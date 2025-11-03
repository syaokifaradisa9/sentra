<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\BusinessDTO;
use App\Http\Requests\BusinessRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\Business;
use App\Services\BusinessService;
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

class BusinessController extends Controller
{
    public function __construct(
        private BusinessService $businessService,
    ) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('business/Index');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('business/Create');
    }

    public function store(BusinessRequest $request): RedirectResponse
    {
        try {
            $this->businessService->store(BusinessDTO::fromAppRequest($request));

            return to_route('business.index')->with('success', 'Bisnis berhasil dibuat');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal membuat bisnis');
        }
    }

    public function show(Business $business): InertiaResponse
    {
        $this->ensureBusinessOwner($business);

        return Inertia::render('business/Detail', [
            'business' => [
                'id' => $business->id,
                'name' => $business->name,
                'description' => $business->description,
            ],
        ]);
    }

    public function edit(Business $business): InertiaResponse
    {
        $this->ensureBusinessOwner($business);

        return Inertia::render('business/Edit', [
            'business' => [
                'id' => $business->id,
                'name' => $business->name,
                'description' => $business->description,
            ],
        ]);
    }

    public function update(BusinessRequest $request, Business $business): RedirectResponse
    {
        try {
            $this->ensureBusinessOwner($business);

            $updated = $this->businessService->update(
                $business->id,
                BusinessDTO::fromAppRequest($request)
            );

            if (! $updated) {
                return back()->withInput()->with('error', 'Bisnis tidak ditemukan');
            }

            return to_route('business.index')->with('success', 'Bisnis berhasil diperbarui');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal memperbarui bisnis');
        }
    }

    public function destroy(Business $business): RedirectResponse
    {
        try {
            $this->ensureBusinessOwner($business);

            $deleted = $this->businessService->delete($business->id, auth()->id());

            if ($deleted) {
                return to_route('business.index')->with('success', 'Bisnis berhasil dihapus');
            }

            return back()->with('error', 'Gagal menghapus bisnis');
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus bisnis');
        }
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->businessService->paginateForUser($request->all(), auth()->id());

        return response()->json($paginator);
    }

    public function printPdf(DatatableRequest $request)
    {
        $records = $this->businessService->getForExport($request->validated(), auth()->id());

        $pdf = Pdf::loadView('reports.business', [
            'records' => $records,
        ])->setPaper('A4', 'landscape');

        $fileName = 'laporan-bisnis-' . now()->format('Ymd_His') . '.pdf';

        return $pdf->stream($fileName);
    }

    public function printExcel(DatatableRequest $request)
    {
        $records = $this->businessService->getForExport($request->validated(), auth()->id());

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'Nama Bisnis', 'Deskripsi'];
        foreach ($headers as $index => $header) {
            $columnLetter = chr(65 + $index);
            $worksheet->setCellValue("{$columnLetter}1", $header);
            $worksheet->getStyle("{$columnLetter}1")->getAlignment()->setHorizontal('center')->setVertical('center');
            $worksheet->getColumnDimension($columnLetter)->setAutoSize(true);
        }

        foreach ($records as $rowIndex => $record) {
            $rowNumber = $rowIndex + 2;
            $worksheet->setCellValue("A{$rowNumber}", $rowIndex + 1);
            $worksheet->setCellValue("B{$rowNumber}", $record->name);
            $worksheet->setCellValue("C{$rowNumber}", $record->description ?: '-');
            $worksheet->getStyle("A{$rowNumber}")
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical('center');
        }

        $fileName = 'Laporan Data Bisnis Per ' . now()->format('d F Y') . '.xlsx';
        $filePath = storage_path('app/public/' . $fileName);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return Response::download($filePath)->deleteFileAfterSend(true);
    }

    private function ensureBusinessOwner(Business $business): void
    {
        abort_if($business->user_id !== auth()->id(), 403);
    }
}


