<?php

namespace App\Billing\Services;

use App\Models\BillingWebhookReceipt;
use App\Models\TenantBillingEvent;
use App\Models\TenantSubscription;
use Illuminate\Support\Arr;
use InvalidArgumentException;

class BillingWebhookService
{
    /**
     * @return array<string, mixed>
     */
    public function handleStripe(string $rawPayload, ?string $signatureHeader = null): array
    {
        $payload = json_decode($rawPayload, true);
        if (! is_array($payload)) {
            throw new InvalidArgumentException('Invalid billing webhook payload.');
        }

        $this->assertStripeSignatureIsValid($rawPayload, $signatureHeader);

        $providerEventId = (string) ($payload['id'] ?? '');
        if ($providerEventId === '') {
            throw new InvalidArgumentException('Missing billing provider event id.');
        }

        $existing = BillingWebhookReceipt::query()
            ->where('provider', 'stripe')
            ->where('provider_event_id', $providerEventId)
            ->first();

        if ($existing !== null) {
            return [
                'status' => 'duplicate_ignored',
                'provider_event_id' => $providerEventId,
            ];
        }

        $receipt = BillingWebhookReceipt::query()->create([
            'provider' => 'stripe',
            'provider_event_id' => $providerEventId,
            'status' => 'received',
            'payload' => $payload,
            'processed_at' => null,
        ]);

        $eventType = (string) ($payload['type'] ?? '');
        $subscriptionExternalId = $this->extractSubscriptionExternalId($payload);

        $subscription = null;
        if ($subscriptionExternalId !== null) {
            $subscription = TenantSubscription::query()
                ->where('provider', 'stripe')
                ->where('provider_subscription_id', $subscriptionExternalId)
                ->first();
        }

        if ($subscription === null) {
            $receipt->status = 'ignored';
            $receipt->error_message = 'Subscription not found for webhook event.';
            $receipt->processed_at = now();
            $receipt->save();

            return [
                'status' => 'ignored',
                'provider_event_id' => $providerEventId,
            ];
        }

        $normalizedEvent = $this->normalizeEventName($eventType);
        $nextStatus = $this->resolveStatus($eventType, $payload);

        if ($nextStatus !== null) {
            $subscription->status = $nextStatus;
            if ($nextStatus === 'canceled') {
                $subscription->canceled_at = now();
            } elseif ($nextStatus === 'active') {
                $subscription->canceled_at = null;
            }
            $subscription->save();
        }

        TenantBillingEvent::query()->create([
            'tenant_id' => $subscription->tenant_id,
            'subscription_id' => $subscription->id,
            'plan_code' => $subscription->plan->plan_code ?? null,
            'event_name' => $normalizedEvent,
            'event_version' => '1.0',
            'provider' => 'stripe',
            'provider_event_id' => $providerEventId,
            'payload' => $payload,
            'occurred_at' => now(),
        ]);

        $receipt->status = 'processed';
        $receipt->processed_at = now();
        $receipt->save();

        return [
            'status' => 'processed',
            'provider_event_id' => $providerEventId,
            'event_name' => $normalizedEvent,
            'subscription_status' => $subscription->status,
        ];
    }

    private function assertStripeSignatureIsValid(string $rawPayload, ?string $signatureHeader): void
    {
        $secret = (string) config('billing.stripe.webhook_secret', '');
        if ($secret === '') {
            return;
        }

        if ($signatureHeader === null || $signatureHeader === '') {
            throw new InvalidArgumentException('Missing Stripe signature header.');
        }

        $timestamp = Arr::first(explode(',', $signatureHeader), fn (string $part) => str_starts_with($part, 't='));
        $signature = Arr::first(explode(',', $signatureHeader), fn (string $part) => str_starts_with($part, 'v1='));

        if ($timestamp === null || $signature === null) {
            throw new InvalidArgumentException('Invalid Stripe signature header format.');
        }

        $timestampValue = (string) str_replace('t=', '', $timestamp);
        $signatureValue = (string) str_replace('v1=', '', $signature);
        $computed = hash_hmac('sha256', "{$timestampValue}.{$rawPayload}", $secret);

        if (! hash_equals($computed, $signatureValue)) {
            throw new InvalidArgumentException('Invalid Stripe webhook signature.');
        }
    }

    private function extractSubscriptionExternalId(array $payload): ?string
    {
        $object = (array) ($payload['data']['object'] ?? []);

        if (isset($object['id']) && str_starts_with((string) $object['id'], 'sub_')) {
            return (string) $object['id'];
        }

        if (isset($object['subscription']) && is_string($object['subscription'])) {
            return $object['subscription'];
        }

        return null;
    }

    private function normalizeEventName(string $stripeType): string
    {
        return match ($stripeType) {
            'invoice.paid' => 'billing.invoice.paid',
            'invoice.payment_failed' => 'billing.invoice.payment_failed',
            'customer.subscription.deleted' => 'billing.subscription.canceled',
            'customer.subscription.updated' => 'billing.subscription.renewed',
            default => 'billing.subscription.updated',
        };
    }

    private function resolveStatus(string $stripeType, array $payload): ?string
    {
        if ($stripeType === 'invoice.payment_failed') {
            return 'past_due';
        }

        if ($stripeType === 'invoice.paid') {
            return 'active';
        }

        if ($stripeType === 'customer.subscription.deleted') {
            return 'canceled';
        }

        if ($stripeType !== 'customer.subscription.updated') {
            return null;
        }

        $status = (string) ($payload['data']['object']['status'] ?? '');

        return match ($status) {
            'trialing' => 'trialing',
            'active' => 'active',
            'past_due' => 'past_due',
            'canceled' => 'canceled',
            default => null,
        };
    }
}
