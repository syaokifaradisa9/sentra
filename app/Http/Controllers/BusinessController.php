<?php

namespace App\Http\Controllers;

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