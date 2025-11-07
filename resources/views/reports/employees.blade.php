<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Data Karyawan</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .no-border {
            border: none;
        }
        .report-date {
            font-size: 12px;
            color: #666;
            text-align: right;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Data Karyawan</h1>
        <p>Data Karyawan Sistem Manajemen</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Alamat</th>
                <th>Jabatan</th>
                <th>Cabang</th>
            </tr>
        </thead>
        <tbody>
            @forelse($records as $index => $record)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $record->name }}</td>
                    <td>{{ $record->email }}</td>
                    <td>{{ $record->phone }}</td>
                    <td>{{ $record->address }}</td>
                    <td>{{ $record->position }}</td>
                    <td>
                        @if($record->branches->isNotEmpty())
                            {{ $record->branches->pluck('name')->join(', ') }}
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center;">Tidak ada data karyawan</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    
    <div class="report-date">
        Dicetak pada: {{ now()->format('d M Y H:i') }}
    </div>
</body>
</html>