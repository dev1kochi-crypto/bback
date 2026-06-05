<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->nullable();
            $table->string('icon_alt')->nullable();
            $table->string('name')->nullable();
            $table->json('translations')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_category_id')->nullable()->constrained('menu_categories')->nullOnDelete();
            $table->string('image')->nullable();
            $table->string('image_alt')->nullable();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->json('translations')->nullable();
            $table->boolean('spicy')->default(false);
            $table->enum('food_type', ['veg', 'non_veg'])->default('veg');
            $table->decimal('price', 10, 2)->default(0);
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->string('alt_text')->nullable();
            $table->json('translations')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menu_categories');
    }
};
