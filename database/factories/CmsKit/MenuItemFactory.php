<?php

namespace Database\Factories\CmsKit;

use App\Models\CmsKit\MenuCategory;
use App\Models\CmsKit\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    protected $model = MenuItem::class;

    public function definition(): array
    {
        $name = fake()->randomElement([
            'Filled Chicken',
            'Loaded Fries',
            'Cheesy Salmon',
            'Chicken Shawarma',
            'Kafta',
            'Tawook Beef Blast',
            'Cheesy Bee',
            'Mozzarella Beef',
            'Smash Cheese',
            'Beefy Bey',
            'Classic',
            'Choco-Banana',
            'Chicken Crispy Bites',
            'Wings',
        ]);
        $description = fake()->randomElement([
            'Chicken fillet, moramb, cheddar cheese, smoked turkey, pigayty, burger sauce',
            'Beef, pickles, tomato sauce, lettuce and melted cheese',
            'Salmon, ancefepala, caara, rasmona, basal, pizza sauce',
            'Mees, cheesest, crilff, crilpe and tomato, sauce',
            'Tender chicken, fresh lettuce, tomato and signature sauce',
        ]);

        return [
            'menu_category_id' => MenuCategory::query()->active()->inRandomOrder()->value('id'),
            'image' => null,
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
            'spicy' => fake()->boolean(20),
            'food_type' => fake()->randomElement(['veg', 'non_veg']),
            'price' => fake()->randomFloat(2, 10, 35),
            'sort_order' => MenuItem::max('sort_order') + 1,
            'status' => true,
        ];
    }
}
