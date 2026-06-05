<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class MenuOfferPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'menus.view',
            'menus.create',
            'menus.edit',
            'menus.delete',
            'signature-items.view',
            'signature-items.create',
            'signature-items.edit',
            'signature-items.delete',
            'order-process.view',
            'order-process.create',
            'order-process.edit',
            'order-process.delete',
            'offers.view',
            'offers.create',
            'offers.edit',
            'offers.delete',
            'coupons.view',
            'coupons.create',
            'coupons.edit',
            'coupons.delete',
            'delivery-tax.view',
            'delivery-tax.edit',
            'customer-orders.view',
            'customer-orders.edit',
        ] as $permission) {
            Permission::updateOrCreate([
                'name' => $permission,
                'guard_name' => 'cms',
            ]);
        }

        foreach (config('cms-kit.permissions.roles', []) as $roleSlug => $roleData) {
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
