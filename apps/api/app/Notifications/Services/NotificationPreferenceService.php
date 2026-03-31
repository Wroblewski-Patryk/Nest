<?php

namespace App\Notifications\Services;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

class NotificationPreferenceService
{
    /**
     * @var list<string>
     */
    public const CHANNELS = ['push', 'email', 'in_app'];

    /**
     * @var list<string>
     */
    public const EVENT_TYPES = [
        'task_assigned',
        'task_handoff',
        'task_reminder_owner_changed',
        'task_due_today',
        'calendar_event_assigned',
        'calendar_event_handoff',
        'calendar_reminder_owner_changed',
        'calendar_upcoming',
    ];

    /**
     * @var array<string, bool>
     */
    private const DEFAULT_CHANNELS = [
        'push' => true,
        'email' => false,
        'in_app' => true,
    ];

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function updateForUser(User $user, array $payload): array
    {
        $preference = $this->getOrCreatePreference($user);
        $current = $this->toEffectiveConfig($user, $preference);

        $nextChannels = $current['channels'];
        if (array_key_exists('channels', $payload) && is_array($payload['channels'])) {
            $nextChannels = $this->normalizeChannelMap($payload['channels'], $nextChannels);
        }

        $nextEventChannels = $current['event_channels'];
        if (array_key_exists('event_channels', $payload) && is_array($payload['event_channels'])) {
            $nextEventChannels = $this->normalizeEventChannelMap($payload['event_channels'], $nextChannels);
        }

        $quietHours = $current['quiet_hours'];
        if (array_key_exists('quiet_hours', $payload) && is_array($payload['quiet_hours'])) {
            $input = $payload['quiet_hours'];
            $quietHours = [
                'enabled' => array_key_exists('enabled', $input) ? (bool) $input['enabled'] : (bool) $quietHours['enabled'],
                'start' => $this->normalizeTime(
                    array_key_exists('start', $input) ? (string) $input['start'] : (string) $quietHours['start']
                ),
                'end' => $this->normalizeTime(
                    array_key_exists('end', $input) ? (string) $input['end'] : (string) $quietHours['end']
                ),
                'timezone' => array_key_exists('timezone', $input) ? (string) $input['timezone'] : (string) $quietHours['timezone'],
            ];
        }

        $locale = array_key_exists('locale', $payload) && is_string($payload['locale']) && $payload['locale'] !== ''
            ? $payload['locale']
            : (string) $current['locale'];

        $preference->fill([
            'channels' => $nextChannels,
            'event_channels' => $nextEventChannels,
            'quiet_hours_enabled' => (bool) $quietHours['enabled'],
            'quiet_hours_start' => (string) $quietHours['start'],
            'quiet_hours_end' => (string) $quietHours['end'],
            'quiet_hours_timezone' => (string) $quietHours['timezone'],
            'locale' => $locale,
        ]);
        $preference->save();

        return $this->toEffectiveConfig($user, $preference->fresh());
    }

    /**
     * @return array<string, mixed>
     */
    public function getForUser(User $user): array
    {
        return $this->toEffectiveConfig($user, $this->getOrCreatePreference($user));
    }

    /**
     * @return array{deliver:bool,failure_reason:string|null}
     */
    public function evaluateChannel(User $user, string $eventType, string $channel, ?Carbon $now = null): array
    {
        if (! in_array($channel, self::CHANNELS, true)) {
            throw new InvalidArgumentException('Unsupported notification channel: '.$channel);
        }

        $config = $this->getForUser($user);
        $channels = $config['channels'];
        $eventChannels = $config['event_channels'];
        $quietHours = $config['quiet_hours'];

        $channelEnabled = (bool) (
            $eventChannels[$eventType][$channel]
            ?? $channels[$channel]
            ?? self::DEFAULT_CHANNELS[$channel]
        );

        if (! $channelEnabled) {
            return [
                'deliver' => false,
                'failure_reason' => 'channel_disabled',
            ];
        }

        if ($channel === 'in_app') {
            return [
                'deliver' => true,
                'failure_reason' => null,
            ];
        }

        if (! (bool) $quietHours['enabled']) {
            return [
                'deliver' => true,
                'failure_reason' => null,
            ];
        }

        $timezone = (string) $quietHours['timezone'];
        $localNow = ($now ?? Carbon::now())->copy()->timezone($timezone);
        $minutes = (int) $localNow->format('H') * 60 + (int) $localNow->format('i');
        $startMinutes = $this->toMinutes((string) $quietHours['start']);
        $endMinutes = $this->toMinutes((string) $quietHours['end']);

        $isSuppressed = false;
        if ($startMinutes === $endMinutes) {
            $isSuppressed = true;
        } elseif ($startMinutes < $endMinutes) {
            $isSuppressed = $minutes >= $startMinutes && $minutes < $endMinutes;
        } else {
            $isSuppressed = $minutes >= $startMinutes || $minutes < $endMinutes;
        }

        if ($isSuppressed) {
            return [
                'deliver' => false,
                'failure_reason' => 'quiet_hours_window',
            ];
        }

        return [
            'deliver' => true,
            'failure_reason' => null,
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @param  array<string, bool>  $fallback
     * @return array<string, bool>
     */
    private function normalizeChannelMap(array $input, array $fallback): array
    {
        $result = [];
        foreach (self::CHANNELS as $channel) {
            $result[$channel] = array_key_exists($channel, $input)
                ? (bool) $input[$channel]
                : (bool) ($fallback[$channel] ?? self::DEFAULT_CHANNELS[$channel]);
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $input
     * @param  array<string, bool>  $fallbackChannels
     * @return array<string, array<string, bool>>
     */
    private function normalizeEventChannelMap(array $input, array $fallbackChannels): array
    {
        $result = [];
        foreach ($input as $eventType => $channels) {
            if (! is_string($eventType) || $eventType === '' || ! is_array($channels)) {
                continue;
            }

            $result[$eventType] = $this->normalizeChannelMap($channels, $fallbackChannels);
        }

        foreach (self::EVENT_TYPES as $eventType) {
            if (! array_key_exists($eventType, $result)) {
                $result[$eventType] = $fallbackChannels;
            }
        }

        return $result;
    }

    private function getOrCreatePreference(User $user): NotificationPreference
    {
        $locale = $this->resolveLocaleFromUser($user);
        $quietHours = $this->defaultQuietHoursWindowForLocale($locale);

        return NotificationPreference::query()->firstOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
            ],
            [
                'channels' => self::DEFAULT_CHANNELS,
                'event_channels' => $this->defaultEventChannels(self::DEFAULT_CHANNELS),
                'quiet_hours_enabled' => false,
                'quiet_hours_start' => $quietHours['start'],
                'quiet_hours_end' => $quietHours['end'],
                'quiet_hours_timezone' => $this->resolveTimezone($user->timezone),
                'locale' => $locale,
            ]
        );
    }

    /**
     * @param  array<string, bool>  $channels
     * @return array<string, array<string, bool>>
     */
    private function defaultEventChannels(array $channels): array
    {
        $result = [];
        foreach (self::EVENT_TYPES as $eventType) {
            $result[$eventType] = $channels;
        }

        return $result;
    }

    /**
     * @return array<string, mixed>
     */
    private function toEffectiveConfig(User $user, ?NotificationPreference $preference): array
    {
        $locale = $this->resolveLocaleFromPreference($user, $preference);
        $quietHoursDefaults = $this->defaultQuietHoursWindowForLocale($locale);
        $channels = $this->normalizeChannelMap(
            is_array($preference?->channels) ? $preference->channels : [],
            self::DEFAULT_CHANNELS
        );
        $eventChannels = $this->normalizeEventChannelMap(
            is_array($preference?->event_channels) ? $preference->event_channels : [],
            $channels
        );

        return [
            'channels' => $channels,
            'event_channels' => $eventChannels,
            'quiet_hours' => [
                'enabled' => (bool) ($preference?->quiet_hours_enabled ?? false),
                'start' => $this->normalizeTime((string) ($preference?->quiet_hours_start ?? $quietHoursDefaults['start'])),
                'end' => $this->normalizeTime((string) ($preference?->quiet_hours_end ?? $quietHoursDefaults['end'])),
                'timezone' => $this->resolveTimezone((string) ($preference?->quiet_hours_timezone ?? $user->timezone)),
            ],
            'locale' => $locale,
            'supported_event_types' => self::EVENT_TYPES,
        ];
    }

    /**
     * @return array{start:string,end:string}
     */
    private function defaultQuietHoursWindowForLocale(string $locale): array
    {
        $normalized = strtolower(trim($locale));

        if (str_starts_with($normalized, 'pl')) {
            return ['start' => '21:00', 'end' => '06:00'];
        }

        return ['start' => '22:00', 'end' => '07:00'];
    }

    private function resolveLocaleFromUser(User $user): string
    {
        $settings = is_array($user->settings) ? $user->settings : [];
        $locale = $settings['locale'] ?? null;

        if (is_string($locale) && $locale !== '') {
            return $locale;
        }

        $language = is_string($settings['language'] ?? null) ? strtolower((string) $settings['language']) : 'en';

        return $language === 'pl' ? 'pl-PL' : 'en-US';
    }

    private function resolveLocaleFromPreference(User $user, ?NotificationPreference $preference): string
    {
        if (is_string($preference?->locale) && $preference->locale !== '') {
            return $preference->locale;
        }

        return $this->resolveLocaleFromUser($user);
    }

    private function resolveTimezone(?string $timezone): string
    {
        if (! is_string($timezone) || $timezone === '') {
            return 'UTC';
        }

        try {
            new \DateTimeZone($timezone);
        } catch (\Throwable) {
            return 'UTC';
        }

        return $timezone;
    }

    private function toMinutes(string $hhmm): int
    {
        [$hour, $minute] = explode(':', $hhmm);

        return max(0, min(23, (int) $hour)) * 60 + max(0, min(59, (int) $minute));
    }

    private function normalizeTime(string $value): string
    {
        $parts = explode(':', $value);
        $hour = isset($parts[0]) ? (int) $parts[0] : 0;
        $minute = isset($parts[1]) ? (int) $parts[1] : 0;

        return sprintf('%02d:%02d', max(0, min(23, $hour)), max(0, min(59, $minute)));
    }
}
