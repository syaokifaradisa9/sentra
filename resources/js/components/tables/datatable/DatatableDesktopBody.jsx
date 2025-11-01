import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import React from "react";
import CheckRoles from "../../../utils/CheckRoles";
import { useState } from "react";

export default function DatatableDesktopBody({
    expandable,
    dataTable,
    columns,
    isLoading = false,
    limit = 10,
    sortBy = "created_at",
    sortDirection = "desc",
    onParamsChange,
    onHeaderClick,
}) {
    const [expandedRows, setExpandedRows] = useState([]);

    function toggleRow(index) {
        setExpandedRows((prev) => {
            const currentIndex = prev.indexOf(index);
            if (currentIndex >= 0) {
                return prev.filter((i) => i !== index);
            }
            return [...prev, index];
        });
    }

    function toggleAllRow() {
        setExpandedRows((prev) =>
            prev.length
                ? []
                : Array.from(
                      { length: dataTable?.data?.length || 0 },
                      (_, i) => i
                  )
        );
    }

    function renderHeader(column, index) {
        const isSortable = column.name && (onHeaderClick || onParamsChange);
        const isCurrentSort = sortBy === column.name;
        
        const handleSort = () => {
            if (isSortable) {
                if (onHeaderClick) {
                    // Use the new onHeaderClick prop if available
                    onHeaderClick(column.name);
                } else {
                    // Fallback to the old method
                    onParamsChange({
                        target: {
                            name: 'sort_by',
                            value: column.name
                        }
                    });
                }
            }
        };
        
        return (
            <th
                key={`th-${index}`}
                className={`px-4 py-3 font-medium text-left text-slate-700 dark:text-slate-200 ${
                    isSortable ? "cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" : ""
                } ${column.headerClassName || ""}`}
                onClick={isSortable ? handleSort : undefined}
            >
                <div className="flex items-center">
                    <span>{column.header}</span>
                    {isCurrentSort && (
                        <span className="ml-2">
                            {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                    )}
                </div>
            </th>
        );
    }

    function renderColumn(column, item, rowIndex, colIndex) {
        return (
            <td
                key={`col-${item.id}-${colIndex}`}
                width={column.width ?? "auto"}
                className={`px-4 py-3 text-slate-600 dark:text-slate-300 align-middle ${
                    column.bodyClassname ?? ""
                }`}
            >
                {column.render(item)}
            </td>
        );
    }

    function renderSkeletonColumn(column, colIndex) {
        return (
            <td
                key={`skeleton-col-${colIndex}`}
                width={column.width ?? "auto"}
                className={`px-4 py-3 text-slate-600 dark:text-slate-300 ${
                    column.bodyClassname ?? ""
                }`}
            >
                <div
                    className="h-5 bg-gray-200 rounded dark:bg-gray-600 animate-pulse"
                    style={{ width: `${Math.floor(Math.random() * 50) + 30}%` }}
                ></div>
            </td>
        );
    }

    function renderFooter(column, index) {
        return column.footer ? (
            <td
                key={`footer-${index}`}
                className={`px-4 py-2 text-slate-700 dark:text-slate-200 ${
                    column.footerClassName ?? ""
                }`}
            >
                {typeof column.footer === "function"
                    ? column.footer(dataTable?.data || [])
                    : column.footer}
            </td>
        ) : (
            <td key={`footer-${index}`} />
        );
    }

    const hasFooter = columns.some((column) => column.footer);

    // Generate skeleton rows
    const renderSkeletonRows = () => {
        const rowCount = limit;
        return Array(rowCount)
            .fill(0)
            .map((_, rowIndex) => (
                <tr
                    key={`skeleton-row-${rowIndex}`}
                    className="bg-white hover:bg-gray-50 dark:bg-slate-800/20 dark:hover:bg-slate-700/20"
                >
                    {expandable && (
                        <td className="w-10 px-4">
                            <div className="p-1 rounded-lg">
                                <div className="bg-gray-200 rounded size-4 dark:bg-gray-600 animate-pulse"></div>
                            </div>
                        </td>
                    )}
                    {columns.map((column, colIndex) =>
                        column.roles ? (
                            <CheckRoles
                                key={`skeleton-col-role-${rowIndex}-${colIndex}`}
                                roles={column.roles}
                                children={renderSkeletonColumn(
                                    column,
                                    colIndex
                                )}
                            />
                        ) : (
                            renderSkeletonColumn(column, colIndex)
                        )
                    )}
                </tr>
            ));
    };

    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-gray-300 bg-gray-50 dark:border-slate-600/50 dark:bg-slate-700/30">
                    {expandable && (
                        <th className="w-10 px-4 py-3">
                            <button
                                onClick={toggleAllRow}
                                className="p-1 transition-colors rounded-lg text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600/50"
                                disabled={isLoading}
                            >
                                {expandedRows.length ? (
                                    <ChevronUp className="size-4" />
                                ) : (
                                    <ChevronRight className="size-4" />
                                )}
                            </button>
                        </th>
                    )}
                    {columns.map((column, index) =>
                        column.roles ? (
                            <CheckRoles
                                key={`header-role-${index}`}
                                roles={column.roles}
                                children={renderHeader(column, index)}
                            />
                        ) : column.notroles ? (
                            <CheckRoles
                                key={`header-notrole-${index}`}
                                notRoles={column.notroles}
                                children={renderHeader(column, index)}
                            />
                        ) : (
                            <React.Fragment key={`header-${index}`}>
                                {renderHeader(column, index)}
                            </React.Fragment>
                        )
                    )}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-slate-600/50">
                {isLoading ? (
                    renderSkeletonRows()
                ) : dataTable?.data?.length ? (
                    dataTable.data.map((item, rowIndex) => (
                        <React.Fragment key={`row-${item.id}-${rowIndex}`}>
                            <tr
                                className="bg-white hover:bg-gray-50 dark:bg-slate-800/20 dark:hover:bg-slate-700/20"
                            >
                                {expandable && (
                                    <td className="w-10 px-4">
                                        <button
                                            onClick={() => toggleRow(rowIndex)}
                                            className="p-1 transition-colors rounded-lg text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600/50"
                                        >
                                            {expandedRows.includes(rowIndex) ? (
                                                <ChevronDown className="size-4" />
                                            ) : (
                                                <ChevronRight className="size-4" />
                                            )}
                                        </button>
                                    </td>
                                )}
                                {columns.map((column, colIndex) =>
                                    column.roles ? (
                                        <CheckRoles
                                            key={`col-role-${item.id}-${colIndex}`}
                                            roles={column.roles}
                                            children={renderColumn(
                                                column,
                                                item,
                                                rowIndex,
                                                colIndex
                                            )}
                                        />
                                    ) : column.notroles ? (
                                        <CheckRoles
                                            key={`col-role-${item.id}-${colIndex}`}
                                            notRoles={column.notroles}
                                            children={renderColumn(
                                                column,
                                                item,
                                                rowIndex,
                                                colIndex
                                            )}
                                        />
                                    ) : (
                                        renderColumn(
                                            column,
                                            item,
                                            rowIndex,
                                            colIndex
                                        )
                                    )
                                )}
                            </tr>
                            {expandable && expandedRows.includes(rowIndex) && (
                                <tr
                                    key={`expanded-row-${item.id}-${rowIndex}-expanded`}
                                    className="border-t border-gray-100 dark:border-slate-600/50"
                                >
                                    <td
                                        colSpan={columns.length + 1}
                                        className="px-4 border-l-2 border-primary bg-gray-50 dark:bg-slate-700/20"
                                    >
                                        {expandable(item)}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={columns.length + (expandable ? 1 : 0)}
                            className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                        >
                            Data Masih Kosong
                        </td>
                    </tr>
                )}
            </tbody>
            {hasFooter && (
                <tfoot className="border-t border-gray-300 bg-gray-50 dark:border-slate-600/50 dark:bg-slate-700/30">
                    <tr>
                        {expandable && <td className="w-10 px-4" />}
                        {columns.map((column, index) =>
                            column.roles ? (
                                <CheckRoles
                                    key={`footer-role-${index}`}
                                    roles={column.roles}
                                    children={renderFooter(column, index)}
                                />
                            ) : (
                                renderFooter(column, index)
                            )
                        )}
                    </tr>
                </tfoot>
            )}
        </table>
    );
}
