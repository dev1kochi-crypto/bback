<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->unique()->after('email');
            $table->string('phone_login_otp')->nullable()->after('password_reset_token');
            $table->timestamp('phone_login_otp_expires_at')->nullable()->after('phone_login_otp');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'phone_login_otp', 'phone_login_otp_expires_at']);
        });
    }
};
