import DataTable from '../../components/tables/Datatable';
import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { Edit, Plus, Printer, Trash2 } from "lucide-react";
import { router } from "@inertiajs/react";
import ContentCard from '../../components/layouts/ContentCard';
import RootLayout from '../../components/layouts/RootLayout';
import ConfirmationAlert from '../../components/alerts/ConfirmationAlert';
import FormSearch from '../../components/forms/FormSearch';
import DropdownButton from '../../components/buttons/DropdownButton';
import Button from '../../components/buttons/Button';
import Tooltip from '../../components/common/Tooltip';

export default function BusinessIndex() {
    const [dataTable, setDataTable] = useState([]);
    const [params, setParams] = useState({
        search: "",
        limit: 20,
        page: 1,
        sort_by: "created_at",
        sort_direction: "desc",
    });

    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    async function loadDatatable() {
        let url = `/business/datatable`;
        let paramsKey = Object.keys(params);
        for (let i = 0; i < paramsKey.length; i++) {
            if (i == 0) {
                url += `?${paramsKey[i]}=${params[paramsKey[i]]}`;
            } else {
                url += `&${paramsKey[i]}=${params[paramsKey[i]]}`;
            }
        }

        let response = await fetch(url);
        let data = await response.json();

        setDataTable(data);
    }

    useEffect(() => {
        loadDatatable();
    }, [params]);

    function onChangePage(e) {
        e.preventDefault();

        let page = e.target.href.split("page=")[1];
        page = page.split("&")[0];

        setParams({
            ...params,
            page: page,
        });
    }

    function onParamsChange(e) {
        e.preventDefault();

        setParams({
            ...params,
            [e.target.name]: e.target.value,
        });
    }

    function onPrint(e, type) {
        let url = `${window.location.href}/print/${type}`;
        let paramsKey = Object.keys(params);
        for (let i = 0; i < paramsKey.length; i++) {
            if (i == 0) {
                url += `?${paramsKey[i]}=${params[paramsKey[i]]}`;
            } else {
                url += `&${paramsKey[i]}=${params[paramsKey[i]]}`;
            }
        }

        window.open(url, "_blank");
    }

    return (
        <RootLayout title="Data Master Bisnis">
            <ConfirmationAlert
                isOpen={openConfirm}
                setOpenModalStatus={setOpenConfirm}
                title="Konfirmasi Hapus"
                message={`Hapus data ${selectedItem?.name}? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    if (selectedItem?.id) {
                        router.delete(
                            `/business/${selectedItem.id}/delete`,
                            {
                                onSuccess: () => {
                                    loadDatatable();
                                }
                            }
                        );
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
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                    onHeaderClick={(columnName) => {
                        // Toggle sort direction if clicking the same column, otherwise default to asc
                        const newSortDirection = params.sort_by === columnName && params.sort_direction === 'asc' ? 'desc' : 'asc';
                        
                        // Update params state
                        setParams(prevParams => ({
                            ...prevParams,
                            sort_by: columnName,
                            sort_direction: newSortDirection,
                        }));
                    }}
                    additionalHeaderElements={
                        <>
                            <DropdownButton
                                icon={
                                    <Printer className="text-gray-700 dark:text-gray-300 size-4" />
                                }
                                items={[
                                    {
                                        label: "PDF",
                                        onClick: (e) => {
                                            onPrint(e, "pdf");
                                        },
                                    },
                                    {
                                        label: "Excel",
                                        onClick: (e) => {
                                            onPrint(e, "excel");
                                        },
                                    },
                                ]}
                            />
                        </>
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
                            render: (item) => item.description || '-',
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
                                <div className="flex items-center gap-3">
                                    <Tooltip text="Edit">
                                        <Link
                                            href={`/business/${item.id}/edit`}
                                            className="inline-flex items-center"
                                        >
                                            <Edit className="text-blue-500 dark:text-blue-400/90 size-4" />
                                        </Link>
                                    </Tooltip>
                                    <Tooltip text="Hapus">
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setOpenConfirm(true);
                                            }}
                                            className="inline-flex items-center"
                                        >
                                            <Trash2 className="text-red-500 dark:text-red-400/90 size-4" />
                                        </button>
                                    </Tooltip>
                                </div>
                            ),
                        },
                    ]}
                />
            </ContentCard>
        </RootLayout>
    );
}
