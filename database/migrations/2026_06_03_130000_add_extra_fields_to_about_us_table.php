<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('about_us', function (Blueprint $table) {
            if (! Schema::hasColumn('about_us', 'extra_fields')) {
                $table->json('extra_fields')->nullable()->after('translations');
            }
        });
    }

    public function down(): void
    {
        Schema::table('about_us', function (Blueprint $table) {
            if (Schema::hasColumn('about_us', 'extra_fields')) {
                $table->dropColumn('extra_fields');
            }
        });
    }
};
