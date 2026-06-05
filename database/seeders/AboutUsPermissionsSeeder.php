<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AboutUsPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['about-us.view', 'about-us.create', 'about-us.edit', 'about-us.delete'] as $permission) {
            Permission::updateOrCreate([
                'name' => $permission,
                'guard_name' => 'cms',
            ]);
        }

        $rolesConfig = config('cms-kit.permissions.roles', []);

        foreach ($rolesConfig as $roleSlug => $roleData) {
            $role = Role::where('guard_name', 'cms')->where('name', $roleSlug)->first();

            if (!$role) {
                continue;
            }

            if (($roleData['permissions'] ?? null) === '*') {
                $role->syncPermissions(Permission::where('guard_name', 'cms')->get());
                continue;
            }

            $role->syncPermissions(
                Permission::where('guard_name', 'cms')
                    ->whereIn('name', $roleData['permissions'] ?? [])
                    ->get()
            );
        }
    }
}
