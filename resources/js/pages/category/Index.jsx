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
import {
    CATEGORY_ICON_LABEL_MAP,
    CATEGORY_ICON_MAP,
} from '../../constants/categoryIcons';
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

export default function CategoryIndex() {
    const [dataTable, setDataTable] = useState(initialDatatableState);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        search: '',
        limit: 20,
        page: 1,
        sort_by: 'created_at',
        sort_direction: 'desc',
        name: '',
        branch: '',
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const onPrint = (type) => {
        const query = new URLSearchParams(params).toString();
        const url = `/categories/print/${type}?${query}`;
        window.open(url, '_blank');
    };

    const loadDatatable = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/categories/datatable?${query}`);
            const data = await response.json();
            setDataTable(data);
        } catch (error) {
            console.error('Failed to load category datatable', error);
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

    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setIsConfirmOpen(true);
    };

    const branchLabel = (branches) =>
        branches && branches.length > 0
            ? branches.map((branch) => branch.name).join(', ')
            : '-';

    const renderCategoryCard = (category) => {
        const iconName = category.icon ?? null;
        const IconComponent = iconName && CATEGORY_ICON_MAP[iconName];
        const branches = category.branches ?? [];

        return (
            <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-primary/5 dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="flex items-center gap-4">
                    {IconComponent ? (
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 text-primary dark:border-teal-400/40 dark:bg-teal-400/5 dark:text-teal-200">
                            <IconComponent className="h-6 w-6" />
                        </span>
                    ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-600 dark:text-slate-500">
                            Tidak ada ikon
                        </span>
                    )}
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
                            Kategori
                        </p>
                        <p className="text-lg font-semibold text-slate-800 dark:text-white">
                            {category.name}
                        </p>
                        {iconName && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {CATEGORY_ICON_LABEL_MAP[iconName] ?? 'Ikon'}
                            </p>
                        )}
                    </div>
                </div>

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
                            Belum ada cabang terkait.
                        </p>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href={`/categories/${category.id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-200 dark:hover:bg-teal-400/10"
                    >
                        <Edit className="size-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => openDeleteModal(category)}
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
        <RootLayout title="Data Kategori">
            <ConfirmationAlert
                isOpen={isConfirmOpen}
                setOpenModalStatus={setIsConfirmOpen}
                title="Konfirmasi Hapus"
                message={`Hapus kategori ${selectedCategory?.name ?? ''}? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    if (selectedCategory?.id) {
                        router.delete(`/categories/${selectedCategory.id}`, {
                            preserveScroll: true,
                            onSuccess: () => loadDatatable(),
                            onFinish: () => setSelectedCategory(null),
                        });
                    }
                }}
            />

            <ContentCard
                title="Data Kategori"
                additionalButton={
                    <CheckRoles
                        roles={['Businessman', 'BusinessOwner']}
                        children={
                            <Button
                                className="w-full"
                                label="Tambah Kategori"
                                href="/categories/create"
                                icon={<Plus className="size-4" />}
                            />
                        }
                    />
                }
            >
                <DataTable
                    dataTable={dataTable}
                    cardItem={renderCategoryCard}
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
                            header: 'Ikon',
                            headerClassName: 'w-24',
                            bodyClassname: 'w-24',
                            render: (item) => {
                                const iconName = item.icon ?? null;
                                const IconComponent =
                                    iconName && CATEGORY_ICON_MAP[iconName];
                                return IconComponent ? (
                                    <span
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-teal-200"
                                        title={
                                            CATEGORY_ICON_LABEL_MAP[iconName] ??
                                            'Ikon kategori'
                                        }
                                    >
                                        <IconComponent className="h-5 w-5" />
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        -
                                    </span>
                                );
                            },
                        },
                        {
                            name: 'name',
                            header: 'Nama Kategori',
                            render: (item) => item.name,
                            footer: (
                                <FormSearch
                                    name="name"
                                    placeholder="Filter Nama Kategori"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            roles: ['Businessman', 'BusinessOwner'],
                            header: 'Cabang',
                            name: null,
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
                                />
                            ),
                        },
                        {
                            roles: ['Businessman', 'BusinessOwner'],
                            header: 'Aksi',
                            render: (item) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link
                                        href={`/categories/${item.id}/edit`}
                                        className="inline-flex items-center rounded-md border border-primary/40 px-3 py-1 text-sm text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-300 dark:hover:bg-teal-400/10"
                                    >
                                        <Edit className="mr-2 size-4" />
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
                    onParamsChange={onParamsChange}
                    onChangePage={onChangePage}
                    limit={params.limit}
                    isLoading={isLoading}
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                    onHeaderClick={handleSort}
                />
            </ContentCard>
        </RootLayout>
    );
}
