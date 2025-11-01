import { Search } from "lucide-react";
import { sumList } from "../../utils/ListCalculations";

export default function AlkesOrderTable({
    items,
    quantities,
    descriptions = null,
    onChange,
    onChangeDescription = null,
    total,
    showCategory = false,
    onSearch = null,
}) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const hasDescriptions = descriptions != null;

    return (
        <>
            <div className="flex justify-end">
                {onSearch && (
                    <div className="relative w-full md:w-80">
                        <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-slate-400" />
                        <input
                            name="search"
                            type="text"
                            className="w-full pl-10 pr-4 text-sm transition-colors bg-white border border-gray-400 rounded-lg h-9 text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            placeholder="Cari data..."
                            onChange={onSearch}
                        />
                    </div>
                )}
            </div>
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                        {showCategory && (
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300">
                                Layanan
                            </th>
                        )}
                        <th className="px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300">
                            Alat Kesehatan
                        </th>
                        <th className="w-24 px-4 py-3 text-xs font-medium text-center text-gray-700 md:w-32 md:text-sm dark:text-slate-300">
                            Jumlah
                        </th>
                        <th className="w-32 px-4 py-3 text-xs font-medium text-right text-gray-700 md:w-40 md:text-sm dark:text-slate-300">
                            Tarif
                        </th>
                        <th className="w-32 px-4 py-3 text-xs font-medium text-right text-gray-700 md:w-40 md:text-sm dark:text-slate-300">
                            Sub Total
                        </th>
                        {hasDescriptions && (
                            <th className="w-64 px-4 py-3 text-xs font-medium text-left text-gray-700 md:text-sm dark:text-slate-300">
                                Keterangan
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {items?.map((item, index) => (
                        <tr
                            key={item.id}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700/30"
                        >
                            {showCategory && (
                                <td className="px-4 py-3 text-xs text-gray-700 md:text-sm dark:text-slate-300">
                                    {item.category.name}
                                </td>
                            )}
                            <td className="px-4 py-3 text-xs text-gray-700 md:text-sm dark:text-slate-300">
                                {item.name}
                            </td>
                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    min="0"
                                    name={item.id}
                                    value={quantities[index]}
                                    onChange={(e) =>
                                        onChange(index, e.target.value)
                                    }
                                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-center bg-white border border-gray-300 rounded-lg dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </td>
                            <td className="px-4 py-3 text-xs text-right text-gray-700 md:text-sm dark:text-slate-300">
                                {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-right text-gray-900 md:text-sm dark:text-white">
                                {formatCurrency(
                                    item.price * (quantities[index] || 0)
                                )}
                            </td>
                            {hasDescriptions && (
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        name={item.id}
                                        value={descriptions[index] || ""}
                                        onChange={(e) =>
                                            onChangeDescription(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Keterangan Tambahan (Optional)"
                                        className="w-full px-3 py-1.5 text-xs md:text-sm bg-white border border-gray-300 rounded-lg dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td
                            colSpan={showCategory ? 2 : 1}
                            className="px-4 py-3 text-xs font-medium text-gray-700 md:text-sm dark:text-slate-300"
                        >
                            Total
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-right text-gray-900 md:text-sm dark:text-white">
                            {sumList(quantities)}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-right text-gray-900 md:text-sm dark:text-white"></td>
                        <td className="px-4 py-3 text-xs font-medium text-right text-gray-900 md:text-sm dark:text-white">
                            {formatCurrency(total)}
                        </td>
                        {hasDescriptions && <td />}
                    </tr>
                </tfoot>
            </table>
        </>
    );
}
