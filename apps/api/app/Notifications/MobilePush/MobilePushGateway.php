<?php

namespace App\Notifications\MobilePush;

interface MobilePushGateway
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{status:string,response_payload?:array<string, mixed>,error_message?:string}
     */
    public function send(string $token, string $title, string $body, array $payload = []): array;
}
