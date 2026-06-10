<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\Language;
use App\Models\CmsKit\MenuCategory;
use App\Models\CmsKit\MenuItem;
use App\Models\CmsKit\MenuSignatureItem;
use App\Models\CmsKit\Offer;
use App\Models\CmsKit\SectionLabel;
use App\Services\FrontendRevalidationService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use CMS\SiteManager\Support\ValidatesImageDimensions;
use Yajra\DataTables\Facades\DataTables;

class MenuController extends Controller
{
    use ValidatesImageDimensions;

    public function common()
    {
        $languages = Language::active()->get();
        $section = SectionLabel::firstOrCreate(['section_key' => 'menus'], [
            'translations' => [],
            'extra_fields' => [],
            'status' => true,
        ]);

        return view('cms-kit::menus.common', compact('languages', 'section'));
    }

    public function updateCommon(Request $request)
    {
        $rules = [
            'extra_fields.button_url' => ['nullable', 'string', 'max:255'],
        ];

        foreach (Language::active()->get() as $language) {
            foreach (['line_1', 'line_2', 'short_description', 'button_text', 'listing_title', 'listing_description'] as $field) {
                $rules["translations.{$language->code}.{$field}"] = ['nullable', 'string'];
            }
        }

        $request->validate($rules);

        SectionLabel::updateOrCreate(
            ['section_key' => 'menus'],
            [
                'translations' => $request->input('translations', []),
                'extra_fields' => [
                    'button_url' => $request->input('extra_fields.button_url'),
                    'display_home' => $request->boolean('display_home'),
                ],
                'status' => $request->boolean('status'),
            ]
        );

        return redirect()->route('cms.menus.common')->with('success', 'Menu section updated successfully.');
    }

    public function categories(Request $request)
    {
        if ($request->ajax()) {
            return DataTables::of(MenuCategory::query()->orderBy('sort_order')->orderBy('id'))
                ->addIndexColumn()
                ->addColumn('icon_preview', fn (MenuCategory $category) => $category->icon
                    ? '<img src="' . asset('storage/' . $category->icon) . '" class="img-thumbnail" style="height:42px;">'
                    : '-')
                ->addColumn('name_text', fn (MenuCategory $category) => e($category->getTranslation('name')))
                ->addColumn('status', fn (MenuCategory $category) => '<div class="form-check form-switch"><input class="form-check-input toggle-status" type="checkbox" data-id="' . $category->id . '" ' . ($category->status ? 'checked' : '') . '></div>')
                ->addColumn('order', fn (MenuCategory $category) => '<input type="number" min="1" class="form-control form-control-sm reorder-input" data-id="' . $category->id . '" value="' . $category->sort_order . '" style="width:80px;">')
                ->addColumn('action', fn (MenuCategory $category) => '<div class="btn-group">'
                    . '<a href="' . route('cms.menus.categories.edit', $category->id) . '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a>'
                    . '<button type="button" class="btn btn-sm btn-outline-danger delete-item" data-id="' . $category->id . '"><i class="fas fa-trash"></i></button>'
                    . '</div>')
                ->rawColumns(['icon_preview', 'status', 'order', 'action'])
                ->make(true);
        }

        return view('cms-kit::menus.categories.index');
    }

    public function createCategory()
    {
        $languages = Language::active()->get();
        $nextOrder = (MenuCategory::max('sort_order') ?? 0) + 1;

        return view('cms-kit::menus.categories.create', compact('languages', 'nextOrder'));
    }

    public function storeCategory(Request $request)
    {
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();
        $data = $this->validateCategory($request);
        $order = $this->resolveOrderForCreate(MenuCategory::class, $request->integer('sort_order') ?: null);

        MenuCategory::where('sort_order', '>=', $order)->increment('sort_order');

        $payload = [
            'icon_alt' => data_get($translations, "{$defaultLanguage}.icon_alt"),
            'name' => data_get($translations, "{$defaultLanguage}.name"),
            'translations' => $translations,
            'sort_order' => $order,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('icon')) {
            $this->validateImageWithinLimits($request, 'icon', config('cms-kit.images.menus.category_icon', []), 'Menu category icon');
            $payload['icon'] = $request->file('icon')->store('menus/categories', 'public');
        }

        MenuCategory::create($payload);

        return redirect()->route('cms.menus.categories.index')->with('success', 'Menu category created successfully.');
    }

    public function editCategory(int $id)
    {
        $category = MenuCategory::findOrFail($id);
        $languages = Language::active()->get();

        return view('cms-kit::menus.categories.edit', compact('category', 'languages'));
    }

    public function updateCategory(Request $request, int $id)
    {
        $category = MenuCategory::findOrFail($id);
        $this->validateCategory($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();

        $payload = [
            'icon_alt' => data_get($translations, "{$defaultLanguage}.icon_alt"),
            'name' => data_get($translations, "{$defaultLanguage}.name"),
            'translations' => $translations,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('icon')) {
            $this->validateImageWithinLimits($request, 'icon', config('cms-kit.images.menus.category_icon', []), 'Menu category icon');
            if ($category->icon) {
                Storage::disk('public')->delete($category->icon);
            }
            $payload['icon'] = $request->file('icon')->store('menus/categories', 'public');
        } elseif ($request->boolean('remove_icon') && $category->icon) {
            Storage::disk('public')->delete($category->icon);
            $payload['icon'] = null;
        }

        $category->update($payload);

        return redirect()->route('cms.menus.categories.index')->with('success', 'Menu category updated successfully.');
    }

    public function destroyCategory(int $id)
    {
        $category = MenuCategory::findOrFail($id);
        $order = $category->sort_order;
        $category->delete();
        MenuCategory::where('sort_order', '>', $order)->decrement('sort_order');
        $this->normalizeOrder(MenuCategory::class);

        return response()->json(['success' => true]);
    }

    public function toggleCategoryStatus(int $id)
    {
        $category = MenuCategory::findOrFail($id);
        $category->update(['status' => !$category->status]);

        return response()->json(['success' => true]);
    }

    public function reorderCategory(Request $request)
    {
        return $this->reorder($request, MenuCategory::class, 'menu_categories');
    }

    public function items(Request $request)
    {
        if ($request->ajax()) {
            return DataTables::of(MenuItem::query()->with(['category', 'signatureItem', 'offers'])->orderBy('sort_order')->orderBy('id'))
                ->addIndexColumn()
                ->addColumn('image_preview', fn (MenuItem $item) => $item->image
                    ? '<img src="' . asset('storage/' . $item->image) . '" class="img-thumbnail" style="height:42px;">'
                    : '-')
                ->addColumn('name_text', fn (MenuItem $item) => e($item->getTranslation('name')))
                ->addColumn('category_text', fn (MenuItem $item) => e($item->category?->getTranslation('name') ?? '-'))
                ->addColumn('food_type_text', fn (MenuItem $item) => $item->food_type === 'non_veg' ? 'Non Veg' : 'Veg')
                ->addColumn('spicy_text', fn (MenuItem $item) => $item->spicy ? 'Yes' : 'No')
                ->addColumn('connections_text', fn (MenuItem $item) => $this->formatMenuItemConnections($item))
                ->addColumn('status', fn (MenuItem $item) => '<div class="form-check form-switch"><input class="form-check-input toggle-status" type="checkbox" data-id="' . $item->id . '" ' . ($item->status ? 'checked' : '') . '></div>')
                ->addColumn('order', fn (MenuItem $item) => '<input type="number" min="1" class="form-control form-control-sm reorder-input" data-id="' . $item->id . '" value="' . $item->sort_order . '" style="width:80px;">')
                ->addColumn('action', fn (MenuItem $item) => '<div class="btn-group">'
                    . '<a href="' . route('cms.menus.items.edit', $item->id) . '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a>'
                    . '<button type="button" class="btn btn-sm btn-outline-danger delete-item" data-id="' . $item->id . '"><i class="fas fa-trash"></i></button>'
                    . '</div>')
                ->rawColumns(['image_preview', 'connections_text', 'status', 'order', 'action'])
                ->make(true);
        }

        return view('cms-kit::menus.items.index');
    }

    public function createItem()
    {
        $languages = Language::active()->get();
        $categories = MenuCategory::orderBy('sort_order')->get();
        $nextOrder = (MenuItem::max('sort_order') ?? 0) + 1;

        return view('cms-kit::menus.items.create', compact('languages', 'categories', 'nextOrder'));
    }

    public function storeItem(Request $request)
    {
        $this->validateItem($request);
        $this->ensureSignatureConnectionAvailable($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();
        $order = $this->resolveOrderForCreate(MenuItem::class, $request->integer('sort_order') ?: null);

        MenuItem::where('sort_order', '>=', $order)->increment('sort_order');

        $payload = [
            'menu_category_id' => $request->input('menu_category_id'),
            'image_alt' => data_get($translations, "{$defaultLanguage}.image_alt"),
            'name' => data_get($translations, "{$defaultLanguage}.name"),
            'description' => data_get($translations, "{$defaultLanguage}.description"),
            'translations' => $translations,
            'spicy' => $request->boolean('spicy'),
            'food_type' => $request->input('food_type', 'veg'),
            'price' => $request->input('price', 0),
            'sort_order' => $order,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('image')) {
            $this->validateImageWithinLimits($request, 'image', config('cms-kit.images.menus.item_image', []), 'Menu item image');
            $payload['image'] = $request->file('image')->store('menus/items', 'public');
        }

        $item = MenuItem::create($payload);
        $this->syncMenuItemConnections($item, $request);

        return redirect()->route('cms.menus.items.index')->with('success', 'Menu item created successfully.');
    }

    public function editItem(int $id)
    {
        $item = MenuItem::findOrFail($id);
        $languages = Language::active()->get();
        $categories = MenuCategory::orderBy('sort_order')->get();

        return view('cms-kit::menus.items.edit', compact('item', 'languages', 'categories'));
    }

    public function updateItem(Request $request, int $id)
    {
        $item = MenuItem::findOrFail($id);
        $this->validateItem($request);
        $this->ensureSignatureConnectionAvailable($request, $item);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();

        $payload = [
            'menu_category_id' => $request->input('menu_category_id'),
            'image_alt' => data_get($translations, "{$defaultLanguage}.image_alt"),
            'name' => data_get($translations, "{$defaultLanguage}.name"),
            'description' => data_get($translations, "{$defaultLanguage}.description"),
            'translations' => $translations,
            'spicy' => $request->boolean('spicy'),
            'food_type' => $request->input('food_type', 'veg'),
            'price' => $request->input('price', 0),
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('image')) {
            $this->validateImageWithinLimits($request, 'image', config('cms-kit.images.menus.item_image', []), 'Menu item image');
            if ($item->image) {
                Storage::disk('public')->delete($item->image);
            }
            $payload['image'] = $request->file('image')->store('menus/items', 'public');
        } elseif ($request->boolean('remove_image') && $item->image) {
            Storage::disk('public')->delete($item->image);
            $payload['image'] = null;
        }

        $item->update($payload);
        $this->syncMenuItemConnections($item->refresh(), $request);

        return redirect()->route('cms.menus.items.index')->with('success', 'Menu item updated successfully.');
    }

    public function destroyItem(int $id)
    {
        $item = MenuItem::findOrFail($id);
        $order = $item->sort_order;
        $item->delete();
        MenuItem::where('sort_order', '>', $order)->decrement('sort_order');
        $this->normalizeOrder(MenuItem::class);

        return response()->json(['success' => true]);
    }

    public function toggleItemStatus(int $id)
    {
        $item = MenuItem::findOrFail($id);
        $item->update(['status' => !$item->status]);

        return response()->json(['success' => true]);
    }

    public function reorderItem(Request $request)
    {
        return $this->reorder($request, MenuItem::class, 'menu_items');
    }

    public function signatureItems(Request $request)
    {
        $languages = Language::active()->get();
        $section = SectionLabel::firstOrCreate(['section_key' => 'menu_signature_items'], [
            'translations' => [],
            'extra_fields' => [],
            'status' => true,
        ]);

        if ($request->ajax()) {
            return DataTables::of(MenuSignatureItem::query()->with('menuItem')->orderBy('sort_order')->orderBy('id'))
                ->addIndexColumn()
                ->addColumn('image_preview', fn (MenuSignatureItem $item) => $item->image
                    ? '<img src="' . asset('storage/' . $item->image) . '" class="img-thumbnail" style="height:42px;">'
                    : ($item->menuItem?->image
                        ? '<img src="' . asset('storage/' . $item->menuItem->image) . '" class="img-thumbnail" style="height:42px;">'
                        : '-'))
                ->addColumn('title_text', fn (MenuSignatureItem $item) => $this->formatSignatureTitleForListing($item->getTranslation('title') ?? $item->menuItem?->getTranslation('name')))
                ->addColumn('menu_item_text', fn (MenuSignatureItem $item) => e($item->menuItem?->getTranslation('name') ?? '-'))
                ->addColumn('alt_text_value', fn (MenuSignatureItem $item) => e($item->getTranslation('image_alt') ?? $item->image_alt ?? $item->menuItem?->getTranslation('image_alt') ?? $item->menuItem?->image_alt ?? '-'))
                ->addColumn('status', fn (MenuSignatureItem $item) => '<div class="form-check form-switch"><input class="form-check-input toggle-status" type="checkbox" data-id="' . $item->id . '" ' . ($item->status ? 'checked' : '') . '></div>')
                ->addColumn('order', fn (MenuSignatureItem $item) => '<input type="number" min="1" class="form-control form-control-sm reorder-input" data-id="' . $item->id . '" value="' . $item->sort_order . '" style="width:80px;">')
                ->addColumn('action', fn (MenuSignatureItem $item) => '<div class="btn-group">'
                    . '<a href="' . route('cms.menus.signature-items.edit', $item->id) . '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a>'
                    . '<button type="button" class="btn btn-sm btn-outline-danger delete-item" data-id="' . $item->id . '"><i class="fas fa-trash"></i></button>'
                    . '</div>')
                ->rawColumns(['image_preview', 'title_text', 'status', 'order', 'action'])
                ->make(true);
        }

        return view('cms-kit::menus.signature-items.index', compact('languages', 'section'));
    }

    public function updateSignatureSection(Request $request)
    {
        $rules = [];

        foreach (Language::active()->get() as $language) {
            foreach (['line_2', 'short_description'] as $field) {
                $rules["translations.{$language->code}.{$field}"] = ['nullable', 'string'];
            }
        }

        $request->validate($rules);

        SectionLabel::updateOrCreate(
            ['section_key' => 'menu_signature_items'],
            [
                'translations' => $request->input('translations', []),
                'extra_fields' => [
                    'display_home' => $request->boolean('display_home'),
                ],
                'status' => $request->boolean('status'),
            ]
        );

        return redirect()->route('cms.menus.signature-items.index')->with('success', 'Signature section updated successfully.');
    }

    public function createSignatureItem()
    {
        if ($this->signatureItemLimitReached()) {
            return redirect()->route('cms.menus.signature-items.index')->with('error', 'Maximum 4 items allowed.');
        }

        $languages = Language::active()->get();
        $menuItems = MenuItem::active()->with('category')->orderBy('sort_order')->orderBy('id')->get();
        $nextOrder = (MenuSignatureItem::max('sort_order') ?? 0) + 1;

        return view('cms-kit::menus.signature-items.create', compact('languages', 'menuItems', 'nextOrder'));
    }

    public function storeSignatureItem(Request $request)
    {
        if ($this->signatureItemLimitReached()) {
            return redirect()->route('cms.menus.signature-items.index')->with('error', 'Maximum 4 items allowed.');
        }

        $this->validateSignatureItem($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();
        $order = $this->resolveOrderForCreate(MenuSignatureItem::class, $request->integer('sort_order') ?: null);

        MenuSignatureItem::where('sort_order', '>=', $order)->increment('sort_order');

        $payload = [
            'menu_item_id' => $request->input('menu_item_id'),
            'image_alt' => data_get($translations, "{$defaultLanguage}.image_alt"),
            'title' => data_get($translations, "{$defaultLanguage}.title"),
            'translations' => $translations,
            'sort_order' => $order,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('image')) {
            $this->validateImageWithinLimits($request, 'image', config('cms-kit.images.menus.signature_item_image', []), 'Signature item image');
            $payload['image'] = $request->file('image')->store('menus/signature-items', 'public');
        }

        MenuSignatureItem::create($payload);

        return redirect()->route('cms.menus.signature-items.index')->with('success', 'Signature item created successfully.');
    }

    public function editSignatureItem(int $id)
    {
        $item = MenuSignatureItem::findOrFail($id);
        $languages = Language::active()->get();
        $menuItems = MenuItem::active()->with('category')->orderBy('sort_order')->orderBy('id')->get();

        return view('cms-kit::menus.signature-items.edit', compact('item', 'languages', 'menuItems'));
    }

    public function updateSignatureItem(Request $request, int $id)
    {
        $item = MenuSignatureItem::findOrFail($id);
        $this->validateSignatureItem($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();

        $payload = [
            'menu_item_id' => $request->input('menu_item_id'),
            'image_alt' => data_get($translations, "{$defaultLanguage}.image_alt"),
            'title' => data_get($translations, "{$defaultLanguage}.title"),
            'translations' => $translations,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('image')) {
            $this->validateImageWithinLimits($request, 'image', config('cms-kit.images.menus.signature_item_image', []), 'Signature item image');
            if ($item->image) {
                Storage::disk('public')->delete($item->image);
            }
            $payload['image'] = $request->file('image')->store('menus/signature-items', 'public');
        } elseif ($request->boolean('remove_image') && $item->image) {
            Storage::disk('public')->delete($item->image);
            $payload['image'] = null;
        }

        $item->update($payload);

        return redirect()->route('cms.menus.signature-items.index')->with('success', 'Signature item updated successfully.');
    }

    public function destroySignatureItem(int $id)
    {
        $item = MenuSignatureItem::findOrFail($id);
        $order = $item->sort_order;

        if ($item->image) {
            Storage::disk('public')->delete($item->image);
        }

        $item->delete();
        MenuSignatureItem::where('sort_order', '>', $order)->decrement('sort_order');
        $this->normalizeOrder(MenuSignatureItem::class);

        return response()->json(['success' => true]);
    }

    public function toggleSignatureItemStatus(int $id)
    {
        $item = MenuSignatureItem::findOrFail($id);
        if (! $item->status && $this->signatureItemLimitReached()) {
            return response()->json(['message' => 'Already ' . $this->maxSignatureItems() . ' signature items selected.'], 422);
        }

        $item->update(['status' => !$item->status]);

        return response()->json(['success' => true]);
    }

    public function reorderSignatureItem(Request $request)
    {
        return $this->reorder($request, MenuSignatureItem::class, 'menu_signature_items');
    }

    protected function validateCategory(Request $request): array
    {
        $rules = [
            'icon' => $this->imageRules('menus.category_icon', ['nullable', 'image']),
            'remove_icon' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];

        foreach (Language::active()->get() as $language) {
            $rules["translations.{$language->code}.name"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$language->code}.icon_alt"] = ['nullable', 'string', 'max:255'];
        }

        return $request->validate($rules);
    }

    protected function validateItem(Request $request): array
    {
        $rules = [
            'menu_category_id' => ['nullable', 'exists:menu_categories,id'],
            'image' => $this->imageRules('menus.item_image', ['nullable', 'image']),
            'remove_image' => ['nullable', 'boolean'],
            'is_signature_item' => ['nullable', 'boolean'],
            'signature_image' => $this->imageRules('menus.signature_item_image', ['nullable', 'image']),
            'remove_signature_image' => ['nullable', 'boolean'],
            'has_offer' => ['nullable', 'boolean'],
            'offer_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'offer_price' => ['nullable', 'numeric', 'min:0'],
            'offer_image' => $this->imageRules('offers.image', ['nullable', 'image']),
            'remove_offer_image' => ['nullable', 'boolean'],
            'spicy' => ['nullable', 'boolean'],
            'food_type' => ['required', 'in:veg,non_veg'],
            'price' => ['required', 'numeric', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];

        foreach (Language::active()->get() as $language) {
            $rules["translations.{$language->code}.name"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$language->code}.description"] = ['nullable', 'string'];
            $rules["translations.{$language->code}.image_alt"] = ['nullable', 'string', 'max:255'];
            $rules["signature_translations.{$language->code}.title"] = ['nullable', 'string', 'max:255'];
            $rules["signature_translations.{$language->code}.image_alt"] = ['nullable', 'string', 'max:255'];
        }

        return $request->validate($rules);
    }

    protected function validateSignatureItem(Request $request): array
    {
        $rules = [
            'menu_item_id' => ['required', 'exists:menu_items,id'],
            'image' => $this->imageRules('menus.signature_item_image', ['nullable', 'image']),
            'remove_image' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];

        foreach (Language::active()->get() as $language) {
            $rules["translations.{$language->code}.title"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$language->code}.image_alt"] = ['nullable', 'string', 'max:255'];
        }

        return $request->validate($rules);
    }

    protected function formatSignatureTitleForListing(?string $title): string
    {
        if (!$title) {
            return '';
        }

        $normalized = preg_replace('/&lt;\s*br\s*\/?\s*&gt;/i', '<br>', $title) ?? $title;
        $parts = preg_split('/<\s*br\s*\/?\s*>/i', $normalized) ?: [$normalized];

        return collect($parts)
            ->map(fn ($part) => e($part))
            ->implode('<br>');
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

    protected function signatureItemLimitReached(): bool
    {
        $maxItems = (int) config('cms-kit.database.menus.signature_items.max_items', 4);

        return $maxItems > 0 && MenuSignatureItem::where('status', true)->count() >= $maxItems;
    }

    protected function maxSignatureItems(): int
    {
        return (int) config('cms-kit.database.menus.signature_items.max_items', 4);
    }

    protected function ensureSignatureConnectionAvailable(Request $request, ?MenuItem $item = null): void
    {
        if (! $request->boolean('is_signature_item')) {
            return;
        }

        if ($item && MenuSignatureItem::withTrashed()->where('menu_item_id', $item->id)->exists()) {
            return;
        }

        if ($this->signatureItemLimitReached()) {
            throw ValidationException::withMessages(['is_signature_item' => 'Already ' . $this->maxSignatureItems() . ' signature items selected.']);
        }
    }

    protected function formatMenuItemConnections(MenuItem $item): string
    {
        $badges = [];

        if ($item->signatureItem?->status) {
            $badges[] = '<span class="badge bg-warning text-dark">Signature</span>';
        }

        if ($item->offers->where('status', true)->isNotEmpty()) {
            $badges[] = '<span class="badge bg-success">Offer</span>';
        }

        return $badges ? implode(' ', $badges) : '-';
    }

    protected function syncMenuItemConnections(MenuItem $item, Request $request): void
    {
        if ($request->boolean('is_signature_item')) {
            $signatureItem = MenuSignatureItem::withTrashed()->firstOrNew(['menu_item_id' => $item->id]);

            if (! $signatureItem->exists) {
                $signatureItem->sort_order = (MenuSignatureItem::max('sort_order') ?? 0) + 1;
            }

            $signatureTranslations = $this->filledSignatureTranslations($request);
            $defaultLanguage = $this->defaultLanguageCode();
            $signatureItem->title = data_get($signatureTranslations, "{$defaultLanguage}.title");
            $signatureItem->image_alt = data_get($signatureTranslations, "{$defaultLanguage}.image_alt");
            $signatureItem->translations = $signatureTranslations;

            if ($request->hasFile('signature_image')) {
                $this->validateImageWithinLimits($request, 'signature_image', config('cms-kit.images.menus.signature_item_image', []), 'Signature item image');
                if ($signatureItem->image) {
                    Storage::disk('public')->delete($signatureItem->image);
                }
                $signatureItem->image = $request->file('signature_image')->store('menus/signature-items', 'public');
            } elseif ($request->boolean('remove_signature_image') && $signatureItem->image) {
                Storage::disk('public')->delete($signatureItem->image);
                $signatureItem->image = null;
            }

            $signatureItem->status = true;
            if ($signatureItem->trashed()) {
                $signatureItem->restore();
            }
            $signatureItem->save();
        } elseif ($item->signatureItem) {
            $item->signatureItem->update(['status' => false]);
        }

        if ($request->boolean('has_offer')) {
            $offer = Offer::withTrashed()->firstOrNew(['menu_item_id' => $item->id]);

            if (! $offer->exists) {
                $offer->sort_order = (Offer::max('sort_order') ?? 0) + 1;
                $offer->alt_text = null;
                $offer->translations = [];
            }

            $offer->offer_percent = $request->input('offer_percent');
            $offer->offer_price = $request->input('offer_price');

            if ($request->hasFile('offer_image')) {
                $this->validateImageWithinLimits($request, 'offer_image', config('cms-kit.images.offers.image', []), 'Offer image');
                if ($offer->image) {
                    Storage::disk('public')->delete($offer->image);
                }
                $offer->image = $request->file('offer_image')->store('offers', 'public');
            } elseif ($request->boolean('remove_offer_image') && $offer->image) {
                Storage::disk('public')->delete($offer->image);
                $offer->image = null;
            }

            $offer->status = true;
            if ($offer->trashed()) {
                $offer->restore();
            }
            $offer->save();
        } else {
            $item->offers()->update(['status' => false]);
        }
    }

    protected function filledSignatureTranslations(Request $request): array
    {
        return collect($request->input('signature_translations', []))
            ->map(function (array $translation) {
                return collect($translation)
                    ->only(['title', 'image_alt'])
                    ->filter(fn ($value) => filled($value))
                    ->all();
            })
            ->filter()
            ->all();
    }

    protected function defaultLanguageCode(): string
    {
        return Language::active()->where('is_default', true)->value('code')
            ?? Language::active()->orderByDesc('is_default')->value('code')
            ?? config('app.fallback_locale');
    }

    protected function resolveOrderForCreate(string $modelClass, ?int $requestedOrder): int
    {
        $maxAllowed = $modelClass::count() + 1;

        if ($requestedOrder === null) {
            return $maxAllowed;
        }

        if ($requestedOrder < 1 || $requestedOrder > $maxAllowed) {
            throw ValidationException::withMessages(['sort_order' => "Order must be between 1 and {$maxAllowed}."]);
        }

        return $requestedOrder;
    }

    protected function reorder(Request $request, string $modelClass, string $table)
    {
        $request->validate([
            'id' => ['required', 'integer', "exists:{$table},id"],
            'sort_order' => ['required', 'integer', 'min:1'],
        ]);

        $item = $modelClass::findOrFail($request->integer('id'));
        $total = $modelClass::count();
        $newOrder = min($request->integer('sort_order'), max($total, 1));
        $oldOrder = $item->sort_order;

        if ($newOrder !== $oldOrder) {
            if ($newOrder > $oldOrder) {
                $modelClass::where('sort_order', '>', $oldOrder)->where('sort_order', '<=', $newOrder)->decrement('sort_order');
            } else {
                $modelClass::where('sort_order', '>=', $newOrder)->where('sort_order', '<', $oldOrder)->increment('sort_order');
            }

            $item->update(['sort_order' => $newOrder]);
        }

        $this->normalizeOrder($modelClass);
        app(FrontendRevalidationService::class)->revalidate(['api-menus']);

        return response()->json(['success' => true]);
    }

    protected function normalizeOrder(string $modelClass): void
    {
        $position = 1;

        foreach ($modelClass::orderBy('sort_order')->orderBy('id')->get(['id']) as $item) {
            $modelClass::whereKey($item->id)->update(['sort_order' => $position++]);
        }
    }
}
