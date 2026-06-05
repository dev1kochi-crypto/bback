<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\Banner;
use App\Models\CmsKit\Enquiry;
use App\Models\CmsKit\MenuItem;
use App\Models\CmsKit\NewsletterSignup;
use App\Models\CmsKit\Testimonial;
use App\Models\Coupon;
use App\Models\CustomerOrder;
use Carbon\CarbonPeriod;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function index()
    {
        $orders = CustomerOrder::query();
        $todayOrders = CustomerOrder::query()->whereDate('created_at', today());
        $completedStatuses = ['delivered'];
        $activeStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
        $cancelledStatuses = ['cancelled'];

        $stats = [
            'total_orders' => (clone $orders)->count(),
            'today_orders' => (clone $todayOrders)->count(),
            'active_orders' => CustomerOrder::query()->whereIn('status', $activeStatuses)->count(),
            'completed_orders' => CustomerOrder::query()->whereIn('status', $completedStatuses)->count(),
            'cancelled_orders' => CustomerOrder::query()->whereIn('status', $cancelledStatuses)->count(),
            'payment_pending' => CustomerOrder::query()->where('payment_status', 'pending')->count(),
            'gross_sales' => (float) CustomerOrder::query()->whereNotIn('status', $cancelledStatuses)->sum('total'),
            'today_sales' => (float) CustomerOrder::query()->whereDate('created_at', today())->whereNotIn('status', $cancelledStatuses)->sum('total'),
            'completed_sales' => (float) CustomerOrder::query()->whereIn('status', $completedStatuses)->sum('total'),
            'pending_sales' => (float) CustomerOrder::query()->whereIn('status', $activeStatuses)->sum('total'),
            'cancelled_value' => (float) CustomerOrder::query()->whereIn('status', $cancelledStatuses)->sum('total'),
            'discounts' => (float) CustomerOrder::query()->whereNotIn('status', $cancelledStatuses)->sum('discount_amount'),
            'delivery_collected' => (float) CustomerOrder::query()->whereNotIn('status', $cancelledStatuses)->sum('delivery_charge_amount'),
            'tax_collected' => (float) CustomerOrder::query()->whereNotIn('status', $cancelledStatuses)->sum('tax_amount'),
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

        $recentOrders = CustomerOrder::query()->latest()->take(8)->get();
        $recentEnquiries = Enquiry::latest()->take(5)->get();
        $topItems = $this->topSellingItems();
        $orderChart = $this->orderChart();

        return view('cms-kit::dashboard', compact('stats', 'recentOrders', 'recentEnquiries', 'statusBreakdown', 'topItems', 'orderChart'));
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

    private function orderChart(): Collection
    {
        $start = today()->subDays(6);
        $ordersByDate = CustomerOrder::query()
            ->selectRaw('DATE(created_at) as order_date, COUNT(*) as orders, COALESCE(SUM(total), 0) as sales')
            ->whereDate('created_at', '>=', $start)
            ->groupBy('order_date')
            ->get()
            ->keyBy('order_date');

        return collect(CarbonPeriod::create($start, today()))
            ->map(function ($date) use ($ordersByDate): array {
                $key = $date->format('Y-m-d');
                $row = $ordersByDate->get($key);

                return [
                    'date' => $key,
                    'label' => $date->format('d M'),
                    'orders' => (int) ($row->orders ?? 0),
                    'sales' => (float) ($row->sales ?? 0),
                ];
            })
            ->values();
    }
}
