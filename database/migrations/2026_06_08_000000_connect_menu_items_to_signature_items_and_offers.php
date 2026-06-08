<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_signature_items', function (Blueprint $table) {
            $table->foreignId('menu_item_id')
                ->nullable()
                ->after('id')
                ->constrained('menu_items')
                ->nullOnDelete();
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->foreignId('menu_item_id')
                ->nullable()
                ->after('id')
                ->constrained('menu_items')
                ->nullOnDelete();
            $table->decimal('offer_percent', 5, 2)->nullable()->after('alt_text');
            $table->decimal('offer_price', 10, 2)->nullable()->after('offer_percent');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['offer_percent', 'offer_price']);
            $table->dropConstrainedForeignId('menu_item_id');
        });

        Schema::table('menu_signature_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('menu_item_id');
        });
    }
};
