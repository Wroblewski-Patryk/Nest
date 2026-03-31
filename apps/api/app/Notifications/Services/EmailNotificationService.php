<?php

namespace App\Notifications\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;

class EmailNotificationService
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{status:string,failure_reason:string|null,metadata:array<string, mixed>}
     */
    public function send(User $user, string $eventType, string $title, string $body, array $payload = []): array
    {
        try {
            Mail::raw($body, function ($message) use ($user, $title): void {
                $message->to($user->email)
                    ->subject('[Nest] '.$title);
            });
        } catch (\Throwable $exception) {
            return [
                'status' => 'failed',
                'failure_reason' => 'mail_transport_error',
                'metadata' => [
                    'error_message' => $exception->getMessage(),
                ],
            ];
        }

        return [
            'status' => 'sent',
            'failure_reason' => null,
            'metadata' => [
                'event_type' => $eventType,
                'recipient' => $user->email,
                'payload' => $payload,
            ],
        ];
    }
}
