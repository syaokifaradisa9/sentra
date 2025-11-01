import useMediaQuery from "../../Helpers/mediaquery.js";
import DatatableFooter from "./Datatable/DatatableFooter.jsx";
import DatatableHeader from "./Datatable/DatatableHeader.jsx";
import DatatableMobileBody from "./Datatable/DatatableMobileBody.jsx";
import DatatableDesktopBody from "./Datatable/DatatableDesktopBody.jsx";

export default function DataTable({
    dataTable,
    columns,
    expandable,
    onParamsChange,
    onChangePage,
    additionalHeaderElements,
    cardItem,
    limit,
    isLoading = false,
    searchValue = "",
    onSearchChange,
    sortBy = "created_at",
    sortDirection = "desc",
    onHeaderClick, // New prop for handling header clicks
}) {
    const isMediumScreen = useMediaQuery("(min-width: 768px)");

    return (
        <div className="flex flex-col h-full">
            <DatatableHeader
                additionalHeaderElements={additionalHeaderElements}
                limit={limit}
                onParamsChange={onParamsChange}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
            />
            <div className="relative flex-grow mt-6">
                <div className="overflow-x-auto">
                    {isMediumScreen || !cardItem ? (
                        <DatatableDesktopBody
                            columns={columns}
                            dataTable={dataTable}
                            expandable={expandable}
                            isLoading={isLoading}
                            limit={limit}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            onParamsChange={onParamsChange}
                            onHeaderClick={onHeaderClick}
                        />
                    ) : (
                        <DatatableMobileBody
                            dataTable={dataTable}
                            cardItem={cardItem}
                        />
                    )}
                </div>
            </div>
            <DatatableFooter
                dataTable={dataTable}
                onChangePage={onChangePage}
            />
        </div>
    );
}
