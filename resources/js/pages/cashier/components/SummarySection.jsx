import { ClipboardList, Download, Minus, Plus, Save, ShoppingBag, Trash2, Receipt, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/cashierUtils';

export default function SummarySection({
    orders = [],
    subtotal = 0,
    discountAmount = 0,
    discount = { type: 'amount', value: 0 },
    total = 0,
    onIncrease,
    onDecrease,
    onRemove,
    onDiscountClick,
    onSaveOrder,
    onLoadOrder,
    canLoadSaved,
    feedbackMessage,
    branchOptions = [],
    canSelectBranch = false,
    selectedBranchId = '',
    onBranchChange = () => { },
    activeBranch = null,
    onCheckout = () => { },
    disableCheckout = false,
}) {
    return (
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-900/50">
            {/* Header */}
            <div className="hidden lg:flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Ringkasan Pesanan
                        </h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            #{Math.floor(Date.now() / 1000).toString().slice(-6)}
                        </p>
                    </div>
                </div>
                <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {orders.length}
                </span>
            </div>

            {/* Order List */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-2">
                    {orders.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                <ShoppingBag className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    Keranjang Kosong
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Silakan pilih menu di samping
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 py-2">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="group relative flex gap-3 rounded-xl bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50"
                                >
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                        {order.photo_url ? (
                                            <img
                                                src={order.photo_url}
                                                alt={order.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-300 dark:text-slate-600">
                                                IMG
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="line-clamp-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {order.name}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => onRemove(order.id)}
                                                className="text-slate-300 transition-colors hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-1 dark:bg-slate-800">
                                                <button
                                                    type="button"
                                                    onClick={() => onDecrease(order.id)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm transition-all hover:text-primary active:scale-95 dark:bg-slate-700 dark:text-slate-300 dark:hover:text-teal-400"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="min-w-[1.5rem] text-center text-xs font-bold text-slate-700 dark:text-slate-200">
                                                    {order.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onIncrease(order.id)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm transition-all hover:text-primary active:scale-95 dark:bg-slate-700 dark:text-slate-300 dark:hover:text-teal-400"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {formatCurrency(order.price * order.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                {/* Branch Selection */}
                {canSelectBranch && branchOptions.length > 0 && (
                    <div className="mb-4 hidden lg:block">
                        <select
                            value={selectedBranchId ?? ''}
                            onChange={onBranchChange}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            {branchOptions.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Totals */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onDiscountClick}
                        className="flex w-full items-center justify-between rounded-lg py-1 text-sm text-slate-500 transition hover:text-primary dark:text-slate-400 dark:hover:text-teal-400"
                    >
                        <span className="flex items-center gap-1 border-b border-dashed border-slate-300 dark:border-slate-600">
                            Diskon
                            {discount.value > 0 && (
                                <span className="text-xs">
                                    ({discount.type === 'percent' ? `${discount.value}%` : formatCurrency(discount.value)})
                                </span>
                            )}
                        </span>
                        <span className="font-semibold text-red-500 dark:text-red-400">
                            -{formatCurrency(discountAmount)}
                        </span>
                    </button>

                    <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
                        <span className="text-lg font-bold text-primary dark:text-teal-400">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        type="button"
                        disabled={orders.length === 0 || disableCheckout}
                        onClick={onCheckout}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:bg-teal-500 dark:shadow-teal-500/20 dark:hover:bg-teal-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                    >
                        <CreditCard className="h-4 w-4" />
                        <span>Proses Pembayaran</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onSaveOrder}
                            disabled={orders.length === 0}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-primary hover:text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-400 dark:disabled:border-slate-800 dark:disabled:text-slate-600"
                        >
                            <Save className="h-4 w-4" />
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={onLoadOrder}
                            disabled={!canLoadSaved}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-primary hover:text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-400 dark:disabled:border-slate-800 dark:disabled:text-slate-600"
                        >
                            <Download className="h-4 w-4" />
                            Muat
                        </button>
                    </div>
                </div>

                {feedbackMessage && (
                    <div className="mt-3 text-center">
                        <p className="text-xs font-medium text-primary dark:text-teal-400 animate-pulse">
                            {feedbackMessage}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
