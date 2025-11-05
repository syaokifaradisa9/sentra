<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\EmployeeDTO;
use App\Http\Requests\EmployeeRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\User;
use App\Services\EmployeeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class EmployeeController extends Controller
{
    public function __construct(
        private EmployeeService $employeeService,
    ) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('employee/Index');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('employee/Create', [
            'branches' => $this->mappedBranchesForUser(),
        ]);
    }

    public function store(EmployeeRequest $request): RedirectResponse
    {
        try {
            $this->employeeService->store(
                EmployeeDTO::fromAppRequest($request)
            );

            return to_route('employees.index')->with('success', 'Karyawan berhasil dibuat');
        } catch (Exception $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal membuat karyawan');
        }
    }

    public function edit(User $employee): InertiaResponse
    {
        $employeeModel = $this->employeeService->getById($employee->id);

        if (! $employeeModel) {
            abort(404);
        }

        return Inertia::render('employee/Edit', [
            'employee' => [
                'id' => $employeeModel->id,
                'name' => $employeeModel->name,
                'email' => $employeeModel->email,
                'phone' => $employeeModel->phone,
                'address' => $employeeModel->address,
                'position' => $employeeModel->position,
                'branch_ids' => $employeeModel->branches->pluck('id')->values(),
            ],
            'branches' => $this->mappedBranchesForUser(),
        ]);
    }

    public function update(EmployeeRequest $request, User $employee): RedirectResponse
    {
        try {
            $updatedEmployee = $this->employeeService->update(
                $employee->id,
                EmployeeDTO::fromAppRequest($request)
            );

            if (! $updatedEmployee) {
                return back()->withInput()->with('error', 'Karyawan tidak ditemukan');
            }

            return to_route('employees.index')->with('success', 'Karyawan berhasil diperbarui');
        } catch (Exception $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal memperbarui karyawan');
        }
    }

    public function destroy(User $employee): RedirectResponse
    {
        try {
            $deleted = $this->employeeService->delete($employee->id);

            if (! $deleted) {
                return back()->with('error', 'Gagal menghapus karyawan');
            }

            return to_route('employees.index')->with('success', 'Karyawan berhasil dihapus');
        } catch (Exception $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus karyawan');
        }
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->employeeService->paginateForUser($request->all(), auth()->id());

        return response()->json($paginator);
    }

    public function printPdf(DatatableRequest $request)
    {
        $records = $this->employeeService->getForExport($request->validated(), auth()->id());

        $pdf = Pdf::loadView('reports.employees', [
            'records' => $records,
        ])->setPaper('A4', 'landscape');

        $fileName = 'laporan-karyawan-' . now()->format('Ymd_His') . '.pdf';

        return $pdf->stream($fileName);
    }

    public function printExcel(DatatableRequest $request)
    {
        $records = $this->employeeService->getForExport($request->validated(), auth()->id());

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'Nama', 'Email', 'Telepon', 'Alamat', 'Jabatan', 'Cabang'];
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
            $worksheet->setCellValue("C{$rowNumber}", $record->email);
            $worksheet->setCellValue("D{$rowNumber}", $record->phone);
            $worksheet->setCellValue("E{$rowNumber}", $record->address);
            $worksheet->setCellValue("F{$rowNumber}", $record->position);
            $branchNames = $record->branches->pluck('name')->implode(', ');
            $worksheet->setCellValue("G{$rowNumber}", $branchNames ?: '-');
            $worksheet->getStyle("A{$rowNumber}")
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical('center');
        }

        $fileName = 'Laporan Data Karyawan Per ' . now()->format('d F Y') . '.xlsx';
        $filePath = storage_path('app/public/' . $fileName);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return Response::download($filePath)->deleteFileAfterSend(true);
    }

    private function mappedBranchesForUser(): Collection
    {
        return $this->employeeService
            ->getBranchesForUser(auth()->id())
            ->map(static fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
            ])
            ->values();
    }
}