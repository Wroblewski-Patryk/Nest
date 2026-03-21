# AI/Tool API Error Contract v1

Last updated: 2026-03-19
Contract version: `2026-03-19.error.v1`

## Purpose

Define a stable machine-readable error envelope and deterministic retry guidance
for API consumers that execute workflows programmatically (agents, automations,
and tool clients).

## Error Envelope

All `api/*` error responses include:

- `message`: human-readable summary
- `error.code`: machine-readable error code
- `error.retryable`: boolean retry hint
- `error.http_status`: HTTP status code
- `error.details`: structured context object
- `meta.contract_version`: contract version identifier
- `errors` (optional): field-level validation map

Example payload:

```json
{
  "message": "The name field is required.",
  "error": {
    "code": "validation_failed",
    "retryable": false,
    "http_status": 422,
    "details": {}
  },
  "errors": {
    "name": ["The name field is required."]
  },
  "meta": {
    "contract_version": "2026-03-19.error.v1"
  }
}
```

## Error Taxonomy and Retry Guidance

- `validation_failed` (`422`): do not retry until payload is corrected.
- `auth_required` (`401`): do not retry until authentication is refreshed.
- `forbidden` (`403`): do not retry; requires permission/scope change.
- `resource_not_found` (`404`): do not retry unless resource identifier changes.
- `tenant_quota_exceeded` (`429`): do not immediate-retry; retry after capacity/plan change.
- `rate_limited` (`429`): retry with backoff; honor `error.details.retry_after` when present.

## Backward Compatibility

- Existing `message` field remains present.
- Validation errors retain top-level `errors` map for compatibility.
- Existing domain error code checks (`error.code`) remain valid.
