<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\SiteInformation;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DeliveryTaxController extends Controller
{
    public function edit()
    {
        return view('cms-kit::delivery-tax.edit', [
            'siteInformation' => SiteInformation::query()->first() ?? new SiteInformation(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'delivery_free_above_amount' => ['nullable', 'numeric', 'min:0'],
            'delivery_charge_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $siteInformation = SiteInformation::query()->first() ?? new SiteInformation();
        $siteInformation->fill([
            'delivery_free_above_amount' => $data['delivery_free_above_amount'] ?? 0,
            'delivery_charge_amount' => $data['delivery_charge_amount'] ?? 0,
            'tax_amount' => $data['tax_amount'] ?? 0,
        ]);
        $siteInformation->save();

        return redirect()->route('cms.delivery-tax.edit')->with('success', 'Delivery charge and tax updated successfully.');
    }
}
