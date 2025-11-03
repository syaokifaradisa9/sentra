<!DOCTYPE html>
<html>
<head>
    <title>Laporan Data Cabang</title>
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
        <h1>LAPORAN DATA CABANG</h1>
        <p>Dicetak pada: {{ date('d F Y H:i:s') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Cabang</th>
                <th>Bisnis</th>
                <th>Alamat</th>
                <th>Jam Buka</th>
                <th>Jam Tutup</th>
            </tr>
        </thead>
        <tbody>
            @forelse($records as $index => $record)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $record->name }}</td>
                    <td>{{ $record->business->name ?? '-' }}</td>
                    <td>{{ $record->address }}</td>
                    <td style="text-align: center;">
                        @php
                            $opening = $record->opening_time instanceof \DateTimeInterface
                                ? $record->opening_time->format('H:i')
                                : ($record->opening_time ?? null);
                        @endphp
                        {{ $opening ?: '-' }}
                    </td>
                    <td style="text-align: center;">
                        @php
                            $closing = $record->closing_time instanceof \DateTimeInterface
                                ? $record->closing_time->format('H:i')
                                : ($record->closing_time ?? null);
                        @endphp
                        {{ $closing ?: '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center;">Tidak ada data cabang</td>
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
