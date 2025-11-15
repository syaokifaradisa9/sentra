import { router, usePage } from '@inertiajs/react';
import { LayoutGrid, List, MoreHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import CashierLayout from '../../components/layouts/CashierLayout';
import CategorySection from './components/CategorySection';
import ProductSection from './components/ProductSection';
import SummarySection from './components/SummarySection';
import { formatCurrency } from './utils/cashierUtils';

function Avatar({ name }) {
    const initial = name?.charAt(0)?.toUpperCase() ?? '?';
    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-teal-400 text-lg font-semibold text-white shadow">
            {initial}
        </div>
    );
}

const SAVED_ORDER_STORAGE_KEY = 'cashier_saved_orders';

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
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [discount, setDiscount] = useState({ type: 'amount', value: 0 });
    const [discountDraft, setDiscountDraft] = useState({
        type: 'amount',
        value: '0',
    });
    const [hasSavedOrder, setHasSavedOrder] = useState(false);
    const [orderFeedback, setOrderFeedback] = useState(null);
    const [savedOrders, setSavedOrders] = useState([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [saveDraftName, setSaveDraftName] = useState('');
    const [productListOffset, setProductListOffset] = useState(0);
    const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
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

    const categoryProductCounts = useMemo(() => {
        return products.reduce((accumulator, product) => {
            const key = String(product.category_id ?? 'null');
            accumulator[key] = (accumulator[key] ?? 0) + 1;
            return accumulator;
        }, {});
    }, [products]);

    const categoryOptions = useMemo(() => {
        return [
            {
                id: 'all',
                name: 'Semua Menu',
                product_count: totalProducts || products.length,
                icon: null,
            },
            ...categories,
        ].map((category) => {
            if (category.id === 'all') {
                return {
                    ...category,
                    product_count: totalProducts || products.length || 0,
                };
            }

            const key = String(category.id ?? 'null');
            return {
                ...category,
                product_count:
                    category.product_count ?? categoryProductCounts[key] ?? 0,
            };
        });
    }, [categories, categoryProductCounts, products, totalProducts]);

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

    const orderQuantities = useMemo(() => {
        return orders.reduce((accumulator, item) => {
            accumulator[item.id] = item.quantity;
            return accumulator;
        }, {});
    }, [orders]);

    const subtotal = useMemo(
        () => orders.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [orders],
    );

    const discountAmount = useMemo(() => {
        const numericValue = Number(discount.value) || 0;
        if (numericValue <= 0 || subtotal <= 0) {
            return 0;
        }

        if (discount.type === 'percent') {
            const percentValue = Math.min(Math.max(numericValue, 0), 100);
            return Math.min(
                subtotal,
                Math.round((subtotal * percentValue) / 100),
            );
        }

        return Math.min(subtotal, Math.max(numericValue, 0));
    }, [discount, subtotal]);

    const total = useMemo(() => {
        const calculated = subtotal - discountAmount;
        return calculated > 0 ? calculated : 0;
    }, [subtotal, discountAmount]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const readSavedOrdersFromStorage = () => {
        if (typeof window === 'undefined') {
            return { items: [], needsMigration: false };
        }
        try {
            const raw = localStorage.getItem(SAVED_ORDER_STORAGE_KEY);
            if (!raw) {
                return { items: [], needsMigration: false };
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return { items: parsed, needsMigration: false };
            }
            if (parsed && typeof parsed === 'object' && parsed.orders) {
                const migrated = [
                    {
                        id:
                            parsed.id ??
                            (typeof crypto !== 'undefined' && crypto.randomUUID
                                ? crypto.randomUUID()
                                : `legacy-${Date.now()}`),
                        name: parsed.name ?? 'Pesanan Tersimpan',
                        orders: Array.isArray(parsed.orders)
                            ? parsed.orders
                            : [],
                        discount:
                            parsed.discount &&
                            typeof parsed.discount === 'object'
                                ? parsed.discount
                                : { type: 'amount', value: 0 },
                        savedAt: parsed.savedAt ?? new Date().toISOString(),
                    },
                ];
                return { items: migrated, needsMigration: true };
            }
            return { items: [], needsMigration: false };
        } catch (error) {
            console.error('Failed to read saved orders', error);
            return { items: [], needsMigration: false };
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const { items, needsMigration } = readSavedOrdersFromStorage();
        setSavedOrders(items);
        setHasSavedOrder(items.length > 0);
        if (needsMigration) {
            persistSavedOrders(items);
        }
    }, []);

    useEffect(() => {
        if (!orderFeedback) {
            return;
        }
        if (typeof window === 'undefined') {
            return;
        }
        const timer = window.setTimeout(() => {
            setOrderFeedback(null);
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [orderFeedback]);

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
            const existing = previous.find((item) => item.id === product.id);

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

    const handleOpenDiscountModal = () => {
        setDiscountDraft({
            type: discount.type ?? 'amount',
            value:
                discount.value !== undefined && discount.value !== null
                    ? String(discount.value)
                    : '0',
        });
        setIsDiscountModalOpen(true);
    };

    const persistSavedOrders = (items) => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(
                    SAVED_ORDER_STORAGE_KEY,
                    JSON.stringify(items),
                );
            } catch (error) {
                console.error('Failed to persist saved orders', error);
            }
        }
        setSavedOrders(items);
        setHasSavedOrder(items.length > 0);
    };

    const handleSaveOrder = () => {
        if (orders.length === 0) {
            setOrderFeedback('Belum ada pesanan yang dapat disimpan.');
            return;
        }

        const timestamp = new Date();
        const defaultName = `Pesanan ${timestamp.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })}`;
        setSaveDraftName(defaultName);
        setIsSaveModalOpen(true);
        setIsLoadModalOpen(false);
    };

    const handleConfirmSaveOrder = () => {
        const trimmedName = saveDraftName.trim();
        const createdAt = new Date().toISOString();
        const item = {
            id:
                typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `saved-${Date.now()}`,
            name:
                trimmedName.length > 0
                    ? trimmedName
                    : `Pesanan ${new Date(createdAt).toLocaleString('id-ID')}`,
            orders: orders.map((order) => ({ ...order })),
            discount: { ...discount },
            savedAt: createdAt,
        };
        const updated = [...savedOrders, item];
        persistSavedOrders(updated);
        handleCloseSaveModal();
        setOrders([]);
        setDiscount({ type: 'amount', value: 0 });
        setDiscountDraft({ type: 'amount', value: '0' });
        setOrderFeedback('Pesanan berhasil disimpan.');
    };

    const handleLoadOrder = () => {
        setIsSaveModalOpen(false);
        const { items } = readSavedOrdersFromStorage();
        persistSavedOrders(items);
        if (items.length === 0) {
            setOrderFeedback('Belum ada pesanan tersimpan.');
            return;
        }
        setIsLoadModalOpen(true);
    };

    const handleLoadSavedOrder = (orderId) => {
        const target = savedOrders.find((item) => item.id === orderId);
        if (!target) {
            setOrderFeedback('Pesanan tidak ditemukan.');
            return;
        }
        setOrders(
            Array.isArray(target.orders)
                ? target.orders.map((order) => ({ ...order }))
                : [],
        );
        if (
            target.discount &&
            typeof target.discount === 'object' &&
            target.discount.value !== undefined
        ) {
            const sanitized = {
                type: target.discount.type === 'percent' ? 'percent' : 'amount',
                value: Number(target.discount.value) || 0,
            };
            setDiscount(sanitized);
            setDiscountDraft({
                type: sanitized.type,
                value: String(sanitized.value ?? 0),
            });
        } else {
            setDiscount({ type: 'amount', value: 0 });
            setDiscountDraft({ type: 'amount', value: '0' });
        }
        const remaining = savedOrders.filter((item) => item.id !== orderId);
        persistSavedOrders(remaining);
        setOrderFeedback(`Pesanan "${target.name}" telah dimuat.`);
        handleCloseLoadModal();
    };

    const handleDeleteSavedOrder = (orderId) => {
        const filtered = savedOrders.filter((item) => item.id !== orderId);
        persistSavedOrders(filtered);
        setOrderFeedback('Pesanan tersimpan telah dihapus.');
        if (filtered.length === 0) {
            handleCloseLoadModal();
        }
    };

    const handleCloseSaveModal = () => {
        setIsSaveModalOpen(false);
        setSaveDraftName('');
    };

    const handleCloseLoadModal = () => {
        setIsLoadModalOpen(false);
    };

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
        <>
            <CashierLayout title="Kasir">
                <div className="mx-auto flex h-full w-full max-w-none flex-1 flex-col overflow-hidden px-2 pt-2 pb-0 sm:px-2 lg:px-3">
                    <div
                        className={`grid flex-1 gap-3 overflow-visible pb-20 lg:min-h-0 ${
                            isCategoryCollapsed
                                ? 'lg:grid-cols-[3rem_minmax(0,1fr)_24rem]'
                                : 'lg:grid-cols-[16rem_minmax(0,1fr)_24rem]'
                        } lg:pb-0`}
                    >
                        <aside className="hidden h-full min-h-0 lg:flex lg:pt-4">
                            <CategorySection
                                categoryOptions={categoryOptions}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                handleBack={handleBack}
                                productListOffset={productListOffset}
                                isCollapsed={isCategoryCollapsed}
                                onToggleCollapse={setIsCategoryCollapsed}
                            />
                        </aside>

                        <ProductSection
                            products={products}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            search={search}
                            setSearch={setSearch}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            handleAddProduct={handleAddProduct}
                            orderQuantities={orderQuantities}
                            categoryOptions={categoryOptions}
                            theme={theme}
                            toggleTheme={toggleTheme}
                            onProductListOffsetChange={setProductListOffset}
                        />

                        <aside className="hidden h-full min-h-0 lg:block lg:pt-4">
                            <div className="lg:sticky lg:top-4">
                                <SummarySection
                                    orders={orders}
                                    subtotal={subtotal}
                                    discountAmount={discountAmount}
                                    discount={discount}
                                    total={total}
                                    onIncrease={handleIncreaseQuantity}
                                    onDecrease={handleDecreaseQuantity}
                                    onRemove={handleRemoveOrderItem}
                                    onDiscountClick={handleOpenDiscountModal}
                                    onSaveOrder={handleSaveOrder}
                                    onLoadOrder={handleLoadOrder}
                                    canLoadSaved={hasSavedOrder}
                                    feedbackMessage={orderFeedback}
                                />
                            </div>
                        </aside>
                    </div>

                    {/* Mobile Fixed Total Price Button */}
                    <div className="fixed right-0 bottom-0 left-0 z-10 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-sm lg:hidden dark:border-slate-700 dark:bg-slate-900/80">
                        <button
                            type="button"
                            onClick={() => {
                                setShowBottomSheet(true);
                                setTimeout(() => setIsSummaryOpen(true), 10);
                            }}
                            className="flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/20 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-300 dark:hover:bg-teal-400/20"
                        >
                            <div className="flex items-center gap-2">
                                <span>Daftar Pesanan</span>
                                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white dark:bg-teal-500 dark:text-white">
                                    {orders.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                                    {formatCurrency(total)}
                                </span>
                                <MoreHorizontal className="h-5 w-5" />
                            </div>
                        </button>
                    </div>

                    {/* Mobile Order Summary Bottom Sheet */}
                    {showBottomSheet && (
                        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden">
                            <div
                                className="absolute inset-0"
                                onClick={() => {
                                    setIsSummaryOpen(false);
                                    setTimeout(
                                        () => setShowBottomSheet(false),
                                        300,
                                    );
                                }}
                            ></div>
                            <div
                                className={`absolute right-0 bottom-0 left-0 flex max-h-[70vh] flex-col rounded-t-3xl bg-white shadow-lg transition-transform duration-300 ease-out dark:bg-slate-900 ${isSummaryOpen ? 'translate-y-0' : 'translate-y-full'}`}
                            >
                                <div className="mx-auto my-2 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        Daftar Pesanan
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSummaryOpen(false);
                                            setTimeout(
                                                () => setShowBottomSheet(false),
                                                300,
                                            );
                                        }}
                                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                        aria-label="Tutup"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-5 py-3">
                                    <SummarySection
                                        orders={orders}
                                        subtotal={subtotal}
                                        discountAmount={discountAmount}
                                        discount={discount}
                                        total={total}
                                        onIncrease={handleIncreaseQuantity}
                                        onDecrease={handleDecreaseQuantity}
                                        onRemove={handleRemoveOrderItem}
                                        onDiscountClick={
                                            handleOpenDiscountModal
                                        }
                                        onSaveOrder={handleSaveOrder}
                                        onLoadOrder={handleLoadOrder}
                                        canLoadSaved={hasSavedOrder}
                                        feedbackMessage={orderFeedback}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CashierLayout>
            {isDiscountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    Atur Diskon
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pilih tipe diskon kemudian masukkan
                                    nilainya.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDiscountModalOpen(false)}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                aria-label="Tutup modal diskon"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 text-sm dark:bg-slate-800">
                                {[
                                    { id: 'amount', label: 'Potongan Harga' },
                                    { id: 'percent', label: 'Diskon %' },
                                ].map((option) => {
                                    const isActive =
                                        discountDraft.type === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() =>
                                                setDiscountDraft((prev) => ({
                                                    ...prev,
                                                    type: option.id,
                                                }))
                                            }
                                            className={`flex-1 rounded-lg px-3 py-1.5 font-medium transition ${
                                                isActive
                                                    ? 'bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-teal-300'
                                                    : 'text-slate-500 hover:text-primary dark:text-slate-300 dark:hover:text-teal-300'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div>
                                <label
                                    htmlFor="discount-value"
                                    className="block text-sm font-medium text-slate-600 dark:text-slate-300"
                                >
                                    Nilai Diskon
                                </label>
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        id="discount-value"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        max={
                                            discountDraft.type === 'percent'
                                                ? '100'
                                                : undefined
                                        }
                                        value={discountDraft.value}
                                        onChange={(event) =>
                                            setDiscountDraft((prev) => ({
                                                ...prev,
                                                value: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                        placeholder={
                                            discountDraft.type === 'percent'
                                                ? 'Masukkan persentase diskon'
                                                : 'Masukkan nominal potongan'
                                        }
                                    />
                                    <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                        {discountDraft.type === 'percent'
                                            ? '%'
                                            : 'Rp'}
                                    </span>
                                </div>
                                {discountDraft.type === 'amount' && (
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                        Maksimal {formatCurrency(subtotal)}.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    setDiscount({ type: 'amount', value: 0 });
                                    setDiscountDraft({
                                        type: 'amount',
                                        value: '0',
                                    });
                                    setIsDiscountModalOpen(false);
                                }}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:text-red-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400/40 dark:hover:text-red-400"
                            >
                                Hapus Diskon
                            </button>
                            <div className="flex flex-1 justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsDiscountModalOpen(false)
                                    }
                                    className="inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-300 dark:hover:text-teal-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const rawValue = Number(
                                            discountDraft.value,
                                        );
                                        const sanitized = Number.isFinite(
                                            rawValue,
                                        )
                                            ? Math.max(rawValue, 0)
                                            : 0;

                                        const nextValue =
                                            discountDraft.type === 'percent'
                                                ? Math.min(sanitized, 100)
                                                : Math.min(sanitized, subtotal);

                                        setDiscount({
                                            type: discountDraft.type,
                                            value: nextValue,
                                        });
                                        setDiscountDraft((prev) => ({
                                            ...prev,
                                            value: String(nextValue),
                                        }));
                                        setIsDiscountModalOpen(false);
                                    }}
                                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    Simpan Pesanan
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Beri nama untuk memudahkan pencarian pesanan
                                    di kemudian hari.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseSaveModal}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                aria-label="Tutup modal simpan pesanan"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleConfirmSaveOrder();
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="saved-order-name"
                                        className="block text-sm font-medium text-slate-600 dark:text-slate-300"
                                    >
                                        Nama Pesanan
                                    </label>
                                    <input
                                        id="saved-order-name"
                                        type="text"
                                        value={saveDraftName}
                                        onChange={(event) =>
                                            setSaveDraftName(event.target.value)
                                        }
                                        placeholder="Misal: Pesanan Meja 5"
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                    />
                                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                                        Pesanan tersimpan mencakup daftar item
                                        dan diskon saat ini.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseSaveModal}
                                    className="inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-300 dark:hover:text-teal-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                                >
                                    Simpan Pesanan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isLoadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    Muat Pesanan Tersimpan
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pilih salah satu pesanan yang pernah
                                    disimpan untuk dilanjutkan.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseLoadModal}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                aria-label="Tutup modal muat pesanan"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {savedOrders.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
                                Belum ada pesanan tersimpan.
                            </div>
                        ) : (
                            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                                {savedOrders
                                    .slice()
                                    .sort(
                                        (a, b) =>
                                            new Date(b.savedAt).getTime() -
                                            new Date(a.savedAt).getTime(),
                                    )
                                    .map((saved) => {
                                        const itemsCount = Array.isArray(
                                            saved.orders,
                                        )
                                            ? saved.orders.reduce(
                                                  (sum, order) =>
                                                      sum +
                                                      (Number(order.quantity) ||
                                                          0),
                                                  0,
                                              )
                                            : 0;
                                        const subtotalSaved = Array.isArray(
                                            saved.orders,
                                        )
                                            ? saved.orders.reduce(
                                                  (sum, order) =>
                                                      sum +
                                                      (Number(order.price) ||
                                                          0) *
                                                          (Number(
                                                              order.quantity,
                                                          ) || 0),
                                                  0,
                                              )
                                            : 0;
                                        const discountValue =
                                            saved.discount &&
                                            saved.discount.value !== undefined
                                                ? Number(
                                                      saved.discount.value,
                                                  ) || 0
                                                : 0;
                                        const discountLabel =
                                            discountValue > 0
                                                ? saved.discount &&
                                                  saved.discount.type ===
                                                      'percent'
                                                    ? `${discountValue}%`
                                                    : formatCurrency(
                                                          discountValue,
                                                      )
                                                : null;
                                        const savedAtLabel = saved.savedAt
                                            ? new Date(
                                                  saved.savedAt,
                                              ).toLocaleString('id-ID', {
                                                  day: '2-digit',
                                                  month: 'short',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : 'Waktu tidak diketahui';

                                        return (
                                            <div
                                                key={saved.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                            {saved.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                                            Disimpan{' '}
                                                            {savedAtLabel} -{' '}
                                                            {itemsCount} item -
                                                            Subtotal{' '}
                                                            {formatCurrency(
                                                                subtotalSaved,
                                                            )}
                                                            {discountLabel
                                                                ? ` - Diskon ${discountLabel}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleLoadSavedOrder(
                                                                    saved.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
                                                        >
                                                            Muat
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteSavedOrder(
                                                                    saved.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-400/10"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseLoadModal}
                                className="inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-300 dark:hover:text-teal-300"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
