import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { nestApiClient } from '@/constants/apiClient';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';

type LifeAreaItem = {
  id: string;
  name: string;
  color: string;
  weight: number;
  is_archived?: boolean;
};

type JournalEntryItem = {
  id: string;
  title: string;
  body: string;
  mood: 'low' | 'neutral' | 'good' | 'great' | null;
  entry_date: string;
  life_areas?: LifeAreaItem[];
  lifeAreas?: LifeAreaItem[];
};

type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;

  return (await requestFn(path, init)) as TResponse;
}

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

function formatMood(mood: JournalEntryItem['mood']): string {
  if (!mood) return 'none';
  if (mood === 'great') return 'Great';
  if (mood === 'good') return 'Good';
  if (mood === 'neutral') return 'Neutral';
  return 'Low';
}

export default function JournalScreen() {
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette('journal'), []);

  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeAreaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);
  const [busyAreaId, setBusyAreaId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('Journal and life areas are ready.');
  const [errorMessage, setErrorMessage] = useState('');

  const [entryTitle, setEntryTitle] = useState('');
  const [entryBody, setEntryBody] = useState('');
  const [entryMood, setEntryMood] = useState<'low' | 'neutral' | 'good' | 'great'>('good');
  const [entryDate, setEntryDate] = useState('');
  const [entryLifeAreaIds, setEntryLifeAreaIds] = useState<string[]>([]);

  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaColor, setNewAreaColor] = useState('#789262');
  const [newAreaWeight, setNewAreaWeight] = useState('50');

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntryTitle, setEditEntryTitle] = useState('');
  const [editEntryBody, setEditEntryBody] = useState('');
  const [editEntryMood, setEditEntryMood] = useState<'low' | 'neutral' | 'good' | 'great'>('good');
  const [editEntryDate, setEditEntryDate] = useState('');
  const [editEntryLifeAreaIds, setEditEntryLifeAreaIds] = useState<string[]>([]);

  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editAreaName, setEditAreaName] = useState('');
  const [editAreaColor, setEditAreaColor] = useState('#789262');
  const [editAreaWeight, setEditAreaWeight] = useState('50');

  const loadWorkspace = useCallback(async () => {
    const [entriesResponse, lifeAreasResponse] = await Promise.all([
      nestApiClient.getJournalEntries({ per_page: 100 }),
      apiRequest<{ data: LifeAreaItem[] }>('/life-areas'),
    ]);

    setEntries((entriesResponse.data ?? []) as JournalEntryItem[]);
    setLifeAreas(lifeAreasResponse.data ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadWorkspace()
      .then(() => {
        if (mounted) setFeedback('Journal and life areas are loaded.');
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

  const topLifeArea = useMemo(() => {
    if (lifeAreas.length === 0) return 'n/a';
    return [...lifeAreas].sort((a, b) => b.weight - a.weight)[0]?.name ?? 'n/a';
  }, [lifeAreas]);

  async function refreshWorkspace() {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      await loadWorkspace();
      setFeedback('Journal and life areas have been refreshed.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createJournalEntry() {
    if (!entryTitle.trim()) {
      setErrorMessage('Entry title is required.');
      return;
    }

    if (!entryBody.trim()) {
      setErrorMessage('Reflection body is required.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/journal-entries', {
        method: 'POST',
        body: {
          title: entryTitle.trim(),
          body: entryBody.trim(),
          mood: entryMood,
          entry_date: entryDate.trim() || undefined,
          life_area_ids: entryLifeAreaIds,
        },
      });
      setEntryTitle('');
      setEntryBody('');
      setEntryMood('good');
      setEntryDate('');
      setEntryLifeAreaIds([]);
      await loadWorkspace();
      setFeedback('Journal entry created successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function createLifeArea() {
    if (!newAreaName.trim()) {
      setErrorMessage('Life area name is required.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/life-areas', {
        method: 'POST',
        body: {
          name: newAreaName.trim(),
          color: newAreaColor,
          weight: Number(newAreaWeight || 0),
        },
      });
      setNewAreaName('');
      setNewAreaColor('#789262');
      setNewAreaWeight('50');
      await loadWorkspace();
      setFeedback('Life area created successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function startEntryEdit(entry: JournalEntryItem) {
    const linkedAreas = entry.life_areas ?? entry.lifeAreas ?? [];
    setEditingEntryId(entry.id);
    setEditEntryTitle(entry.title);
    setEditEntryBody(entry.body);
    setEditEntryMood(entry.mood ?? 'neutral');
    setEditEntryDate(entry.entry_date ? entry.entry_date.slice(0, 10) : '');
    setEditEntryLifeAreaIds(linkedAreas.map((area) => area.id));
  }

  async function saveEntryEdit(entryId: string) {
    if (!editEntryTitle.trim()) {
      setErrorMessage('Entry title is required.');
      return;
    }

    if (!editEntryBody.trim()) {
      setErrorMessage('Reflection body is required.');
      return;
    }

    setBusyEntryId(entryId);
    try {
      setErrorMessage('');
      await apiRequest(`/journal-entries/${entryId}`, {
        method: 'PATCH',
        body: {
          title: editEntryTitle.trim(),
          body: editEntryBody.trim(),
          mood: editEntryMood,
          entry_date: editEntryDate.trim() || undefined,
          life_area_ids: editEntryLifeAreaIds,
        },
      });
      setEditingEntryId(null);
      await loadWorkspace();
      setFeedback('Journal entry updated successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyEntryId(null);
    }
  }

  function deleteEntry(entryId: string) {
    Alert.alert('Delete journal entry?', 'This reflection will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyEntryId(entryId);
            try {
              await apiRequest(`/journal-entries/${entryId}`, { method: 'DELETE' });
              if (editingEntryId === entryId) {
                setEditingEntryId(null);
              }
              await loadWorkspace();
              setFeedback('Journal entry deleted successfully.');
            } catch (error) {
              setErrorMessage(getErrorMessage(error));
            } finally {
              setBusyEntryId(null);
            }
          })();
        },
      },
    ]);
  }

  function startLifeAreaEdit(area: LifeAreaItem) {
    setEditingAreaId(area.id);
    setEditAreaName(area.name);
    setEditAreaColor(area.color);
    setEditAreaWeight(String(area.weight));
  }

  async function saveLifeAreaEdit(areaId: string) {
    if (!editAreaName.trim()) {
      setErrorMessage('Life area name is required.');
      return;
    }

    setBusyAreaId(areaId);
    try {
      setErrorMessage('');
      await apiRequest(`/life-areas/${areaId}`, {
        method: 'PATCH',
        body: {
          name: editAreaName.trim(),
          color: editAreaColor,
          weight: Number(editAreaWeight || 0),
        },
      });
      setEditingAreaId(null);
      await loadWorkspace();
      setFeedback('Life area updated successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAreaId(null);
    }
  }

  function deleteLifeArea(areaId: string) {
    Alert.alert('Archive life area?', 'The life area will be archived and removed from the active mobile flow.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyAreaId(areaId);
            try {
              await apiRequest(`/life-areas/${areaId}`, { method: 'DELETE' });
              if (editingAreaId === areaId) {
                setEditingAreaId(null);
              }
              await loadWorkspace();
              setFeedback('Life area archived successfully.');
            } catch (error) {
              setErrorMessage(getErrorMessage(error));
            } finally {
              setBusyAreaId(null);
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
        <Text style={styles.loadingText}>Loading journal and life areas...</Text>
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
          <Text style={styles.heroTitle}>Journal + Life Areas</Text>
          <Text style={styles.heroSubtitle}>Capture what happened, how you felt, and which parts of life need attention.</Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>Entries: {entries.length}</Text>
            <Text style={styles.metric}>Life areas: {lifeAreas.length}</Text>
            <Text style={styles.metric}>Top area: {topLifeArea}</Text>
            <Pressable onPress={() => void refreshWorkspace()} disabled={isRefreshing}>
              <Text style={styles.metric}>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </Pressable>
          </View>
        </View>

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Quick reflection</Text>
          <TextInput style={styles.input} value={entryTitle} onChangeText={setEntryTitle} placeholder="Title" />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={entryBody}
            onChangeText={setEntryBody}
            placeholder="What worked today? What felt heavy? What should change next?"
            multiline
          />
          <View style={styles.rowWrap}>
            {(['low', 'neutral', 'good', 'great'] as const).map((mood) => (
              <Pressable key={mood} style={[styles.chip, entryMood === mood && styles.chipActive]} onPress={() => setEntryMood(mood)}>
                <Text style={styles.chipText}>{mood}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput style={styles.input} value={entryDate} onChangeText={setEntryDate} placeholder="Entry date (YYYY-MM-DD)" />
          <View style={styles.rowWrap}>
            {lifeAreas.map((area) => (
              <Pressable
                key={area.id}
                style={[styles.chip, entryLifeAreaIds.includes(area.id) && styles.chipActive]}
                onPress={() =>
                  setEntryLifeAreaIds((current) =>
                    current.includes(area.id) ? current.filter((id) => id !== area.id) : [...current, area.id]
                  )
                }
              >
                <Text style={styles.chipText}>{area.name}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void createJournalEntry()}>
            <Text style={styles.primaryButtonText}>Save reflection</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Life areas</Text>
          <TextInput style={styles.input} value={newAreaName} onChangeText={setNewAreaName} placeholder="Life area name" />
          <View style={styles.rowSplit}>
            <TextInput style={[styles.input, styles.splitInput]} value={newAreaColor} onChangeText={setNewAreaColor} placeholder="#789262" />
            <TextInput style={[styles.input, styles.splitInput]} value={newAreaWeight} onChangeText={setNewAreaWeight} placeholder="Weight" keyboardType="numeric" />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void createLifeArea()}>
            <Text style={styles.primaryButtonText}>Add life area</Text>
          </Pressable>

          {lifeAreas.length === 0 ? <Text style={styles.emptyState}>No life areas yet.</Text> : null}

          {lifeAreas.map((area) => (
            <View key={area.id} style={styles.targetCard}>
              {editingAreaId === area.id ? (
                <View style={styles.stack}>
                  <TextInput style={styles.input} value={editAreaName} onChangeText={setEditAreaName} />
                  <View style={styles.rowSplit}>
                    <TextInput style={[styles.input, styles.splitInput]} value={editAreaColor} onChangeText={setEditAreaColor} />
                    <TextInput style={[styles.input, styles.splitInput]} value={editAreaWeight} onChangeText={setEditAreaWeight} keyboardType="numeric" />
                  </View>
                  <Pressable style={styles.primaryButton} onPress={() => void saveLifeAreaEdit(area.id)} disabled={busyAreaId === area.id}>
                    <Text style={styles.primaryButtonText}>{busyAreaId === area.id ? 'Saving...' : 'Save life area'}</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.headerRow}>
                    <View style={styles.headerTextWrap}>
                      <Text style={styles.targetTitle}>{area.name}</Text>
                      <Text style={styles.targetMeta}>Weight: {area.weight}% | Color: {area.color}</Text>
                    </View>
                    <View style={styles.rowWrap}>
                      <Pressable style={styles.ghostButton} onPress={() => startLifeAreaEdit(area)}>
                        <Text style={styles.ghostText}>Edit</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => deleteLifeArea(area.id)} disabled={busyAreaId === area.id}>
                        <Text style={styles.ghostText}>{busyAreaId === area.id ? 'Archiving...' : 'Archive'}</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Recent entries</Text>
          {entries.length === 0 ? <Text style={styles.emptyState}>No entries yet.</Text> : null}

          {entries.map((entry) => {
            const linkedAreas = entry.life_areas ?? entry.lifeAreas ?? [];

            return (
              <View key={entry.id} style={styles.targetCard}>
                {editingEntryId === entry.id ? (
                  <View style={styles.stack}>
                    <TextInput style={styles.input} value={editEntryTitle} onChangeText={setEditEntryTitle} />
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={editEntryBody}
                      onChangeText={setEditEntryBody}
                      multiline
                    />
                    <View style={styles.rowWrap}>
                      {(['low', 'neutral', 'good', 'great'] as const).map((mood) => (
                        <Pressable
                          key={mood}
                          style={[styles.chip, editEntryMood === mood && styles.chipActive]}
                          onPress={() => setEditEntryMood(mood)}
                        >
                          <Text style={styles.chipText}>{mood}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <TextInput style={styles.input} value={editEntryDate} onChangeText={setEditEntryDate} placeholder="YYYY-MM-DD" />
                    <View style={styles.rowWrap}>
                      {lifeAreas.map((area) => (
                        <Pressable
                          key={`${entry.id}-${area.id}`}
                          style={[styles.chip, editEntryLifeAreaIds.includes(area.id) && styles.chipActive]}
                          onPress={() =>
                            setEditEntryLifeAreaIds((current) =>
                              current.includes(area.id) ? current.filter((id) => id !== area.id) : [...current, area.id]
                            )
                          }
                        >
                          <Text style={styles.chipText}>{area.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <Pressable style={styles.primaryButton} onPress={() => void saveEntryEdit(entry.id)} disabled={busyEntryId === entry.id}>
                      <Text style={styles.primaryButtonText}>{busyEntryId === entry.id ? 'Saving...' : 'Save entry'}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View style={styles.headerRow}>
                      <View style={styles.headerTextWrap}>
                        <Text style={styles.targetTitle}>{entry.title}</Text>
                        <Text style={styles.targetMeta}>
                          {entry.entry_date?.slice(0, 10)} | Mood: {formatMood(entry.mood)}
                        </Text>
                      </View>
                      <View style={styles.rowWrap}>
                        <Pressable style={styles.ghostButton} onPress={() => startEntryEdit(entry)}>
                          <Text style={styles.ghostText}>Edit</Text>
                        </Pressable>
                        <Pressable style={styles.ghostButton} onPress={() => deleteEntry(entry.id)} disabled={busyEntryId === entry.id}>
                          <Text style={styles.ghostText}>{busyEntryId === entry.id ? 'Deleting...' : 'Delete'}</Text>
                        </Pressable>
                      </View>
                    </View>
                    <Text style={styles.entryBody}>{entry.body}</Text>
                    {linkedAreas.length > 0 ? (
                      <Text style={styles.targetMeta}>Areas: {linkedAreas.map((area) => area.name).join(', ')}</Text>
                    ) : null}
                  </>
                )}
              </View>
            );
          })}
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
  multilineInput: { minHeight: 88, textAlignVertical: 'top' },
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
  targetCard: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', gap: 8 },
  targetTitle: { color: mobileUiTokens.ink, fontSize: 14, fontWeight: '600' },
  targetMeta: { color: mobileUiTokens.muted, fontSize: 12 },
  entryBody: { color: mobileUiTokens.ink, fontSize: 13, lineHeight: 18 },
  emptyState: { color: mobileUiTokens.muted, fontSize: 12 },
});
