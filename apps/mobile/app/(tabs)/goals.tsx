import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { nestApiClient } from '@/constants/apiClient';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';

type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';
type TargetStatus = GoalStatus;

type GoalItem = {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  target_date: string | null;
};

type TargetItem = {
  id: string;
  goal_id: string;
  title: string;
  metric_type: string;
  value_target: number;
  value_current: number;
  unit: string | null;
  due_date: string | null;
  status: TargetStatus;
};

type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'payload' in error &&
    typeof (error as { payload?: unknown }).payload === 'object' &&
    typeof (error as { payload: { message?: unknown } }).payload?.message === 'string'
  ) {
    return (error as { payload: { message: string } }).payload.message;
  }

  return 'Something went wrong. Please try again.';
}

async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;

  return (await requestFn(path, init)) as TResponse;
}

function formatStatus(status: GoalStatus): string {
  if (status === 'completed') return 'Completed';
  if (status === 'paused') return 'Paused';
  if (status === 'archived') return 'Archived';
  return 'Active';
}

function formatTargetProgress(target: TargetItem): string {
  return `${target.value_current}/${target.value_target}${target.unit ? ` ${target.unit}` : ''}`;
}

export default function GoalsScreen() {
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette('tasks'), []);

  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyGoalId, setBusyGoalId] = useState<string | null>(null);
  const [busyTargetId, setBusyTargetId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('Goals and targets are ready.');
  const [errorMessage, setErrorMessage] = useState('');

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');

  const [newTargetGoalId, setNewTargetGoalId] = useState('');
  const [newTargetTitle, setNewTargetTitle] = useState('');
  const [newTargetMetricType, setNewTargetMetricType] = useState('count');
  const [newTargetValueTarget, setNewTargetValueTarget] = useState('1');
  const [newTargetValueCurrent, setNewTargetValueCurrent] = useState('0');
  const [newTargetUnit, setNewTargetUnit] = useState('');
  const [newTargetDueDate, setNewTargetDueDate] = useState('');

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalDescription, setEditGoalDescription] = useState('');
  const [editGoalStatus, setEditGoalStatus] = useState<GoalStatus>('active');
  const [editGoalTargetDate, setEditGoalTargetDate] = useState('');

  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editTargetTitle, setEditTargetTitle] = useState('');
  const [editTargetMetricType, setEditTargetMetricType] = useState('count');
  const [editTargetValueTarget, setEditTargetValueTarget] = useState('1');
  const [editTargetValueCurrent, setEditTargetValueCurrent] = useState('0');
  const [editTargetUnit, setEditTargetUnit] = useState('');
  const [editTargetStatus, setEditTargetStatus] = useState<TargetStatus>('active');
  const [editTargetDueDate, setEditTargetDueDate] = useState('');

  const loadWorkspace = useCallback(async () => {
    const [goalsResponse, targetsResponse] = await Promise.all([
      nestApiClient.getGoals({ per_page: 100 }),
      apiRequest<{ data: TargetItem[] }>('/targets', { query: { per_page: 100 } }),
    ]);

    setGoals((goalsResponse.data ?? []) as GoalItem[]);
    setTargets(targetsResponse.data ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadWorkspace()
      .then(() => {
        if (mounted) setFeedback('Goals and targets are loaded.');
      })
      .catch((error) => {
        if (mounted) setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadWorkspace]);

  const activeGoalsCount = useMemo(() => goals.filter((goal) => goal.status === 'active').length, [goals]);
  const targetsByGoalId = useMemo(() => {
    const grouped = new Map<string, TargetItem[]>();

    for (const goal of goals) {
      grouped.set(goal.id, []);
    }

    for (const target of targets) {
      const bucket = grouped.get(target.goal_id);
      if (bucket) {
        bucket.push(target);
      }
    }

    return grouped;
  }, [goals, targets]);

  async function refreshWorkspace() {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      await loadWorkspace();
      setFeedback('Goals and targets have been refreshed.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createGoal() {
    if (!newGoalTitle.trim()) {
      setErrorMessage('Goal title is required.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/goals', {
        method: 'POST',
        body: {
          title: newGoalTitle.trim(),
          description: newGoalDescription.trim() || null,
          target_date: newGoalTargetDate.trim() || null,
        },
      });
      setNewGoalTitle('');
      setNewGoalDescription('');
      setNewGoalTargetDate('');
      await loadWorkspace();
      setFeedback('Goal created successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function startGoalEdit(goal: GoalItem) {
    setEditingGoalId(goal.id);
    setEditGoalTitle(goal.title);
    setEditGoalDescription(goal.description ?? '');
    setEditGoalStatus(goal.status);
    setEditGoalTargetDate(goal.target_date ?? '');
  }

  async function saveGoal(goalId: string) {
    if (!editGoalTitle.trim()) {
      setErrorMessage('Goal title is required.');
      return;
    }

    setBusyGoalId(goalId);
    try {
      setErrorMessage('');
      await apiRequest(`/goals/${goalId}`, {
        method: 'PATCH',
        body: {
          title: editGoalTitle.trim(),
          description: editGoalDescription.trim() || null,
          status: editGoalStatus,
          target_date: editGoalTargetDate.trim() || null,
        },
      });
      setEditingGoalId(null);
      await loadWorkspace();
      setFeedback('Goal updated successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyGoalId(null);
    }
  }

  function deleteGoal(goalId: string) {
    Alert.alert('Archive goal?', 'The goal will be archived and removed from the active mobile flow.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyGoalId(goalId);
            try {
              await apiRequest(`/goals/${goalId}`, { method: 'DELETE' });
              await loadWorkspace();
              setFeedback('Goal archived successfully.');
            } catch (error) {
              setErrorMessage(getErrorMessage(error));
            } finally {
              setBusyGoalId(null);
            }
          })();
        },
      },
    ]);
  }

  async function createTarget() {
    if (!newTargetGoalId) {
      setErrorMessage('Choose a goal for the target.');
      return;
    }

    if (!newTargetTitle.trim()) {
      setErrorMessage('Target title is required.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/targets', {
        method: 'POST',
        body: {
          goal_id: newTargetGoalId,
          title: newTargetTitle.trim(),
          metric_type: newTargetMetricType.trim() || 'count',
          value_target: Number(newTargetValueTarget || 0),
          value_current: Number(newTargetValueCurrent || 0),
          unit: newTargetUnit.trim() || null,
          due_date: newTargetDueDate.trim() || null,
        },
      });
      setNewTargetTitle('');
      setNewTargetMetricType('count');
      setNewTargetValueTarget('1');
      setNewTargetValueCurrent('0');
      setNewTargetUnit('');
      setNewTargetDueDate('');
      await loadWorkspace();
      setFeedback('Target created successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function startTargetEdit(target: TargetItem) {
    setEditingTargetId(target.id);
    setEditTargetTitle(target.title);
    setEditTargetMetricType(target.metric_type);
    setEditTargetValueTarget(String(target.value_target));
    setEditTargetValueCurrent(String(target.value_current));
    setEditTargetUnit(target.unit ?? '');
    setEditTargetStatus(target.status);
    setEditTargetDueDate(target.due_date ?? '');
  }

  async function saveTarget(targetId: string) {
    if (!editTargetTitle.trim()) {
      setErrorMessage('Target title is required.');
      return;
    }

    setBusyTargetId(targetId);
    try {
      setErrorMessage('');
      await apiRequest(`/targets/${targetId}`, {
        method: 'PATCH',
        body: {
          title: editTargetTitle.trim(),
          metric_type: editTargetMetricType.trim() || 'count',
          value_target: Number(editTargetValueTarget || 0),
          value_current: Number(editTargetValueCurrent || 0),
          unit: editTargetUnit.trim() || null,
          status: editTargetStatus,
          due_date: editTargetDueDate.trim() || null,
        },
      });
      setEditingTargetId(null);
      await loadWorkspace();
      setFeedback('Target updated successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyTargetId(null);
    }
  }

  function deleteTarget(targetId: string) {
    Alert.alert('Archive target?', 'The target will be archived and removed from the active mobile flow.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyTargetId(targetId);
            try {
              await apiRequest(`/targets/${targetId}`, { method: 'DELETE' });
              await loadWorkspace();
              setFeedback('Target archived successfully.');
            } catch (error) {
              setErrorMessage(getErrorMessage(error));
            } finally {
              setBusyTargetId(null);
            }
          })();
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={mobileUiTokens.accent} />
        <Text style={styles.loadingText}>Loading goals and targets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.aura, styles.auraLeft, { backgroundColor: auraA }]} />
      <View style={[styles.aura, styles.auraRight, { backgroundColor: auraB }]} />
      <View style={[styles.aura, styles.auraBottom, { backgroundColor: auraC }]} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Goals + Targets</Text>
          <Text style={styles.heroSubtitle}>Real mobile planning flow with API-backed goals and measurable checkpoints.</Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>Goals: {goals.length}</Text>
            <Text style={styles.metric}>Active: {activeGoalsCount}</Text>
            <Text style={styles.metric}>Targets: {targets.length}</Text>
            <Pressable onPress={() => void refreshWorkspace()} disabled={isRefreshing}>
              <Text style={styles.metric}>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </Pressable>
          </View>
        </View>

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create goal</Text>
          <TextInput style={styles.input} value={newGoalTitle} onChangeText={setNewGoalTitle} placeholder="Goal title" />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={newGoalDescription}
            onChangeText={setNewGoalDescription}
            placeholder="Short description"
            multiline
          />
          <TextInput style={styles.input} value={newGoalTargetDate} onChangeText={setNewGoalTargetDate} placeholder="Target date (YYYY-MM-DD)" />
          <Pressable style={styles.primaryButton} onPress={() => void createGoal()}>
            <Text style={styles.primaryButtonText}>Create goal</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create target</Text>
          <View style={styles.rowWrap}>
            {goals.map((goal) => (
              <Pressable
                key={goal.id}
                style={[styles.chip, newTargetGoalId === goal.id && styles.chipActive]}
                onPress={() => setNewTargetGoalId(goal.id)}
              >
                <Text style={styles.chipText}>{goal.title}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput style={styles.input} value={newTargetTitle} onChangeText={setNewTargetTitle} placeholder="Target title" />
          <TextInput style={styles.input} value={newTargetMetricType} onChangeText={setNewTargetMetricType} placeholder="Metric type (count, percent, steps...)" />
          <View style={styles.rowSplit}>
            <TextInput style={[styles.input, styles.splitInput]} value={newTargetValueTarget} onChangeText={setNewTargetValueTarget} placeholder="Target value" keyboardType="numeric" />
            <TextInput style={[styles.input, styles.splitInput]} value={newTargetValueCurrent} onChangeText={setNewTargetValueCurrent} placeholder="Current value" keyboardType="numeric" />
          </View>
          <View style={styles.rowSplit}>
            <TextInput style={[styles.input, styles.splitInput]} value={newTargetUnit} onChangeText={setNewTargetUnit} placeholder="Unit" />
            <TextInput style={[styles.input, styles.splitInput]} value={newTargetDueDate} onChangeText={setNewTargetDueDate} placeholder="Due date" />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void createTarget()}>
            <Text style={styles.primaryButtonText}>Create target</Text>
          </Pressable>
        </View>

        {goals.map((goal) => (
          <View key={goal.id} style={styles.panel}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.panelTitle}>{goal.title}</Text>
                <Text style={styles.goalMeta}>
                  {formatStatus(goal.status)}
                  {goal.target_date ? ` | ${goal.target_date}` : ''}
                </Text>
              </View>
              <View style={styles.rowWrap}>
                <Pressable style={styles.ghostButton} onPress={() => startGoalEdit(goal)}>
                  <Text style={styles.ghostText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.ghostButton} onPress={() => deleteGoal(goal.id)} disabled={busyGoalId === goal.id}>
                  <Text style={styles.ghostText}>{busyGoalId === goal.id ? 'Archiving...' : 'Archive'}</Text>
                </Pressable>
              </View>
            </View>

            {goal.description ? <Text style={styles.goalDescription}>{goal.description}</Text> : null}

            {editingGoalId === goal.id ? (
              <View style={styles.stack}>
                <TextInput style={styles.input} value={editGoalTitle} onChangeText={setEditGoalTitle} />
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={editGoalDescription}
                  onChangeText={setEditGoalDescription}
                  multiline
                />
                <TextInput style={styles.input} value={editGoalTargetDate} onChangeText={setEditGoalTargetDate} placeholder="YYYY-MM-DD" />
                <View style={styles.rowWrap}>
                  {(['active', 'paused', 'completed'] as const).map((status) => (
                    <Pressable
                      key={status}
                      style={[styles.chip, editGoalStatus === status && styles.chipActive]}
                      onPress={() => setEditGoalStatus(status)}
                    >
                      <Text style={styles.chipText}>{status}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={styles.primaryButton} onPress={() => void saveGoal(goal.id)} disabled={busyGoalId === goal.id}>
                  <Text style={styles.primaryButtonText}>{busyGoalId === goal.id ? 'Saving...' : 'Save goal'}</Text>
                </Pressable>
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>Targets</Text>
            {(targetsByGoalId.get(goal.id) ?? []).length === 0 ? <Text style={styles.emptyState}>No targets yet.</Text> : null}

            {(targetsByGoalId.get(goal.id) ?? []).map((target) => (
              <View key={target.id} style={styles.targetCard}>
                {editingTargetId === target.id ? (
                  <View style={styles.stack}>
                    <TextInput style={styles.input} value={editTargetTitle} onChangeText={setEditTargetTitle} />
                    <TextInput style={styles.input} value={editTargetMetricType} onChangeText={setEditTargetMetricType} />
                    <View style={styles.rowSplit}>
                      <TextInput style={[styles.input, styles.splitInput]} value={editTargetValueTarget} onChangeText={setEditTargetValueTarget} keyboardType="numeric" />
                      <TextInput style={[styles.input, styles.splitInput]} value={editTargetValueCurrent} onChangeText={setEditTargetValueCurrent} keyboardType="numeric" />
                    </View>
                    <View style={styles.rowSplit}>
                      <TextInput style={[styles.input, styles.splitInput]} value={editTargetUnit} onChangeText={setEditTargetUnit} placeholder="Unit" />
                      <TextInput style={[styles.input, styles.splitInput]} value={editTargetDueDate} onChangeText={setEditTargetDueDate} placeholder="YYYY-MM-DD" />
                    </View>
                    <View style={styles.rowWrap}>
                      {(['active', 'paused', 'completed'] as const).map((status) => (
                        <Pressable
                          key={status}
                          style={[styles.chip, editTargetStatus === status && styles.chipActive]}
                          onPress={() => setEditTargetStatus(status)}
                        >
                          <Text style={styles.chipText}>{status}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <Pressable style={styles.primaryButton} onPress={() => void saveTarget(target.id)} disabled={busyTargetId === target.id}>
                      <Text style={styles.primaryButtonText}>{busyTargetId === target.id ? 'Saving...' : 'Save target'}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <Text style={styles.targetTitle}>{target.title}</Text>
                    <Text style={styles.targetMeta}>
                      {formatStatus(target.status)} | {target.metric_type} | {formatTargetProgress(target)}
                    </Text>
                    {target.due_date ? <Text style={styles.targetMeta}>Due: {target.due_date}</Text> : null}
                    <View style={styles.rowWrap}>
                      <Pressable style={styles.ghostButton} onPress={() => startTargetEdit(target)}>
                        <Text style={styles.ghostText}>Edit</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => deleteTarget(target.id)} disabled={busyTargetId === target.id}>
                        <Text style={styles.ghostText}>{busyTargetId === target.id ? 'Archiving...' : 'Archive'}</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileUiTokens.surface },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: mobileUiTokens.surface },
  loadingText: { color: mobileUiTokens.muted },
  aura: { position: 'absolute', borderRadius: 999, opacity: 1 },
  auraLeft: { width: 320, height: 320, top: -90, left: -120 },
  auraRight: { width: 280, height: 280, top: 130, right: -120 },
  auraBottom: { width: 340, height: 340, bottom: -120, left: 10 },
  content: { gap: 12, padding: 14, paddingBottom: 110 },
  hero: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', padding: 14, gap: 8 },
  heroTitle: { fontSize: 28, color: mobileUiTokens.ink, fontWeight: '400' },
  heroSubtitle: { color: mobileUiTokens.muted, fontSize: 14 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { color: mobileUiTokens.ink, fontSize: 12, fontWeight: '600' },
  feedback: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, backgroundColor: mobileUiTokens.accentSoft, color: mobileUiTokens.ink, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12 },
  error: { borderWidth: 1, borderColor: '#d06363', backgroundColor: '#ffe3e1', color: '#a02121', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12 },
  panel: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.76)', padding: 12, gap: 8 },
  panelTitle: { fontSize: 14, fontWeight: '700', color: mobileUiTokens.ink, textTransform: 'uppercase', letterSpacing: 0.7 },
  input: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, color: mobileUiTokens.ink, backgroundColor: '#fff', fontSize: 13 },
  multilineInput: { minHeight: 78, textAlignVertical: 'top' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rowSplit: { flexDirection: 'row', gap: 8 },
  splitInput: { flex: 1 },
  chip: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 999, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { borderColor: mobileUiTokens.accent, backgroundColor: mobileUiTokens.accentSoft },
  chipText: { color: mobileUiTokens.ink, fontSize: 12 },
  primaryButton: { borderWidth: 1, borderColor: mobileUiTokens.accent, backgroundColor: mobileUiTokens.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fbfdf9', fontSize: 13, fontWeight: '700' },
  ghostButton: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#fff' },
  ghostText: { color: mobileUiTokens.ink, fontSize: 12, fontWeight: '600' },
  stack: { gap: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  headerTextWrap: { flex: 1, gap: 4 },
  goalMeta: { color: mobileUiTokens.muted, fontSize: 12 },
  goalDescription: { color: mobileUiTokens.ink, fontSize: 13, lineHeight: 18 },
  sectionLabel: { color: mobileUiTokens.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 },
  emptyState: { color: mobileUiTokens.muted, fontSize: 12 },
  targetCard: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', gap: 8 },
  targetTitle: { color: mobileUiTokens.ink, fontSize: 14, fontWeight: '600' },
  targetMeta: { color: mobileUiTokens.muted, fontSize: 12 },
});
