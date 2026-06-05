<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_information', function (Blueprint $table) {
            if (! Schema::hasColumn('site_information', 'delivery_free_above_amount')) {
                $table->decimal('delivery_free_above_amount', 10, 2)->default(0)->after('receipt_email');
            }

            if (! Schema::hasColumn('site_information', 'delivery_charge_amount')) {
                $table->decimal('delivery_charge_amount', 10, 2)->default(0)->after('delivery_free_above_amount');
            }

            if (! Schema::hasColumn('site_information', 'tax_amount')) {
                $table->decimal('tax_amount', 10, 2)->default(0)->after('delivery_charge_amount');
            }
        });

        Schema::table('customer_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('customer_orders', 'delivery_charge_amount')) {
                $table->decimal('delivery_charge_amount', 10, 2)->default(0)->after('discount_amount');
            }

            if (! Schema::hasColumn('customer_orders', 'tax_amount')) {
                $table->decimal('tax_amount', 10, 2)->default(0)->after('delivery_charge_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customer_orders', function (Blueprint $table) {
            if (Schema::hasColumn('customer_orders', 'tax_amount')) {
                $table->dropColumn('tax_amount');
            }

            if (Schema::hasColumn('customer_orders', 'delivery_charge_amount')) {
                $table->dropColumn('delivery_charge_amount');
            }
        });

        Schema::table('site_information', function (Blueprint $table) {
            foreach (['tax_amount', 'delivery_charge_amount', 'delivery_free_above_amount'] as $column) {
                if (Schema::hasColumn('site_information', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
