<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->display_order_number }}</title>
    <style>
        @page {
            margin: 22px;
        }

        body {
            margin: 0;
            color: #1d1d1f;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
            background: #ffffff;
        }

        .sheet {
            border: 1px solid #8b8b8b;
            padding: 28px 34px;
            position: relative;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .top-table td {
            vertical-align: top;
        }

        .logo {
            width: 126px;
            height: auto;
        }

        .brand-fallback {
            color: #231f20;
            font-size: 26px;
            font-weight: 800;
        }

        .invoice-title {
            text-align: center;
            padding-top: 4px;
        }

        .invoice-meta {
            text-align: right;
            padding-top: 5px;
        }

        h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1;
            font-weight: 700;
            color: #333237;
        }

        .invoice-number {
            font-size: 12px;
            font-weight: 800;
            color: #333237;
        }

        .tax-label {
            margin-top: 5px;
            font-weight: 700;
            color: #333237;
            font-size: 11px;
        }

        .bill-address {
            margin-top: 7px;
        }

        .muted {
            color: #60646d;
        }

        .small {
            font-size: 11px;
        }

        .section-space {
            height: 30px;
        }

        .bill-table td {
            vertical-align: top;
            width: 50%;
        }

        .heading {
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .02em;
        }

        .details-table {
            width: 260px;
            margin-left: auto;
        }

        .details-table td {
            padding: 3px 0;
        }

        .details-table td:last-child {
            text-align: right;
            font-weight: 700;
        }

        .highlight-table {
            margin-top: 26px;
        }

        .highlight-table td {
            padding: 12px 13px;
            color: #fff;
            border-right: 1px solid rgba(255, 255, 255, .7);
        }

        .highlight-table td:last-child {
            border-right: 0;
        }

        .highlight-yellow {
            background: #f9bd42;
        }

        .highlight-dark {
            background: #363236;
        }

        .highlight-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            opacity: .88;
        }

        .highlight-value {
            display: block;
            margin-top: 3px;
            font-size: 18px;
            font-weight: 800;
        }

        .items {
            margin-top: 24px;
        }

        .items th {
            padding: 9px 6px;
            border-bottom: 2px solid #777;
            text-align: left;
            font-size: 12px;
            font-weight: 800;
        }

        .items td {
            padding: 10px 6px;
            border-bottom: 1px solid #dddddd;
            vertical-align: top;
        }

        .right {
            text-align: right;
        }

        .center {
            text-align: center;
        }

        .totals {
            margin-top: 8px;
        }

        .totals td {
            padding: 6px;
        }

        .totals .label {
            text-align: right;
            font-size: 14px;
        }

        .totals .amount {
            text-align: right;
            width: 150px;
            font-weight: 800;
        }

        .totals .grand .label,
        .totals .grand .amount {
            padding-top: 10px;
            font-size: 17px;
            font-weight: 900;
        }

    </style>
</head>
<body>
    @php
        $invoiceNo = ltrim($order->display_order_number, '#');
        $displayInvoiceNo = '#' . $invoiceNo;
        $issueDate = $order->created_at?->format('d/m/Y') ?? now()->format('d/m/Y');
        $dueDate = $order->created_at?->copy()->addDays(3)->format('d/m/Y') ?? now()->addDays(3)->format('d/m/Y');
        $address = collect([$order->address_line_1, $order->address_line_2, $order->city, $order->postal_code])->filter()->values();
    @endphp

    <main class="sheet">
        <table class="top-table">
            <tr>
                <td style="width: 30%;">
                    @if(!empty($logoSrc))
                        <img src="{{ $logoSrc }}" alt="B.back" class="logo">
                    @else
                        <div class="brand-fallback">B.back</div>
                    @endif
                </td>
                <td class="invoice-title" style="width: 40%;">
                    <h1>Invoice</h1>
                </td>
                <td class="invoice-meta" style="width: 30%;">
                    <div class="invoice-number">{{ $displayInvoiceNo }}</div>
                    <div class="tax-label">Tax invoice</div>
                </td>
            </tr>
        </table>

        <div class="section-space"></div>

        <table class="bill-table">
            <tr>
                <td>
                    <div class="heading">Bill To</div>
                    <div>{{ $order->name }}</div>
                    <div class="muted">{{ $order->email }}</div>
                    <div class="muted">{{ $order->phone }}</div>
                    <div class="bill-address">
                        @foreach($address as $line)
                            <div>{{ $line }}</div>
                        @endforeach
                    </div>
                </td>
                <td>
                    <table class="details-table">
                        <tr>
                            <td>Issue date:</td>
                            <td>{{ $issueDate }}</td>
                        </tr>
                        <tr>
                            <td>Due date:</td>
                            <td>{{ $dueDate }}</td>
                        </tr>
                        <tr>
                            <td style="height: 18px;"></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Reference:</td>
                            <td>{{ $displayInvoiceNo }}</td>
                        </tr>
                        <tr>
                            <td>Payment:</td>
                            <td>Cash on Delivery</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <table class="highlight-table">
            <tr>
                <td class="highlight-yellow">
                    <span class="highlight-label">Invoice No.</span>
                    <span class="highlight-value">{{ $displayInvoiceNo }}</span>
                </td>
                <td class="highlight-yellow">
                    <span class="highlight-label">Issue date</span>
                    <span class="highlight-value">{{ $issueDate }}</span>
                </td>
                <td class="highlight-yellow">
                    <span class="highlight-label">Due date</span>
                    <span class="highlight-value">{{ $dueDate }}</span>
                </td>
                <td class="highlight-dark">
                    <span class="highlight-label">Total due (GEL)</span>
                    <span class="highlight-value">{{ number_format((float) $order->total, 2) }}</span>
                </td>
            </tr>
        </table>

        <table class="items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="center" style="width: 90px;">Quantity</th>
                    <th class="right" style="width: 140px;">Unit price (GEL)</th>
                    <th class="right" style="width: 140px;">Amount (GEL)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items ?? [] as $item)
                    <tr>
                        <td>
                            <strong>{{ $item['name'] ?? 'Menu item' }}</strong>
                            <div class="muted small">{{ $item['category_name'] ?? '' }}</div>
                        </td>
                        <td class="center">{{ $item['quantity'] ?? 1 }}</td>
                        <td class="right">{{ number_format((float) ($item['unit_price'] ?? 0), 2) }}</td>
                        <td class="right">{{ number_format((float) ($item['line_total'] ?? 0), 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals">
            <tr>
                <td></td>
                <td class="label">Subtotal:</td>
                <td class="amount">{{ number_format((float) $order->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td></td>
                <td class="label">Discount:</td>
                <td class="amount">{{ number_format((float) $order->discount_amount, 2) }}</td>
            </tr>
            <tr>
                <td></td>
                <td class="label">Delivery Charge:</td>
                <td class="amount">{{ number_format((float) $order->delivery_charge_amount, 2) }}</td>
            </tr>
            <tr>
                <td></td>
                <td class="label">Tax:</td>
                <td class="amount">{{ number_format((float) $order->tax_amount, 2) }}</td>
            </tr>
            <tr class="grand">
                <td></td>
                <td class="label">Total (GEL):</td>
                <td class="amount">{{ number_format((float) $order->total, 2) }}</td>
            </tr>
        </table>

    </main>
</body>
</html>
