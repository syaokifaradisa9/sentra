<?php

namespace App\Http\Controllers;

use App\Http\Requests\BranchRequest;
use App\Services\BranchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Branch;
use App\DataTransferObjects\BranchDTO;

class BranchController extends Controller
{
    private BranchService $branchService;
    private User $loggedUser;

    public function __construct(BranchService $branchService)
    {
        $this->branchService = $branchService;
        $this->loggedUser = Auth::user();
    }

    /**
     * Display a listing of the branches.
     */
    public function index(): Response
    {
        return Inertia::render('Branch/Index');
    }

    /**
     * Show the form for creating a new branch.
     */
    public function create(): Response
    {
        return Inertia::render('Branch/Form');
    }

    /**
     * Store a newly created branch in storage.
     */
    public function store(BranchRequest $request): RedirectResponse
    {
        try {
            $this->branchService->store(BranchDTO::fromAppRequest($request));
            
            return redirect()->route('branches.index')
                ->with('message', 'Cabang berhasil dibuat');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal membuat cabang');
        }
    }

    /**
     * Display the specified branch.
     */
    public function show(Branch $branch)
    {
        return Inertia::render('Branch/Detail', [
            'branch' => $branch
        ]);
    }

    /**
     * Show the form for editing the specified branch.
     */
    public function edit(Branch $branch): Response
    {
        return Inertia::render('Branch/Form', [
            'branch' => $branch
        ]);
    }

    /**
     * Update the specified branch in storage.
     */
    public function update(BranchRequest $request, Branch $branch): RedirectResponse
    {
        try {
            $this->branchService->update($branch->id, BranchDTO::fromAppRequest($request));
            
            return redirect()->route('branches.index')
                ->with('message', 'Cabang berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal memperbarui cabang');
        }
    }

    /**
     * Remove the specified branch from storage.
     */
    public function destroy(Branch $branch): RedirectResponse
    {
        try {
            $deleted = $this->branchService->delete($branch->id);
            
            if ($deleted) {
                return redirect()->route('branches.index')
                    ->with('message', 'Cabang berhasil dihapus');
        } else {
                return redirect()->back()
                    ->with('error', 'Gagal menghapus cabang');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menghapus cabang');
        }
    }
}