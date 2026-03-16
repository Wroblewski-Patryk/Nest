<?php

namespace App\Notifications\MobilePush;

use Illuminate\Support\Facades\Log;

class LogMobilePushGateway implements MobilePushGateway
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{status:string,response_payload?:array<string, mixed>,error_message?:string}
     */
    public function send(string $token, string $title, string $body, array $payload = []): array
    {
        Log::info('Mobile push reminder dispatched', [
            'title' => $title,
            'body' => $body,
            'payload' => $payload,
            'token_hash' => hash('sha256', $token),
        ]);

        return [
            'status' => 'sent',
            'response_payload' => [
                'gateway' => 'log',
                'accepted' => true,
            ],
        ];
    }
}
