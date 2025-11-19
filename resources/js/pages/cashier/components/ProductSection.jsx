import { LayoutGrid, List, Moon, Search, Sun, PackageOpen, ChevronLeft, Briefcase, Store, ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
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
        <section className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden lg:px-2 lg:pt-4">
            {/* Mobile Header */}
            <div className="flex flex-col gap-4 lg:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {handleBack && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}

                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                {userName || 'Pengguna'}
                            </h3>
                            <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Briefcase className="h-3 w-3" />
                                <span>{userPosition || 'Kasir'}</span>
                            </div>
                        </div>
                    </div>

                    <ThemeToggleButton className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" />
                </div>

                {canSelectBranch && (
                    <div className="relative">
                        <Store className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                            value={selectedBranchId || ''}
                            onChange={(e) => onBranchChange(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm font-bold text-slate-700 shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
                        >
                            <option value="" disabled>
                                Pilih Cabang
                            </option>
                            {branchOptions.map((branch) => (
                                <option key={branch.value} value={branch.value}>
                                    {branch.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                )}

                <div className="relative w-full">
                    <label htmlFor="product-search-mobile" className="sr-only">
                        Pencarian menu
                    </label>
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        id="product-search-mobile"
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari menu..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold text-slate-700 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
                    />
                </div>
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
                className="scrollbar-hide flex-1 overflow-y-auto pb-20 lg:pb-0"
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
                        <div className="space-y-3 lg:hidden">
                            {filteredProducts.map((product) => {
                                const quantityInOrder = orderQuantities[product.id] ?? 0;

                                return (
                                    <article
                                        key={product.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleAddProduct(product)}
                                        className="group relative flex select-none items-center gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
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
            </div >
        </section >
    );
}
