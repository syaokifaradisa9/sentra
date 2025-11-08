<?php

namespace App\Http\Controllers;

use App\Datatables\BusinessDatatableService;
use App\DataTransferObjects\BusinessDTO;
use App\Http\Requests\BusinessRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\Business;
use App\Models\User;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Throwable;

class BusinessController extends Controller
{
    public function __construct(
        private BusinessService $businessService,
        private BusinessDatatableService $businessDatatable
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
            $this->businessService->store(
                BusinessDTO::fromAppRequest($request, $this->currentUserId())
            );

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
            $updated = $this->businessService->update(
                $business->id,
                BusinessDTO::fromAppRequest($request, $this->currentUserId())
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
            $deleted = $this->businessService->delete($business->id, $this->currentUserId());

            if ($deleted) {
                return to_route('business.index')->with('success', 'Bisnis berhasil dihapus');
            }

            return back()->with('error', 'Gagal menghapus bisnis');
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus bisnis');
        }
    }

    public function datatable(DatatableRequest $request)
    {
        return $this->businessDatatable->getDatatable($request, $this->currentUser());
    }

    public function printPdf(DatatableRequest $request)
    {
        $pdfContent = $this->businessDatatable->printPdf($request, $this->currentUser());
        $fileName = 'laporan-bisnis-' . now()->format('Ymd_His') . '.pdf';

        return response()->make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->businessDatatable->printExcel($request, $this->currentUser());
    }

    private function currentUser(): User
    {
        /** @var User */
        return auth()->user();
    }

    private function currentUserId(): int
    {
        return (int) $this->currentUser()->id;
    }
}
