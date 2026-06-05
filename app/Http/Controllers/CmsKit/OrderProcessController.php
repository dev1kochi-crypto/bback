<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\Language;
use App\Models\CmsKit\OrderProcessItem;
use App\Models\CmsKit\SectionLabel;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use CMS\SiteManager\Support\ValidatesImageDimensions;
use Yajra\DataTables\Facades\DataTables;

class OrderProcessController extends Controller
{
    use ValidatesImageDimensions;

    public function index(Request $request)
    {
        $languages = Language::active()->get();
        $section = SectionLabel::firstOrCreate(['section_key' => 'order_process'], [
            'translations' => [],
            'extra_fields' => [],
            'status' => true,
        ]);

        if ($request->ajax()) {
            return DataTables::of(OrderProcessItem::query()->orderBy('sort_order')->orderBy('id'))
                ->addIndexColumn()
                ->addColumn('icon_preview', fn (OrderProcessItem $item) => $item->icon
                    ? '<img src="' . asset('storage/' . $item->icon) . '" class="img-thumbnail" style="height:42px;">'
                    : '-')
                ->addColumn('title_text', fn (OrderProcessItem $item) => e($item->getTranslation('title')))
                ->addColumn('description_text', fn (OrderProcessItem $item) => e(str($item->getTranslation('description'))->limit(90)))
                ->addColumn('status', fn (OrderProcessItem $item) => '<div class="form-check form-switch"><input class="form-check-input toggle-status" type="checkbox" data-id="' . $item->id . '" ' . ($item->status ? 'checked' : '') . '></div>')
                ->addColumn('order', fn (OrderProcessItem $item) => '<input type="number" min="1" class="form-control form-control-sm reorder-input" data-id="' . $item->id . '" value="' . $item->sort_order . '" style="width:80px;">')
                ->addColumn('action', fn (OrderProcessItem $item) => '<div class="btn-group">'
                    . '<a href="' . route('cms.order-process.items.edit', $item->id) . '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a>'
                    . '<button type="button" class="btn btn-sm btn-outline-danger delete-item" data-id="' . $item->id . '"><i class="fas fa-trash"></i></button>'
                    . '</div>')
                ->rawColumns(['icon_preview', 'status', 'order', 'action'])
                ->make(true);
        }

        return view('cms-kit::order-process.index', compact('languages', 'section'));
    }

    public function updateSection(Request $request)
    {
        $rules = [
            'image' => $this->imageRules('order-process.section_image', ['nullable', 'image']),
            'remove_image' => ['nullable', 'boolean'],
            'image_alt' => ['nullable', 'string', 'max:255'],
        ];

        foreach (Language::active()->get() as $language) {
            foreach (['line_1', 'title', 'description'] as $field) {
                $rules["translations.{$language->code}.{$field}"] = ['nullable', 'string'];
            }
        }

        $request->validate($rules);
        $this->validateImageWithinLimits($request, 'image', config('cms-kit.images.order-process.section_image', []), 'Order process section image');

        $section = SectionLabel::firstOrCreate(['section_key' => 'order_process']);
        $payload = [
            'translations' => $request->input('translations', []),
            'section_image_alt' => $request->input('image_alt'),
            'extra_fields' => [
                'display_home' => $request->boolean('display_home'),
            ],
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('image')) {
            if ($section->section_image) {
                Storage::disk('public')->delete($section->section_image);
            }
            $payload['section_image'] = $request->file('image')->store('order-process', 'public');
        } elseif ($request->boolean('remove_image') && $section->section_image) {
            Storage::disk('public')->delete($section->section_image);
            $payload['section_image'] = null;
        }

        $section->update($payload);

        return redirect()->route('cms.order-process.index')->with('success', 'Order process section updated successfully.');
    }

    public function createItem()
    {
        if ($this->itemLimitReached()) {
            return redirect()->route('cms.order-process.index')->with('error', 'Maximum 3 items allowed.');
        }

        $languages = Language::active()->get();
        $nextOrder = (OrderProcessItem::max('sort_order') ?? 0) + 1;

        return view('cms-kit::order-process.create', compact('languages', 'nextOrder'));
    }

    public function storeItem(Request $request)
    {
        if ($this->itemLimitReached()) {
            return redirect()->route('cms.order-process.index')->with('error', 'Maximum 3 items allowed.');
        }

        $this->validateItem($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();
        $order = $this->resolveOrderForCreate($request->integer('sort_order') ?: null);

        OrderProcessItem::where('sort_order', '>=', $order)->increment('sort_order');

        $payload = [
            'icon_alt' => $request->input('icon_alt'),
            'title' => data_get($translations, "{$defaultLanguage}.title"),
            'description' => data_get($translations, "{$defaultLanguage}.description"),
            'translations' => $translations,
            'sort_order' => $order,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('icon')) {
            $this->validateImageWithinLimits($request, 'icon', config('cms-kit.images.order-process.item_icon', []), 'Order process icon');
            $payload['icon'] = $request->file('icon')->store('order-process/icons', 'public');
        }

        OrderProcessItem::create($payload);

        return redirect()->route('cms.order-process.index')->with('success', 'Order process item created successfully.');
    }

    public function editItem(int $id)
    {
        $item = OrderProcessItem::findOrFail($id);
        $languages = Language::active()->get();

        return view('cms-kit::order-process.edit', compact('item', 'languages'));
    }

    public function updateItem(Request $request, int $id)
    {
        $item = OrderProcessItem::findOrFail($id);
        $this->validateItem($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();

        $payload = [
            'icon_alt' => $request->input('icon_alt'),
            'title' => data_get($translations, "{$defaultLanguage}.title"),
            'description' => data_get($translations, "{$defaultLanguage}.description"),
            'translations' => $translations,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('icon')) {
            $this->validateImageWithinLimits($request, 'icon', config('cms-kit.images.order-process.item_icon', []), 'Order process icon');
            if ($item->icon) {
                Storage::disk('public')->delete($item->icon);
            }
            $payload['icon'] = $request->file('icon')->store('order-process/icons', 'public');
        } elseif ($request->boolean('remove_icon') && $item->icon) {
            Storage::disk('public')->delete($item->icon);
            $payload['icon'] = null;
        }

        $item->update($payload);

        return redirect()->route('cms.order-process.index')->with('success', 'Order process item updated successfully.');
    }

    public function destroyItem(int $id)
    {
        $item = OrderProcessItem::findOrFail($id);
        $order = $item->sort_order;

        if ($item->icon) {
            Storage::disk('public')->delete($item->icon);
        }

        $item->delete();
        OrderProcessItem::where('sort_order', '>', $order)->decrement('sort_order');
        $this->normalizeOrder();

        return response()->json(['success' => true]);
    }

    public function toggleItemStatus(int $id)
    {
        $item = OrderProcessItem::findOrFail($id);
        $item->update(['status' => !$item->status]);

        return response()->json(['success' => true]);
    }

    public function reorderItem(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:order_process_items,id'],
            'sort_order' => ['required', 'integer', 'min:1'],
        ]);

        $item = OrderProcessItem::findOrFail($request->integer('id'));
        $total = OrderProcessItem::count();
        $newOrder = min($request->integer('sort_order'), max($total, 1));
        $oldOrder = $item->sort_order;

        if ($newOrder !== $oldOrder) {
            if ($newOrder > $oldOrder) {
                OrderProcessItem::where('sort_order', '>', $oldOrder)->where('sort_order', '<=', $newOrder)->decrement('sort_order');
            } else {
                OrderProcessItem::where('sort_order', '>=', $newOrder)->where('sort_order', '<', $oldOrder)->increment('sort_order');
            }

            $item->update(['sort_order' => $newOrder]);
        }

        $this->normalizeOrder();

        return response()->json(['success' => true]);
    }

    protected function validateItem(Request $request): array
    {
        $rules = [
            'icon' => $this->imageRules('order-process.item_icon', ['nullable', 'image']),
            'remove_icon' => ['nullable', 'boolean'],
            'icon_alt' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];

        foreach (Language::active()->get() as $language) {
            $rules["translations.{$language->code}.title"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$language->code}.description"] = ['nullable', 'string'];
        }

        return $request->validate($rules);
    }

    protected function imageRules(string $configKey, array $baseRules = ['nullable', 'image']): array
    {
        $config = config("cms-kit.images.{$configKey}", []);
        $rules = $baseRules;

        if ($mimes = ($config['mimes'] ?? null)) {
            $rules[] = 'mimes:' . implode(',', $mimes);
        }

        if ($maxSize = ($config['max_size'] ?? null)) {
            $rules[] = 'max:' . $maxSize;
        }

        return $rules;
    }

    protected function itemLimitReached(): bool
    {
        $maxItems = (int) config('cms-kit.database.order-process.max_items', 3);

        return $maxItems > 0 && OrderProcessItem::count() >= $maxItems;
    }

    protected function defaultLanguageCode(): string
    {
        return Language::active()->where('is_default', true)->value('code')
            ?? Language::active()->orderByDesc('is_default')->value('code')
            ?? config('app.fallback_locale');
    }

    protected function resolveOrderForCreate(?int $requestedOrder): int
    {
        $maxAllowed = OrderProcessItem::count() + 1;

        if ($requestedOrder === null) {
            return $maxAllowed;
        }

        if ($requestedOrder < 1 || $requestedOrder > $maxAllowed) {
            throw ValidationException::withMessages(['sort_order' => "Order must be between 1 and {$maxAllowed}."]);
        }

        return $requestedOrder;
    }

    protected function normalizeOrder(): void
    {
        $position = 1;

        foreach (OrderProcessItem::orderBy('sort_order')->orderBy('id')->get(['id']) as $item) {
            OrderProcessItem::whereKey($item->id)->update(['sort_order' => $position++]);
        }
    }
}
