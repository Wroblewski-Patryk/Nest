<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [UserSettingsController::class, 'me']);
        Route::patch('/auth/settings', [UserSettingsController::class, 'update']);
    });
});
