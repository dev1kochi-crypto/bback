<?php

namespace App\Http\Controllers\Api;

use App\Support\SitePayloadBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class SiteController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json(SitePayloadBuilder::build());
    }
}
