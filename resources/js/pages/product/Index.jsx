import { useEffect, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Edit, Plus, Trash2 } from "lucide-react";
import RootLayout from "../../components/layouts/RootLayout";
import ContentCard from "../../components/layouts/ContentCard";
import Button from "../../components/buttons/Button";
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

export default function ProductIndex() {
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
        category: "",
        branch: "",
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
            console.error("Failed to load product datatable", error);
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
            const sortDirection =
                isSameColumn && prev.sort_direction === "asc" ? "desc" : "asc";

            return {
                ...prev,
                sort_by: columnName,
                sort_direction: sortDirection,
            };
        });
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) {
            return "-";
        }

        const number = Number(value);
        if (Number.isNaN(number)) {
            return value;
        }

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(number);
    };

    const branchLabel = (branches) =>
        branches && branches.length > 0
            ? branches.map((branch) => branch.name).join(", ")
            : "-";

    return (
        <RootLayout title="Data Produk">
            <ConfirmationAlert
                isOpen={isConfirmOpen}
                setOpenModalStatus={setIsConfirmOpen}
                title="Konfirmasi Hapus"
                message={`Hapus produk ${selectedProduct?.name ?? ""}? Tindakan ini tidak dapat dibatalkan.`}
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
                    <Button
                        className="w-full"
                        label="Tambah Produk"
                        href="/products/create"
                        icon={<Plus className="size-4" />}
                    />
                }
            >
                <DataTable
                    dataTable={dataTable}
                    isLoading={isLoading}
                    onChangePage={onChangePage}
                    onParamsChange={onParamsChange}
                    searchValue={params.search}
                    onSearchChange={onParamsChange}
                    limit={params.limit}
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                    onHeaderClick={handleSort}
                    columns={[
                        {
                            name: "name",
                            header: "Nama Produk",
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
                            header: "Kategori",
                            render: (item) => item.category?.name ?? "-",
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
                            name: "price",
                            header: "Harga",
                            render: (item) => (
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {formatCurrency(item.price)}
                                </span>
                            ),
                        },
                        {
                            header: "Cabang",
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
                            header: "Aksi",
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
