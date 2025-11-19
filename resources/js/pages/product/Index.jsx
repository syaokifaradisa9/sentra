import { Link, router } from '@inertiajs/react';
import { Edit, Plus, Printer, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmationAlert from '../../components/alerts/ConfirmationAlert';
import Button from '../../components/buttons/Button';
import DropdownButton from '../../components/buttons/DropdownButton';
import FormSearch from '../../components/forms/FormSearch';
import ContentCard from '../../components/layouts/ContentCard';
import RootLayout from '../../components/layouts/RootLayout';
import DataTable from '../../components/tables/Datatable';
import CheckRoles from '../../utils/CheckRoles';

const initialDatatableState = {
    data: [],
    from: 0,
    to: 0,
    total: 0,
    current_page: 1,
    last_page: 1,
    links: [],
};

export default function ProductIndex() {
    const [dataTable, setDataTable] = useState(initialDatatableState);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        search: '',
        limit: 20,
        page: 1,
        sort_by: 'created_at',
        sort_direction: 'desc',
        name: '',
        description: '',
        category: '',
        branch: '',
    });

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const loadDatatable = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/products/datatable?${query}`);
            const data = await response.json();
            setDataTable(data);
        } catch (error) {
            console.error('Failed to load product datatable', error);
            setDataTable({ ...initialDatatableState });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDatatable();
    }, [JSON.stringify(params)]);

    const onParamsChange = (event) => {
        const { name, value } = event.target;
        setParams((prev) => ({
            ...prev,
            page: name === 'limit' ? 1 : prev.page,
            [name]: value,
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

    const formatCurrency = (value) => {
        if (value === null || value === undefined) {
            return '-';
        }

        const number = Number(value);
        if (Number.isNaN(number)) {
            return value;
        }

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(number);
    };

    const branchLabel = (branches) =>
        branches && branches.length > 0
            ? branches.map((branch) => branch.name).join(', ')
            : '-';

    const onPrint = (type) => {
        const query = new URLSearchParams(params).toString();
        const url = `/products/print/${type}?${query}`;
        window.open(url, '_blank');
    };

    const renderProductCard = (product) => {
        const branches = product.branches ?? [];
        const photoUrl = product.photo_url ?? null;

        return (
            <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-primary/5 dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="flex gap-4">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={product.name}
                            loading="lazy"
                            className="h-16 w-16 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-600 dark:text-slate-500">
                            Tidak ada foto
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="text-lg font-semibold text-slate-800 dark:text-white">
                            {product.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {product.category?.name ?? 'Kategori belum diatur'}
                        </p>
                    </div>
                </div>

                {product.description && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        {product.description}
                    </p>
                )}

                <div className="mt-4">
                    <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
                        Cabang
                    </p>
                    {branches.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {branches.map((branch) => (
                                <span
                                    key={branch.id}
                                    className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                    {branch.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Belum terhubung dengan cabang mana pun.
                        </p>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100">
                    <span>Harga</span>
                    <span className="text-base text-primary dark:text-teal-200">
                        {formatCurrency(product.price)}
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href={`/products/${product.id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-200 dark:hover:bg-teal-400/10"
                    >
                        <Edit className="size-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedProduct(product);
                            setIsConfirmOpen(true);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/20"
                    >
                        <Trash2 className="size-4" />
                        Hapus
                    </button>
                </div>
            </div>
        );
    };

    return (
        <RootLayout title="Data Produk">
            <ConfirmationAlert
                isOpen={isConfirmOpen}
                setOpenModalStatus={setIsConfirmOpen}
                title="Konfirmasi Hapus"
                message={`Hapus produk ${selectedProduct?.name ?? ''}? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    if (selectedProduct?.id) {
                        router.delete(`/products/${selectedProduct.id}`, {
                            preserveScroll: true,
                            onSuccess: () => loadDatatable(),
                            onFinish: () => setSelectedProduct(null),
                        });
                    }
                }}
            />

            <ContentCard
                title="Data Produk"
                additionalButton={
                    <CheckRoles notRoles={['Manager', 'Cashier']}>
                        <Button
                            className="w-full"
                            label="Tambah Produk"
                            href="/products/create"
                            icon={<Plus className="size-4" />}
                        />
                    </CheckRoles>
                }
            >
                <DataTable
                    dataTable={dataTable}
                    cardItem={renderProductCard}
                    isLoading={isLoading}
                    onChangePage={onChangePage}
                    onParamsChange={onParamsChange}
                    searchValue={params.search}
                    onSearchChange={onParamsChange}
                    limit={params.limit}
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
                            name: 'name',
                            header: 'Nama Produk',
                            render: (item) => item.name,
                            footer: (
                                <FormSearch
                                    name="name"
                                    placeholder="Filter Nama Produk"
                                    onChange={onParamsChange}
                                    value={params.name}
                                />
                            ),
                        },
                        {
                            header: 'Kategori',
                            render: (item) => item.category?.name ?? '-',
                            footer: (
                                <FormSearch
                                    name="category"
                                    placeholder="Filter Kategori"
                                    onChange={onParamsChange}
                                    value={params.category}
                                />
                            ),
                        },
                        {
                            name: 'price',
                            header: 'Harga',
                            render: (item) => (
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {formatCurrency(item.price)}
                                </span>
                            ),
                        },
                        {
                            notroles: ['Manager', 'Cashier'],
                            header: 'Cabang',
                            render: (item) => (
                                <span className="text-slate-600 dark:text-slate-300">
                                    {branchLabel(item.branches ?? [])}
                                </span>
                            ),
                            footer: (
                                <FormSearch
                                    name="branch"
                                    placeholder="Filter Cabang"
                                    onChange={onParamsChange}
                                    value={params.branch}
                                />
                            ),
                        },
                        {
                            notroles: ['Manager', 'Cashier'],
                            header: 'Aksi',
                            render: (item) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link
                                        href={`/products/${item.id}/edit`}
                                        className="inline-flex items-center rounded-md border border-primary/40 px-3 py-1 text-sm text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-300 dark:hover:bg-teal-400/10"
                                    >
                                        <Edit className="mr-2 size-4" />
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedProduct(item);
                                            setIsConfirmOpen(true);
                                        }}
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
