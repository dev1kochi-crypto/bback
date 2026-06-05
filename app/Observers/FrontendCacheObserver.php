<?php

namespace App\Observers;

use App\Services\FrontendRevalidationService;

class FrontendCacheObserver
{
    public function __construct(
        private readonly FrontendRevalidationService $revalidation
    ) {}

    public function saved(object $model): void
    {
        $this->revalidation->revalidateFor($model);
    }

    public function deleted(object $model): void
    {
        $this->revalidation->revalidateFor($model);
    }
}
