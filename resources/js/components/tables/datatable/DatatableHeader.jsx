import { Search } from "lucide-react";

export default function DatatableHeader({
    additionalHeaderElements,
    onParamsChange,
    limit,
    searchValue = "",
    onSearchChange,
}) {
    return (
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Tampilkan
                </p>
                <select
                    name="limit"
                    className="px-3 text-sm transition-colors bg-white border border-gray-400 rounded-lg h-9 text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    onChange={onParamsChange}
                    value={limit}
                >
                    {[5, 10, 20, 50, 100].map((value) => (
                        <option
                            key={`filter-page-limit-${value}`}
                            value={value}
                        >
                            {value}
                        </option>
                    ))}
                </select>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Per Halaman
                </p>
            </div>

            <div className="flex flex-col w-full gap-3 md:w-auto md:flex-row md:items-center">
                <div className="relative w-full md:w-80">
                    <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-slate-400" />
                    <input
                        name="search"
                        type="text"
                        value={searchValue}
                        className="w-full pl-10 pr-4 text-sm transition-colors bg-white border border-gray-400 rounded-lg h-9 text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        placeholder="Cari data..."
                        onChange={onSearchChange ?? onParamsChange}
                    />
                </div>
                <div className="flex items-center justify-center gap-2">
                    {additionalHeaderElements}
                </div>
            </div>
        </div>
    );
}
