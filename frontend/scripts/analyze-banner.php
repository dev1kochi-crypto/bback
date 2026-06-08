<?php

$path = __DIR__ . '/../public/app/images/header-bg.png';
$image = imagecreatefromjpeg($path);
$width = imagesx($image);
$height = imagesy($image);

$columns = [];

for ($x = 0; $x < $width; $x++) {
    $values = [];
    for ($y = 0; $y < $height; $y++) {
        $sample = imagecolorat($image, $x, $y);
        $values[] = (($sample >> 16) & 0xFF) + (($sample >> 8) & 0xFF) + ($sample & 0xFF);
    }

    $avg = array_sum($values) / count($values);
    $variance = 0;
    foreach ($values as $value) {
        $variance += ($value - $avg) ** 2;
    }
    $std = sqrt($variance / count($values));
    $columns[$x] = ['avg' => $avg, 'std' => $std];
}

echo "Low-variance divider strips (std < 7, avg 35-55):\n";
foreach ($columns as $x => $data) {
    if ($data['std'] < 7 && $data['avg'] >= 35 && $data['avg'] <= 55) {
        echo "x={$x} avg=" . round($data['avg']) . " std=" . round($data['std'], 2) . PHP_EOL;
    }
}
