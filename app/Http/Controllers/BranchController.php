<?php

namespace App\Http\Controllers;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Branch;
use App\Services\BranchService;
use App\Http\Requests\BranchRequest;
use Illuminate\Http\RedirectResponse;
use App\DataTransferObjects\BranchDTO;

class BranchController extends Controller
{
    private BranchService $branchService;

    public function __construct(BranchService $branchService)
    {
        $this->branchService = $branchService;
    }

    public function index(): Response
    {
        return Inertia::render('Branch/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Branch/Form');
    }

    public function store(BranchRequest $request): RedirectResponse
    {
        try {
            $this->branchService->store(BranchDTO::fromAppRequest($request));

            return to_route('branches.index')->with('message', 'Cabang berhasil dibuat');
        } catch (Exception $e) {
            return back()->with('error', 'Gagal membuat cabang');
        }
    }

    public function show(Branch $branch)
    {
        return Inertia::render('Branch/Detail', [
            'branch' => $branch
        ]);
    }

    public function edit(Branch $branch): Response
    {
        return Inertia::render('Branch/Form', [
            'branch' => $branch
        ]);
    }

    public function update(BranchRequest $request, Branch $branch): RedirectResponse
    {
        try {
            $this->branchService->update($branch->id, BranchDTO::fromAppRequest($request));

            return to_route('branches.index')->with('message', 'Cabang berhasil diperbarui');
        } catch (Exception $e) {
            return back()->with('error', 'Gagal memperbarui cabang');
        }
    }

    public function destroy(Branch $branch): RedirectResponse
    {
        try {
            $deleted = $this->branchService->delete($branch->id);

            if ($deleted) {
                return to_route('branches.index')->with('message', 'Cabang berhasil dihapus');
        } else {
                return back()->with('error', 'Gagal menghapus cabang');
            }
        } catch (Exception $e) {
            return back()->with('error', 'Gagal menghapus cabang');
        }
    }
}
