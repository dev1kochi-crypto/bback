<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\Language;
use App\Models\CmsKit\Offer;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use CMS\SiteManager\Support\ValidatesImageDimensions;
use Yajra\DataTables\Facades\DataTables;

class OfferController extends Controller
{
    use ValidatesImageDimensions;

    public function index(Request $request)
    {
        if ($request->ajax()) {
            return DataTables::of(Offer::query()->orderBy('sort_order')->orderBy('id'))
                ->addIndexColumn()
                ->addColumn('image_preview', fn (Offer $offer) => $offer->image
                    ? '<img src="' . asset('storage/' . $offer->image) . '" class="img-thumbnail" style="height:52px;">'
                    : '-')
                ->addColumn('alt_text_value', fn (Offer $offer) => e($offer->getTranslation('alt_text')))
                ->addColumn('status', fn (Offer $offer) => '<div class="form-check form-switch"><input class="form-check-input toggle-status" type="checkbox" data-id="' . $offer->id . '" ' . ($offer->status ? 'checked' : '') . '></div>')
                ->addColumn('order', fn (Offer $offer) => '<input type="number" min="1" class="form-control form-control-sm reorder-input" data-id="' . $offer->id . '" value="' . $offer->sort_order . '" style="width:80px;">')
                ->addColumn('action', fn (Offer $offer) => '<div class="btn-group">'
                    . '<a href="' . route('cms.offers.edit', $offer->id) . '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a>'
                    . '<button type="button" class="btn btn-sm btn-outline-danger delete-item" data-id="' . $offer->id . '"><i class="fas fa-trash"></i></button>'
                    . '</div>')
                ->rawColumns(['image_preview', 'status', 'order', 'action'])
                ->make(true);
        }

        return view('cms-kit::offers.index');
    }

    public function create()
    {
        $languages = Language::active()->get();
        $nextOrder = (Offer::max('sort_order') ?? 0) + 1;

        return view('cms-kit::offers.create', compact('languages', 'nextOrder'));
    }

    public function store(Request $request)
    {
        $this->validateOffer($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();
        $order = $this->resolveOrderForCreate($request->integer('sort_order') ?: null);

        Offer::where('sort_order', '>=', $order)->increment('sort_order');

        $payload = [
            'alt_text' => data_get($translations, "{$defaultLanguage}.alt_text"),
            'translations' => $translations,
            'sort_order' => $order,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('image')) {
            $this->validateImageWithinLimits($request, 'image', config('cms-kit.images.offers.image', []), 'Offer image');
            $payload['image'] = $request->file('image')->store('offers', 'public');
        }

        Offer::create($payload);

        return redirect()->route('cms.offers.index')->with('success', 'Offer created successfully.');
    }

    public function edit(int $id)
    {
        $offer = Offer::findOrFail($id);
        $languages = Language::active()->get();

        return view('cms-kit::offers.edit', compact('offer', 'languages'));
    }

    public function update(Request $request, int $id)
    {
        $offer = Offer::findOrFail($id);
        $this->validateOffer($request);
        $translations = $request->input('translations', []);
        $defaultLanguage = $this->defaultLanguageCode();

        $payload = [
            'alt_text' => data_get($translations, "{$defaultLanguage}.alt_text"),
            'translations' => $translations,
            'status' => $request->boolean('status'),
        ];

        if ($request->hasFile('image')) {
            $this->validateImageWithinLimits($request, 'image', config('cms-kit.images.offers.image', []), 'Offer image');
            if ($offer->image) {
                Storage::disk('public')->delete($offer->image);
            }
            $payload['image'] = $request->file('image')->store('offers', 'public');
        } elseif ($request->boolean('remove_image') && $offer->image) {
            Storage::disk('public')->delete($offer->image);
            $payload['image'] = null;
        }

        $offer->update($payload);

        return redirect()->route('cms.offers.index')->with('success', 'Offer updated successfully.');
    }

    public function destroy(int $id)
    {
        $offer = Offer::findOrFail($id);
        $order = $offer->sort_order;
        $offer->delete();
        Offer::where('sort_order', '>', $order)->decrement('sort_order');
        $this->normalizeOrder();

        return response()->json(['success' => true]);
    }

    public function toggleStatus(int $id)
    {
        $offer = Offer::findOrFail($id);
        $offer->update(['status' => !$offer->status]);

        return response()->json(['success' => true]);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:offers,id'],
            'sort_order' => ['required', 'integer', 'min:1'],
        ]);

        $offer = Offer::findOrFail($request->integer('id'));
        $total = Offer::count();
        $newOrder = min($request->integer('sort_order'), max($total, 1));
        $oldOrder = $offer->sort_order;

        if ($newOrder !== $oldOrder) {
            if ($newOrder > $oldOrder) {
                Offer::where('sort_order', '>', $oldOrder)->where('sort_order', '<=', $newOrder)->decrement('sort_order');
            } else {
                Offer::where('sort_order', '>=', $newOrder)->where('sort_order', '<', $oldOrder)->increment('sort_order');
            }

            $offer->update(['sort_order' => $newOrder]);
        }

        $this->normalizeOrder();

        return response()->json(['success' => true]);
    }

    protected function validateOffer(Request $request): array
    {
        $rules = [
            'image' => $this->imageRules('offers.image', ['nullable', 'image']),
            'remove_image' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];

        foreach (Language::active()->get() as $language) {
            $rules["translations.{$language->code}.alt_text"] = ['nullable', 'string', 'max:255'];
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

    protected function defaultLanguageCode(): string
    {
        return Language::active()->where('is_default', true)->value('code')
            ?? Language::active()->orderByDesc('is_default')->value('code')
            ?? config('app.fallback_locale');
    }

    protected function resolveOrderForCreate(?int $requestedOrder): int
    {
        $maxAllowed = Offer::count() + 1;

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

        foreach (Offer::orderBy('sort_order')->orderBy('id')->get(['id']) as $offer) {
            Offer::whereKey($offer->id)->update(['sort_order' => $position++]);
        }
    }
}
