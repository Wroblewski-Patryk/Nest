<?php

namespace Tests\Unit;

use App\Integrations\Adapters\GoogleCalendarAdapter;
use Tests\TestCase;

class GoogleCalendarAdapterTest extends TestCase
{
    public function test_adapter_maps_calendar_payload_to_consistent_google_calendar_shape(): void
    {
        $adapter = new GoogleCalendarAdapter;

        $result = $adapter->sync([
            'internal_entity_type' => 'calendar_event',
            'external_id' => 'gcal-event-1',
            'entity_payload' => [
                'title' => 'Deep Work',
                'description' => 'Focus block',
                'start_at' => '2026-03-20T08:00:00+01:00',
                'end_at' => '2026-03-20T09:00:00+01:00',
                'timezone' => 'Europe/Warsaw',
                'all_day' => false,
            ],
        ]);

        $this->assertSame('gcal-event-1', $result->externalId);
        $this->assertSame('success', $result->status);
        $this->assertSame('google_calendar.v1', $result->metadata['mapping_version']);
        $this->assertSame('calendar_event', $result->metadata['mapped_entity_type']);
        $this->assertContains('summary', $result->metadata['mapped_fields']);
        $this->assertContains('start', $result->metadata['mapped_fields']);
    }
}
