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
        $partition = $this->partitionConflictFields($provider, $entityType, $candidateFields);

        return $partition['manual_queue_fields'];
    }

    /**
     * @param  list<string>  $candidateFields
     * @return array{manual_queue_fields:list<string>,auto_merge_fields:list<string>}
     */
    public function partitionConflictFields(string $provider, string $entityType, array $candidateFields): array
    {
        $rules = $this->matrix()[$provider][$entityType] ?? [];
        if ($rules === [] || $candidateFields === []) {
            return [
                'manual_queue_fields' => [],
                'auto_merge_fields' => [],
            ];
        }

        $manual = [];
        $auto = [];
        foreach ($candidateFields as $field) {
            $mode = $rules[$field] ?? null;
            if ($mode === 'manual_queue') {
                $manual[] = $field;
                continue;
            }

            if ($mode === 'auto_latest_timestamp') {
                $auto[] = $field;
            }
        }

        return [
            'manual_queue_fields' => array_values(array_unique($manual)),
            'auto_merge_fields' => array_values(array_unique($auto)),
        ];
    }

    /**
     * @return list<string>
     */
    public function autoMergeFields(string $provider, string $entityType, array $candidateFields): array
    {
        $partition = $this->partitionConflictFields($provider, $entityType, $candidateFields);

        return $partition['auto_merge_fields'];
    }

    /**
     * @param  list<string>  $manualFields
     * @param  list<string>  $autoFields
     * @return array{
     *   merge_policy: array{
     *     manual_queue_fields:list<string>,
     *     auto_merge_fields:list<string>
     *   },
     *   merge_state:'manual_required'|'auto_merged'
     * }
     */
    public function buildMergePolicyPayload(array $manualFields, array $autoFields): array
    {
        $normalizedManual = array_values(array_unique($manualFields));
        $normalizedAuto = array_values(array_unique($autoFields));

        return [
            'merge_policy' => [
                'manual_queue_fields' => $normalizedManual,
                'auto_merge_fields' => $normalizedAuto,
            ],
            'merge_state' => $normalizedManual === [] ? 'auto_merged' : 'manual_required',
        ];
    }

    /**
     * @param  array<string, mixed>  $existingPayload
     * @param  list<string>  $manualFields
     * @param  list<string>  $autoFields
     * @return array<string, mixed>
     */
    public function mergeMergePolicyIntoPayload(array $existingPayload, array $manualFields, array $autoFields): array
    {
        $existingPolicy = is_array($existingPayload['merge_policy'] ?? null)
            ? $existingPayload['merge_policy']
            : [];
        $existingManual = is_array($existingPolicy['manual_queue_fields'] ?? null)
            ? $existingPolicy['manual_queue_fields']
            : [];
        $existingAuto = is_array($existingPolicy['auto_merge_fields'] ?? null)
            ? $existingPolicy['auto_merge_fields']
            : [];

        $nextPolicy = $this->buildMergePolicyPayload(
            manualFields: [...$existingManual, ...$manualFields],
            autoFields: [...$existingAuto, ...$autoFields],
        );

        return [
            ...$existingPayload,
            ...$nextPolicy,
        ];
    }

    /**
     * @param  list<string>  $manualFields
     * @return list<string>
     */
    private function unique(array $manualFields): array
    {
        return array_values(array_unique($manualFields));
    }

    /**
     * @return list<string>
     */
    public function normalizeFields(array $fields): array
    {
        $normalized = [];
        foreach ($fields as $field) {
            if (is_string($field) && $field !== '') {
                $normalized[] = $field;
            }
        }

        return $this->unique($normalized);
    }
}
