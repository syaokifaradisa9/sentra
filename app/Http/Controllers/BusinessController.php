<?php

namespace App\Http\Controllers;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Business;
use App\DTOs\BusinessDTO;
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
            return back()
                ->with('error', 'Gagal membuat bisnis');
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
            return back()
                ->with('error', 'Gagal menghapus bisnis');
        }
    }
}
