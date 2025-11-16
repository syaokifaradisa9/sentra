import { Link, router } from '@inertiajs/react';
import {
    Edit,
    Mail,
    MapPin,
    Phone,
    Plus,
    Printer,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmationAlert from '../../components/alerts/ConfirmationAlert';
import Button from '../../components/buttons/Button';
import DropdownButton from '../../components/buttons/DropdownButton';
import FormSearch from '../../components/forms/FormSearch';
import ContentCard from '../../components/layouts/ContentCard';
import RootLayout from '../../components/layouts/RootLayout';
import DataTable from '../../components/tables/Datatable';

const initialDatatableState = {
    data: [],
    from: 0,
    to: 0,
    total: 0,
    current_page: 1,
    last_page: 1,
    links: [],
};

export default function EmployeeIndex() {
    const [dataTable, setDataTable] = useState(initialDatatableState);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        search: '',
        limit: 20,
        page: 1,
        sort_by: 'created_at',
        sort_direction: 'desc',
        name: '',
        email: '',
        phone: '',
        position: '',
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const loadDatatable = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/employees/datatable?${query}`);
            const data = await response.json();
            setDataTable(data);
        } catch (error) {
            console.error('Failed to load employee datatable', error);
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

    const openDeleteModal = (employee) => {
        setSelectedEmployee(employee);
        setIsConfirmOpen(true);
    };

    const onPrint = (type) => {
        const query = new URLSearchParams(params).toString();
        const url = `/employees/print/${type}?${query}`;
        window.open(url, '_blank');
    };

    const branchLabel = (branches) =>
        branches && branches.length > 0
            ? branches.map((branch) => branch.name).join(', ')
            : '-';

    const renderEmployeeCard = (employee) => {
        const branches = employee.branches ?? [];
        const initial = (employee.name ?? '?').charAt(0).toUpperCase();

        return (
            <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-primary/5 dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary dark:bg-teal-400/10 dark:text-teal-200">
                        {initial}
                    </span>
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
                            Karyawan
                        </p>
                        <p className="text-lg font-semibold text-slate-800 dark:text-white">
                            {employee.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {employee.position || 'Belum ada jabatan'}
                        </p>
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                        <Mail className="size-4 text-slate-400 dark:text-slate-500" />
                        <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="size-4 text-slate-400 dark:text-slate-500" />
                        <span>{employee.phone || 'Belum ada telepon'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 text-slate-400 dark:text-slate-500" />
                        <span>{branchLabel(branches)}</span>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href={`/employees/${employee.id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-200 dark:hover:bg-teal-400/10"
                    >
                        <Edit className="size-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => openDeleteModal(employee)}
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
        <RootLayout title="Data Karyawan">
            <ConfirmationAlert
                isOpen={isConfirmOpen}
                setOpenModalStatus={setIsConfirmOpen}
                title="Konfirmasi Hapus"
                message={`Hapus karyawan ${selectedEmployee?.name ?? ''}? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    if (selectedEmployee?.id) {
                        router.delete(`/employees/${selectedEmployee.id}`, {
                            preserveScroll: true,
                            onSuccess: () => loadDatatable(),
                            onFinish: () => setSelectedEmployee(null),
                        });
                    }
                }}
            />

            <ContentCard
                title="Data Karyawan"
                additionalButton={
                    <Button
                        className="w-full"
                        label="Tambah Karyawan"
                        href="/employees/create"
                        icon={<Plus className="size-4" />}
                    />
                }
            >
                <DataTable
                    dataTable={dataTable}
                    cardItem={renderEmployeeCard}
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
                            header: 'Nama',
                            render: (item) => (
                                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <User className="size-4 text-gray-400 dark:text-slate-500" />
                                    {item.name}
                                </span>
                            ),
                            footer: (
                                <FormSearch
                                    name="name"
                                    placeholder="Filter Nama Karyawan"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: 'email',
                            header: 'Email',
                            render: (item) => (
                                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Mail className="size-4 text-gray-400 dark:text-slate-500" />
                                    {item.email}
                                </span>
                            ),
                            footer: (
                                <FormSearch
                                    name="email"
                                    placeholder="Filter Email"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: 'phone',
                            header: 'Telepon',
                            render: (item) => (
                                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Phone className="size-4 text-gray-400 dark:text-slate-500" />
                                    {item.phone || '-'}
                                </span>
                            ),
                            footer: (
                                <FormSearch
                                    name="phone"
                                    placeholder="Filter Telepon"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: 'position',
                            header: 'Jabatan',
                            render: (item) => item.position || '-',
                            footer: (
                                <FormSearch
                                    name="position"
                                    placeholder="Filter Jabatan"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: null,
                            roles: ['Businessman', 'BusinessOwner'],
                            header: 'Cabang',
                            render: (item) => (
                                <span className="inline-flex items-start gap-2 text-slate-600 dark:text-slate-300">
                                    <MapPin className="size-4 text-gray-400 dark:text-slate-500" />
                                    <span>
                                        {branchLabel(item.branches ?? [])}
                                    </span>
                                </span>
                            ),
                        },
                        {
                            header: 'Aksi',
                            render: (item) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link
                                        href={`/employees/${item.id}/edit`}
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
                    searchValue={params.search}
                    onSearchChange={onParamsChange}
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
