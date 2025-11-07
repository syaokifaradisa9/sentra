<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the foreign key constraint first
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        
        // Rename the column
        Schema::table('businesses', function (Blueprint $table) {
            $table->renameColumn('user_id', 'owner_id');
        });
        
        // Add the foreign key constraint back with the new column name
        Schema::table('businesses', function (Blueprint $table) {
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the foreign key constraint first
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
        });
        
        // Rename the column back to user_id
        Schema::table('businesses', function (Blueprint $table) {
            $table->renameColumn('owner_id', 'user_id');
        });
        
        // Add the foreign key constraint back with the old column name
        Schema::table('businesses', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
