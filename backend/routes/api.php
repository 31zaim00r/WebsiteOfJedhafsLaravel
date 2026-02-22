<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\PoemController;
use App\Http\Controllers\OccasionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $roleData = DB::table('user_roles')->where('user_id', $user->id)->first();
        $user->role = $roleData ? $roleData->role : 'user';
        return $user;
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // User Management (Admin only logic should be here or in controller)
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}/profile', [UserController::class, 'updateProfile']);
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
    Route::patch('/users/{id}/toggle-upload', [UserController::class, 'toggleUpload']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Protected Poem/Occasion Routes
    Route::get('/my-poems', [PoemController::class, 'myPoems']);
    Route::post('/poems', [PoemController::class, 'store']);
    Route::put('/poems/{id}', [PoemController::class, 'update']);
    Route::delete('/poems/{id}', [PoemController::class, 'destroy']);
    Route::post('/occasions', [OccasionController::class, 'store']);
    Route::put('/occasions/{id}', [OccasionController::class, 'update']);
    Route::delete('/occasions/{id}', [OccasionController::class, 'destroy']);
});

// Public Routes
Route::get('/poems', [PoemController::class, 'index']);
Route::get('/poems/{id}', [PoemController::class, 'show']);
Route::post('/poems/{id}/view', [PoemController::class, 'incrementViews']);
Route::post('/poems/{id}/download', [PoemController::class, 'incrementDownloads']);
Route::get('/occasions', [OccasionController::class, 'index']);
