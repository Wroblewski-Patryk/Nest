import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  translate,
  type CalendarEventCreatePayload,
  type CalendarEventItem,
  type CalendarEventUpdatePayload,
  type IntegrationConflictItem,
  type IntegrationConnectionItem,
  type IntegrationHealthProviderItem,
} from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { calendarData } from '@/constants/mvpData';
import { mobileUiTokens } from '@/constants/uiTokens';
import { useUiLanguage } from '@/lib/ui-language';
import { getUserSafeErrorMessage } from '@/lib/ux-contract';

const supportedProviders = ['trello', 'google_tasks', 'todoist', 'clickup', 'microsoft_todo', 'google_calendar', 'obsidian'] as const;
type SupportedProvider = (typeof supportedProviders)[number];
type EventDraft = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
};

function asProvider(provider: string): SupportedProvider | null {
  if ((supportedProviders as readonly string[]).includes(provider)) {
    return provider as SupportedProvider;
  }

  return null;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function toLocalDateTimeInput(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(
    date.getHours()
  )}:${padDatePart(date.getMinutes())}`;
}

function createDefaultEventDraft(): EventDraft {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    title: '',
    description: '',
    startAt: toLocalDateTimeInput(start),
    endAt: toLocalDateTimeInput(end),
  };
}

function parseDateTimeInput(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function formatEventTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export default function CalendarScreen() {
  const language = useUiLanguage();
  const t = (key: string, fallback: string) => translate(key, language, fallback);
  const [conflicts, setConflicts] = useState<IntegrationConflictItem[]>([]);
  const [connections, setConnections] = useState<IntegrationConnectionItem[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [healthItems, setHealthItems] = useState<IntegrationHealthProviderItem[]>([]);
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [healthBusyKey, setHealthBusyKey] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventDraft, setEventDraft] = useState<EventDraft>(() => createDefaultEventDraft());
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EventDraft>(() => createDefaultEventDraft());
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventFeedback, setEventFeedback] = useState('Loading calendar events...');
  const [eventError, setEventError] = useState('');

  const updateEventDraft = useCallback((key: keyof EventDraft, value: string) => {
    setEventDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const updateEditDraft = useCallback((key: keyof EventDraft, value: string) => {
    setEditDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const loadConflicts = useCallback(async () => {
    const response = await nestApiClient.getIntegrationConflicts({
      provider: 'google_calendar',
      per_page: 10,
    });
    setConflicts(response.data ?? []);
  }, []);

  const loadConnections = useCallback(async () => {
    const response = await nestApiClient.getIntegrationConnections();
    setConnections(response.data ?? []);
  }, []);

  const loadHealth = useCallback(async () => {
    const response = await nestApiClient.getIntegrationHealth({ window_hours: 24 });
    setHealthItems(response.data ?? []);
  }, []);

  const loadEvents = useCallback(async () => {
    const response = await nestApiClient.getCalendarEvents({
      per_page: 100,
      sort: 'start_at',
    });
    setEvents((response.data ?? []) as CalendarEventItem[]);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadConflicts().catch(() => {
      if (!mounted) return;
      setConflicts([]);
    });

    loadConnections().catch(() => {
      if (!mounted) return;
      setConnections([]);
    });
    loadHealth().catch(() => {
      if (!mounted) return;
      setHealthItems([]);
    });
    loadEvents()
      .then(() => {
        if (mounted) setEventFeedback('Calendar events are ready.');
      })
      .catch((error) => {
        if (!mounted) return;
        setEventError(getUserSafeErrorMessage(error));
      })
      .finally(() => {
        if (mounted) setIsLoadingEvents(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadConflicts, loadConnections, loadHealth, loadEvents]);

  const refreshEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    setEventError('');
    try {
      await loadEvents();
      setEventFeedback('Calendar events refreshed.');
    } catch (error) {
      setEventError(getUserSafeErrorMessage(error));
    } finally {
      setIsLoadingEvents(false);
    }
  }, [loadEvents]);

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .sort((first, second) => Date.parse(first.start_at) - Date.parse(second.start_at))
        .slice(0, 8),
    [events]
  );

  const activeEvent = useMemo(() => {
    const now = Date.now();
    return upcomingEvents.find((item) => Date.parse(item.end_at) >= now) ?? upcomingEvents[0] ?? null;
  }, [upcomingEvents]);

  function buildEventPayload(draft: EventDraft): CalendarEventCreatePayload | CalendarEventUpdatePayload | null {
    const title = draft.title.trim();
    if (!title) {
      setEventError('Event title is required.');
      return null;
    }

    const startAt = parseDateTimeInput(draft.startAt);
    const endAt = parseDateTimeInput(draft.endAt);
    if (!startAt || !endAt) {
      setEventError('Start and end date-time are required.');
      return null;
    }

    if (Date.parse(endAt) <= Date.parse(startAt)) {
      setEventError('End time must be after start time.');
      return null;
    }

    return {
      title,
      description: draft.description.trim() || null,
      start_at: startAt,
      end_at: endAt,
      timezone: getTimezone(),
      all_day: false,
    };
  }

  const createEvent = useCallback(async () => {
    const payload = buildEventPayload(eventDraft) as CalendarEventCreatePayload | null;
    if (!payload) return;

    setIsCreatingEvent(true);
    setEventError('');
    setEventFeedback('');
    try {
      await nestApiClient.createCalendarEvent(payload);
      setEventDraft(createDefaultEventDraft());
      await loadEvents();
      setEventFeedback('Calendar event created.');
    } catch (error) {
      setEventError(getUserSafeErrorMessage(error));
    } finally {
      setIsCreatingEvent(false);
    }
  }, [eventDraft, loadEvents]);

  const startEventEdit = useCallback((item: CalendarEventItem) => {
    setEditingEventId(item.id);
    setEditDraft({
      title: item.title,
      description: item.description ?? '',
      startAt: toLocalDateTimeInput(item.start_at),
      endAt: toLocalDateTimeInput(item.end_at),
    });
    setEventError('');
    setEventFeedback(`Editing ${item.title}.`);
  }, []);

  const cancelEventEdit = useCallback(() => {
    setEditingEventId(null);
    setEditDraft(createDefaultEventDraft());
    setEventFeedback('Event edit canceled.');
  }, []);

  const saveEventEdit = useCallback(
    async (eventId: string) => {
      const payload = buildEventPayload(editDraft) as CalendarEventUpdatePayload | null;
      if (!payload) return;

      setBusyEventId(eventId);
      setEventError('');
      setEventFeedback('');
      try {
        await nestApiClient.updateCalendarEvent(eventId, payload);
        setEditingEventId(null);
        await loadEvents();
        setEventFeedback('Calendar event updated.');
      } catch (error) {
        setEventError(getUserSafeErrorMessage(error));
      } finally {
        setBusyEventId(null);
      }
    },
    [editDraft, loadEvents]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      Alert.alert('Delete event?', 'This calendar event will be removed.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusyEventId(eventId);
              setEventError('');
              setEventFeedback('');
              try {
                await nestApiClient.deleteCalendarEvent(eventId);
                if (editingEventId === eventId) {
                  setEditingEventId(null);
                }
                await loadEvents();
                setEventFeedback('Calendar event deleted.');
              } catch (error) {
                setEventError(getUserSafeErrorMessage(error));
              } finally {
                setBusyEventId(null);
              }
            })();
          },
        },
      ]);
    },
    [editingEventId, loadEvents]
  );

  const prepareNewEvent = useCallback(() => {
    setEventDraft(createDefaultEventDraft());
    setEventError('');
    setEventFeedback('Add event form is ready below.');
  }, []);

  const resolveConflict = useCallback(
    async (conflictId: string, action: 'accept' | 'override') => {
      setResolvingId(conflictId);
      try {
        await nestApiClient.resolveIntegrationConflict(
          conflictId,
          action,
          action === 'override' ? { strategy: 'keep_internal' } : undefined
        );
        await loadConflicts();
      } finally {
        setResolvingId(null);
      }
    },
    [loadConflicts]
  );

  const revokeProvider = useCallback(
    async (provider: string) => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      setBusyProvider(provider);
      try {
        await nestApiClient.revokeIntegrationConnection(typedProvider);
        await loadConnections();
      } finally {
        setBusyProvider(null);
      }
    },
    [loadConnections]
  );

  const remediateProvider = useCallback(
    async (provider: string, action: 'replay_latest_failure' | 'reconnect_provider') => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      const key = `${provider}:${action}`;
      setHealthBusyKey(key);
      setHealthMessage(null);

      try {
        const response = await nestApiClient.remediateIntegrationHealth(typedProvider, action);
        setHealthMessage(`${provider}: ${response.data.message}`);
        await loadHealth();
      } finally {
        setHealthBusyKey(null);
      }
    },
    [loadHealth]
  );

  const forceCalendarSync = useCallback(async () => {
    setEventError('');
    setEventFeedback('Syncing Google Calendar...');
    try {
      await nestApiClient.syncCalendar('google_calendar');
      await Promise.all([loadEvents(), loadConflicts(), loadHealth()]);
      setEventFeedback('Calendar sync completed.');
    } catch (error) {
      setEventError(getUserSafeErrorMessage(error));
    }
  }, [loadConflicts, loadEvents, loadHealth]);

  return (
    <ModuleScreen
      moduleKey={calendarData.module}
      title={t('mobile.calendar.title', 'Calendar')}
      subtitle={t('mobile.calendar.subtitle', 'Plan events linked to tasks, goals, and routines.')}
      state={calendarData.state}
      telemetry={calendarData.telemetry}
      metrics={calendarData.metrics}
      rows={calendarData.rows}
      intentProgress={0.64}
      quickActions={[
        { label: t('mobile.calendar.quick_action.add_event', 'Add event'), variant: 'primary', onPress: prepareNewEvent },
        { label: t('mobile.calendar.quick_action.force_sync', 'Force sync'), variant: 'secondary', onPress: forceCalendarSync },
      ]}
      conflicts={{
        items: conflicts.map((conflict) => ({
          id: conflict.id,
          provider: conflict.provider,
          entityType: conflict.internal_entity_type,
          fields: conflict.conflict_fields,
          mergeState: conflict.merge_state,
          autoMergeFields: conflict.merge_policy?.auto_merge_fields ?? [],
          comparison: conflict.comparison,
        })),
        onResolve: resolveConflict,
        resolvingId,
      }}
      connections={{
        items: connections,
        onRevoke: revokeProvider,
        busyProvider,
        connectUnavailableMessage: 'Provider connect is outside the V1 founder-ready scope. Use Nest-first events for now.',
      }}
      integrationHealth={{
        items: healthItems,
        onRemediate: remediateProvider,
        busyKey: healthBusyKey,
        message: healthMessage,
      }}
    >
      <View style={styles.panel}>
        <View style={styles.panelHeaderRow}>
          <View style={styles.panelHeaderText}>
            <Text style={styles.panelTitle}>Calendar events</Text>
            <Text style={styles.panelDetail}>
              {activeEvent
                ? `Next: ${activeEvent.title} at ${formatEventTime(activeEvent.start_at)}`
                : 'Create the first event for your day.'}
            </Text>
          </View>
          <Pressable
            style={styles.ghostButton}
            onPress={() => void refreshEvents()}
            disabled={isLoadingEvents}
            accessibilityRole="button"
            accessibilityLabel="Refresh calendar events"
          >
            <Text style={styles.ghostText}>{isLoadingEvents ? 'Refreshing...' : 'Refresh'}</Text>
          </Pressable>
        </View>

        {eventError ? <Text style={styles.errorText}>{eventError}</Text> : null}
        {eventFeedback ? <Text style={styles.feedbackText}>{eventFeedback}</Text> : null}
        {isLoadingEvents ? <ActivityIndicator color={mobileUiTokens.accent} accessibilityLabel="Loading calendar events" /> : null}

        <View style={styles.formStack}>
          <TextInput
            style={styles.input}
            value={eventDraft.title}
            onChangeText={(value) => updateEventDraft('title', value)}
            placeholder="Event title"
            accessibilityLabel="Event title"
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={eventDraft.description}
            onChangeText={(value) => updateEventDraft('description', value)}
            placeholder="Description"
            multiline
            accessibilityLabel="Event description"
          />
          <View style={styles.splitRow}>
            <TextInput
              style={[styles.input, styles.splitInput]}
              value={eventDraft.startAt}
              onChangeText={(value) => updateEventDraft('startAt', value)}
              placeholder="Start YYYY-MM-DDTHH:mm"
              accessibilityLabel="Event start date and time"
            />
            <TextInput
              style={[styles.input, styles.splitInput]}
              value={eventDraft.endAt}
              onChangeText={(value) => updateEventDraft('endAt', value)}
              placeholder="End YYYY-MM-DDTHH:mm"
              accessibilityLabel="Event end date and time"
            />
          </View>
          <Pressable
            style={styles.primaryButton}
            onPress={() => void createEvent()}
            disabled={isCreatingEvent}
            accessibilityRole="button"
            accessibilityLabel="Create calendar event"
          >
            <Text style={styles.primaryButtonText}>{isCreatingEvent ? 'Creating...' : 'Create event'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Upcoming events</Text>
        {upcomingEvents.length === 0 && !isLoadingEvents ? (
          <Text style={styles.emptyText}>No calendar events yet.</Text>
        ) : null}

        {upcomingEvents.map((item) => (
          <View key={item.id} style={styles.eventCard}>
            {editingEventId === item.id ? (
              <View style={styles.formStack}>
                <TextInput
                  style={styles.input}
                  value={editDraft.title}
                  onChangeText={(value) => updateEditDraft('title', value)}
                  placeholder="Event title"
                  accessibilityLabel={`Edit title for ${item.title}`}
                />
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={editDraft.description}
                  onChangeText={(value) => updateEditDraft('description', value)}
                  placeholder="Description"
                  multiline
                  accessibilityLabel={`Edit description for ${item.title}`}
                />
                <View style={styles.splitRow}>
                  <TextInput
                    style={[styles.input, styles.splitInput]}
                    value={editDraft.startAt}
                    onChangeText={(value) => updateEditDraft('startAt', value)}
                    placeholder="Start YYYY-MM-DDTHH:mm"
                    accessibilityLabel={`Edit start date and time for ${item.title}`}
                  />
                  <TextInput
                    style={[styles.input, styles.splitInput]}
                    value={editDraft.endAt}
                    onChangeText={(value) => updateEditDraft('endAt', value)}
                    placeholder="End YYYY-MM-DDTHH:mm"
                    accessibilityLabel={`Edit end date and time for ${item.title}`}
                  />
                </View>
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => void saveEventEdit(item.id)}
                    disabled={busyEventId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Save ${item.title}`}
                  >
                    <Text style={styles.primaryButtonText}>{busyEventId === item.id ? 'Saving...' : 'Save event'}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.ghostButton}
                    onPress={cancelEventEdit}
                    disabled={busyEventId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Cancel editing ${item.title}`}
                  >
                    <Text style={styles.ghostText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.eventHeader}>
                  <View style={styles.eventCopy}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventDetail}>{formatEventTime(item.start_at)} - {formatEventTime(item.end_at)}</Text>
                    {item.description ? <Text style={styles.eventDetail}>{item.description}</Text> : null}
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.source || 'Nest'}</Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.ghostButton}
                    onPress={() => startEventEdit(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.title}`}
                  >
                    <Text style={styles.ghostText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={styles.ghostButton}
                    onPress={() => deleteEvent(item.id)}
                    disabled={busyEventId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.title}`}
                  >
                    <Text style={styles.ghostText}>{busyEventId === item.id ? 'Deleting...' : 'Delete'}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    </ModuleScreen>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  panelHeaderText: {
    flex: 1,
    gap: 4,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: mobileUiTokens.ink,
  },
  panelDetail: {
    color: mobileUiTokens.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackText: {
    color: '#4f6f43',
    backgroundColor: '#edf5e8',
    borderWidth: 1,
    borderColor: '#c9dfbd',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  errorText: {
    color: '#a02121',
    backgroundColor: '#ffe3e1',
    borderWidth: 1,
    borderColor: '#e0aaa4',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  formStack: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    borderRadius: 14,
    backgroundColor: '#fffdf7',
    color: mobileUiTokens.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  splitInput: {
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: mobileUiTokens.accent,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fffdf7',
    fontWeight: '800',
  },
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  ghostText: {
    color: mobileUiTokens.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    color: mobileUiTokens.muted,
    fontSize: 13,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    backgroundColor: '#fffaf0',
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  eventCopy: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    color: mobileUiTokens.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  eventDetail: {
    color: mobileUiTokens.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#edf5e8',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    color: '#4f6f43',
    fontSize: 11,
    fontWeight: '800',
  },
});
