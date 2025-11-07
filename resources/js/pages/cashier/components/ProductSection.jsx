import { LayoutGrid, List } from 'lucide-react';
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
}) {
    // Filter products based on selected category and search term
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
            className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 ${className}`}
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
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                            isActive
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-500 hover:text-primary dark:text-slate-300 dark:hover:text-teal-300'
                        }`}
                        title={`Tampilan ${label}`}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                );
            })}
        </div>
    );

    return (
        <section className="flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden lg:px-2 lg:pt-4">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm lg:hidden dark:bg-slate-900/60 dark:ring-slate-700">
                <div className="mb-3">
                    <FormSelect
                        name="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        options={categoryOptions.map((category) => ({
                            value: category.id,
                            label: `${category.name} (${category.product_count})`,
                        }))}
                        className="w-full"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="product-search-mobile" className="sr-only">
                        Pencarian menu
                    </label>
                    <input
                        id="product-search-mobile"
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari menu atau kode..."
                        className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200 transition outline-none focus:bg-white focus:text-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700 dark:focus:bg-slate-900"
                    />
                </div>
            </div>

            <div className="hidden items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm lg:flex dark:bg-slate-900/60 dark:ring-slate-700">
                <div className="flex w-full items-center gap-3">
                    <div className="w-full">
                        <label htmlFor="product-search" className="sr-only">
                            Pencarian menu
                        </label>
                        <input
                            id="product-search"
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari menu atau kode..."
                            className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200 transition outline-none focus:bg-white focus:text-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700 dark:focus:bg-slate-900"
                        />
                    </div>
                    <ViewModeToggle />
                </div>
            </div>

            <div className="scrollbar-elegant flex-1 overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                    <div className="ring-dashed rounded-2xl bg-white/80 p-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-300 backdrop-blur-sm dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700">
                        Produk tidak ditemukan.
                    </div>
                ) : (
                    <div className="my-3">
                        {/* Mobile devices always show list view - hidden on desktop */}
                        <div className="space-y-3 lg:hidden">
                            {filteredProducts.map((product) => {
                                const quantityInOrder = orderQuantities[product.id] ?? 0;
                                const quantityBadge = quantityInOrder > 0 ? (
                                    <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm dark:bg-teal-500/90">
                                        {quantityInOrder}x
                                    </span>
                                ) : null;

                                return (
                                    <article
                                        key={product.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleAddProduct(product)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleAddProduct(product);
                                            }
                                        }}
                                        className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 p-3 shadow-sm transition select-none hover:-translate-y-1 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-teal-400/40 dark:focus-visible:border-teal-300 dark:focus-visible:ring-teal-400/40"
                                    >
                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900/40">
                                            {quantityBadge}
                                            {product.photo_url ? (
                                                <img
                                                    src={product.photo_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary shadow-sm dark:bg-teal-400/10 dark:text-teal-300">
                                                        {product.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <div>
                                                <span className="text-xs font-semibold tracking-wide text-primary uppercase dark:text-teal-300">
                                                    {product.category_name ?? 'Tanpa Kategori'}
                                                </span>
                                                <h3 className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-teal-600 dark:text-teal-300">
                                                    {formatCurrency(product.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Desktop - Grid view when viewMode is grid, hidden on mobile */}
                        <div
                            className={`hidden sm:grid-cols-2 lg:grid lg:gap-3 xl:grid-cols-3 2xl:grid-cols-4 ${viewMode === 'grid' ? 'lg:block' : 'lg:hidden'}`}
                        >
                            {filteredProducts.map((product) => {
                                const quantityInOrder = orderQuantities[product.id] ?? 0;
                                const quantityBadge = quantityInOrder > 0 ? (
                                    <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm dark:bg-teal-500/90">
                                        {quantityInOrder}x
                                    </span>
                                ) : null;

                                return (
                                    <article
                                        key={product.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleAddProduct(product)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleAddProduct(product);
                                            }
                                        }}
                                        className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 shadow-sm transition select-none hover:-translate-y-1 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-teal-400/40 dark:focus-visible:border-teal-300 dark:focus-visible:ring-teal-400/40"
                                    >
                                        <div className="relative h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-900/40">
                                            {quantityBadge}
                                            {product.photo_url ? (
                                                <img
                                                    src={product.photo_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary shadow-sm dark:bg-teal-400/10 dark:text-teal-300">
                                                        {product.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </span>
                                                    <p className="text-[10px] tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                                        Tidak ada foto
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1.5 p-4">
                                            <span className="text-[11px] font-semibold tracking-wide text-primary uppercase dark:text-teal-300">
                                                {product.category_name ?? 'Tanpa Kategori'}
                                            </span>
                                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {product.name}
                                            </h3>
                                            <div className="mt-auto text-base font-semibold text-teal-600 dark:text-teal-300">
                                                {formatCurrency(product.price)}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Desktop - List view when viewMode is list, hidden on mobile */}
                        <div
                            className={`hidden lg:flex lg:flex-col lg:space-y-3 ${viewMode === 'list' ? 'lg:block' : 'lg:hidden'}`}
                        >
                            {filteredProducts.map((product) => {
                                const quantityInOrder = orderQuantities[product.id] ?? 0;
                                const quantityBadge = quantityInOrder > 0 ? (
                                    <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm dark:bg-teal-500/90">
                                        {quantityInOrder}x
                                    </span>
                                ) : null;

                                return (
                                    <article
                                        key={product.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleAddProduct(product)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleAddProduct(product);
                                            }
                                        }}
                                        className="group relative flex items-stretch gap-4 overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 p-3 shadow-sm transition select-none hover:-translate-y-1 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-teal-400/40 dark:focus-visible:border-teal-300 dark:focus-visible:ring-teal-400/40"
                                    >
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900/40">
                                            {quantityBadge}
                                            {product.photo_url ? (
                                                <img
                                                    src={product.photo_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shadow-sm dark:bg-teal-400/10 dark:text-teal-300">
                                                        {product.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </span>
                                                    <p className="text-[10px] tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                                        Tidak ada foto
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div>
                                                <span className="text-[11px] font-semibold tracking-wide text-primary uppercase dark:text-teal-300">
                                                    {product.category_name ?? 'Tanpa Kategori'}
                                                </span>
                                                <h3 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-base font-semibold text-teal-600 dark:text-teal-300">
                                                    {formatCurrency(product.price)}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-400">
                                                    Ketuk untuk tambah
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}