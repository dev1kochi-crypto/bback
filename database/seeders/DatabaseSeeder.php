<?php

namespace Database\Seeders;

use CMS\SiteManager\Database\Seeders\CmsRolesPermissionsSeeder;
use CMS\SiteManager\Database\Seeders\MetadataSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CmsRolesPermissionsSeeder::class,
            AboutUsPermissionsSeeder::class,
            MenuOfferPermissionsSeeder::class,
            MetadataSeeder::class,
        ]);
    }
}
