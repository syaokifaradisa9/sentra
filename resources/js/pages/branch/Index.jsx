import { useEffect, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Building2, Edit, MapPin, Plus, Printer, Trash2, Watch } from "lucide-react";
import RootLayout from "../../components/layouts/RootLayout";
import ContentCard from "../../components/layouts/ContentCard";
import Button from "../../components/buttons/Button";
import DropdownButton from "../../components/buttons/DropdownButton";
import ConfirmationAlert from "../../components/alerts/ConfirmationAlert";
import DataTable from "../../components/tables/Datatable";
import FormSearch from "../../components/forms/FormSearch";

const initialDatatableState = {
    data: [],
    from: 0,
    to: 0,
    total: 0,
    current_page: 1,
    last_page: 1,
    links: [],
};

export default function BranchIndex() {
    const [dataTable, setDataTable] = useState(initialDatatableState);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        search: "",
        limit: 20,
        page: 1,
        sort_by: "created_at",
        sort_direction: "desc",
        name: "",
        address: "",
        business: "",
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const loadDatatable = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/branches/datatable?${query}`);
            const data = await response.json();
            setDataTable(data);
        } catch (error) {
            console.error("Failed to load branch datatable", error);
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
            page: name === "limit" ? 1 : prev.page,
            [name]: value,
        }));
    };

    const onChangePage = (event) => {
        event.preventDefault();
        try {
            const url = new URL(event.target.href);
            const page = url.searchParams.get("page") ?? "1";
            setParams((prev) => ({
                ...prev,
                page: Number(page),
            }));
        } catch (error) {
            console.error("Failed to change page", error);
        }
    };

    const handleSort = (columnName) => {
        setParams((prev) => {
            const isSameColumn = prev.sort_by === columnName;
            const sortDirection = isSameColumn && prev.sort_direction === "asc" ? "desc" : "asc";

            return {
                ...prev,
                sort_by: columnName,
                sort_direction: sortDirection,
            };
        });
    };

    const openDeleteModal = (branch) => {
        setSelectedBranch(branch);
        setIsConfirmOpen(true);
    };

    const onPrint = (type) => {
        const query = new URLSearchParams(params).toString();
        const url = `/branches/print/${type}?${query}`;
        window.open(url, "_blank");
    };

    const formatTime = (time) => {
        if (!time) {
            return null;
        }

        const timeString = time.toString();
        return `${timeString.slice(0, 5)} WIB`;
    };

    return (
        <RootLayout title="Data Cabang">
            <ConfirmationAlert
                isOpen={isConfirmOpen}
                setOpenModalStatus={setIsConfirmOpen}
                title="Konfirmasi Hapus"
                message={`Hapus cabang ${selectedBranch?.name ?? ""}? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    if (selectedBranch?.id) {
                        router.delete(`/branches/${selectedBranch.id}`, {
                            preserveScroll: true,
                            onSuccess: () => loadDatatable(),
                            onFinish: () => setSelectedBranch(null),
                        });
                    }
                }}
            />

            <ContentCard
                title="Data Cabang"
                additionalButton={
                    <Button
                        className="w-full"
                        label="Tambah Cabang"
                        href="/branches/create"
                        icon={<Plus className="size-4" />}
                    />
                }
            >
                <DataTable
                    dataTable={dataTable}
                    additionalHeaderElements={
                        <DropdownButton
                            icon={
                                <Printer className="size-4 text-gray-700 dark:text-gray-300" />
                            }
                            items={[
                                {
                                    label: "PDF",
                                    onClick: () => onPrint("pdf"),
                                },
                                {
                                    label: "Excel",
                                    onClick: () => onPrint("excel"),
                                },
                            ]}
                        />
                    }
                    columns={[
                        {
                            name: "name",
                            header: "Nama",
                            render: (item) => item.name,
                            footer: (
                                <FormSearch
                                    name="name"
                                    placeholder="Filter Nama Cabang"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: null,
                            header: "Bisnis",
                            render: (item) => (
                                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Building2 className="size-4 text-gray-400 dark:text-slate-500" />
                                    {item.business?.name ?? "-"}
                                </span>
                            ),
                            footer: (
                                <FormSearch
                                    name="business"
                                    placeholder="Filter Bisnis"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: "address",
                            header: "Alamat",
                            render: (item) => (
                                <span className="inline-flex items-start gap-2 text-slate-600 dark:text-slate-300">
                                    <MapPin className="mt-0.5 size-4 text-gray-400 dark:text-slate-500" />
                                    <span>{item.address}</span>
                                </span>
                            ),
                            footer: (
                                <FormSearch
                                    name="address"
                                    placeholder="Filter Alamat"
                                    onChange={onParamsChange}
                                />
                            ),
                        },
                        {
                            name: "opening_time",
                            header: "Jam Operasional",
                            render: (item) => {
                                const opening = formatTime(item.opening_time);
                                const closing = formatTime(item.closing_time);
                                const label = !opening && !closing
                                    ? "-"
                                    : `${opening ?? "-"} - ${closing ?? "-"}`;

                                return (
                                    <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Watch className="size-4 text-gray-400 dark:text-slate-500" />
                                        {label}
                                    </span>
                                );
                            },
                        },
                        {
                            header: "Aksi",
                            render: (item) => (
                                <div className="flex items-center gap-3 justify-end">
                                    <Link
                                        href={`/branches/${item.id}/edit`}
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
