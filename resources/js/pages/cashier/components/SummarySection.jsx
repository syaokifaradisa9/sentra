import { ClipboardList, Minus, Plus, Trash2 } from 'lucide-react';
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
}) {
    return (
        <div className="flex max-h-[calc(100vh-6rem)] flex-col rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Daftar Pesanan
                </h3>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-4 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/20 dark:text-slate-300">
                            <ClipboardList className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            <span>Belum ada pesanan</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/30"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">
                                                {order.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                                                {formatCurrency(order.price)}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onRemove(order.id)}
                                            className="rounded-lg border border-transparent p-0.5 text-slate-400 transition hover:border-red-200 hover:text-red-500 dark:hover:border-red-400/40 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onDecrease(order.id)}
                                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:text-primary dark:border-slate-600 dark:text-slate-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-6 text-center text-xs font-semibold text-slate-700 dark:text-slate-100">
                                                {order.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onIncrease(order.id)}
                                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:text-primary dark:border-slate-600 dark:text-slate-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                                            {formatCurrency(order.price * order.quantity)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="grid grid-cols-[1fr_auto] gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span className="block text-left">Subtotal</span>
                        <span className="block text-right">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onDiscountClick}
                        className="grid w-full grid-cols-[1fr_auto] gap-2 rounded-lg px-0 py-0.5 text-xs font-medium text-slate-500 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:text-slate-300 dark:hover:text-teal-300 dark:focus-visible:ring-teal-300/30"
                    >
                        <span className="text-left">
                            Diskon
                            {discount.value > 0
                                ? discount.type === 'percent'
                                    ? ` (${discount.value}%)`
                                    : ` (${formatCurrency(discount.value)})`
                                : ''}
                        </span>
                        <span className="text-right text-red-500 dark:text-red-400">
                            -{formatCurrency(discountAmount)}
                        </span>
                    </button>
                </div>

                <div className="mt-2 flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 dark:bg-slate-900/40 dark:text-slate-100">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>

                <button
                    type="button"
                    disabled={orders.length === 0}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                >
                    Buat Pesanan
                </button>

                <div className="mt-3 flex flex-col gap-1">
                    <div className="grid grid-cols-2 gap-1">
                        <button
                            type="button"
                            onClick={onSaveOrder}
                            disabled={orders.length === 0}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300 dark:disabled:border-slate-700 dark:disabled:text-slate-500"
                        >
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={onLoadOrder}
                            disabled={!canLoadSaved}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300 dark:disabled:border-slate-700 dark:disabled:text-slate-500"
                        >
                            Muat
                        </button>
                    </div>
                    {feedbackMessage && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                            {feedbackMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
