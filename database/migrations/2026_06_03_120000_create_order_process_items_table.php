<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_process_items', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->nullable();
            $table->string('icon_alt')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->json('translations')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_process_items');
    }
};
