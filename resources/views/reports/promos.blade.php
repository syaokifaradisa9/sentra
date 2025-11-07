<!DOCTYPE html>
<html>
<head>
    <title>Laporan Data Promo</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
        }

        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
        }

        .signature {
            margin-top: 60px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN DATA PROMO</h1>
        <p>Dicetak pada: {{ date('d F Y H:i:s') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Periode</th>
                <th>Diskon</th>
                <th>Harga Awal</th>
                <th>Harga Promo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($records as $index => $promo)
                @php
                    $basePrice = (float) ($promo->product->price ?? 0);
                    $percent = $promo->percent_discount;
                    $nominal = $promo->price_discount;
                    $promoPrice = $basePrice;
                    if ($percent !== null) {
                        $promoPrice -= $promoPrice * ((float) $percent / 100);
                    }
                    if ($nominal !== null) {
                        $promoPrice -= (float) $nominal;
                    }
                    $promoPrice = max($promoPrice, 0);
                @endphp
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $promo->product->name ?? '-' }}</td>
                    <td>{{ $promo->product->category->name ?? '-' }}</td>
                    <td>{{ optional($promo->start_date)->format('d M Y') }} s/d {{ optional($promo->end_date)->format('d M Y') }}</td>
                    <td>
                        @php $parts = []; @endphp
                        @if(!is_null($promo->percent_discount))
                            @php $parts[] = rtrim(rtrim(number_format($promo->percent_discount, 2, '.', ''), '0'), '.') . '%'; @endphp
                        @endif
                        @if(!is_null($promo->price_discount))
                            @php $parts[] = 'Rp ' . number_format((float) $promo->price_discount, 0, ',', '.'); @endphp
                        @endif
                        {{ implode(' + ', $parts) ?: '-' }}
                    </td>
                    <td style="text-align: right;">Rp {{ number_format($basePrice, 0, ',', '.') }}</td>
                    <td style="text-align: right;">Rp {{ number_format($promoPrice, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center;">Tidak ada data promo</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <div class="signature">
            <p>Hormat kami,</p>
            <br><br><br>
            <p>_______________________</p>
        </div>
    </div>
</body>
</html>
