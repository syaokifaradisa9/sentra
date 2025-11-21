import { LayoutGrid, List, Moon, Search, Sun, PackageOpen, ChevronLeft, Briefcase, Store, ChevronDown, Check, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FormSelect from '../../../components/forms/FormSelect';
import { formatCurrency } from '../utils/cashierUtils';

export default function ProductSection({
    products = [],
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
    viewMode,
    setViewMode,
    handleAddProduct,
    orderQuantities = {},
    categoryOptions = [],
    theme,
    toggleTheme,
    onProductListOffsetChange,
    userName,
    userPosition,
    handleBack,
    branchOptions = [],
    selectedBranchId,
    canSelectBranch = false,
    onBranchChange,
}) {
    const filteredProducts = products
        .filter((product) => {
            if (selectedCategory === 'all') {
                return true;
            }
            return String(product.category_id) === String(selectedCategory);
        })
        .filter((product) =>
            product.name.toLowerCase().includes(search.toLowerCase()),
        );

    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

    const ViewModeToggle = ({ className = '' }) => (
        <div
            className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 ${className}`}
        >
            {[
                { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                { id: 'list', icon: List, label: 'List' },
            ].map(({ id, icon: Icon, label }) => {
                const isActive = viewMode === id;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setViewMode(id)}
                        aria-pressed={isActive}
                        aria-label={`Tampilkan produk sebagai ${label.toLowerCase()}`}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all ${isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal-300'
                            }`}
                        title={`Tampilan ${label}`}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                );
            })}
        </div>
    );

    const ThemeToggleButton = ({ className = '' }) => (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Ubah tema ke ${theme === 'dark' ? 'terang' : 'gelap'}`}
            title={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition-all hover:border-primary/50 hover:text-primary hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-teal-400/50 dark:hover:text-teal-300 ${className}`}
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );

    const productListRef = useRef(null);

    useEffect(() => {
        if (!onProductListOffsetChange) {
            return;
        }

        const updateOffset = () => {
            if (productListRef.current) {
                onProductListOffsetChange(
                    productListRef.current.offsetTop ?? 0,
                );
            }
        };

        updateOffset();

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateOffset);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateOffset);
            }
        };
    }, [onProductListOffsetChange]);

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden lg:space-y-4 lg:px-2 lg:pt-4">
            {/* Mobile Header */}
            <div className="sticky top-0 z-20 flex flex-col bg-white/90 backdrop-blur-md shadow-sm transition-colors dark:bg-slate-900/90 lg:hidden">
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {handleBack && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}

                        <div className="flex flex-col overflow-hidden">
                            {canSelectBranch ? (
                                <button
                                    type="button"
                                    onClick={() => setIsBranchModalOpen(true)}
                                    className="flex items-center gap-1 transition-colors active:opacity-70"
                                >
                                    <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                                        {(() => {
                                            const selectedBranch = branchOptions.find(
                                                b => String(b.value || b.id) === String(selectedBranchId)
                                            );
                                            return selectedBranch?.label || selectedBranch?.name || 'Pilih Cabang';
                                        })()}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                </button>
                            ) : (
                                <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {userName || 'Kasir'}
                                </h3>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isSearchVisible ? 'bg-slate-100 text-primary dark:bg-slate-800 dark:text-teal-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                        >
                            <Search className="h-4.5 w-4.5" />
                        </button>
                        <ThemeToggleButton className="h-8 w-8 border-0 shadow-none" />
                    </div>
                </div>

                {isSearchVisible && (
                    <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari menu..."
                            className="w-full rounded-lg border-0 bg-slate-100 py-2 px-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/50 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                )}
            </div>

            {/* Desktop Header */}
            <div className="hidden items-center justify-between gap-4 lg:flex">
                <div className="relative flex-1">
                    <label htmlFor="product-search" className="sr-only">
                        Pencarian menu
                    </label>
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        id="product-search"
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari menu favoritmu..."
                        className="w-full rounded-2xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all placeholder:text-slate-400 hover:ring-slate-300 focus:ring-2 focus:ring-primary/50 dark:bg-slate-900/50 dark:text-slate-200 dark:ring-slate-700 dark:placeholder:text-slate-600 dark:focus:ring-teal-500/50"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggleButton />
                    <ViewModeToggle />
                </div>
            </div>

            {/* Product List */}
            <div
                ref={productListRef}
                className="flex-1 overflow-y-auto px-3 pt-2 pb-20 lg:px-0 lg:pt-0 lg:pb-0"
            >
                {filteredProducts.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/20">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <PackageOpen className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Produk tidak ditemukan
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Coba kata kunci lain atau ganti kategori.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-1">
                        {/* Mobile List View */}
                        <div className="space-y-2 lg:hidden">
                            {filteredProducts.map((product) => {
                                const quantityInOrder = orderQuantities[product.id] ?? 0;

                                return (
                                    <article
                                        key={product.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleAddProduct(product)}
                                        className="group relative flex select-none items-center gap-3 overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-all active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                            {quantityInOrder > 0 && (
                                                <span className="absolute top-0.5 right-0.5 z-10 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm dark:bg-teal-500">
                                                    {quantityInOrder}
                                                </span>
                                            )}
                                            {product.photo_url ? (
                                                <img
                                                    src={product.photo_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-300 dark:text-slate-600">
                                                    IMG
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-0.5">
                                            <div>
                                                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    {product.category_name}
                                                </span>
                                                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <div className="mt-1 font-bold text-primary dark:text-teal-400">
                                                {formatCurrency(product.price)}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Desktop Grid View */}
                        <div
                            className={`hidden lg:gap-4 lg:grid-cols-4 xl:grid-cols-5 ${viewMode === 'grid' ? 'lg:grid' : 'lg:hidden'}`}
                        >
                            {
                                filteredProducts.map((product) => {
                                    const quantityInOrder = orderQuantities[product.id] ?? 0;

                                    return (
                                        <article
                                            key={product.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleAddProduct(product)}
                                            className="group relative flex flex-col select-none overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-900/50"
                                        >
                                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                {quantityInOrder > 0 && (
                                                    <span className="absolute top-3 right-3 z-10 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white shadow-lg shadow-primary/30 ring-2 ring-white dark:bg-teal-500 dark:ring-slate-900">
                                                        {quantityInOrder}
                                                    </span>
                                                )}
                                                {product.photo_url ? (
                                                    <img
                                                        src={product.photo_url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-600">
                                                        <div className="rounded-full bg-slate-200/50 p-3 dark:bg-slate-800/50">
                                                            <PackageOpen className="h-6 w-6" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/5" />
                                            </div>

                                            <div className="flex flex-1 flex-col p-4">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                        {product.category_name ?? 'Umum'}
                                                    </span>
                                                </div>
                                                <h3 className="mb-3 line-clamp-2 text-[15px] font-bold leading-snug text-slate-800 dark:text-slate-100">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-auto flex items-center justify-between">
                                                    <span className="text-lg font-bold text-primary dark:text-teal-400">
                                                        {formatCurrency(product.price)}
                                                    </span>

                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            }
                        </div >

                        {/* Desktop List View */}
                        <div
                            className={`hidden lg:gap-4 lg:grid-cols-1 ${viewMode === 'list' ? 'lg:grid' : 'lg:hidden'}`}
                        >
                            {filteredProducts.map((product) => {
                                const quantityInOrder = orderQuantities[product.id] ?? 0;

                                return (
                                    <article
                                        key={product.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleAddProduct(product)}
                                        className="group relative flex select-none items-center gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                            {quantityInOrder > 0 && (
                                                <span className="absolute top-1 right-1 z-10 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shadow-sm dark:bg-teal-500">
                                                    {quantityInOrder}
                                                </span>
                                            )}
                                            {product.photo_url ? (
                                                <img
                                                    src={product.photo_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300 dark:text-slate-600">
                                                    IMG
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div>
                                                <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    {product.category_name}
                                                </span>
                                                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <div className="mt-2 font-bold text-primary dark:text-teal-400">
                                                {formatCurrency(product.price)}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div >
                )}
            </div>

            {/* Branch Selection Bottom Sheet */}
            {isBranchModalOpen && canSelectBranch && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm lg:hidden">
                    <div className="w-full max-w-md transform overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-all sm:rounded-3xl dark:bg-slate-900">
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                        </div>

                        <div className="flex items-center justify-between px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                Pilih Cabang
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsBranchModalOpen(false)}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">
                            {branchOptions && branchOptions.length > 0 ? (
                                <div className="grid gap-2">
                                    {branchOptions.map((branch, index) => {
                                        const branchValue = branch.value || branch.id || index;
                                        const branchLabel = branch.label || branch.name || 'Cabang';
                                        const isActive = String(selectedBranchId) === String(branchValue);
                                        return (
                                            <button
                                                key={`branch-${branchValue}-${index}`}
                                                onClick={() => {
                                                    onBranchChange(branchValue);
                                                    setIsBranchModalOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${isActive
                                                    ? 'border-primary bg-primary/5 shadow-sm dark:border-teal-500 dark:bg-teal-500/10'
                                                    : 'border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <span className={`text-sm font-bold ${isActive ? 'text-primary dark:text-teal-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {branchLabel}
                                                </span>
                                                {isActive && (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white dark:bg-teal-500 dark:text-slate-900">
                                                        <Check className="h-3 w-3" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Store className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Tidak ada cabang tersedia
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
