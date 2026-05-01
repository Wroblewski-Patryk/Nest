import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiRequest, nestApiClient } from '@/constants/apiClient';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';
import { getUserSafeErrorMessage } from '@/lib/ux-contract';

type HabitType = 'boolean' | 'numeric' | 'duration';

type HabitItem = {
  id: string;
  title: string;
  description: string | null;
  type: HabitType;
  cadence: Record<string, unknown>;
  is_active: boolean;
};

type RoutineStep = {
  id: string;
  title: string;
  details: string | null;
  duration_minutes: number | null;
};

type RoutineItem = {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  steps: RoutineStep[];
};

function resolveCadenceType(cadence: Record<string, unknown> | null | undefined): 'daily' | 'weekly' {
  if (cadence && typeof cadence.type === 'string' && cadence.type === 'weekly') {
    return 'weekly';
  }

  return 'daily';
}

export default function HabitsScreen() {
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette('tasks'), []);

  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyHabitId, setBusyHabitId] = useState<string | null>(null);
  const [busyRoutineId, setBusyRoutineId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('Habits and routines are ready.');
  const [errorMessage, setErrorMessage] = useState('');

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitType, setNewHabitType] = useState<HabitType>('boolean');
  const [newHabitCadence, setNewHabitCadence] = useState<'daily' | 'weekly'>('daily');

  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineStepTitle, setNewRoutineStepTitle] = useState('');
  const [newRoutineStepDuration, setNewRoutineStepDuration] = useState('15');

  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitTitle, setEditHabitTitle] = useState('');
  const [editHabitType, setEditHabitType] = useState<HabitType>('boolean');
  const [editHabitCadence, setEditHabitCadence] = useState<'daily' | 'weekly'>('daily');
  const [editHabitIsActive, setEditHabitIsActive] = useState(true);

  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editRoutineTitle, setEditRoutineTitle] = useState('');
  const [editRoutineStepTitle, setEditRoutineStepTitle] = useState('');
  const [editRoutineStepDuration, setEditRoutineStepDuration] = useState('15');
  const [editRoutineIsActive, setEditRoutineIsActive] = useState(true);

  const loadWorkspace = useCallback(async () => {
    const [habitsResponse, routinesResponse] = await Promise.all([
      nestApiClient.getHabits({ per_page: 100 }),
      apiRequest<{ data: RoutineItem[] }>('/routines', { query: { per_page: 100 } }),
    ]);

    setHabits((habitsResponse.data ?? []) as HabitItem[]);
    setRoutines(routinesResponse.data ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadWorkspace()
      .then(() => {
        if (mounted) setFeedback('Habits and routines are loaded.');
      })
      .catch((error) => {
        if (mounted) setErrorMessage(getUserSafeErrorMessage(error));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadWorkspace]);

  const activeHabits = useMemo(() => habits.filter((habit) => habit.is_active).length, [habits]);
  const activeRoutines = useMemo(() => routines.filter((routine) => routine.is_active).length, [routines]);

  async function refreshWorkspace() {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      await loadWorkspace();
      setFeedback('Habits and routines have been refreshed.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createHabit() {
    if (!newHabitTitle.trim()) {
      setErrorMessage('Habit title is required.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/habits', {
        method: 'POST',
        body: {
          title: newHabitTitle.trim(),
          type: newHabitType,
          cadence: { type: newHabitCadence },
          is_active: true,
        },
      });
      setNewHabitTitle('');
      setNewHabitType('boolean');
      setNewHabitCadence('daily');
      await loadWorkspace();
      setFeedback('Habit created successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    }
  }

  function startHabitEdit(habit: HabitItem) {
    setEditingHabitId(habit.id);
    setEditHabitTitle(habit.title);
    setEditHabitType(habit.type);
    setEditHabitCadence(resolveCadenceType(habit.cadence));
    setEditHabitIsActive(habit.is_active);
  }

  async function saveHabit(habitId: string) {
    if (!editHabitTitle.trim()) {
      setErrorMessage('Habit title is required.');
      return;
    }

    setBusyHabitId(habitId);
    try {
      setErrorMessage('');
      await apiRequest(`/habits/${habitId}`, {
        method: 'PATCH',
        body: {
          title: editHabitTitle.trim(),
          type: editHabitType,
          cadence: { type: editHabitCadence },
          is_active: editHabitIsActive,
        },
      });
      setEditingHabitId(null);
      await loadWorkspace();
      setFeedback('Habit updated successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyHabitId(null);
    }
  }

  async function toggleHabitActive(habit: HabitItem) {
    setBusyHabitId(habit.id);
    try {
      await apiRequest(`/habits/${habit.id}`, {
        method: 'PATCH',
        body: { is_active: !habit.is_active },
      });
      await loadWorkspace();
      setFeedback(habit.is_active ? 'Habit paused.' : 'Habit reactivated.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyHabitId(null);
    }
  }

  async function logHabit(habit: HabitItem) {
    setBusyHabitId(habit.id);
    try {
      const payload =
        habit.type === 'numeric'
          ? { logged_at: new Date().toISOString(), value_numeric: 1 }
          : habit.type === 'duration'
            ? { logged_at: new Date().toISOString(), value_seconds: 900 }
            : { logged_at: new Date().toISOString() };

      await apiRequest(`/habits/${habit.id}/logs`, {
        method: 'POST',
        body: payload,
      });
      setFeedback('Habit log saved.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyHabitId(null);
    }
  }

  function deleteHabit(habitId: string) {
    Alert.alert('Delete habit?', 'The habit will be removed from the active mobile flow.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyHabitId(habitId);
            try {
              await apiRequest(`/habits/${habitId}`, { method: 'DELETE' });
              if (editingHabitId === habitId) {
                setEditingHabitId(null);
              }
              await loadWorkspace();
              setFeedback('Habit deleted successfully.');
            } catch (error) {
              setErrorMessage(getUserSafeErrorMessage(error));
            } finally {
              setBusyHabitId(null);
            }
          })();
        },
      },
    ]);
  }

  async function createRoutine() {
    if (!newRoutineTitle.trim()) {
      setErrorMessage('Routine title is required.');
      return;
    }

    if (!newRoutineStepTitle.trim()) {
      setErrorMessage('At least one routine step is required.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/routines', {
        method: 'POST',
        body: {
          title: newRoutineTitle.trim(),
          is_active: true,
          steps: [
            {
              title: newRoutineStepTitle.trim(),
              duration_minutes: Number(newRoutineStepDuration || 0),
            },
          ],
        },
      });
      setNewRoutineTitle('');
      setNewRoutineStepTitle('');
      setNewRoutineStepDuration('15');
      await loadWorkspace();
      setFeedback('Routine created successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    }
  }

  function startRoutineEdit(routine: RoutineItem) {
    setEditingRoutineId(routine.id);
    setEditRoutineTitle(routine.title);
    setEditRoutineIsActive(routine.is_active);
    setEditRoutineStepTitle(routine.steps[0]?.title ?? '');
    setEditRoutineStepDuration(String(routine.steps[0]?.duration_minutes ?? 0));
  }

  async function saveRoutine(routineId: string) {
    if (!editRoutineTitle.trim()) {
      setErrorMessage('Routine title is required.');
      return;
    }

    if (!editRoutineStepTitle.trim()) {
      setErrorMessage('At least one routine step is required.');
      return;
    }

    setBusyRoutineId(routineId);
    try {
      setErrorMessage('');
      await apiRequest(`/routines/${routineId}`, {
        method: 'PATCH',
        body: {
          title: editRoutineTitle.trim(),
          is_active: editRoutineIsActive,
          steps: [
            {
              title: editRoutineStepTitle.trim(),
              duration_minutes: Number(editRoutineStepDuration || 0),
            },
          ],
        },
      });
      setEditingRoutineId(null);
      await loadWorkspace();
      setFeedback('Routine updated successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyRoutineId(null);
    }
  }

  async function toggleRoutineActive(routine: RoutineItem) {
    setBusyRoutineId(routine.id);
    try {
      await apiRequest(`/routines/${routine.id}`, {
        method: 'PATCH',
        body: {
          is_active: !routine.is_active,
          steps: routine.steps.map((step) => ({
            title: step.title,
            details: step.details ?? null,
            duration_minutes: step.duration_minutes ?? 0,
          })),
        },
      });
      await loadWorkspace();
      setFeedback(routine.is_active ? 'Routine paused.' : 'Routine reactivated.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyRoutineId(null);
    }
  }

  function deleteRoutine(routineId: string) {
    Alert.alert('Delete routine?', 'The routine will be removed from the active mobile flow.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyRoutineId(routineId);
            try {
              await apiRequest(`/routines/${routineId}`, { method: 'DELETE' });
              if (editingRoutineId === routineId) {
                setEditingRoutineId(null);
              }
              await loadWorkspace();
              setFeedback('Routine deleted successfully.');
            } catch (error) {
              setErrorMessage(getUserSafeErrorMessage(error));
            } finally {
              setBusyRoutineId(null);
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
        <Text style={styles.loadingText}>Loading habits and routines...</Text>
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
          <Text style={styles.heroTitle}>Habits + Routines</Text>
          <Text style={styles.heroSubtitle}>Keep consistency visible with habit tracking and repeatable routines.</Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>Habits: {habits.length}</Text>
            <Text style={styles.metric}>Active habits: {activeHabits}</Text>
            <Text style={styles.metric}>Active routines: {activeRoutines}</Text>
            <Pressable onPress={() => void refreshWorkspace()} disabled={isRefreshing}>
              <Text style={styles.metric}>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </Pressable>
          </View>
        </View>

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create habit</Text>
          <TextInput style={styles.input} value={newHabitTitle} onChangeText={setNewHabitTitle} placeholder="Habit title" />
          <View style={styles.rowWrap}>
            {(['boolean', 'numeric', 'duration'] as const).map((type) => (
              <Pressable key={type} style={[styles.chip, newHabitType === type && styles.chipActive]} onPress={() => setNewHabitType(type)}>
                <Text style={styles.chipText}>{type}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.rowWrap}>
            {(['daily', 'weekly'] as const).map((cadence) => (
              <Pressable key={cadence} style={[styles.chip, newHabitCadence === cadence && styles.chipActive]} onPress={() => setNewHabitCadence(cadence)}>
                <Text style={styles.chipText}>{cadence}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void createHabit()}>
            <Text style={styles.primaryButtonText}>Create habit</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create routine</Text>
          <TextInput style={styles.input} value={newRoutineTitle} onChangeText={setNewRoutineTitle} placeholder="Routine title" />
          <View style={styles.rowSplit}>
            <TextInput style={[styles.input, styles.splitInput]} value={newRoutineStepTitle} onChangeText={setNewRoutineStepTitle} placeholder="First step" />
            <TextInput style={[styles.input, styles.splitInput]} value={newRoutineStepDuration} onChangeText={setNewRoutineStepDuration} placeholder="Minutes" keyboardType="numeric" />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void createRoutine()}>
            <Text style={styles.primaryButtonText}>Create routine</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Habits</Text>
          {habits.length === 0 ? <Text style={styles.emptyState}>No habits yet.</Text> : null}

          {habits.map((habit) => (
            <View key={habit.id} style={styles.card}>
              {editingHabitId === habit.id ? (
                <View style={styles.stack}>
                  <TextInput style={styles.input} value={editHabitTitle} onChangeText={setEditHabitTitle} />
                  <View style={styles.rowWrap}>
                    {(['boolean', 'numeric', 'duration'] as const).map((type) => (
                      <Pressable key={type} style={[styles.chip, editHabitType === type && styles.chipActive]} onPress={() => setEditHabitType(type)}>
                        <Text style={styles.chipText}>{type}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.rowWrap}>
                    {(['daily', 'weekly'] as const).map((cadence) => (
                      <Pressable key={cadence} style={[styles.chip, editHabitCadence === cadence && styles.chipActive]} onPress={() => setEditHabitCadence(cadence)}>
                        <Text style={styles.chipText}>{cadence}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.rowWrap}>
                    <Pressable style={[styles.chip, editHabitIsActive && styles.chipActive]} onPress={() => setEditHabitIsActive((current) => !current)}>
                      <Text style={styles.chipText}>{editHabitIsActive ? 'active' : 'inactive'}</Text>
                    </Pressable>
                  </View>
                  <Pressable style={styles.primaryButton} onPress={() => void saveHabit(habit.id)} disabled={busyHabitId === habit.id}>
                    <Text style={styles.primaryButtonText}>{busyHabitId === habit.id ? 'Saving...' : 'Save habit'}</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.headerRow}>
                    <View style={styles.headerTextWrap}>
                      <Text style={styles.cardTitle}>{habit.title}</Text>
                      <Text style={styles.cardMeta}>
                        {habit.type} | cadence: {resolveCadenceType(habit.cadence)} | {habit.is_active ? 'active' : 'inactive'}
                      </Text>
                    </View>
                    <View style={styles.rowWrap}>
                      <Pressable style={styles.ghostButton} onPress={() => void logHabit(habit)} disabled={busyHabitId === habit.id}>
                        <Text style={styles.ghostText}>{busyHabitId === habit.id ? 'Saving...' : 'Log'}</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => startHabitEdit(habit)}>
                        <Text style={styles.ghostText}>Edit</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => void toggleHabitActive(habit)} disabled={busyHabitId === habit.id}>
                        <Text style={styles.ghostText}>{habit.is_active ? 'Pause' : 'Activate'}</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => deleteHabit(habit.id)} disabled={busyHabitId === habit.id}>
                        <Text style={styles.ghostText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Routines</Text>
          {routines.length === 0 ? <Text style={styles.emptyState}>No routines yet.</Text> : null}

          {routines.map((routine) => (
            <View key={routine.id} style={styles.card}>
              {editingRoutineId === routine.id ? (
                <View style={styles.stack}>
                  <TextInput style={styles.input} value={editRoutineTitle} onChangeText={setEditRoutineTitle} />
                  <View style={styles.rowSplit}>
                    <TextInput style={[styles.input, styles.splitInput]} value={editRoutineStepTitle} onChangeText={setEditRoutineStepTitle} placeholder="First step" />
                    <TextInput style={[styles.input, styles.splitInput]} value={editRoutineStepDuration} onChangeText={setEditRoutineStepDuration} keyboardType="numeric" />
                  </View>
                  <View style={styles.rowWrap}>
                    <Pressable style={[styles.chip, editRoutineIsActive && styles.chipActive]} onPress={() => setEditRoutineIsActive((current) => !current)}>
                      <Text style={styles.chipText}>{editRoutineIsActive ? 'active' : 'inactive'}</Text>
                    </Pressable>
                  </View>
                  <Pressable style={styles.primaryButton} onPress={() => void saveRoutine(routine.id)} disabled={busyRoutineId === routine.id}>
                    <Text style={styles.primaryButtonText}>{busyRoutineId === routine.id ? 'Saving...' : 'Save routine'}</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.headerRow}>
                    <View style={styles.headerTextWrap}>
                      <Text style={styles.cardTitle}>{routine.title}</Text>
                      <Text style={styles.cardMeta}>
                        {routine.steps.length} steps | {routine.is_active ? 'active' : 'inactive'}
                      </Text>
                      {routine.steps[0] ? (
                        <Text style={styles.cardMeta}>
                          First step: {routine.steps[0].title}
                          {routine.steps[0].duration_minutes ? ` (${routine.steps[0].duration_minutes} min)` : ''}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.rowWrap}>
                      <Pressable style={styles.ghostButton} onPress={() => startRoutineEdit(routine)}>
                        <Text style={styles.ghostText}>Edit</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => void toggleRoutineActive(routine)} disabled={busyRoutineId === routine.id}>
                        <Text style={styles.ghostText}>{routine.is_active ? 'Pause' : 'Activate'}</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => deleteRoutine(routine.id)} disabled={busyRoutineId === routine.id}>
                        <Text style={styles.ghostText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
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
  card: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', gap: 8 },
  cardTitle: { color: mobileUiTokens.ink, fontSize: 14, fontWeight: '600' },
  cardMeta: { color: mobileUiTokens.muted, fontSize: 12 },
  emptyState: { color: mobileUiTokens.muted, fontSize: 12 },
});
