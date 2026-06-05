<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('about_us', function (Blueprint $table) {
            $table->id();
            $table->string('line_1')->nullable();
            $table->string('line_2')->nullable();
            $table->string('about_page_title')->nullable();
            $table->text('short_description')->nullable();
            $table->longText('long_description')->nullable();
            $table->string('button_text')->nullable();
            $table->string('button_url')->nullable();
            $table->string('video_type')->default('url');
            $table->string('video_url')->nullable();
            $table->string('video_file')->nullable();
            $table->text('mission')->nullable();
            $table->text('vision')->nullable();
            $table->text('core_value')->nullable();
            $table->json('translations')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('why_choose_us_items', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->nullable();
            $table->string('icon_alt')->nullable();
            $table->string('line_1')->nullable();
            $table->string('line_2')->nullable();
            $table->json('translations')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('why_choose_us_items');
        Schema::dropIfExists('about_us');
    }
};
