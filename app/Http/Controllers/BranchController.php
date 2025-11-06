<?php

namespace App\Http\Controllers;

use App\Datatables\BranchDatatableService;
use App\DataTransferObjects\BranchDTO;
use App\Http\Requests\BranchRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\Branch;
use App\Services\BranchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Throwable;

class BranchController extends Controller
{
    private $loggedUser;
    public function __construct(
        private BranchService $branchService,
        private BranchDatatableService $branchDatatable
    ) {
        $this->loggedUser = Auth::user();
    }

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

    public function datatable(DatatableRequest $request): JsonResponse
    {
        return $this->branchDatatable->getDatatable($request, $this->loggedUser);
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

    public function show(Branch $branch): InertiaResponse
    {
        $this->ensureBranchOwner($branch);

        $branchData = $this->branchService->getForUser($branch->id, $this->loggedUser->id);

        abort_unless($branchData, 404);

        return Inertia::render('branch/Detail', [
            'branch' => [
                'id' => $branchData->id,
                'name' => $branchData->name,
                'address' => $branchData->address,
                'business_id' => $branchData->business_id,
                'opening_time' => optional($branchData->opening_time)->format('H:i'),
                'closing_time' => optional($branchData->closing_time)->format('H:i'),
            ],
        ]);
    }

    public function edit(Branch $branch): InertiaResponse
    {
        $this->ensureBranchOwner($branch);

        $branchData = $this->branchService->getForUser($branch->id, $this->loggedUser->id);

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

            $deleted = $this->branchService->delete($branch->id, $this->loggedUser->id);

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
        return $this->branchDatatable->printPdf($request, $this->loggedUser);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->branchDatatable->printExcel($request, $this->loggedUser);
    }

    private function businessOptions()
    {
        return $this->branchService
            ->getBusinessesForUser($this->loggedUser->id)
            ->map(static fn ($business) => [
                'id' => $business->id,
                'name' => $business->name,
            ])
            ->values();
    }

    private function ensureBranchOwner(Branch $branch): void
    {
        abort_if($branch->owner_id !== $this->loggedUser->id, 403);
    }
}