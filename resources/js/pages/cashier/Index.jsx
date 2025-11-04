import { router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardList,
    Coffee,
    Minus,
    Moon,
    MoreHorizontal,
    Package2,
    Plus,
    Sun,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import CashierLayout from '../../components/layouts/CashierLayout';
import { CATEGORY_ICON_MAP } from '../../constants/categoryIcons';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function Avatar({ name }) {
    const initial = name?.charAt(0)?.toUpperCase() ?? '?';
    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-teal-400 text-lg font-semibold text-white shadow">
            {initial}
        </div>
    );
}

export default function CashierIndex({
    categories = [],
    products = [],
    total_products: totalProducts = 0,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') {
            return 'dark';
        }

        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    });

    const categoryOptions = useMemo(() => {
        return [
            {
                id: 'all',
                name: 'Semua Menu',
                product_count: totalProducts,
                icon: null,
            },
            ...categories,
        ];
    }, [categories, totalProducts]);

    const filteredProducts = useMemo(() => {
        return products
            .filter((product) => {
                if (selectedCategory === 'all') {
                    return true;
                }
                return String(product.category_id) === String(selectedCategory);
            })
            .filter((product) =>
                product.name.toLowerCase().includes(search.toLowerCase()),
            );
    }, [products, selectedCategory, search]);

    const subtotal = useMemo(
        () =>
            orders.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            ),
        [orders],
    );
    const TAX_RATE = 0.1;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        router.visit('/dashboard');
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const handleAddProduct = (product) => {
        setOrders((previous) => {
            const existing = previous.find(
                (item) => item.id === product.id,
            );

            if (existing) {
                return previous.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [
                ...previous,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                },
            ];
        });
    };

    const handleIncreaseQuantity = (productId) => {
        setOrders((previous) =>
            previous.map((item) =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item,
            ),
        );
    };

    const handleDecreaseQuantity = (productId) => {
        setOrders((previous) =>
            previous
                .map((item) =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const handleRemoveOrderItem = (productId) => {
        setOrders((previous) =>
            previous.filter((item) => item.id !== productId),
        );
    };

    const OrderSummary = ({
        className = '',
        orders,
        subtotal,
        tax,
        total,
        onIncrease,
        onDecrease,
        onRemove,
    }) => (
        <div
            className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Daftar Pesanan
                </h3>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-300"
                >
                    Pilih Meja
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/20 dark:text-slate-300">
                    <ClipboardList className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                    <span>Belum ada pesanan. Pilih produk untuk menambah.</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/30"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                                        {order.name}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-400">
                                        {formatCurrency(order.price)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(order.id)}
                                    className="rounded-lg border border-transparent p-1 text-slate-400 transition hover:border-red-200 hover:text-red-500 dark:hover:border-red-400/40 dark:hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onDecrease(order.id)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:text-primary dark:border-slate-600 dark:text-slate-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-semibold text-slate-700 dark:text-slate-100">
                                        {order.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onIncrease(order.id)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:text-primary dark:border-slate-600 dark:text-slate-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                                    {formatCurrency(order.price * order.quantity)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Pajak (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Diskon</span>
                    <span>{formatCurrency(0)}</span>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 dark:bg-slate-900/40 dark:text-slate-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
            </div>

            <button
                type="button"
                disabled={orders.length === 0}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
                Buat Pesanan
            </button>
        </div>
    );

    return (
        <CashierLayout title="Kasir">
            <div className="mx-auto flex h-full w-full max-w-none flex-1 flex-col overflow-hidden px-2 pt-2 pb-5 sm:px-2 lg:px-3">
                <header className="flex flex-shrink-0 flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm dark:bg-slate-900/60 dark:ring-slate-700">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-600 ring-1 ring-slate-200 transition hover:text-primary hover:ring-primary/50 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700"
                            aria-label="Kembali"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={user?.name} />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {user?.name ?? 'Kasir'}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {user?.email ?? 'Pengguna'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        <nav className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-1 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                            <button
                                type="button"
                                className="rounded-lg bg-white px-3 py-1.5 text-primary shadow-sm dark:bg-slate-900/50 dark:text-teal-300"
                            >
                                Pesan
                            </button>
                            <button
                                type="button"
                                className="rounded-lg px-3 py-1.5 text-slate-400 dark:text-slate-500"
                                disabled
                            >
                                Aktivitas
                            </button>
                        </nav>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </header>

                <div className="mt-5 grid flex-1 gap-3 overflow-hidden lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)_24rem]">
                    <aside className="hidden h-full min-h-0 lg:flex lg:pt-4 lg:pr-2">
                        <div className="flex h-full min-h-0 w-full flex-col rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm dark:bg-slate-900/60 dark:ring-slate-700">
                            <div className="mb-4">
                                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                    Kategori
                                </p>
                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
                                    Pilih Menu
                                </h2>
                            </div>
                            <div className="scrollbar-elegant flex-1 space-y-1 overflow-y-auto pr-1">
                                {categoryOptions.map((category) => {
                                    const isActive =
                                        String(selectedCategory) ===
                                        String(category.id);
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory(category.id)
                                            }
                                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                                                isActive
                                                    ? 'border-primary/50 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40 dark:border-teal-400/40 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/40'
                                                    : 'border-transparent text-slate-500 hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:text-slate-300 dark:hover:border-teal-400/30 dark:hover:bg-slate-800/60'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {(() => {
                                                    if (category.id === 'all') {
                                                        return (
                                                            <Coffee className="h-4 w-4" />
                                                        );
                                                    }

                                                    const iconName =
                                                        category.icon ?? null;
                                                    const IconComponent =
                                                        iconName &&
                                                        CATEGORY_ICON_MAP[
                                                            iconName
                                                        ]
                                                            ? CATEGORY_ICON_MAP[
                                                                  iconName
                                                              ]
                                                            : Package2;

                                                    return (
                                                        <IconComponent className="h-4 w-4" />
                                                    );
                                                })()}
                                                <span>{category.name}</span>
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                                {category.product_count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <section className="flex h-full min-h-0 flex-col space-y-2 overflow-hidden lg:px-2 lg:pt-4">
                        <div className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm lg:hidden dark:bg-slate-900/60 dark:ring-slate-700">
                            <div className="flex flex-wrap gap-2">
                                {categoryOptions.map((category) => {
                                    const isActive =
                                        String(selectedCategory) ===
                                        String(category.id);
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory(category.id)
                                            }
                                            className={`flex items-center gap-3 rounded-xl border px-3 py-1.5 text-left text-xs transition ${
                                                isActive
                                                    ? 'border-primary/40 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40 dark:border-teal-400/40 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/40'
                                                    : 'border-slate-200 bg-white/80 text-slate-600 hover:border-primary/30 hover:text-primary dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {(() => {
                                                    if (category.id === 'all') {
                                                        return (
                                                            <Coffee className="h-4 w-4" />
                                                        );
                                                    }

                                                    const iconName =
                                                        category.icon ?? null;
                                                    const IconComponent =
                                                        iconName &&
                                                        CATEGORY_ICON_MAP[
                                                            iconName
                                                        ]
                                                            ? CATEGORY_ICON_MAP[
                                                                  iconName
                                                              ]
                                                            : Package2;

                                                    return (
                                                        <IconComponent className="h-4 w-4" />
                                                    );
                                                })()}
                                                <span>{category.name}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-3 w-full">
                                <label
                                    htmlFor="product-search-mobile"
                                    className="sr-only"
                                >
                                    Pencarian menu
                                </label>
                                <input
                                    id="product-search-mobile"
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari menu atau kode..."
                                    className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200 transition outline-none focus:bg-white focus:text-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700 dark:focus:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="hidden items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm lg:flex dark:bg-slate-900/60 dark:ring-slate-700">
                            <div className="w-full">
                                <label
                                    htmlFor="product-search"
                                    className="sr-only"
                                >
                                    Pencarian menu
                                </label>
                                <input
                                    id="product-search"
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari menu atau kode..."
                                    className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200 transition outline-none focus:bg-white focus:text-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700 dark:focus:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="scrollbar-elegant flex-1 overflow-y-auto pr-1">
                            {filteredProducts.length === 0 ? (
                                <div className="ring-dashed rounded-2xl bg-white/80 p-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-300 backdrop-blur-sm dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700">
                                    Produk tidak ditemukan.
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                    {filteredProducts.map((product) => (
                                        <article
                                            key={product.id}
                                            className="group relative flex flex-col overflow-hidden rounded-xl bg-white/90 shadow-sm ring-1 ring-transparent transition hover:-translate-y-1 hover:ring-primary/40 dark:bg-slate-900/60"
                                        >
                                            <div className="relative h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-900/40">
                                                {product.photo_url ? (
                                                    <img
                                                        src={product.photo_url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                                                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary shadow-sm dark:bg-teal-400/10 dark:text-teal-300">
                                                            {product.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ??
                                                                '?'}
                                                        </span>
                                                        <p className="text-[10px] tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                                            Tidak ada foto
                                                        </p>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddProduct(product)}
                                                    className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm transition hover:bg-primary hover:text-white"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-1 flex-col gap-1.5 p-4">
                                                <span className="text-[11px] font-semibold tracking-wide text-primary uppercase dark:text-teal-300">
                                                    {product.category_name ??
                                                        'Tanpa Kategori'}
                                                </span>
                                                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-auto text-base font-semibold text-teal-600 dark:text-teal-300">
                                                    {formatCurrency(
                                                        product.price,
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="hidden lg:block lg:pt-4">
                        <OrderSummary
                            className="sticky top-4"
                            orders={orders}
                            subtotal={subtotal}
                            tax={tax}
                            total={total}
                            onIncrease={handleIncreaseQuantity}
                            onDecrease={handleDecreaseQuantity}
                            onRemove={handleRemoveOrderItem}
                        />
                    </aside>
                </div>

                <div className="lg:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSummaryOpen((state) => !state)}
                        className="flex w-full items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-primary hover:ring-primary/40 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700"
                    >
                        <span>Daftar Pesanan</span>
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {isSummaryOpen && (
                        <OrderSummary
                            className="mt-3"
                            orders={orders}
                            subtotal={subtotal}
                            tax={tax}
                            total={total}
                            onIncrease={handleIncreaseQuantity}
                            onDecrease={handleDecreaseQuantity}
                            onRemove={handleRemoveOrderItem}
                        />
                    )}
                </div>
            </div>
        </CashierLayout>
    );
}
