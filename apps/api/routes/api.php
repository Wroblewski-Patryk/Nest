<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskListController;
use App\Http\Controllers\Api\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [UserSettingsController::class, 'me']);
        Route::patch('/auth/settings', [UserSettingsController::class, 'update']);

        Route::get('/lists', [TaskListController::class, 'index']);
        Route::post('/lists', [TaskListController::class, 'store']);
        Route::get('/lists/{listId}', [TaskListController::class, 'show']);
        Route::patch('/lists/{listId}', [TaskListController::class, 'update']);
        Route::delete('/lists/{listId}', [TaskListController::class, 'destroy']);

        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::get('/tasks/{taskId}', [TaskController::class, 'show']);
        Route::patch('/tasks/{taskId}', [TaskController::class, 'update']);
        Route::delete('/tasks/{taskId}', [TaskController::class, 'destroy']);
    });
});
