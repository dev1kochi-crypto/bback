<?php

namespace Database\Seeders;

use App\Models\CmsKit\MenuCategory;
use App\Models\CmsKit\MenuItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class MenuItemDemoSeeder extends Seeder
{
    private const ITEMS = [
        ['Sajuk', 'Sandwich', 'Beef, ICE berg, pickles, tomato sauce', 14, '134314063_c94482cf-37bb-4673-a62b-ed34cfde336c 2-1.png'],
        ['Filled Chicken', 'Burger', 'Chicken fillet, moramb, cheddar cheese, smoked turkey, pigayty, burger sauce', 20, 'hero-burger.png'],
        ['Loaded Fries', 'Plates', 'Mees, cheesest, crilff, crilpe and tomato, sauce', 14, 'fries.png'],
        ['Cheesy Salmon', 'Pizza', 'Salmon, ancefepala, caara, rasmona, basal, pizza sauce', 33, 'close-up-half-pizza-with-slice 1.png'],
        ['Chicken Shawarma', 'Sandwich', 'Fresh chicken, garlic sauce, pickles and toasted bread', 14, 'chicken-sandwich-with-tomato-lettuce-it 1.png'],
        ['Chines', 'Sandwich', 'Chicken, beef, mozzarella, crispy roll and house sauce', 22, 'sandwich 1.png'],
        ['Kafta', 'Sandwich', 'Beef kafta, tomato, onion, pickles and tahini sauce', 14, '134314063_c94482cf-37bb-4673-a62b-ed34cfde336c 2-2.png'],
        ['Tawook Beef Blast', 'Sandwich', 'Tender tawook, fresh vegetables and special sauce', 26, 'sandwich 1.png'],
        ['Cheesy Bee', 'Burger', 'Grilled beef, mozzarella cheese, lettuce and sauce', 20, 'cheeseburger-caf-restaurant-menus-burger-hamburger-cheeseburger-with-fries 1.png'],
        ['Mozzarella Beef', 'Burger', 'Juicy beef, tomato, pickles and mozzarella cheese', 21, 'hero-burger.png'],
        ['Smash Cheese', 'Burger', 'Smashed beef, cheddar cheese and burger sauce', 23, 'hero-three 4.png'],
        ['Beefy Bey', 'Burger', 'Premium beef, tomato, pickles and smoky sauce', 20, 'hero-three 2.png'],
        ['Classic', 'Pizza', 'Tomato sauce, cheese, oregano and fresh basil', 33, 'crispy-mixed-pizza-with-olives-sausage 1.png'],
        ['Choco-Banana', 'Pizza', 'Chocolate, banana and sweet cream topping', 33, 'close-up-half-pizza-with-slice 1.png'],
        ['Chicken Crispy Bites', 'Snacks', 'Crispy chicken bites with signature dip', 13, 'dfg 1.png'],
        ['Wings', 'Snacks', 'Chicken wings, buffalo sauce and fresh herbs', 20, 'asf 1.png'],
    ];

    public function run(): void
    {
        $categories = MenuCategory::query()
            ->active()
            ->get()
            ->mapWithKeys(fn (MenuCategory $category) => [
                mb_strtolower($category->getTranslation('name') ?? $category->name ?? '') => $category,
            ]);

        if ($categories->isEmpty()) {
            $this->command?->warn('No active menu categories found. Add categories before running MenuItemDemoSeeder.');
            return;
        }

        for ($index = 0; $index < 40; $index++) {
            $item = self::ITEMS[$index % count(self::ITEMS)];
            [$name, $categoryName, $description, $price, $imageName] = $item;
            $category = $categories->get(mb_strtolower($categoryName));

            if (! $category) {
                $this->command?->warn("Skipping {$name}: category '{$categoryName}' was not found.");
                continue;
            }

            $imagePath = $this->copyMenuImage($imageName, $index + 1);

            MenuItem::factory()->create([
                'menu_category_id' => $category->id,
                'image' => $imagePath,
                'image_alt' => $name,
                'name' => $name,
                'description' => $description,
                'translations' => [
                    'en' => [
                        'name' => $name,
                        'description' => $description,
                        'image_alt' => $name,
                    ],
                ],
                'food_type' => in_array($categoryName, ['Pizza', 'Sauces'], true) ? 'veg' : 'non_veg',
                'price' => $price,
                'sort_order' => $index + 1,
                'status' => true,
            ]);
        }
    }

    private function copyMenuImage(string $imageName, int $index): ?string
    {
        $source = base_path("frontend/public/app/images/{$imageName}");

        if (! File::exists($source)) {
            return null;
        }

        $extension = File::extension($source) ?: 'png';
        $target = "menus/items/demo-{$index}.{$extension}";

        Storage::disk('public')->put($target, File::get($source));

        return $target;
    }
}
