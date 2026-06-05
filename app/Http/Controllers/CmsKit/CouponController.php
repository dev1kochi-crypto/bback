<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\Coupon;
use App\Models\CmsKit\MenuCategory;
use App\Models\CmsKit\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Yajra\DataTables\Facades\DataTables;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return DataTables::of(Coupon::query()->orderByDesc('id'))
                ->addIndexColumn()
                ->addColumn('discount', fn (Coupon $coupon) => $coupon->discount_type === 'percent'
                    ? $coupon->discount_value . '%'
                    : $coupon->discount_value)
                ->addColumn('target', fn (Coupon $coupon) => $coupon->menuItem?->getTranslation('name')
                    ?? $coupon->menuCategory?->getTranslation('name')
                    ?? 'All items')
                ->addColumn('status', fn (Coupon $coupon) => '<div class="form-check form-switch"><input class="form-check-input toggle-status" type="checkbox" data-id="' . $coupon->id . '" ' . ($coupon->status ? 'checked' : '') . '></div>')
                ->addColumn('action', fn (Coupon $coupon) => '<div class="btn-group">'
                    . '<a href="' . route('cms.coupons.edit', $coupon->id) . '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a>'
                    . '<button type="button" class="btn btn-sm btn-outline-danger delete-item" data-id="' . $coupon->id . '"><i class="fas fa-trash"></i></button>'
                    . '</div>')
                ->rawColumns(['status', 'action'])
                ->make(true);
        }

        return view('cms-kit::coupons.index');
    }

    public function create()
    {
        return view('cms-kit::coupons.create', $this->formData());
    }

    public function store(Request $request)
    {
        Coupon::create($this->validated($request));

        return redirect()->route('cms.coupons.index')->with('success', 'Coupon created successfully.');
    }

    public function edit(int $id)
    {
        return view('cms-kit::coupons.edit', ['coupon' => Coupon::findOrFail($id), ...$this->formData()]);
    }

    public function update(Request $request, int $id)
    {
        Coupon::findOrFail($id)->update($this->validated($request, $id));

        return redirect()->route('cms.coupons.index')->with('success', 'Coupon updated successfully.');
    }

    public function destroy(int $id)
    {
        Coupon::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    public function toggleStatus(int $id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update(['status' => ! $coupon->status]);

        return response()->json(['success' => true]);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:80', 'unique:coupons,code,' . ($id ?? 'NULL') . ',id'],
            'discount_type' => ['required', 'in:fixed,percent'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
            'maximum_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'menu_category_id' => ['nullable', 'exists:menu_categories,id'],
            'menu_item_id' => ['nullable', 'exists:menu_items,id'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status' => ['nullable', 'boolean'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $data['minimum_order_amount'] = $data['minimum_order_amount'] ?? 0;
        $data['status'] = $request->boolean('status');

        if (! empty($data['menu_item_id'])) {
            $data['menu_category_id'] = null;
        }

        return $data;
    }

    private function formData(): array
    {
        return [
            'categories' => MenuCategory::orderBy('sort_order')->get(),
            'items' => MenuItem::with('category')->orderBy('sort_order')->get(),
        ];
    }
}
