<?php

return [
    /*
    |--------------------------------------------------------------------------
    | MVP Feature Flags
    |--------------------------------------------------------------------------
    |
    | End-user AI surface must remain disabled for MVP scope. This guard is
    | intentionally "false by default" and requires explicit opt-in later.
    |
    */
    'ai_surface_enabled' => (bool) env('AI_SURFACE_ENABLED', false),
];
