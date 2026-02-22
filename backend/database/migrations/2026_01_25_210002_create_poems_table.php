<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('poems', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('poet_name');
            $table->integer('year')->nullable();
            $table->string('media_url')->nullable();
            $table->foreignId('occasion_id')->nullable()->constrained('occasions')->nullOnDelete();
            $table->enum('category', ['وقفة', 'موشح', 'متعدد الأوزان'])->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('poems');
    }
};
