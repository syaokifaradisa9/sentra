import { router, usePage } from '@inertiajs/react';
import {
    Download,
    LayoutGrid,
    List,
    MoreHorizontal,
    Save,
    Trash2,
    X,
    Menu,
    Check,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import CashierLayout from '../../components/layouts/CashierLayout';
import CategorySection from './components/CategorySection';
import ProductSection from './components/ProductSection';
import SummarySection from './components/SummarySection';
import { formatCurrency } from './utils/cashierUtils';

const SAVED_ORDER_STORAGE_KEY = 'cashier_saved_orders';

export default function CashierIndex({
    categories = [],
    products = [],
    total_products: totalProducts = 0,
    branchOptions: branchOptionsProp = [],
    selectedBranchId = null,
    canSelectBranch = false,
    activeBranch = null,
    currentRole = '',
}) {
    const { loggeduser } = usePage().props;
    const displayName = loggeduser?.name ?? 'Pengguna';
    const displayPosition = loggeduser?.position ?? loggeduser?.role ?? 'Kasir';
    const branchOptions = branchOptionsProp ?? [];

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
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [checkoutError, setCheckoutError] = useState('');
    const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
    const [checkoutResult, setCheckoutResult] = useState(null);
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
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [branchFilter, setBranchFilter] = useState(
        selectedBranchId
            ? String(selectedBranchId)
            : branchOptions[0]?.id
                ? String(branchOptions[0].id)
                : '',
    );

    useEffect(() => {
        setBranchFilter(selectedBranchId ? String(selectedBranchId) : '');
    }, [selectedBranchId]);

    useEffect(() => {
        if (!canSelectBranch) {
            return;
        }

        setOrders([]);
        setHasSavedOrder(false);
        setOrderFeedback(null);
    }, [selectedBranchId, canSelectBranch]);

    const handleBranchChange = (eventOrValue) => {
        const value = typeof eventOrValue === 'object' && eventOrValue?.target
            ? eventOrValue.target.value
            : eventOrValue;
        setBranchFilter(value);
        router.get(
            '/cashier',
            { branch_id: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

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
                    photo_url: product.photo_url,
                    price: product.price,
                    quantity: 1,
                    category_name: product.category_name ?? null,
                    promo_id: product.promo_id ?? null,
                    discount_percent: product.discount_percent ?? null,
                    discount_price: product.discount_price ?? null,
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

    const handleOpenCheckoutModal = () => {
        if (orders.length === 0) {
            setOrderFeedback('Belum ada pesanan untuk diproses.');
            return;
        }
        setCheckoutError('');
        setCheckoutResult(null);
        setIsCheckoutModalOpen(true);
    };

    const handleCloseCheckoutModal = () => {
        if (isSubmittingCheckout) {
            return;
        }
        setIsCheckoutModalOpen(false);
        setCheckoutError('');
        setCheckoutResult(null);
        setPaymentAmount('');
        setCustomerName('');
        setCustomerPhone('');
    };

    const handleSubmitCheckout = async () => {
        if (!branchFilter) {
            setCheckoutError('Pilih cabang terlebih dahulu.');
            return;
        }

        const payment = Number(paymentAmount);
        if (Number.isNaN(payment) || payment <= 0) {
            setCheckoutError('Masukkan jumlah pembayaran yang valid.');
            return;
        }

        const amountDue = total > 0 ? total : 0;
        if (payment < amountDue) {
            setCheckoutError('Jumlah pembayaran kurang dari total belanja.');
            return;
        }

        const csrfToken =
            typeof document !== 'undefined'
                ? document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content')
                : null;

        const payload = {
            customer_name: customerName || null,
            customer_phone: customerPhone || null,
            branch_id: Number(branchFilter),
            discount_type: discount.type ?? null,
            discount_value:
                discount.type && discount.value !== undefined
                    ? Number(discount.value || 0)
                    : null,
            payment_amount: payment,
            items: orders.map((order) => ({
                product_id: order.id,
                product_name: order.name,
                category_name: order.category_name ?? null,
                price: order.price,
                quantity: order.quantity,
                promo_id: order.promo_id ?? null,
                discount_percent: order.discount_percent ?? null,
                discount_price: order.discount_price ?? null,
            })),
        };

        setIsSubmittingCheckout(true);
        try {
            const response = await fetch('/cashier/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message ?? 'Gagal menyimpan transaksi.');
            }

            setCheckoutResult({
                change: data.change_amount ?? 0,
                transactionNumber: data.transaction_number ?? '-',
            });
            setOrderFeedback('Transaksi berhasil disimpan.');
            setOrders([]);
            setDiscount({ type: 'amount', value: 0 });
            setDiscountDraft({ type: 'amount', value: '0' });
            setPaymentAmount('');
            setCustomerName('');
            setCustomerPhone('');
            setSavedOrders([]);
            setHasSavedOrder(false);
        } catch (error) {
            setCheckoutError(
                error instanceof Error
                    ? error.message
                    : 'Terjadi kesalahan saat menyimpan transaksi.',
            );
        } finally {
            setIsSubmittingCheckout(false);
        }
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
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${isActive
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
                <main className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
                    {/* Background Pattern */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    <div className="relative z-10 mx-auto flex h-full w-full max-w-[1920px] flex-1 flex-col overflow-hidden sm:p-3 lg:p-4">
                        <div
                            className={`grid flex-1 gap-4 min-h-0 overflow-hidden lg:grid-rows-[minmax(0,1fr)] ${isCategoryCollapsed
                                ? 'lg:grid-cols-[4rem_minmax(0,1fr)_22rem]'
                                : 'lg:grid-cols-[17rem_minmax(0,1fr)_22rem]'
                                } transition-all duration-300 ease-in-out lg:pb-0`}
                        >
                            <aside className="hidden h-full min-h-0 flex-col lg:flex">
                                <CategorySection
                                    categoryOptions={categoryOptions}
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    handleBack={handleBack}
                                    userName={displayName}
                                    userPosition={displayPosition}
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
                                userName={displayName}
                                userPosition={displayPosition}
                                handleBack={() => window.history.back()}
                                branchOptions={branchOptions}
                                selectedBranchId={branchFilter}
                                canSelectBranch={canSelectBranch}
                                onBranchChange={handleBranchChange}
                            />

                            <aside className="hidden h-full min-h-0 lg:block">
                                <div className="h-full">
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
                                        branchOptions={branchOptions}
                                        canSelectBranch={canSelectBranch}
                                        selectedBranchId={branchFilter}
                                        onBranchChange={handleBranchChange}
                                        activeBranch={activeBranch}
                                        onCheckout={handleOpenCheckoutModal}
                                        disableCheckout={isSubmittingCheckout}
                                    />
                                </div>
                            </aside>
                        </div>

                        {/* Mobile Fixed Total Price Button & Categories */}
                        <div className="fixed right-0 bottom-0 left-0 z-30 flex flex-col gap-2 pb-4 lg:hidden pointer-events-none">
                            <div className="flex justify-center pointer-events-auto">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="group flex items-center gap-2.5 rounded-full bg-white/80 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-xl shadow-slate-200/40 backdrop-blur-md ring-1 ring-slate-200/50 transition-all active:scale-95 dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-slate-900/40 dark:ring-slate-700/50"
                                >
                                    <Menu className="h-4 w-4 text-primary transition-transform group-hover:rotate-180 dark:text-teal-400" />
                                    <span>Kategori</span>
                                </button>
                            </div>
                            <div className="px-4 pointer-events-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBottomSheet(true);
                                        setTimeout(
                                            () => setIsSummaryOpen(true),
                                            50,
                                        );
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98] dark:bg-teal-500 dark:shadow-teal-500/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                                            {orders.length}
                                        </div>
                                        <span>Lihat Pesanan</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">
                                            {formatCurrency(total)}
                                        </span>
                                        <MoreHorizontal className="h-5 w-5" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Mobile Order Summary Bottom Sheet */}
                        {showBottomSheet && (
                            <div className="fixed inset-0 z-50 lg:hidden">
                                <div
                                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                                    onClick={() => {
                                        setIsSummaryOpen(false);
                                        setTimeout(
                                            () => setShowBottomSheet(false),
                                            300,
                                        );
                                    }}
                                ></div>
                                <div
                                    className={`absolute right-0 bottom-0 left-0 flex h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-900 ${isSummaryOpen ? 'translate-y-0' : 'translate-y-full'}`}
                                >
                                    <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2 dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            Detail Pesanan
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsSummaryOpen(false);
                                                setTimeout(
                                                    () =>
                                                        setShowBottomSheet(
                                                            false,
                                                        ),
                                                    300,
                                                );
                                            }}
                                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-hidden p-4">
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
                                            branchOptions={branchOptions}
                                            canSelectBranch={canSelectBranch}
                                            selectedBranchId={branchFilter}
                                            onBranchChange={handleBranchChange}
                                            activeBranch={activeBranch}
                                            onCheckout={handleOpenCheckoutModal}
                                            disableCheckout={
                                                isSubmittingCheckout
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </CashierLayout>
            {isDiscountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/70">
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
                                            className={`flex-1 rounded-lg px-3 py-1.5 font-medium transition ${isActive
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
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:text-red-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400/40 dark:hover:text-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Diskon</span>
                            </button>
                            <div className="flex flex-1 justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsDiscountModalOpen(false)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-300 dark:hover:text-teal-300"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Batal</span>
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
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Simpan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/90">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    {checkoutResult
                                        ? 'Pembayaran Berhasil'
                                        : 'Konfirmasi Pembayaran'}
                                </h2>
                                {!checkoutResult && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Masukkan informasi pelanggan dan jumlah
                                        pembayaran.
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseCheckoutModal}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                aria-label="Tutup modal pembayaran"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {checkoutResult ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Nomor Transaksi
                                    </p>
                                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        {checkoutResult.transactionNumber}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200">
                                    <p className="text-xs tracking-wide uppercase">
                                        Jumlah Kembalian
                                    </p>
                                    <p className="text-2xl font-semibold">
                                        {formatCurrency(
                                            checkoutResult.change ?? 0,
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseCheckoutModal}
                                    className="v mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                                >
                                    OK
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Nama Pelanggan (opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(event) =>
                                            setCustomerName(event.target.value)
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-300/30"
                                        placeholder="Masukkan nama pelanggan"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Nomor Telepon (opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={customerPhone}
                                        onChange={(event) =>
                                            setCustomerPhone(event.target.value)
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-300/30"
                                        placeholder="Masukkan nomor telepon"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Jumlah Pembayaran
                                    </label>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        value={paymentAmount}
                                        onChange={(event) =>
                                            setPaymentAmount(event.target.value)
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-300/30"
                                        placeholder="Masukkan jumlah pembayaran"
                                    />
                                    <p className="mt-1 text-right text-xs text-slate-400 dark:text-slate-500">
                                        Total harus dibayar:{' '}
                                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                                            {formatCurrency(total)}
                                        </span>
                                    </p>
                                </div>

                                {checkoutError && (
                                    <p className="text-sm text-red-500 dark:text-red-400">
                                        {checkoutError}
                                    </p>
                                )}

                                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={handleCloseCheckoutModal}
                                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                                        disabled={isSubmittingCheckout}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmitCheckout}
                                        disabled={isSubmittingCheckout}
                                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                    >
                                        {isSubmittingCheckout
                                            ? 'Memproses...'
                                            : 'Bayar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/70">
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
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-300 dark:hover:text-teal-300"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Batal</span>
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Simpan Pesanan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isLoadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/70">
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
                                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            <span>Muat</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteSavedOrder(
                                                                    saved.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-400/10"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span>Hapus</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm lg:hidden">
                    <div className="w-full max-w-md transform overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-all sm:rounded-3xl dark:bg-slate-900">
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                        </div>

                        <div className="flex items-center justify-between px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                Pilih Kategori
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">
                            <div className="grid gap-2">
                                {categoryOptions.map((category) => {
                                    const isActive =
                                        String(selectedCategory) ===
                                        String(category.id);
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setSelectedCategory(category.id);
                                                setIsCategoryModalOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${isActive
                                                ? 'border-primary bg-primary/5 shadow-sm dark:border-teal-500 dark:bg-teal-500/10'
                                                : 'border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${isActive ? 'text-primary dark:text-teal-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {category.name}
                                                </span>
                                                <span className="text-xs font-medium text-slate-400">
                                                    {category.product_count} produk
                                                </span>
                                            </div>
                                            {isActive && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white dark:bg-teal-500 dark:text-slate-900">
                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
