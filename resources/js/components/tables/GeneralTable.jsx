import CheckRoles from "../../utils/CheckRoles";
import ForEachUtils from "../../Utils/ForEachUtils";

export default function GeneralTable({
    title = "",
    headers,
    items,
    columns,
    footers,
    type = "regular",
    className = "",
}) {
    return (
        <div className={className}>
            {title && (
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {title}
                </label>
            )}
            <table className="w-full mt-3">
                <thead className="bg-gray-100 dark:bg-slate-700/90">
                    <tr>
                        <ForEachUtils
                            lists={headers}
                            child={(item, index) =>
                                item.roles ? (
                                    <CheckRoles
                                        roles={item.roles}
                                        anotherValidation={
                                            item.isHidden ?? true
                                        }
                                        children={
                                            <th
                                                key={`table-header-${index}`}
                                                className={`${item.className} px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300`}
                                            >
                                                {item.label}
                                            </th>
                                        }
                                    />
                                ) : item.isHidden ? null : (
                                    <th
                                        key={`table-header-${index}`}
                                        className={`${item.className} px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300`}
                                    >
                                        {item.label}
                                    </th>
                                )
                            }
                        />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300/80 dark:divide-slate-700">
                    <ForEachUtils
                        lists={items}
                        child={(item, rowIndex) => (
                            <tr
                                key={`table-body-${rowIndex}`}
                                className="hover:bg-gray-50 dark:hover:bg-slate-700/80"
                            >
                                <ForEachUtils
                                    lists={columns}
                                    child={(column, columnIndex) =>
                                        column.roles ? (
                                            <CheckRoles
                                                roles={column.roles}
                                                anotherValidation={
                                                    column.isHidden ?? true
                                                }
                                                children={
                                                    <td
                                                        key={`table-col-${columnIndex}`}
                                                        className={`${
                                                            column.className
                                                        } ${
                                                            type == "regular"
                                                                ? " py-3"
                                                                : ""
                                                        } ${
                                                            type == "small"
                                                                ? "py-2"
                                                                : ""
                                                        } px-4 text-xs text-gray-700 md:text-sm dark:text-slate-300`}
                                                    >
                                                        {column.render(
                                                            item,
                                                            rowIndex
                                                        )}
                                                    </td>
                                                }
                                            />
                                        ) : column.isHidden ? null : (
                                            <td
                                                key={`table-col-${columnIndex}`}
                                                className={`${
                                                    column.className
                                                } ${
                                                    type == "regular"
                                                        ? " py-3"
                                                        : ""
                                                } ${
                                                    type == "small"
                                                        ? "py-2"
                                                        : ""
                                                } px-4 text-xs text-gray-700 md:text-sm dark:text-slate-300`}
                                            >
                                                {column.render(item, rowIndex)}
                                            </td>
                                        )
                                    }
                                />
                            </tr>
                        )}
                    />
                </tbody>
                {footers && (
                    <tfoot>
                        <tr>
                            <ForEachUtils
                                lists={footers}
                                child={(item, index) =>
                                    item.roles ? (
                                        <CheckRoles
                                            roles={item.roles}
                                            children={
                                                <th
                                                    key={`table-footer-${index}`}
                                                    colSpan={item.colSpan ?? 1}
                                                    className={`${item.className} px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300`}
                                                >
                                                    {item.label}
                                                </th>
                                            }
                                        />
                                    ) : item.notRoles ? (
                                        <CheckRoles
                                            notRoles={item.notRoles}
                                            children={
                                                <th
                                                    key={`table-footer-${index}`}
                                                    colSpan={item.colSpan ?? 1}
                                                    className={`${item.className} px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300`}
                                                >
                                                    {item.label}
                                                </th>
                                            }
                                        />
                                    ) : (
                                        <th
                                            key={`table-footer-${index}`}
                                            colSpan={item.colSpan ?? 1}
                                            className={`${item.className} px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300`}
                                        >
                                            {item.label}
                                        </th>
                                    )
                                }
                            />
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
