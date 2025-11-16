<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\BusinessService;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\EmployeeRequest;
use App\DataTransferObjects\EmployeeDTO;
use Illuminate\Support\Facades\Response;
use Inertia\Response as InertiaResponse;
use App\Datatables\EmployeeDatatableService;
use App\Http\Requests\Common\DatatableRequest;
use Illuminate\Validation\ValidationException;

class EmployeeController extends Controller
{
    private ?User $loggedUser = null;

    public function __construct(
        private EmployeeService $employeeService,
        private BusinessService $businessService,
        private EmployeeDatatableService $employeeDatatable,
    ) {
        $this->middleware(function ($request, $next) {
            $this->loggedUser = $request->user();

             if (! $this->loggedUser?->hasAnyRole([
                 'Businessman',
                 'BusinessOwner',
                 'SmallBusinessOwner',
             ])) {
                 abort(403);
             }

            return $next($request);
        });
    }

    public function index(): InertiaResponse
    {
        return Inertia::render('employee/Index');
    }

    public function create(): InertiaResponse
    {
        $userId = $this->loggedUser->id;

        $businesses = collect();
        if ($this->loggedUser->hasRole('Businessman')) {
            $businesses = $this->businessService
                ->getByOwnerId($userId)
                ->map(static fn ($business) => [
                    'id' => $business->id,
                    'name' => $business->name,
                ])
                ->values();
        }

        $branches = $this->employeeService
            ->getBranchesForUser($userId)
            ->map(static fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'business_id' => $branch->business_id,
            ])
            ->values();

        $defaultBranchIds = $this->loggedUser->hasRole('SmallBusinessOwner')
            ? $branches->pluck('id')->take(1)->values()
            : collect();

        return Inertia::render('employee/Create', [
            'businesses' => $businesses->toArray(),
            'branches' => $branches->toArray(),
            'currentRole' => $this->loggedUser->getRoleNames()->first(),
            'defaultBranchIds' => $defaultBranchIds->toArray(),
        ]);
    }

    public function store(EmployeeRequest $request): RedirectResponse
    {
        try {
            $this->employeeService->store(
                EmployeeDTO::fromAppRequest($request),
                $this->loggedUser->id
            );

            return to_route('employees.index')->with('success', 'Karyawan berhasil dibuat');
        } catch (ValidationException $exception) {
            throw $exception;
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

        $userId = $this->loggedUser->id;

        $businesses = collect();
        if ($this->loggedUser->hasRole('Businessman')) {
            $businesses = $this->businessService
                ->getByOwnerId($userId)
                ->map(static fn ($business) => [
                    'id' => $business->id,
                    'name' => $business->name,
                ])
                ->values();
        }

        $branches = $this->employeeService
            ->getBranchesForUser($userId)
            ->map(static fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'business_id' => $branch->business_id,
            ])
            ->values();

        $selectedBusinessId = $employeeModel->branches->first()?->business_id;

        return Inertia::render('employee/Edit', [
            'employee' => [
                'id' => $employeeModel->id,
                'name' => $employeeModel->name,
                'email' => $employeeModel->email,
                'phone' => $employeeModel->phone,
                'address' => $employeeModel->address,
                'position' => $employeeModel->position,
                'branch_id' => $employeeModel->branches->pluck('id')->first(),
                'business_id' => $selectedBusinessId,
            ],
            'businesses' => $businesses->toArray(),
            'branches' => $branches->toArray(),
            'currentRole' => $this->loggedUser->getRoleNames()->first(),
        ]);
    }

    public function update(EmployeeRequest $request, User $employee): RedirectResponse
    {
        try {
            $updatedEmployee = $this->employeeService->update(
                $employee->id,
                EmployeeDTO::fromAppRequest($request),
                $this->loggedUser->id
            );

            if (! $updatedEmployee) {
                return back()->withInput()->with('error', 'Karyawan tidak ditemukan');
            }

            return to_route('employees.index')->with('success', 'Karyawan berhasil diperbarui');
        } catch (ValidationException $exception) {
            throw $exception;
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

    public function datatable(DatatableRequest $request)
    {
        return $this->employeeDatatable->getDatatable($request, $this->loggedUser);
    }

    public function printPdf(DatatableRequest $request)
    {
        $pdfContent = $this->employeeDatatable->printPdf($request, $this->loggedUser);
        $fileName = 'laporan-karyawan-' . now()->format('Ymd_His') . '.pdf';

        return response()->make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->employeeDatatable->printExcel($request, $this->loggedUser);
    }
}
