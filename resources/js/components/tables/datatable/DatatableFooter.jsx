import { Link } from "@inertiajs/react";

export default function DatatableFooter({ dataTable, onChangePage }) {
    return (
        <div className="flex flex-col items-center justify-between gap-4 mt-4 md:flex-row">
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Menampilkan{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100">
                    {dataTable.from} - {dataTable.to}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100">
                    {dataTable.total}
                </span>{" "}
                Data
            </p>

            <nav
                className="flex -space-x-px overflow-hidden border border-gray-300 rounded-lg dark:border-slate-500/30"
                aria-label="Pagination"
            >
                {dataTable.links?.map((link, index, array) => {
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;
                    const pageNumber = parseInt(link.label);
                    const currentPage = dataTable.current_page;
                    const totalPages = dataTable.last_page;
                    const isMobile = window.innerWidth < 640;
                    const edgeCount = isMobile ? 2 : 3;
                    const midCount = 3;

                    const shouldShow =
                        isFirst ||
                        isLast ||
                        index <= edgeCount ||
                        index >= array.length - edgeCount ||
                        (pageNumber &&
                            Math.abs(pageNumber - currentPage) <=
                                Math.floor(midCount / 2));

                    const showLeftEllipsis =
                        currentPage >
                            edgeCount + Math.floor(midCount / 2) + 1 &&
                        index === edgeCount;
                    const showRightEllipsis =
                        currentPage <
                            totalPages -
                                (edgeCount + Math.floor(midCount / 2)) &&
                        index === array.length - (edgeCount + 1);

                    if (!shouldShow && !showLeftEllipsis && !showRightEllipsis)
                        return null;

                    if (showLeftEllipsis || showRightEllipsis) {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="flex items-center justify-center px-3 text-sm bg-white border-r border-gray-300 h-9 text-slate-500 last:border-0 dark:border-slate-500/30 dark:bg-slate-700/20 dark:text-slate-300"
                            >
                                ...
                            </span>
                        );
                    }

                    return link.url ? (
                        <Link
                            key={`page-${index}`}
                            href={link.url}
                            onClick={onChangePage}
                            className={`
                                flex h-9 min-w-[36px] items-center justify-center border-r border-gray-300 px-3 text-sm font-medium last:border-0
                                dark:border-slate-500/30 transition-colors duration-150
                                ${
                                    link.active
                                        ? "z-10 bg-primary text-white hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary"
                                        : "bg-white text-slate-600 hover:bg-gray-100/80 dark:bg-slate-700/20 dark:text-slate-300 dark:hover:bg-slate-700/40"
                                }
                                ${isFirst ? "rounded-l-lg" : ""}
                                ${isLast ? "rounded-r-lg" : ""}
                            `}
                            dangerouslySetInnerHTML={{
                                __html: (() => {
                                    const rawLabel = link.label ? link.label.toString().trim() : '';
                                    if (["&laquo; Previous", "pagination.previous"].includes(rawLabel)) {
                                        return "&lt;";
                                    }
                                    if (["Next &raquo;", "pagination.next"].includes(rawLabel)) {
                                        return "&gt;";
                                    }
                                    return rawLabel;
                                })(),
                            }}
                        />
                    ) : (
                        <span
                            key={`page-${index}`}
                            className={`
                                flex h-9 min-w-[36px] items-center justify-center border-r border-gray-300 px-3 text-sm font-medium last:border-0
                                dark:border-slate-500/30
                                ${
                                    link.active
                                        ? "z-10 bg-primary text-white dark:bg-primary/90"
                                        : "cursor-not-allowed bg-gray-100 text-slate-400 dark:bg-slate-700/10 dark:text-slate-400"
                                }
                                ${isFirst ? "rounded-l-lg" : ""}
                                ${isLast ? "rounded-r-lg" : ""}
                            `}
                            dangerouslySetInnerHTML={{
                                __html: (() => {
                                    const rawLabel = link.label ? link.label.toString().trim() : '';
                                    if (["&laquo; Previous", "pagination.previous"].includes(rawLabel)) {
                                        return "&lt;";
                                    }
                                    if (["Next &raquo;", "pagination.next"].includes(rawLabel)) {
                                        return "&gt;";
                                    }
                                    return rawLabel;
                                })(),
                            }}
                        />
                    );
                })}
            </nav>
        </div>
    );
}
