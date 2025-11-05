import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Building2,
    Download,
    Eye,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import RootLayout from '../../components/layouts/RootLayout';
import Button from '../../components/buttons/Button';
import FormInput from '../../components/forms/FormInput';

const headers = [
    { key: 'name', label: 'Nama', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Telepon', sortable: true },
    { key: 'position', label: 'Jabatan', sortable: true },
    { key: 'branches', label: 'Cabang', sortable: false },
    { key: 'actions', label: 'Aksi', sortable: false },
];

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
    const { auth } = usePage().props;
    const [dataTable, setDataTable] = useState(initialDatatableState);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        search: '',
        limit: 20,
        page: 1,
        sort_by: 'created_at',
        sort_direction: 'desc',
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const onPrint = (type) => {
        const query = new URLSearchParams(params).toString();
        const url = `/employees/print/${type}?${query}`;
        window.open(url, '_blank');
    };

    const loadDatatable = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/employees/datatable?${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Inertia': 'true',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDataTable({
                    data: data.data || [],
                    from: data.from || 0,
                    to: data.to || 0,
                    total: data.total || 0,
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                    links: data.links || [],
                });
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDatatable();
    }, [params]);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
            router.delete(`/employees/${id}`, {
                onSuccess: () => {
                    loadDatatable();
                },
            });
        }
    };

    const handleSearch = (search) => {
        setParams(prev => ({
            ...prev,
            search: search,
            page: 1
        }));
    };

    const handleSort = (column) => {
        setParams(prev => ({
            ...prev,
            sort_by: column,
            sort_direction: prev.sort_direction === 'asc' ? 'desc' : 'asc',
            page: 1
        }));
    };

    const handlePageChange = (page) => {
        setParams(prev => ({
            ...prev,
            page: page
        }));
    };

    return (
        <RootLayout title="Data Karyawan">
            <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm dark:bg-slate-900/80 dark:ring-slate-700">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            Data Karyawan
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Kelola data karyawan di sistem
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPrint('pdf')}
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                PDF
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPrint('excel')}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Excel
                            </Button>
                        </div>
                        <Button
                            onClick={() => router.get('/employees/create')}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Karyawan
                        </Button>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-3">
                    <div className="w-full sm:w-64">
                        <FormInput
                            name="search"
                            placeholder="Cari karyawan..."
                            value={params.search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full">
                        <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <tr>
                                {headers.map((header) => (
                                    <th
                                        key={header.key}
                                        className="px-4 py-3 text-left"
                                    >
                                        {header.sortable ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSort(header.key)
                                                }
                                                className="flex items-center gap-1"
                                            >
                                                {header.label}
                                            </button>
                                        ) : (
                                            header.label
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-sm text-slate-700 dark:divide-slate-700 dark:text-slate-300">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="px-4 py-8 text-center text-slate-500"
                                    >
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : dataTable.data.length > 0 ? (
                                dataTable.data.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className="px-4 py-3">
                                            {employee.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {employee.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            {employee.phone}
                                        </td>
                                        <td className="px-4 py-3">
                                            {employee.position}
                                        </td>
                                        <td className="px-4 py-3">
                                            {employee.branches?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {employee.branches.map(
                                                        (branch) => (
                                                            <span
                                                                key={branch.id}
                                                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-teal-400/20 dark:text-teal-300"
                                                            >
                                                                <Building2 className="h-3 w-3" />
                                                                {branch.name}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    Tidak ada cabang
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.get(
                                                            `/employees/${employee.id}/edit`
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-teal-300"
                                                    title="Edit karyawan"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            employee.id
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-400/10 dark:hover:text-red-400"
                                                    title="Hapus karyawan"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        Tidak ada data karyawan ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {dataTable.last_page > 1 && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                            Menampilkan{' '}
                            <span className="font-semibold">
                                {dataTable.from}
                            </span>{' '}
                            hingga{' '}
                            <span className="font-semibold">
                                {dataTable.to}
                            </span>{' '}
                            dari{' '}
                            <span className="font-semibold">
                                {dataTable.total}
                            </span>{' '}
                            entri
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {dataTable.current_page > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePageChange(dataTable.current_page - 1)
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Sebelumnya
                                </button>
                            )}
                            <div className="flex gap-1">
                                {Array.from(
                                    { length: Math.min(5, dataTable.last_page) },
                                    (_, i) => {
                                        const page = Math.max(
                                            1,
                                            Math.min(
                                                dataTable.current_page - 2,
                                                dataTable.last_page - 4
                                            ) + i
                                        );
                                        if (page > dataTable.last_page) return null;
                                        
                                        return (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                                    dataTable.current_page === page
                                                        ? 'bg-primary text-white'
                                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                            {dataTable.current_page < dataTable.last_page && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePageChange(dataTable.current_page + 1)
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Berikutnya
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </RootLayout>
    );
}