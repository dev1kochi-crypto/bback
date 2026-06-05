<?php

namespace App\Http\Controllers\CmsKit;

use App\Models\CmsKit\SiteInformation;
use App\Models\CustomerOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerOrderController extends Controller
{
    private const STATUSES = [
        'pending' => 'Pending',
        'confirmed' => 'Confirmed',
        'preparing' => 'Preparing',
        'out_for_delivery' => 'Out For Delivery',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
    ];

    private const PAYMENT_STATUSES = [
        'pending' => 'Pending',
        'paid' => 'Paid',
        'failed' => 'Failed',
        'refunded' => 'Refunded',
    ];

    public function index(Request $request)
    {
        $orders = $this->filteredQuery($request)
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('cms-kit::customer-orders.index', [
            'orders' => $orders,
            'statuses' => self::STATUSES,
            'paymentStatuses' => self::PAYMENT_STATUSES,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function show(CustomerOrder $order)
    {
        return view('cms-kit::customer-orders.show', [
            'order' => $order,
            'statuses' => self::STATUSES,
            'paymentStatuses' => self::PAYMENT_STATUSES,
        ]);
    }

    public function invoice(CustomerOrder $order)
    {
        return Pdf::loadView('invoices.customer-order', [
            'order' => $order,
            'logoSrc' => $this->invoiceLogoSrc(),
        ])->setPaper('a4')->download($this->invoiceFilename($order));
    }

    public function updateStatus(Request $request, CustomerOrder $order)
    {
        $data = $request->validate([
            'status' => ['required', 'in:' . implode(',', array_keys(self::STATUSES))],
        ]);

        $order->update(['status' => $data['status']]);

        return back()->with('success', 'Order status updated successfully.');
    }

    public function updatePaymentStatus(Request $request, CustomerOrder $order)
    {
        $data = $request->validate([
            'payment_status' => ['required', 'in:' . implode(',', array_keys(self::PAYMENT_STATUSES))],
        ]);

        $order->update(['payment_status' => $data['payment_status']]);

        return back()->with('success', 'Payment status updated successfully.');
    }

    public function export(Request $request): StreamedResponse
    {
        $orders = $this->filteredQuery($request)->latest()->get();

        return response()->streamDownload(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Order Number',
                'Customer',
                'Phone',
                'Email',
                'Status',
                'Payment Status',
                'Subtotal',
                'Discount',
                'Delivery Charge',
                'Tax',
                'Total',
                'Address',
                'Notes',
                'Created At',
            ]);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->display_order_number,
                    $order->name,
                    $order->phone,
                    $order->email,
                    $order->status,
                    $order->payment_status ?? 'pending',
                    $order->subtotal,
                    $order->discount_amount,
                    $order->delivery_charge_amount,
                    $order->tax_amount,
                    $order->total,
                    collect([$order->address_line_1, $order->address_line_2, $order->city, $order->postal_code])->filter()->implode(', '),
                    $order->notes,
                    $order->created_at,
                ]);
            }

            fclose($handle);
        }, 'customer-orders-' . now()->format('Ymd-His') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        return CustomerOrder::query()
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $search = '%' . trim((string) $request->input('search')) . '%';

                $query->where(function (Builder $query) use ($search) {
                    $query->where('order_number', 'like', $search)
                        ->orWhere('name', 'like', $search)
                        ->orWhere('email', 'like', $search)
                        ->orWhere('phone', 'like', $search);
                });
            })
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->input('status')))
            ->when($request->filled('date_from'), fn (Builder $query) => $query->whereDate('created_at', '>=', $request->input('date_from')))
            ->when($request->filled('date_to'), fn (Builder $query) => $query->whereDate('created_at', '<=', $request->input('date_to')));
    }

    private function invoiceLogoSrc(): ?string
    {
        $siteLogo = SiteInformation::query()->value('logo');
        $paths = array_filter([
            public_path('app/images/b-back-invoice-logo.svg'),
            public_path('app/images/b-back-black-logo.svg'),
            $siteLogo ? public_path('storage/' . ltrim($siteLogo, '/')) : null,
            base_path('frontend/public/app/images/logo.svg'),
        ]);

        foreach ($paths as $path) {
            if (is_file($path)) {
                $contents = file_get_contents($path);

                if ($contents === false) {
                    continue;
                }

                $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                $mime = match ($extension) {
                    'png' => 'image/png',
                    'jpg', 'jpeg' => 'image/jpeg',
                    'webp' => 'image/webp',
                    default => 'image/svg+xml',
                };

                return 'data:' . $mime . ';base64,' . base64_encode($contents);
            }
        }

        return null;
    }

    private function invoiceFilename(CustomerOrder $order): string
    {
        return 'invoice-' . str_replace('#', '', $order->display_order_number) . '.pdf';
    }
}
