<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\BranchDTO;
use App\Http\Requests\BranchRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\Branch;
use App\Services\BranchService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Throwable;

class BranchController extends Controller
{
    public function __construct(
        private BranchService $branchService,
    ) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('branch/Index');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('branch/Create', [
            'businesses' => $this->businessOptions(),
        ]);
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->branchService->paginateForUser($request->all(), auth()->id());

        return response()->json($paginator);
    }

    public function store(BranchRequest $request): RedirectResponse
    {
        try {
            $this->branchService->store(BranchDTO::fromAppRequest($request));

            return to_route('branches.index')->with('success', 'Cabang berhasil dibuat');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal membuat cabang');
        }
    }

    public function edit(Branch $branch): InertiaResponse
    {
        $this->ensureBranchOwner($branch);

        $branchData = $this->branchService->getForUser($branch->id, auth()->id());

        abort_unless($branchData, 404);

        return Inertia::render('branch/Edit', [
            'branch' => [
                'id' => $branchData->id,
                'name' => $branchData->name,
                'address' => $branchData->address,
                'business_id' => $branchData->business_id,
                'opening_time' => optional($branchData->opening_time)->format('H:i'),
                'closing_time' => optional($branchData->closing_time)->format('H:i'),
            ],
            'businesses' => $this->businessOptions(),
        ]);
    }

    public function update(BranchRequest $request, Branch $branch): RedirectResponse
    {
        try {
            $this->ensureBranchOwner($branch);

            $updated = $this->branchService->update($branch->id, BranchDTO::fromAppRequest($request));

            if (! $updated) {
                return back()->withInput()->with('error', 'Cabang tidak ditemukan');
            }

            return to_route('branches.index')->with('success', 'Cabang berhasil diperbarui');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal memperbarui cabang');
        }
    }

    public function destroy(Branch $branch): RedirectResponse
    {
        try {
            $this->ensureBranchOwner($branch);

            $deleted = $this->branchService->delete($branch->id, auth()->id());

            if ($deleted) {
                return to_route('branches.index')->with('success', 'Cabang berhasil dihapus');
            }

            return back()->with('error', 'Gagal menghapus cabang');
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus cabang');
        }
    }

    public function printPdf(DatatableRequest $request)
    {
        $records = $this->branchService->getForExport($request->validated(), auth()->id());

        $pdf = Pdf::loadView('reports.branches', [
            'records' => $records,
        ])->setPaper('A4', 'landscape');

        $fileName = 'laporan-cabang-' . now()->format('Ymd_His') . '.pdf';

        return $pdf->stream($fileName);
    }

    public function printExcel(DatatableRequest $request)
    {
        $records = $this->branchService->getForExport($request->validated(), auth()->id());

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'Nama Cabang', 'Bisnis', 'Alamat', 'Jam Buka', 'Jam Tutup'];
        foreach ($headers as $index => $header) {
            $columnLetter = chr(65 + $index);
            $worksheet->setCellValue("{$columnLetter}1", $header);
            $worksheet->getStyle("{$columnLetter}1")->getAlignment()->setHorizontal('center')->setVertical('center');
            $worksheet->getColumnDimension($columnLetter)->setAutoSize(true);
        }

        foreach ($records as $rowIndex => $record) {
            $rowNumber = $rowIndex + 2;
            $opening = $record->opening_time instanceof \DateTimeInterface
                ? $record->opening_time->format('H:i')
                : ($record->opening_time ?? null);
            $closing = $record->closing_time instanceof \DateTimeInterface
                ? $record->closing_time->format('H:i')
                : ($record->closing_time ?? null);

            $worksheet->setCellValue("A{$rowNumber}", $rowIndex + 1);
            $worksheet->setCellValue("B{$rowNumber}", $record->name);
            $worksheet->setCellValue("C{$rowNumber}", $record->business->name ?? '-');
            $worksheet->setCellValue("D{$rowNumber}", $record->address);
            $worksheet->setCellValue("E{$rowNumber}", $opening ?: '-');
            $worksheet->setCellValue("F{$rowNumber}", $closing ?: '-');
            $worksheet->getStyle("A{$rowNumber}")
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical('center');
            $worksheet->getStyle("E{$rowNumber}:F{$rowNumber}")
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical('center');
        }

        $fileName = 'Laporan Data Cabang Per ' . now()->format('d F Y') . '.xlsx';
        $filePath = storage_path('app/public/' . $fileName);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return Response::download($filePath)->deleteFileAfterSend(true);
    }

    private function businessOptions()
    {
        return $this->branchService
            ->getBusinessesForUser(auth()->id())
            ->map(static fn ($business) => [
                'id' => $business->id,
                'name' => $business->name,
            ])
            ->values();
    }

    private function ensureBranchOwner(Branch $branch): void
    {
        abort_if($branch->user_id !== auth()->id(), 403);
    }
}
