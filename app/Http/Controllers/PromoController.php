<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\PromoDTO;
use App\Datatables\PromoDatatableService;
use App\Http\Requests\Common\DatatableRequest;
use App\Http\Requests\PromoRequest;
use App\Services\ProductService;
use App\Services\PromoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Throwable;

class PromoController extends Controller
{
    private $loggedUser;

    public function __construct(
        private PromoService $promoService,
        private ProductService $productService,
        private PromoDatatableService $promoDatatable,
    ) {
        $this->loggedUser = Auth::user();
    }

    public function index(): InertiaResponse
    {
        return Inertia::render('promo/Index');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('promo/Create', [
            'products' => $this->productOptions(),
        ]);
    }

    public function store(PromoRequest $request): RedirectResponse
    {
        try {
            $this->promoService->store(
                PromoDTO::fromAppRequest($request),
                $this->loggedUser->id
            );

            return to_route('promos.index')->with('success', 'Promo berhasil dibuat');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
            return back()->withInput()->with('error', 'Gagal membuat promo');
        }
    }

    public function edit(int $promo): InertiaResponse
    {
        $promoModel = $this->promoService->findForUser($promo, $this->loggedUser->id);

        abort_if(! $promoModel, 404);

        return Inertia::render('promo/Edit', [
            'promo' => $this->formatPromo($promoModel),
            'products' => $this->productOptions(),
        ]);
    }

    public function update(PromoRequest $request, int $promo): RedirectResponse
    {
        try {
            $updated = $this->promoService->update(
                $promo,
                PromoDTO::fromAppRequest($request),
                $this->loggedUser->id
            );

            if (! $updated) {
                return back()->withInput()->with('error', 'Promo tidak ditemukan');
            }

            return to_route('promos.index')->with('success', 'Promo berhasil diperbarui');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal memperbarui promo');
        }
    }

    public function destroy(int $promo): RedirectResponse
    {
        try {
            $deleted = $this->promoService->delete($promo, $this->loggedUser->id);

            if (! $deleted) {
                return back()->with('error', 'Promo tidak ditemukan');
            }

            return to_route('promos.index')->with('success', 'Promo berhasil dihapus');
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus promo');
        }
    }

    public function datatable(DatatableRequest $request)
    {
        return $this->promoDatatable->getDatatable($request, $this->loggedUser);
    }

    public function printPdf(DatatableRequest $request)
    {
        $pdfContent = $this->promoDatatable->printPdf($request, $this->loggedUser);
        $fileName = 'laporan-promo-' . now()->format('Ymd_His') . '.pdf';

        return response()->make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->promoDatatable->printExcel($request, $this->loggedUser);
    }

    private function productOptions(): array
    {
        return $this->productService
            ->getByOwnerId($this->loggedUser->id)
            ->map(fn ($product) => [
                'value' => (string) $product->id,
                'label' => $product->name,
            ])
            ->toArray();
    }

    private function formatPromo($promo): array
    {
        return [
            'id' => $promo->id,
            'product' => [
                'id' => $promo->product->id,
                'name' => $promo->product->name,
                'price' => $promo->product->price,
                'category' => [
                    'id' => $promo->product->category?->id,
                    'name' => $promo->product->category?->name,
                ],
            ],
            'product_id' => $promo->product_id,
            'start_date' => optional($promo->start_date)?->format('Y-m-d'),
            'end_date' => optional($promo->end_date)?->format('Y-m-d'),
            'percent_discount' => $promo->percent_discount,
            'price_discount' => $promo->price_discount,
        ];
    }
}
