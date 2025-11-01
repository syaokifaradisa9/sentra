import React from "react";
import FormInput from "../Forms/FormInput";

export default function AlkesOrderMobile({
    items,
    quantities,
    descriptions = null,
    onChange,
    onChangeDescription = null,
    total,
    showCategory = false,
}) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleIncrement = (index) => {
        onChange(index, Number(quantities[index] || 0) + 1);
    };

    const handleDecrement = (index) => {
        if (quantities[index] > 0) {
            onChange(index, Number(quantities[index]) - 1);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="sticky top-0 z-20 px-4 py-4 border-b backdrop-blur-lg dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Daftar Alat Kesehatan
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    {items?.length || 0} item dalam pesanan
                </p>
            </div>
            <div className="flex-1">
                <div className="py-4 space-y-4">
                    {items?.map((item, index) => (
                        <div
                            key={item.id}
                            className="relative overflow-hidden transition-all bg-white border shadow-sm border-gray-400/50 dark:bg-slate-800 dark:border-slate-600 rounded-2xl hover:shadow-md"
                        >
                            {showCategory && (
                                <div className="absolute top-4 right-4">
                                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full text-primary bg-primary/10">
                                        {item.category.name}
                                    </span>
                                </div>
                            )}

                            <div className="p-5">
                                <div className="space-y-2">
                                    <h3 className="text-base font-medium leading-relaxed text-gray-900 dark:text-white">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                        {formatCurrency(item.price)} / unit
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                                            Jumlah
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDecrement(index);
                                                }}
                                                className="flex items-center justify-center transition-all border w-9 h-9 rounded-xl hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700"
                                            >
                                                <span className="text-lg text-gray-600 dark:text-slate-400">
                                                    −
                                                </span>
                                            </button>

                                            <input
                                                type="number"
                                                min="0"
                                                name={item.id}
                                                value={quantities[index] || "0"}
                                                onChange={(e) =>
                                                    onChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-16 px-2 py-1.5 text-center border rounded-lg dark:border-slate-600 dark:bg-slate-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            />

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleIncrement(index);
                                                }}
                                                className="flex items-center justify-center transition-all border w-9 h-9 rounded-xl text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
                                            >
                                                <span className="text-lg">
                                                    +
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {descriptions !== null && (
                                    <div className="mt-5">
                                        <FormInput
                                            value={descriptions[index] ?? ""}
                                            onChange={(e) =>
                                                onChangeDescription(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Tambahkan catatan..."
                                        />
                                    </div>
                                )}
                            </div>

                            {quantities[index] > 0 && (
                                <div className="px-5 py-4 mt-2 border-t bg-gray-50/50 dark:bg-slate-700/20 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                                            Subtotal
                                        </span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(
                                                item.price *
                                                    (quantities[index] || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Payment Summary - Moved to bottom of list */}
                    <div className="p-4 border border-gray-200 bg-white/90 dark:bg-slate-800/90 dark:border-slate-700 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                    Total Pembayaran
                                </p>
                                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(total)}
                                </p>
                            </div>
                            <div className="px-4 py-2 text-sm font-medium rounded-xl text-primary bg-primary/10">
                                {items?.filter(
                                    (_item, index) => quantities[index] > 0
                                ).length || 0}{" "}
                                item
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
