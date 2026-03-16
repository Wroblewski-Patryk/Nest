<?php

namespace App\Integrations\Services;

class IntegrationConflictPolicyMatrixService
{
    /**
     * @return array<string, array<string, array<string, string>>>
     */
    public function matrix(): array
    {
        return [
            'trello' => [
                'task' => [
                    'title' => 'manual_queue',
                    'due_date' => 'manual_queue',
                    'status' => 'auto_latest_timestamp',
                    'priority' => 'auto_latest_timestamp',
                    'description' => 'auto_latest_timestamp',
                    'list_id' => 'auto_latest_timestamp',
                ],
                'task_list' => [
                    'name' => 'manual_queue',
                    'position' => 'auto_latest_timestamp',
                    'color' => 'auto_latest_timestamp',
                ],
            ],
            'google_tasks' => [
                'task' => [
                    'title' => 'manual_queue',
                    'due_date' => 'manual_queue',
                    'status' => 'auto_latest_timestamp',
                    'priority' => 'auto_latest_timestamp',
                    'description' => 'auto_latest_timestamp',
                    'list_id' => 'auto_latest_timestamp',
                ],
                'task_list' => [
                    'name' => 'manual_queue',
                    'position' => 'auto_latest_timestamp',
                    'color' => 'auto_latest_timestamp',
                ],
            ],
            'todoist' => [
                'task' => [
                    'title' => 'manual_queue',
                    'due_date' => 'manual_queue',
                    'status' => 'auto_latest_timestamp',
                    'priority' => 'auto_latest_timestamp',
                    'description' => 'auto_latest_timestamp',
                    'list_id' => 'auto_latest_timestamp',
                ],
                'task_list' => [
                    'name' => 'manual_queue',
                    'position' => 'auto_latest_timestamp',
                    'color' => 'auto_latest_timestamp',
                ],
            ],
            'google_calendar' => [
                'calendar_event' => [
                    'title' => 'manual_queue',
                    'start_at' => 'manual_queue',
                    'end_at' => 'manual_queue',
                    'timezone' => 'manual_queue',
                    'all_day' => 'manual_queue',
                    'description' => 'auto_latest_timestamp',
                    'linked_entity_type' => 'auto_latest_timestamp',
                    'linked_entity_id' => 'auto_latest_timestamp',
                ],
            ],
            'obsidian' => [
                'journal_entry' => [
                    'title' => 'manual_queue',
                    'entry_date' => 'manual_queue',
                    'mood' => 'manual_queue',
                    'body' => 'auto_latest_timestamp',
                    'life_areas' => 'auto_latest_timestamp',
                ],
            ],
        ];
    }

    /**
     * @param  list<string>  $candidateFields
     * @return list<string>
     */
    public function manualQueueFields(string $provider, string $entityType, array $candidateFields): array
    {
        $rules = $this->matrix()[$provider][$entityType] ?? [];
        if ($rules === [] || $candidateFields === []) {
            return [];
        }

        $allowed = [];
        foreach ($candidateFields as $field) {
            if (($rules[$field] ?? null) === 'manual_queue') {
                $allowed[] = $field;
            }
        }

        return array_values(array_unique($allowed));
    }
}
