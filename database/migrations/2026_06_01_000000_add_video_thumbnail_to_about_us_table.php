<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('about_us') && ! Schema::hasColumn('about_us', 'video_thumbnail')) {
            Schema::table('about_us', function (Blueprint $table) {
                $table->string('video_thumbnail')->nullable()->after('video_file');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('about_us') && Schema::hasColumn('about_us', 'video_thumbnail')) {
            Schema::table('about_us', function (Blueprint $table) {
                $table->dropColumn('video_thumbnail');
            });
        }
    }
};
