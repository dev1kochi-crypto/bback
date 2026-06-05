<?php

namespace App\Support;

final class FrontendNavigation
{
    /**
     * @return array<int, array{label: string, url: string}>
     */
    public static function items(): array
    {
        return [
            ['label' => 'Home', 'url' => '/'],
            ['label' => 'About', 'url' => '/about'],
            ['label' => 'Our Menu', 'url' => '/menu'],
            ['label' => 'Offers', 'url' => '/offers'],
            ['label' => 'Contact', 'url' => '/contact'],
        ];
    }
}
