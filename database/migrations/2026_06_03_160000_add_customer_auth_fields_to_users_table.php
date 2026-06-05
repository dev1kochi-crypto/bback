<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('password');
            $table->string('apple_id')->nullable()->unique()->after('google_id');
            $table->string('avatar')->nullable()->after('apple_id');
            $table->string('password_reset_otp')->nullable()->after('remember_token');
            $table->timestamp('password_reset_otp_expires_at')->nullable()->after('password_reset_otp');
            $table->timestamp('password_reset_otp_verified_at')->nullable()->after('password_reset_otp_expires_at');
            $table->string('password_reset_token')->nullable()->after('password_reset_otp_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
            $table->dropUnique(['apple_id']);
            $table->dropColumn([
                'google_id',
                'apple_id',
                'avatar',
                'password_reset_otp',
                'password_reset_otp_expires_at',
                'password_reset_otp_verified_at',
                'password_reset_token',
            ]);
        });
    }
};
