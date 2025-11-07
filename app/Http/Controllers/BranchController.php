<?php

namespace App\Http\Controllers;

use App\Datatables\BranchDatatableService;
use App\DataTransferObjects\BranchDTO;
use App\Http\Requests\BranchRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\Branch;
use App\Services\BranchService;
use App\Services\BusinessService;
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
        private BranchDatatableService $branchDatatable,
        private BusinessService $businessService
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
            'businesses' => $this->businessService->getOptionsDataByOwnerId($this->loggedUser->id)
        ]);
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
        return Inertia::render('branch/Detail', [
            'branch' => $branch,
        ]);
    }

    public function edit(Branch $branch): InertiaResponse
    {
        return Inertia::render('branch/Edit', [
            'branch' => $branch,
            'businesses' => $this->businessService->getOptionsDataByOwnerId($this->loggedUser->id)
        ]);
    }

    public function update(BranchRequest $request, Branch $branch): RedirectResponse
    {
        try {
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
            $deleted = $this->branchService->delete($branch->id);

            if ($deleted) {
                return to_route('branches.index')->with('success', 'Cabang berhasil dihapus');
            }

            return back()->with('error', 'Gagal menghapus cabang');
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus cabang');
        }
    }

    public function datatable(DatatableRequest $request)
    {
        return $this->branchDatatable->getDatatable($request, $this->loggedUser);
    }

    public function printPdf(DatatableRequest $request)
    {
        $pdfContent =  $this->branchDatatable->printPdf($request, $this->loggedUser);
        $fileName = 'laporan-bisnis-' . now()->format('Ymd_His') . '.pdf';

        return response()->make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->branchDatatable->printExcel($request, $this->loggedUser);
    }
}
