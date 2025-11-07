<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->foreignId('owner_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('scope_type')->default('product')->after('product_id');
            $table->unsignedBigInteger('scope_id')->nullable()->after('scope_type');
            $table->unsignedInteger('usage_limit')->nullable()->after('price_discount');
            $table->unsignedInteger('used_count')->default(0)->after('usage_limit');
            $table->unsignedInteger('impacted_products')->default(0)->after('used_count');
            $table->index(['scope_type', 'scope_id']);
        });

        // Backfill scope data based on existing product_id values
        DB::table('promos')->update([
            'scope_type' => DB::raw("CASE WHEN product_id IS NOT NULL THEN 'product' ELSE 'product' END"),
            'scope_id' => DB::raw('product_id'),
        ]);

        $owners = DB::table('promos')
            ->leftJoin('product_branches', 'product_branches.product_id', '=', 'promos.product_id')
            ->leftJoin('branches', 'branches.id', '=', 'product_branches.branch_id')
            ->select('promos.id', DB::raw('MIN(branches.owner_id) as owner_id'))
            ->groupBy('promos.id')
            ->get();

        foreach ($owners as $row) {
            if ($row->owner_id) {
                DB::table('promos')
                    ->where('id', $row->id)
                    ->update(['owner_id' => $row->owner_id]);
            }
        }

        Schema::create('promo_price_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('base_price', 12, 2);
            $table->decimal('promo_price', 12, 2);
            $table->timestamp('recorded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promo_price_histories');

        Schema::table('promos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('owner_id');
            $table->dropIndex(['scope_type', 'scope_id']);
            $table->dropColumn([
                'scope_type',
                'scope_id',
                'usage_limit',
                'used_count',
                'impacted_products',
            ]);
        });
    }
};
