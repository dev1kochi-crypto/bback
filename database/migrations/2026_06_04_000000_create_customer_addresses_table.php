<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('address_line_1');
            $table->string('address_line_2')->nullable();
            $table->string('landmark')->nullable();
            $table->enum('address_type', ['home', 'office', 'other'])->default('home');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::table('customer_orders', function (Blueprint $table) {
            $table->foreignId('customer_address_id')->nullable()->after('user_id')->constrained('customer_addresses')->nullOnDelete();
            $table->string('landmark')->nullable()->after('address_line_2');
            $table->string('address_type')->nullable()->after('landmark');
        });
    }

    public function down(): void
    {
        Schema::table('customer_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_address_id');
            $table->dropColumn(['landmark', 'address_type']);
        });

        Schema::dropIfExists('customer_addresses');
    }
};
