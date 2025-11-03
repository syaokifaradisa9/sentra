<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\BusinessDTO;
use App\Http\Requests\BusinessRequest;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class BusinessController extends Controller
{
    public function __construct(
        private BusinessService $businessService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('business/Index');
    }

    public function create(): Response
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

    public function show(Business $business): Response
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

    public function edit(Business $business): Response
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

    public function printPdf(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Fitur cetak PDF belum tersedia.',
        ], 501);
    }

    public function printExcel(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Fitur cetak Excel belum tersedia.',
        ], 501);
    }

    private function ensureBusinessOwner(Business $business): void
    {
        abort_if($business->user_id !== auth()->id(), 403);
    }
}
