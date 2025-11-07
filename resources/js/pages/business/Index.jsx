import DataTable from "../../components/tables/Datatable";
import { useEffect, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Edit, Plus, Printer, Trash2 } from "lucide-react";
import ContentCard from "../../components/layouts/ContentCard";
import RootLayout from "../../components/layouts/RootLayout";
import ConfirmationAlert from "../../components/alerts/ConfirmationAlert";
import FormSearch from "../../components/forms/FormSearch";
import DropdownButton from "../../components/buttons/DropdownButton";
import Button from "../../components/buttons/Button";

const initialDatatableState = {
    data: [],
    from: 0,
    to: 0,
    total: 0,
    current_page: 1,
    last_page: 1,
    links: [],
};

export default function BusinessIndex() {
    const [dataTable, setDataTable] = useState(initialDatatableState);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        search: "",
        limit: 20,
        page: 1,
        sort_by: "created_at",
        sort_direction: "desc",
        name: "",
        description: "",
    });

    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const loadDatatable = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/business/datatable?${query}`);
            const data = await response.json();
            setDataTable(data);
        } catch (error) {
            console.error("Failed to load business datatable", error);
            setDataTable({ ...initialDatatableState });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDatatable();
    }, [JSON.stringify(params)]);

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

    const onParamsChange = (event) => {
        const { name, value } = event.target;
        setParams((prev) => ({
            ...prev,
            page: name === "limit" ? 1 : prev.page,
            [name]: value,
        }));
    };

    const handleSort = (columnName) => {
        setParams((prev) => {
            const isSameColumn = prev.sort_by === columnName;
            const sortDirection =
                isSameColumn && prev.sort_direction === "asc" ? "desc" : "asc";

            return {
                ...prev,
                sort_by: columnName,
                sort_direction: sortDirection,
            };
        });
    };

    const onPrint = (type) => {
        const query = new URLSearchParams(params).toString();
        const url = `/business/print/${type}?${query}`;
        window.open(url, "_blank");
    };

    const renderBusinessCard = (business) => (
        <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-primary/5 dark:border-slate-700/60 dark:bg-slate-900/70">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Bisnis
                    </p>
                    <p className="text-lg font-semibold text-slate-800 dark:text-white">
                        {business.name}
                    </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-teal-400/10 dark:text-teal-200">
                    #{business.id}
                </span>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {business.description || "Belum ada deskripsi"}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
                <Link
                    href={`/business/${business.id}/edit`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-200 dark:hover:bg-teal-400/10"
                >
                    <Edit className="size-4" />
                    Edit
                </Link>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedItem(business);
                        setOpenConfirm(true);
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/20"
                >
                    <Trash2 className="size-4" />
                    Hapus
                </button>
            </div>
        </div>
    );

    return (
        <RootLayout title="Data Master Bisnis">
            <ConfirmationAlert
                isOpen={openConfirm}
                setOpenModalStatus={setOpenConfirm}
                title="Konfirmasi Hapus"
                message={`Hapus data ${selectedItem?.name ?? ""}? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    if (selectedItem?.id) {
                        router.delete(`/business/${selectedItem.id}/delete`, {
                            preserveScroll: true,
                            onSuccess: () => loadDatatable(),
                            onFinish: () => setSelectedItem(null),
                        });
                    }
                }}
            />
            <ContentCard
                title="Data Master Bisnis"
                additionalButton={
                    <Button
                        className="w-full"
                        label="Tambah Data Bisnis"
                        href="/business/create"
                        icon={<Plus className="size-4" />}
                    />
                }
            >
                <DataTable
                    onChangePage={onChangePage}
                    onParamsChange={onParamsChange}
                    limit={params.limit}
                    dataTable={dataTable}
                    cardItem={renderBusinessCard}
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                    onHeaderClick={handleSort}
                    isLoading={isLoading}
                    additionalHeaderElements={
                        <DropdownButton
                            icon={
                                <Printer className="text-gray-700 dark:text-gray-300 size-4" />
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
                            header: "Nama Bisnis",
                            render: (item) => item.name,
                            footer: (
                                <FormSearch
                                    name="name"
                                    onChange={onParamsChange}
                                    placeholder="Filter Nama Bisnis"
                                />
                            ),
                        },
                        {
                            name: "description",
                            header: "Deskripsi",
                            render: (item) => item.description || "-",
                            footer: (
                                <FormSearch
                                    name="description"
                                    onChange={onParamsChange}
                                    placeholder="Filter Deskripsi"
                                />
                            ),
                        },
                        {
                            header: "Aksi",
                            render: (item) => (
                                <div className="flex items-center justify-end gap-3">
                                    <Link
                                        href={`/business/${item.id}/edit`}
                                        className="inline-flex items-center rounded-md border border-primary/40 px-3 py-1 text-sm text-primary transition hover:bg-primary hover:text-white dark:border-teal-400/40 dark:text-teal-300 dark:hover:bg-teal-400/10"
                                    >
                                        <Edit className="mr-2 size-4" />
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setOpenConfirm(true);
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
