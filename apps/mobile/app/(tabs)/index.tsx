import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { nestApiClient } from '@/constants/apiClient';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';
import { getUserSafeErrorMessage } from '@/lib/ux-contract';

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'canceled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type ListParentType = 'none' | 'goal' | 'target' | 'life_area';

type ListItem = {
  id: string;
  name: string;
  color: string;
  goal_id: string | null;
  target_id: string | null;
  life_area_id: string | null;
};

type TaskItem = {
  id: string;
  list_id: string | null;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
};

type GoalItem = { id: string; title: string };
type TargetItem = { id: string; title: string };
type LifeAreaItem = { id: string; name: string };

type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

const TASKS_PAGE_SIZE = 100;
const TASKS_PAGE_GUARD_LIMIT = 20;

function buildListParentPayload(type: ListParentType, id: string) {
  if (type === 'goal') return { goal_id: id || null, target_id: null, life_area_id: null };
  if (type === 'target') return { goal_id: null, target_id: id || null, life_area_id: null };
  if (type === 'life_area') return { goal_id: null, target_id: null, life_area_id: id || null };
  return { goal_id: null, target_id: null, life_area_id: null };
}

async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;
  return (await requestFn(path, init)) as TResponse;
}

function formatPriority(priority: TaskPriority): string {
  return priority === 'urgent' ? 'Urgent' : priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low';
}

function formatStatus(status: TaskStatus): string {
  return status === 'in_progress' ? 'In progress' : status === 'done' ? 'Done' : status === 'canceled' ? 'Canceled' : 'To do';
}

export default function TasksScreen() {
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette('tasks'), []);

  const [lists, setLists] = useState<ListItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeAreaItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyListId, setBusyListId] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState('Tasks and lists are ready.');
  const [errorMessage, setErrorMessage] = useState('');

  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#789262');
  const [newListParentType, setNewListParentType] = useState<ListParentType>('none');
  const [newListParentId, setNewListParentId] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskListId, setNewTaskListId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('all');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>('medium');
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>('todo');
  const [editTaskListId, setEditTaskListId] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');
  const [editListColor, setEditListColor] = useState('#789262');

  const loadAllTasks = useCallback(async (): Promise<TaskItem[]> => {
    const allTasks: TaskItem[] = [];
    let page = 1;

    while (page <= TASKS_PAGE_GUARD_LIMIT) {
      const response = await nestApiClient.getTasks({ page, per_page: TASKS_PAGE_SIZE, sort: '-created_at' });
      const chunk = (response.data ?? []) as TaskItem[];
      allTasks.push(...chunk);

      const total = response.meta && typeof response.meta.total === 'number' ? response.meta.total : allTasks.length;
      if (chunk.length === 0 || allTasks.length >= total) break;
      page += 1;
    }

    return allTasks;
  }, []);

  const loadWorkspace = useCallback(async () => {
    const [listsResponse, tasksResponse, goalsResponse, targetsResponse, lifeAreasResponse] = await Promise.all([
      nestApiClient.getLists({ per_page: 100 }),
      loadAllTasks(),
      nestApiClient.getGoals({ per_page: 100 }),
      apiRequest<{ data: TargetItem[] }>('/targets', { query: { per_page: 100 } }),
      apiRequest<{ data: LifeAreaItem[] }>('/life-areas', { query: { per_page: 100 } }),
    ]);

    setLists((listsResponse.data ?? []) as ListItem[]);
    setTasks(tasksResponse);
    setGoals((goalsResponse.data ?? []) as GoalItem[]);
    setTargets(targetsResponse.data ?? []);
    setLifeAreas(lifeAreasResponse.data ?? []);
  }, [loadAllTasks]);

  useEffect(() => {
    let mounted = true;

    loadWorkspace()
      .then(() => {
        if (mounted) setFeedback('Tasks and lists are loaded.');
      })
      .catch((error) => {
        if (!mounted) return;
        setErrorMessage(getUserSafeErrorMessage(error));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadWorkspace]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      if (statusFilter === 'open' && (task.status === 'done' || task.status === 'canceled')) return false;
      if (statusFilter === 'done' && task.status !== 'done') return false;
      if (normalizedSearch && !task.title.toLowerCase().includes(normalizedSearch)) return false;
      return true;
    });
  }, [searchQuery, statusFilter, tasks]);

  const tasksByListId = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    grouped.set('', []);
    for (const list of lists) grouped.set(list.id, []);

    for (const task of filteredTasks) {
      const bucket = grouped.get(task.list_id ?? '');
      if (bucket) bucket.push(task);
    }

    return grouped;
  }, [filteredTasks, lists]);

  const openTasksCount = useMemo(
    () => tasks.filter((task) => task.status !== 'done' && task.status !== 'canceled').length,
    [tasks]
  );

  async function refreshWorkspace() {
    setIsRefreshing(true);
    setErrorMessage('');
    setFeedback('');

    try {
      await loadWorkspace();
      setFeedback('Tasks and lists have been refreshed.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createList() {
    if (!newListName.trim()) {
      setErrorMessage('List name is required.');
      return;
    }

    if (newListParentType !== 'none' && !newListParentId) {
      setErrorMessage('Select parent for selected parent type.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/lists', {
        method: 'POST',
        body: {
          name: newListName.trim(),
          color: newListColor,
          ...buildListParentPayload(newListParentType, newListParentId),
        },
      });
      setNewListName('');
      setNewListColor('#789262');
      setNewListParentType('none');
      setNewListParentId('');
      await loadWorkspace();
      setFeedback('List created successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    }
  }

  function startListEdit(list: ListItem) {
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListColor(list.color);
  }

  async function saveList(list: ListItem) {
    if (!editListName.trim()) {
      setErrorMessage('List name is required.');
      return;
    }

    setBusyListId(list.id);
    try {
      setErrorMessage('');
      await apiRequest(`/lists/${list.id}`, {
        method: 'PATCH',
        body: {
          name: editListName.trim(),
          color: editListColor,
          goal_id: list.goal_id,
          target_id: list.target_id,
          life_area_id: list.life_area_id,
        },
      });
      setEditingListId(null);
      await loadWorkspace();
      setFeedback('List updated successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyListId(null);
    }
  }

  function deleteList(listId: string) {
    Alert.alert('Delete list?', 'Tasks in this list will lose list assignment.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyListId(listId);
            try {
              await apiRequest(`/lists/${listId}`, { method: 'DELETE' });
              await loadWorkspace();
              setFeedback('List deleted successfully.');
            } catch (error) {
              setErrorMessage(getUserSafeErrorMessage(error));
            } finally {
              setBusyListId(null);
            }
          })();
        },
      },
    ]);
  }

  async function createTask() {
    if (!newTaskTitle.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }

    try {
      setErrorMessage('');
      await apiRequest('/tasks', {
        method: 'POST',
        body: {
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          list_id: newTaskListId || null,
        },
      });
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskListId('');
      await loadWorkspace();
      setFeedback('Task created successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    }
  }

  function startTaskEdit(task: TaskItem) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority);
    setEditTaskStatus(task.status);
    setEditTaskListId(task.list_id ?? '');
  }

  async function saveTask(taskId: string) {
    if (!editTaskTitle.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }

    setBusyTaskId(taskId);
    try {
      setErrorMessage('');
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: {
          title: editTaskTitle.trim(),
          priority: editTaskPriority,
          status: editTaskStatus,
          list_id: editTaskListId || null,
        },
      });
      setEditingTaskId(null);
      await loadWorkspace();
      setFeedback('Task updated successfully.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function toggleDone(task: TaskItem) {
    setBusyTaskId(task.id);
    try {
      await apiRequest(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: { status: task.status === 'done' ? 'todo' : 'done' },
      });
      await loadWorkspace();
      setFeedback(task.status === 'done' ? 'Task reopened.' : 'Task completed.');
    } catch (error) {
      setErrorMessage(getUserSafeErrorMessage(error));
    } finally {
      setBusyTaskId(null);
    }
  }

  function deleteTask(taskId: string) {
    Alert.alert('Delete task?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyTaskId(taskId);
            try {
              await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
              await loadWorkspace();
              setFeedback('Task deleted successfully.');
            } catch (error) {
              setErrorMessage(getUserSafeErrorMessage(error));
            } finally {
              setBusyTaskId(null);
            }
          })();
        },
      },
    ]);
  }

  const parentOptions =
    newListParentType === 'goal'
      ? goals.map((goal) => ({ id: goal.id, label: goal.title }))
      : newListParentType === 'target'
        ? targets.map((target) => ({ id: target.id, label: target.title }))
        : newListParentType === 'life_area'
          ? lifeAreas.map((lifeArea) => ({ id: lifeArea.id, label: lifeArea.name }))
          : [];

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={mobileUiTokens.accent} />
        <Text style={styles.loadingText}>Loading tasks and lists...</Text>
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
          <Text style={styles.heroTitle}>Tasks + Lists</Text>
          <Text style={styles.heroSubtitle}>Practical mobile flow for standalone tasks and list structure.</Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>Open: {openTasksCount}</Text>
            <Text style={styles.metric}>Lists: {lists.length}</Text>
            <Pressable onPress={() => void refreshWorkspace()} disabled={isRefreshing}>
              <Text style={styles.metric}>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </Pressable>
          </View>
        </View>

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create list</Text>
          <TextInput style={styles.input} value={newListName} onChangeText={setNewListName} placeholder='List name' />
          <TextInput style={styles.input} value={newListColor} onChangeText={setNewListColor} placeholder='#789262' />
          <View style={styles.rowWrap}>
            {(['none', 'goal', 'target', 'life_area'] as const).map((type) => (
              <Pressable key={type} style={[styles.chip, newListParentType === type && styles.chipActive]} onPress={() => { setNewListParentType(type); setNewListParentId(''); }}>
                <Text style={styles.chipText}>{type}</Text>
              </Pressable>
            ))}
          </View>
          {newListParentType !== 'none' ? (
            <View style={styles.rowWrap}>
              {parentOptions.map((option) => (
                <Pressable key={option.id} style={[styles.chip, newListParentId === option.id && styles.chipActive]} onPress={() => setNewListParentId(option.id)}>
                  <Text style={styles.chipText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Pressable style={styles.primaryButton} onPress={() => void createList()}>
            <Text style={styles.primaryButtonText}>Create list</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create task</Text>
          <TextInput style={styles.input} value={newTaskTitle} onChangeText={setNewTaskTitle} placeholder='Task title' />
          <View style={styles.rowWrap}>
            {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
              <Pressable key={priority} style={[styles.chip, newTaskPriority === priority && styles.chipActive]} onPress={() => setNewTaskPriority(priority)}>
                <Text style={styles.chipText}>{priority}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.rowWrap}>
            <Pressable style={[styles.chip, newTaskListId === '' && styles.chipActive]} onPress={() => setNewTaskListId('')}>
              <Text style={styles.chipText}>No list</Text>
            </Pressable>
            {lists.map((list) => (
              <Pressable key={list.id} style={[styles.chip, newTaskListId === list.id && styles.chipActive]} onPress={() => setNewTaskListId(list.id)}>
                <Text style={styles.chipText}>{list.name}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void createTask()}>
            <Text style={styles.primaryButtonText}>Create task</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Filters</Text>
          <TextInput style={styles.input} value={searchQuery} onChangeText={setSearchQuery} placeholder='Search tasks' />
          <View style={styles.rowWrap}>
            {(['all', 'open', 'done'] as const).map((filter) => (
              <Pressable key={filter} style={[styles.chip, statusFilter === filter && styles.chipActive]} onPress={() => setStatusFilter(filter)}>
                <Text style={styles.chipText}>{filter}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>No list tasks</Text>
          {(tasksByListId.get('') ?? []).map((task) => (
            <View key={task.id} style={styles.taskCard}>
              {editingTaskId === task.id ? (
                <View style={styles.stack}>
                  <TextInput style={styles.input} value={editTaskTitle} onChangeText={setEditTaskTitle} />
                  <View style={styles.rowWrap}>
                    {(['todo', 'in_progress', 'done', 'canceled'] as const).map((status) => (
                      <Pressable key={status} style={[styles.chip, editTaskStatus === status && styles.chipActive]} onPress={() => setEditTaskStatus(status)}>
                        <Text style={styles.chipText}>{status}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.rowWrap}>
                    {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                      <Pressable key={priority} style={[styles.chip, editTaskPriority === priority && styles.chipActive]} onPress={() => setEditTaskPriority(priority)}>
                        <Text style={styles.chipText}>{priority}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.rowWrap}>
                    <Pressable style={[styles.chip, editTaskListId === '' && styles.chipActive]} onPress={() => setEditTaskListId('')}><Text style={styles.chipText}>No list</Text></Pressable>
                    {lists.map((list) => (
                      <Pressable key={`edit-${list.id}`} style={[styles.chip, editTaskListId === list.id && styles.chipActive]} onPress={() => setEditTaskListId(list.id)}>
                        <Text style={styles.chipText}>{list.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable style={styles.primaryButton} onPress={() => void saveTask(task.id)} disabled={busyTaskId === task.id}>
                    <Text style={styles.primaryButtonText}>Save task</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskMeta}>{formatStatus(task.status)} • {formatPriority(task.priority)}</Text>
                  <View style={styles.rowWrap}>
                    <Pressable style={styles.ghostButton} onPress={() => void toggleDone(task)}><Text style={styles.ghostText}>{task.status === 'done' ? 'Reopen' : 'Done'}</Text></Pressable>
                    <Pressable style={styles.ghostButton} onPress={() => startTaskEdit(task)}><Text style={styles.ghostText}>Edit</Text></Pressable>
                    <Pressable style={styles.ghostButton} onPress={() => deleteTask(task.id)}><Text style={styles.ghostText}>Delete</Text></Pressable>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        {lists.map((list) => (
          <View key={list.id} style={[styles.panel, { borderTopWidth: 3, borderTopColor: list.color }]}>
            <View style={styles.rowWrap}>
              <Text style={styles.panelTitle}>{list.name}</Text>
              <Pressable style={styles.ghostButton} onPress={() => startListEdit(list)}>
                <Text style={styles.ghostText}>Edit list</Text>
              </Pressable>
              <Pressable style={styles.ghostButton} onPress={() => deleteList(list.id)} disabled={busyListId === list.id}>
                <Text style={styles.ghostText}>{busyListId === list.id ? 'Deleting...' : 'Delete list'}</Text>
              </Pressable>
            </View>

            {editingListId === list.id ? (
              <View style={styles.stack}>
                <TextInput style={styles.input} value={editListName} onChangeText={setEditListName} />
                <TextInput style={styles.input} value={editListColor} onChangeText={setEditListColor} />
                <Pressable style={styles.primaryButton} onPress={() => void saveList(list)} disabled={busyListId === list.id}>
                  <Text style={styles.primaryButtonText}>{busyListId === list.id ? 'Saving...' : 'Save list'}</Text>
                </Pressable>
              </View>
            ) : null}

            {(tasksByListId.get(list.id) ?? []).length === 0 ? <Text style={styles.taskMeta}>No tasks.</Text> : null}
            {(tasksByListId.get(list.id) ?? []).map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>{formatStatus(task.status)} • {formatPriority(task.priority)}</Text>
                <View style={styles.rowWrap}>
                  <Pressable style={styles.ghostButton} onPress={() => void toggleDone(task)}>
                    <Text style={styles.ghostText}>{task.status === 'done' ? 'Reopen' : 'Done'}</Text>
                  </Pressable>
                  <Pressable style={styles.ghostButton} onPress={() => startTaskEdit(task)}>
                    <Text style={styles.ghostText}>Edit</Text>
                  </Pressable>
                  <Pressable style={styles.ghostButton} onPress={() => deleteTask(task.id)}>
                    <Text style={styles.ghostText}>Delete</Text>
                  </Pressable>
                </View>
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
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 999, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { borderColor: mobileUiTokens.accent, backgroundColor: mobileUiTokens.accentSoft },
  chipText: { color: mobileUiTokens.ink, fontSize: 12 },
  primaryButton: { borderWidth: 1, borderColor: mobileUiTokens.accent, backgroundColor: mobileUiTokens.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fbfdf9', fontSize: 13, fontWeight: '700' },
  taskCard: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', gap: 8 },
  taskTitle: { color: mobileUiTokens.ink, fontSize: 14, fontWeight: '600' },
  taskMeta: { color: mobileUiTokens.muted, fontSize: 12 },
  ghostButton: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#fff' },
  ghostText: { color: mobileUiTokens.ink, fontSize: 12, fontWeight: '600' },
  stack: { gap: 8 },
});

