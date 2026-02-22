<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['admin', 'user'])->default('user');
            $table->timestamps();
            
            // Ensure one role per user pair is unique if needed, or just index
            $table->unique(['user_id', 'role']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_roles');
    }
};
