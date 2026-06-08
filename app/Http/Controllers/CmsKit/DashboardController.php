<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\Banner;
use App\Models\CmsKit\Enquiry;
use App\Models\CmsKit\MenuItem;
use App\Models\CmsKit\NewsletterSignup;
use App\Models\CmsKit\Testimonial;
use App\Models\Coupon;
use App\Models\CustomerOrder;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    private const COMPLETED_STATUSES = ['delivered'];

    private const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];

    private const CANCELLED_STATUSES = ['cancelled'];

    public function index()
    {
        $orders = CustomerOrder::query();
        $todayOrders = CustomerOrder::query()->whereDate('created_at', today());
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();
        $weekOrders = CustomerOrder::query()->whereBetween('created_at', [$weekStart, $weekEnd]);
        $validOrders = CustomerOrder::query()->whereNotIn('status', self::CANCELLED_STATUSES);
        $totalOrderCount = (int) (clone $validOrders)->count();
        $grossSales = (float) (clone $validOrders)->sum('total');

        $stats = [
            'total_orders' => (clone $orders)->count(),
            'today_orders' => (clone $todayOrders)->count(),
            'week_orders' => (clone $weekOrders)->count(),
            'active_orders' => CustomerOrder::query()->whereIn('status', self::ACTIVE_STATUSES)->count(),
            'completed_orders' => CustomerOrder::query()->whereIn('status', self::COMPLETED_STATUSES)->count(),
            'cancelled_orders' => CustomerOrder::query()->whereIn('status', self::CANCELLED_STATUSES)->count(),
            'payment_pending' => CustomerOrder::query()->where('payment_status', 'pending')->count(),
            'paid_orders' => CustomerOrder::query()->where('payment_status', 'paid')->whereNotIn('status', self::CANCELLED_STATUSES)->count(),
            'gross_sales' => $grossSales,
            'today_sales' => (float) (clone $todayOrders)->whereNotIn('status', self::CANCELLED_STATUSES)->sum('total'),
            'week_sales' => (float) (clone $weekOrders)->whereNotIn('status', self::CANCELLED_STATUSES)->sum('total'),
            'paid_sales' => (float) CustomerOrder::query()->where('payment_status', 'paid')->whereNotIn('status', self::CANCELLED_STATUSES)->sum('total'),
            'unpaid_sales' => (float) CustomerOrder::query()->where('payment_status', 'pending')->whereNotIn('status', self::CANCELLED_STATUSES)->sum('total'),
            'completed_sales' => (float) CustomerOrder::query()->whereIn('status', self::COMPLETED_STATUSES)->sum('total'),
            'pending_sales' => (float) CustomerOrder::query()->whereIn('status', self::ACTIVE_STATUSES)->sum('total'),
            'cancelled_value' => (float) CustomerOrder::query()->whereIn('status', self::CANCELLED_STATUSES)->sum('total'),
            'discounts' => (float) (clone $validOrders)->sum('discount_amount'),
            'delivery_collected' => (float) (clone $validOrders)->sum('delivery_charge_amount'),
            'tax_collected' => (float) (clone $validOrders)->sum('tax_amount'),
            'subtotal' => (float) (clone $validOrders)->sum('subtotal'),
            'avg_order_value' => $totalOrderCount > 0 ? round($grossSales / $totalOrderCount, 2) : 0.0,
            'items_sold' => $this->itemsSold((clone $validOrders)->get(['items'])),
            'unique_customers' => (int) (clone $validOrders)->whereNotNull('phone')->pluck('phone')->unique()->count(),
            'menu_items' => MenuItem::count(),
            'active_menu_items' => MenuItem::active()->count(),
            'coupons' => Coupon::count(),
            'active_coupons' => Coupon::active()->count(),
            'banners' => Banner::count(),
            'enquiries' => Enquiry::count(),
            'newsletter_signups' => NewsletterSignup::count(),
            'testimonials' => Testimonial::count(),
        ];

        $statusBreakdown = CustomerOrder::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderByDesc('total')
            ->pluck('total', 'status');

        $recentOrders = CustomerOrder::query()->latest()->take(10)->get();
        $recentEnquiries = Enquiry::latest()->take(6)->get();
        $topItems = $this->topSellingItems();
        $chartPeriod = 'day';
        $orderChartPayload = $this->orderChartPayload($chartPeriod);

        return view('cms-kit::dashboard', compact(
            'stats',
            'recentOrders',
            'recentEnquiries',
            'statusBreakdown',
            'topItems',
            'chartPeriod',
            'orderChartPayload',
        ));
    }

    public function orderChart(Request $request)
    {
        $period = $this->normalizeChartPeriod($request->string('period')->toString());

        return response()->json($this->orderChartPayload($period));
    }

    private function normalizeChartPeriod(?string $period): string
    {
        return in_array($period, ['hour', 'day', 'week', 'month'], true) ? $period : 'day';
    }

    private function orderChartPayload(string $period): array
    {
        $chart = $this->orderChartForPeriod($period);
        $totalOrders = (int) $chart->sum('orders');
        $totalSales = (float) $chart->sum('sales');
        $peak = $chart->sortByDesc('orders')->first();
        $peakSalesPoint = $chart->sortByDesc('sales')->first();
        $bucketCount = max($chart->count(), 1);
        $periodStats = $this->periodStats($period);

        return [
            'period' => $period,
            'subtitle' => $this->chartSubtitle($period),
            'chart' => $chart->values()->all(),
            'summary' => [
                'total_orders' => $totalOrders,
                'total_sales' => $totalSales,
                'peak_orders' => (int) ($peak['orders'] ?? 0),
                'peak_label' => (string) ($peak['label'] ?? '-'),
                'peak_sales' => (float) ($peakSalesPoint['sales'] ?? 0),
                'peak_sales_label' => (string) ($peakSalesPoint['label'] ?? '-'),
                'avg_orders' => round($totalOrders / $bucketCount, 2),
                'avg_order_value' => $totalOrders > 0 ? round($totalSales / $totalOrders, 2) : 0.0,
                'items_sold' => $periodStats['items_sold'],
            ],
            'stats' => $periodStats,
        ];
    }

    private function chartSubtitle(string $period): string
    {
        return match ($period) {
            'hour' => 'Hourly order movement for today.',
            'day' => 'Daily order movement for the last 7 days.',
            'week' => 'Weekly order movement for the last 8 weeks.',
            'month' => 'Monthly order movement for the last 12 months.',
            default => 'Order movement overview.',
        };
    }

    private function periodStats(string $period): array
    {
        [$start, $end] = $this->chartRange($period);
        $base = CustomerOrder::query()->whereBetween('created_at', [$start, $end]);
        $valid = (clone $base)->whereNotIn('status', self::CANCELLED_STATUSES);
        $validOrders = (clone $valid)->count();
        $grossSales = (float) (clone $valid)->sum('total');

        return [
            'gross_sales' => $grossSales,
            'subtotal' => (float) (clone $valid)->sum('subtotal'),
            'total_orders' => $validOrders,
            'items_sold' => $this->itemsSold((clone $valid)->get(['items'])),
            'completed_sales' => (float) (clone $base)->whereIn('status', self::COMPLETED_STATUSES)->sum('total'),
            'pending_sales' => (float) (clone $base)->whereIn('status', self::ACTIVE_STATUSES)->sum('total'),
            'paid_sales' => (float) (clone $valid)->where('payment_status', 'paid')->sum('total'),
            'unpaid_sales' => (float) (clone $valid)->where('payment_status', 'pending')->sum('total'),
            'discounts' => (float) (clone $valid)->sum('discount_amount'),
            'delivery_collected' => (float) (clone $valid)->sum('delivery_charge_amount'),
            'tax_collected' => (float) (clone $valid)->sum('tax_amount'),
            'cancelled_orders' => (int) (clone $base)->whereIn('status', self::CANCELLED_STATUSES)->count(),
            'cancelled_sales' => (float) (clone $base)->whereIn('status', self::CANCELLED_STATUSES)->sum('total'),
            'avg_order_value' => $validOrders > 0 ? round($grossSales / $validOrders, 2) : 0.0,
        ];
    }

    private function chartRange(string $period): array
    {
        return match ($period) {
            'hour' => [today()->startOfDay(), today()->endOfDay()],
            'day' => [today()->subDays(6)->startOfDay(), today()->endOfDay()],
            'week' => [today()->startOfWeek()->subWeeks(7)->startOfDay(), today()->endOfWeek()->endOfDay()],
            'month' => [today()->startOfMonth()->subMonths(11)->startOfDay(), today()->endOfMonth()->endOfDay()],
            default => [today()->subDays(6)->startOfDay(), today()->endOfDay()],
        };
    }

    private function orderChartForPeriod(string $period): Collection
    {
        [$start, $end] = $this->chartRange($period);

        $orders = CustomerOrder::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereNotIn('status', self::CANCELLED_STATUSES)
            ->get(['created_at', 'total']);

        $grouped = $orders->groupBy(fn (CustomerOrder $order) => $this->chartBucketKey($order->created_at, $period))
            ->map(fn (Collection $bucket) => [
                'orders' => $bucket->count(),
                'sales' => (float) $bucket->sum('total'),
            ]);

        return $this->chartBuckets($period)->map(function (Carbon $date) use ($grouped, $period): array {
            $key = $this->chartBucketKey($date, $period);

            return [
                'key' => $key,
                'label' => $this->chartBucketLabel($date, $period),
                'orders' => (int) ($grouped[$key]['orders'] ?? 0),
                'sales' => (float) ($grouped[$key]['sales'] ?? 0),
            ];
        })->values();
    }

    private function chartBuckets(string $period): Collection
    {
        return match ($period) {
            'hour' => collect(CarbonPeriod::create(today()->startOfDay(), '1 hour', today()->endOfDay()))
                ->map(fn (Carbon $date) => $date->copy()->startOfHour()),
            'day' => collect(CarbonPeriod::create(today()->subDays(6)->startOfDay(), '1 day', today()->startOfDay()))
                ->map(fn (Carbon $date) => $date->copy()->startOfDay()),
            'week' => collect(range(0, 7))->map(fn (int $offset) => today()->startOfWeek()->subWeeks(7 - $offset)->startOfDay()),
            'month' => collect(range(0, 11))->map(fn (int $offset) => today()->startOfMonth()->subMonths(11 - $offset)->startOfDay()),
            default => collect(CarbonPeriod::create(today()->subDays(6)->startOfDay(), '1 day', today()->startOfDay()))
                ->map(fn (Carbon $date) => $date->copy()->startOfDay()),
        };
    }

    private function chartBucketKey(Carbon $date, string $period): string
    {
        return match ($period) {
            'hour' => $date->copy()->startOfHour()->format('Y-m-d-H'),
            'day' => $date->copy()->startOfDay()->format('Y-m-d'),
            'week' => $date->copy()->startOfWeek()->format('Y-m-d'),
            'month' => $date->copy()->startOfMonth()->format('Y-m'),
            default => $date->copy()->startOfDay()->format('Y-m-d'),
        };
    }

    private function chartBucketLabel(Carbon $date, string $period): string
    {
        return match ($period) {
            'hour' => $date->format('H:00'),
            'day' => $date->format('d M'),
            'week' => $date->startOfWeek()->format('d M'),
            'month' => $date->format('M Y'),
            default => $date->format('d M'),
        };
    }

    private function itemsSold(Collection $orders): int
    {
        return (int) $orders
            ->flatMap(fn (CustomerOrder $order) => $order->items ?? [])
            ->sum(fn (array $item) => (int) ($item['quantity'] ?? 1));
    }

    private function topSellingItems(): Collection
    {
        return CustomerOrder::query()
            ->whereNotIn('status', ['cancelled'])
            ->get(['items'])
            ->flatMap(fn (CustomerOrder $order) => $order->items ?? [])
            ->groupBy(fn (array $item) => $item['name'] ?? 'Menu item')
            ->map(function (Collection $items, string $name): array {
                return [
                    'name' => $name,
                    'quantity' => $items->sum(fn (array $item) => (int) ($item['quantity'] ?? 1)),
                    'sales' => $items->sum(fn (array $item) => (float) ($item['line_total'] ?? 0)),
                ];
            })
            ->sortByDesc('quantity')
            ->take(5)
            ->values();
    }
}
