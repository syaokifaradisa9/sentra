import { Link, router } from '@inertiajs/react';
import { CalendarDays, Percent, Plus, Printer, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmationAlert from '../../components/alerts/ConfirmationAlert';
import Button from '../../components/buttons/Button';
import DropdownButton from '../../components/buttons/DropdownButton';
import FormSearch from '../../components/forms/FormSearch';
import ContentCard from '../../components/layouts/ContentCard';
import RootLayout from '../../components/layouts/RootLayout';
import DataTable from '../../components/tables/Datatable';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(value));
    } catch (error) {
        return value;
    }
};

const hasValue = (value) =>
    value !== null &&
    value !== undefined &&
    value !== '' &&
    !Number.isNaN(Number(value));

const discountLabel = (promo) => {
    const parts = [];
    if (hasValue(promo.percent_discount)) {
        parts.push(`${Number(promo.percent_discount)}%`);
    }
    if (hasValue(promo.price_discount)) {
        parts.push(currencyFormatter.format(Number(promo.price_discount)));
    }

    return parts.length ? parts.join(' + ') : '-';
};

const getBasePrice = (promo) => {
    if (hasValue(promo.product?.price)) {
        return Number(promo.product.price);
    }
    if (hasValue(promo.product_price)) {
        return Number(promo.product_price);
    }
    return 0;
};

const getPromoPrice = (promo) => {
    let price = getBasePrice(promo);

    if (hasValue(promo.percent_discount)) {
        price -= price * (Number(promo.percent_discount) / 100);
    }

    if (hasValue(promo.price_discount)) {
        price -= Number(promo.price_discount);
    }

    return price > 0 ? price : 0;
};

const isPromoActive = (promo) => {
    const now = new Date();
    const start = promo.start_date ? new Date(promo.start_date) : null;
    const end = promo.end_date ? new Date(promo.end_date) : null;

    if (!start || !end) {
        return false;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return now >= start && now <= end;
};

const initialDatatableState = {
    data: [],
    from: 0,
    to: 0,
    total: 0,
    current_page: 1,
    last_page: 1,
    links: [],
};

export default function PromoIndex() {
    const [dataTable, setDataTable] = useState(initialDatatableState);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        search: '',
        limit: 20,
        page: 1,
        sort_by: 'start_date',
        sort_direction: 'desc',
        product: '',
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);

    const loadDatatable = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/promos/datatable?${query}`);
            const data = await response.json();
            setDataTable(data);
        } catch (error) {
            console.error('Failed to load promo datatable', error);
            setDataTable({ ...initialDatatableState });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDatatable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(params)]);

    const onParamsChange = (event) => {
        const { name, value } = event.target;
        setParams((prev) => ({
            ...prev,
            page: name === 'limit' ? 1 : prev.page,
            [name]: value,
        }));
    };

    const onSearchChange = (event) => {
        const { value } = event.target;
        setParams((prev) => ({
            ...prev,
            page: 1,
            search: value,
        }));
    };

    const onChangePage = (event) => {
        event.preventDefault();
        try {
            const url = new URL(event.target.href);
            const page = url.searchParams.get('page') ?? '1';
            setParams((prev) => ({
                ...prev,
                page: Number(page),
            }));
        } catch (error) {
            console.error('Failed to change page', error);
        }
    };

    const handleSort = (columnName) => {
        setParams((prev) => {
            const isSameColumn = prev.sort_by === columnName;
            const sortDirection =
                isSameColumn && prev.sort_direction === 'asc' ? 'desc' : 'asc';

            return {
                ...prev,
                sort_by: columnName,
                sort_direction: sortDirection,
            };
        });
    };

    const openDeleteModal = (promo) => {
        setSelectedPromo(promo);
        setIsConfirmOpen(true);
    };

    const onPrint = (type) => {
        const query = new URLSearchParams(params).toString();
        const url = `/promos/print/${type}?${query}`;
        window.open(url, '_blank');
    };

    const renderPromoCard = (promo) => (
        <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-primary/5 dark:border-slate-700/60 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-primary/70 uppercase dark:text-teal-200/70">
                        {promo.product?.name ?? 'Produk'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {promo.product?.category?.name ?? '-'}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {discountLabel(promo)}
                    </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    #{promo.id}
                </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    <CalendarDays className="size-3.5" />
                    {formatDate(promo.start_date)} -{' '}
                    {formatDate(promo.end_date)}
                </span>
                {hasValue(promo.percent_discount) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-teal-400/10 dark:text-teal-200">
                        <Percent className="size-3.5" />
                        {promo.percent_discount}%
                    </span>
                )}
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        isPromoActive(promo)
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
                    }`}
                >
                    {isPromoActive(promo) ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                        Harga Awal
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {currencyFormatter.format(getBasePrice(promo))}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                        Harga Promo
                    </span>
                    <span className="font-semibold text-primary dark:text-teal-200">
                        {currencyFormatter.format(getPromoPrice(promo))}
                    </span>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                <Link
                    href={`/promos/${promo.id}/edit`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-200 dark:hover:bg-teal-400/10"
                >
                    Edit
                </Link>
                <button
                    type="button"
                    onClick={() => openDeleteModal(promo)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/20"
                >
                    <Trash2 className="size-4" />
                    Hapus
                </button>
            </div>
        </div>
    );

    return (
        <RootLayout title="Promo Produk">
            <ConfirmationAlert
                isOpen={isConfirmOpen}
                setOpenModalStatus={setIsConfirmOpen}
                title="Konfirmasi Hapus"
                message={`Hapus promo ${
                    selectedPromo?.product?.name ?? ''
                }? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    if (selectedPromo?.id) {
                        setIsConfirmOpen(false);
                        router.delete(`/promos/${selectedPromo.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                loadDatatable();
                            },
                            onFinish: () => setSelectedPromo(null),
                        });
                    }
                }}
            />

            <ContentCard
                title="Daftar Promo"
                additionalButton={
                    <Button
                        label="Tambah Promo"
                        href="/promos/create"
                        icon={<Plus className="size-4" />}
                    />
                }
            >
                <DataTable
                    dataTable={dataTable}
                    cardItem={renderPromoCard}
                    limit={params.limit}
                    isLoading={isLoading}
                    onChangePage={onChangePage}
                    onParamsChange={onParamsChange}
                    searchValue={params.search}
                    onSearchChange={onSearchChange}
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                    onHeaderClick={handleSort}
                    additionalHeaderElements={
                        <DropdownButton
                            icon={
                                <Printer className="size-4 text-gray-700 dark:text-gray-300" />
                            }
                            items={[
                                {
                                    label: 'PDF',
                                    onClick: () => onPrint('pdf'),
                                },
                                {
                                    label: 'Excel',
                                    onClick: () => onPrint('excel'),
                                },
                            ]}
                        />
                    }
                    columns={[
                        {
                            name: null,
                            header: 'Produk',
                            render: (item) => (
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                                        {item.product?.name ?? '-'}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {item.product?.category?.name ?? '-'}
                                    </span>
                                </div>
                            ),
                            footer: (
                                <FormSearch
                                    name="product"
                                    placeholder="Filter Produk"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: 'start_date',
                            header: 'Periode',
                            render: (item) => (
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                    {formatDate(item.start_date)} s/d{' '}
                                    {formatDate(item.end_date)}
                                </span>
                            ),
                        },

                        {
                            name: 'percent_discount',
                            header: 'Diskon',
                            render: (item) => (
                                <div className="text-slate-600 dark:text-slate-300">
                                    {discountLabel(item)}
                                </div>
                            ),
                        },
                        {
                            name: null,
                            header: 'Harga Awal',
                            render: (item) => (
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {currencyFormatter.format(
                                        getBasePrice(item),
                                    )}
                                </span>
                            ),
                        },
                        {
                            name: null,
                            header: 'Harga Promo',
                            render: (item) => (
                                <span className="font-semibold text-primary dark:text-teal-200">
                                    {currencyFormatter.format(
                                        getPromoPrice(item),
                                    )}
                                </span>
                            ),
                        },
                        {
                            name: null,
                            header: 'Status',
                            render: (item) => (
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                        isPromoActive(item)
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
                                    }`}
                                >
                                    {isPromoActive(item)
                                        ? 'Aktif'
                                        : 'Tidak Aktif'}
                                </span>
                            ),
                        },
                        {
                            header: 'Aksi',
                            render: (item) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link
                                        href={`/promos/${item.id}/edit`}
                                        className="inline-flex items-center rounded-md border border-primary/40 px-3 py-1 text-sm text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-300 dark:hover:bg-teal-400/10"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => openDeleteModal(item)}
                                        className="inline-flex items-center rounded-md border border-red-200 px-3 py-1 text-sm text-red-600 transition hover:bg-red-600 hover:text-white dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/20"
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Hapus
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
            </ContentCard>
        </RootLayout>
    );
}
