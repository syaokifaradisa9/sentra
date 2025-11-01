<?php

namespace App\Http\Controllers;

<<<<<<< HEAD
use App\Datatables\BusinessDatatable;
use App\DataTransferObjects\BusinessDTO;
use App\Http\Requests\Common\DatatableRequest;
use App\Http\Requests\Business\StoreBusinessRequest;
use App\Http\Requests\Business\UpdateBusinessRequest;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class BusinessController extends Controller
{
    protected BusinessDatatable $businessDatatable;
    protected BusinessService $businessService;
    protected $loggedUser = null;

    public function __construct(BusinessDatatable $businessDatatable, BusinessService $businessService)
    {
        $this->businessDatatable = $businessDatatable;
        $this->businessService = $businessService;
    }

    protected function getLoggedUser()
    {
        if ($this->loggedUser === null) {
            $this->loggedUser = Auth::user();
        }
        
        return $this->loggedUser;
    }

    public function index()
    {
        return Inertia::render('business/Index');
    }

    public function create()
    {
        return Inertia::render('business/Create');
    }

    public function edit(Business $business)
    {
        return Inertia::render('business/Edit', compact("business"));
    }

    public function store(StoreBusinessRequest $request)
    {
        $this->businessService->create(
            BusinessDTO::fromAppRequest($request)
        );

        return to_route('business.index')
            ->with('success', 'Data bisnis berhasil ditambahkan');
    }

    public function update(UpdateBusinessRequest $request, Business $business)
    {
        $this->businessService->update(
            $business->id,
            BusinessDTO::fromAppRequest($request)
        );

        return to_route('business.index')
            ->with('success', 'Mengedit data bisnis sukses');
    }

    public function destroy(Business $business)
    {
        $this->businessService->delete($business->id);
        return to_route('business.index')->with("success", "Berhasil menghapus data bisnis");
    }

    public function datatable(DatatableRequest $request)
    {
        return $this->businessDatatable->getDatatable(
            $request,
            $this->getLoggedUser()
        );
    }

    public function printPdf(Request $request)
    {
        $pdfContent = $this->businessDatatable->printPdf(
            new DatatableRequest($request->all()),
            $this->getLoggedUser()
        );

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="laporan-data-master-bisnis.pdf"',
        ]);
    }

    public function printExcel(Request $request)
    {
        return $this->businessDatatable->printExcel(
            new DatatableRequest($request->all()),
            $this->getLoggedUser()
        );
    }
}
=======
use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Business;
use App\DataTransferObjects\BusinessDTO;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\BusinessRequest;

class BusinessController extends Controller
{
    private BusinessService $businessService;
    public function __construct(BusinessService $businessService)
    {
        $this->businessService = $businessService;
    }

    public function index(): Response
    {
        return Inertia::render('Business/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Business/Form');
    }

    public function store(BusinessRequest $request): RedirectResponse
    {
        try {
            $this->businessService->store(
                BusinessDTO::fromAppRequest($request)
            );

            return to_route('businesses.index')->with('message', 'Bisnis berhasil dibuat');
        } catch (Exception $e) {
            return back()->with('error', 'Gagal membuat bisnis');
        }
    }

    public function show(Business $business)
    {
        return Inertia::render('Business/Detail', [
            'business' => $business
        ]);
    }

    public function edit(Business $business): Response
    {
        return Inertia::render('Business/Form', [
            'business' => $business
        ]);
    }

    public function update(BusinessRequest $request, Business $business): RedirectResponse
    {
        try {
            $this->businessService->update(
                $business->id,
                BusinessDTO::fromAppRequest($request)
            );

            return to_route('businesses.index')->with('message', 'Bisnis berhasil diperbarui');
        } catch (Exception $e) {
            return back()->with('error', 'Gagal memperbarui bisnis');
        }
    }

    public function destroy(Business $business): RedirectResponse
    {
        try {
            $deleted = $this->businessService->delete($business->id);

            if ($deleted) {
                return to_route('businesses.index')->with('message', 'Bisnis berhasil dihapus');
            } else {
                return back()->with('error', 'Gagal menghapus bisnis');
            }
        } catch (Exception $e) {
            return back()->with('error', 'Gagal menghapus bisnis');
        }
    }
}
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607
