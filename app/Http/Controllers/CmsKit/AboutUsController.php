<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\AboutUs;
use App\Models\CmsKit\Language;
use App\Models\CmsKit\SectionLabel;
use App\Models\CmsKit\WhyChooseUsItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use CMS\SiteManager\Support\ValidatesImageDimensions;
use Yajra\DataTables\Facades\DataTables;

class AboutUsController extends Controller
{
    use ValidatesImageDimensions;

    public function index(Request $request)
    {
        $languages = Language::active()->get();
        $aboutUs = AboutUs::query()->first() ?? new AboutUs(['video_type' => 'url', 'is_active' => true]);

        return view('cms-kit::about-us.index', compact('languages', 'aboutUs'));
    }

    public function whyChooseUs(Request $request)
    {
        if ($request->ajax()) {
            return DataTables::of(WhyChooseUsItem::query()->orderBy('sort_order'))
                ->addIndexColumn()
                ->addColumn('icon_preview', function (WhyChooseUsItem $item) {
                    return $item->icon
                        ? '<img src="' . asset('storage/' . $item->icon) . '" class="img-thumbnail" style="height:40px;">'
                        : '-';
                })
                ->addColumn('line_1_text', fn (WhyChooseUsItem $item) => e($item->getTranslation('line_1')))
                ->addColumn('line_2_text', fn (WhyChooseUsItem $item) => e($item->getTranslation('line_2')))
                ->addColumn('status', function (WhyChooseUsItem $item) {
                    $checked = $item->is_active ? 'checked' : '';
                    return '<div class="form-check form-switch"><input class="form-check-input toggle-status" type="checkbox" data-id="' . $item->id . '" ' . $checked . '></div>';
                })
                ->addColumn('order', function (WhyChooseUsItem $item) {
                    return '<input type="number" min="1" class="form-control form-control-sm reorder-input" data-id="' . $item->id . '" value="' . $item->sort_order . '" style="width: 80px;">';
                })
                ->addColumn('action', function (WhyChooseUsItem $item) {
                    return '<div class="btn-group">'
                        . '<a href="' . route('cms.about-us.items.edit', $item->id) . '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a>'
                        . '<button type="button" class="btn btn-sm btn-outline-danger delete-item" data-id="' . $item->id . '"><i class="fas fa-trash"></i></button>'
                        . '</div>';
                })
                ->rawColumns(['icon_preview', 'status', 'order', 'action'])
                ->make(true);
        }

        $languages = Language::active()->get();
        $whyChooseSection = SectionLabel::firstOrCreate(['section_key' => 'why_choose_us'], [
            'translations' => [],
            'status' => true,
        ]);

        return view('cms-kit::about-us.why-choose-us', compact('languages', 'whyChooseSection'));
    }

    public function update(Request $request)
    {
        $aboutUs = AboutUs::query()->first() ?? new AboutUs();
        $languages = Language::active()->get();

        $rules = [
            'button_url' => ['nullable', 'string', 'max:255'],
            'video_type' => ['required', 'in:url,upload'],
            'video_url' => ['nullable', 'string', 'max:255'],
            'video_file' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/ogg', 'max:20480'],
            'video_thumbnail' => $this->imageRules('about-us.video_thumbnail', ['nullable', 'image']),
        ];

        foreach ($languages as $language) {
            foreach (['line_1', 'line_2', 'about_page_title', 'short_description', 'long_description', 'button_text', 'mission', 'vision', 'core_value'] as $field) {
                $rules["translations.{$language->code}.{$field}"] = ['nullable', 'string'];
            }
        }

        $validated = $request->validate($rules);
        $this->validateImageWithinLimits($request, 'video_thumbnail', config('cms-kit.images.about-us.video_thumbnail', []), 'About us video thumbnail');
        $translations = $request->input('translations', []);
        $defaultLanguage = $languages->firstWhere('is_default', true)?->code ?? config('app.fallback_locale');

        $data = [
            'line_1' => data_get($translations, "{$defaultLanguage}.line_1"),
            'line_2' => data_get($translations, "{$defaultLanguage}.line_2"),
            'about_page_title' => data_get($translations, "{$defaultLanguage}.about_page_title"),
            'short_description' => data_get($translations, "{$defaultLanguage}.short_description"),
            'long_description' => data_get($translations, "{$defaultLanguage}.long_description"),
            'button_text' => data_get($translations, "{$defaultLanguage}.button_text"),
            'button_url' => $validated['button_url'] ?? null,
            'video_type' => $validated['video_type'],
            'video_url' => $validated['video_url'] ?? null,
            'mission' => data_get($translations, "{$defaultLanguage}.mission"),
            'vision' => data_get($translations, "{$defaultLanguage}.vision"),
            'core_value' => data_get($translations, "{$defaultLanguage}.core_value"),
            'translations' => $translations,
            'extra_fields' => [
                'display_home' => $request->boolean('display_home'),
            ],
            'is_active' => $request->boolean('is_active'),
        ];

        if ($validated['video_type'] === 'upload' && $request->hasFile('video_file')) {
            if ($aboutUs->video_file) {
                Storage::disk('public')->delete($aboutUs->video_file);
            }
            $data['video_file'] = $request->file('video_file')->store('about-us', 'public');
            $data['video_url'] = null;
        } elseif ($validated['video_type'] === 'url') {
            if ($request->boolean('remove_video_file') && $aboutUs->video_file) {
                Storage::disk('public')->delete($aboutUs->video_file);
                $data['video_file'] = null;
            } else {
                $data['video_file'] = $aboutUs->video_file;
            }
        }

        if ($request->hasFile('video_thumbnail')) {
            if ($aboutUs->video_thumbnail) {
                Storage::disk('public')->delete($aboutUs->video_thumbnail);
            }
            $data['video_thumbnail'] = $request->file('video_thumbnail')->store('about-us/thumbnails', 'public');
        } elseif ($request->boolean('remove_video_thumbnail') && $aboutUs->video_thumbnail) {
            Storage::disk('public')->delete($aboutUs->video_thumbnail);
            $data['video_thumbnail'] = null;
        } else {
            $data['video_thumbnail'] = $aboutUs->video_thumbnail;
        }

        $aboutUs->fill($data)->save();

        return redirect()->route('cms.about-us.index')->with('success', 'About Us updated successfully.');
    }

    public function updateWhyChooseSection(Request $request)
    {
        $languages = Language::active()->get();
        $rules = [];

        foreach ($languages as $language) {
            $rules["translations.{$language->code}.title"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$language->code}.description"] = ['nullable', 'string'];
            $rules["translations.{$language->code}.home_title"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$language->code}.home_description"] = ['nullable', 'string'];
        }

        $request->validate($rules);

        $section = SectionLabel::firstOrCreate(['section_key' => 'why_choose_us']);
        $section->update([
            'translations' => $request->input('translations', []),
            'extra_fields' => [
                'display_home' => $request->boolean('display_home'),
            ],
            'status' => $request->boolean('status'),
        ]);

        return redirect()->route('cms.about-us.why-choose.index')->with('success', 'Why Choose Us section updated successfully.');
    }

    public function createItem()
    {
        if ($this->whyChooseItemLimitReached()) {
            return redirect()->route('cms.about-us.why-choose.index')->with('error', 'Maximum 6 items allowed.');
        }

        $languages = Language::active()->get();
        $nextOrder = (WhyChooseUsItem::max('sort_order') ?? 0) + 1;

        return view('cms-kit::about-us.create-item', compact('languages', 'nextOrder'));
    }

    public function storeItem(Request $request)
    {
        if ($this->whyChooseItemLimitReached()) {
            return redirect()->route('cms.about-us.why-choose.index')->with('error', 'Maximum 6 items allowed.');
        }

        $data = $this->validateItem($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = Language::active()->firstWhere('is_default', true)?->code ?? config('app.fallback_locale');
        $order = $this->resolveItemOrderForCreate($request->sort_order ? (int) $request->sort_order : null);

        WhyChooseUsItem::where('sort_order', '>=', $order)->increment('sort_order');

        $payload = [
            'icon_alt' => $request->input('icon_alt'),
            'line_1' => data_get($translations, "{$defaultLanguage}.line_1"),
            'line_2' => data_get($translations, "{$defaultLanguage}.line_2"),
            'translations' => $translations,
            'sort_order' => $order,
            'is_active' => $request->boolean('is_active'),
        ];

        if ($request->hasFile('icon')) {
            $this->validateImageWithinLimits($request, 'icon', config('cms-kit.images.about-us.why_choose_us_icon', []), 'Why Choose Us icon');
            $payload['icon'] = $request->file('icon')->store('about-us/icons', 'public');
        }

        WhyChooseUsItem::create($payload);

        return redirect()->route('cms.about-us.why-choose.index')->with('success', 'Why Choose Us item created successfully.');
    }

    public function editItem(int $id)
    {
        $item = WhyChooseUsItem::findOrFail($id);
        $languages = Language::active()->get();

        return view('cms-kit::about-us.edit-item', compact('item', 'languages'));
    }

    public function updateItem(Request $request, int $id)
    {
        $item = WhyChooseUsItem::findOrFail($id);
        $this->validateItem($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = Language::active()->firstWhere('is_default', true)?->code ?? config('app.fallback_locale');

        $payload = [
            'icon_alt' => $request->input('icon_alt'),
            'line_1' => data_get($translations, "{$defaultLanguage}.line_1"),
            'line_2' => data_get($translations, "{$defaultLanguage}.line_2"),
            'translations' => $translations,
            'is_active' => $request->boolean('is_active'),
        ];

        if ($request->hasFile('icon')) {
            $this->validateImageWithinLimits($request, 'icon', config('cms-kit.images.about-us.why_choose_us_icon', []), 'Why Choose Us icon');
            if ($item->icon) {
                Storage::disk('public')->delete($item->icon);
            }
            $payload['icon'] = $request->file('icon')->store('about-us/icons', 'public');
        } elseif ($request->boolean('remove_icon') && $item->icon) {
            Storage::disk('public')->delete($item->icon);
            $payload['icon'] = null;
        }

        $item->update($payload);

        return redirect()->route('cms.about-us.why-choose.index')->with('success', 'Why Choose Us item updated successfully.');
    }

    public function destroyItem(int $id)
    {
        $item = WhyChooseUsItem::findOrFail($id);
        $order = $item->sort_order;

        if ($item->icon) {
            Storage::disk('public')->delete($item->icon);
        }

        $item->delete();
        WhyChooseUsItem::where('sort_order', '>', $order)->decrement('sort_order');
        $this->normalizeItemOrder();

        return response()->json(['success' => true]);
    }

    public function toggleItemStatus(int $id)
    {
        $item = WhyChooseUsItem::findOrFail($id);
        $item->is_active = !$item->is_active;
        $item->save();

        return response()->json(['success' => true]);
    }

    public function reorderItem(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:why_choose_us_items,id'],
            'sort_order' => ['required', 'integer', 'min:1'],
        ]);

        $item = WhyChooseUsItem::findOrFail($request->integer('id'));
        $newOrder = $this->resolveItemOrderForReorder($request->integer('sort_order'));
        $oldOrder = $item->sort_order;

        if ($newOrder !== $oldOrder) {
            if ($newOrder > $oldOrder) {
                WhyChooseUsItem::where('sort_order', '>', $oldOrder)
                    ->where('sort_order', '<=', $newOrder)
                    ->decrement('sort_order');
            } else {
                WhyChooseUsItem::where('sort_order', '>=', $newOrder)
                    ->where('sort_order', '<', $oldOrder)
                    ->increment('sort_order');
            }

            $item->update(['sort_order' => $newOrder]);
        }

        $this->normalizeItemOrder();

        return response()->json(['success' => true]);
    }

    protected function validateItem(Request $request): array
    {
        $rules = [
            'icon' => $this->imageRules('about-us.why_choose_us_icon', ['nullable', 'image']),
            'icon_alt' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];

        foreach (Language::active()->get() as $language) {
            $rules["translations.{$language->code}.line_1"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$language->code}.line_2"] = ['nullable', 'string', 'max:255'];
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

    protected function whyChooseItemLimitReached(): bool
    {
        $maxItems = (int) config('cms-kit.database.about-us.why_choose_us.max_items', 6);

        return $maxItems > 0 && WhyChooseUsItem::count() >= $maxItems;
    }

    protected function resolveItemOrderForCreate(?int $requestedOrder): int
    {
        $total = WhyChooseUsItem::count();
        $maxAllowed = $total + 1;

        if ($requestedOrder === null) {
            return $maxAllowed;
        }

        if ($requestedOrder < 1 || $requestedOrder > $maxAllowed) {
            throw ValidationException::withMessages([
                'sort_order' => "Order must be between 1 and {$maxAllowed}.",
            ]);
        }

        return $requestedOrder;
    }

    protected function resolveItemOrderForReorder(int $requestedOrder): int
    {
        $total = WhyChooseUsItem::count();

        if ($total <= 1) {
            return 1;
        }

        if ($requestedOrder < 1 || $requestedOrder > $total) {
            throw ValidationException::withMessages([
                'sort_order' => "Order must be between 1 and {$total}.",
            ]);
        }

        return $requestedOrder;
    }

    protected function normalizeItemOrder(): void
    {
        $items = WhyChooseUsItem::orderBy('sort_order')->orderBy('id')->get(['id']);
        $position = 1;

        foreach ($items as $item) {
            WhyChooseUsItem::whereKey($item->id)->update(['sort_order' => $position]);
            $position++;
        }
    }
}
