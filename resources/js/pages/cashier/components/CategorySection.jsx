import { ArrowLeft, Package2, Coffee } from 'lucide-react';
import { CATEGORY_ICON_MAP } from '../../../constants/categoryIcons';

export default function CategorySection({
    categoryOptions = [],
    selectedCategory,
    setSelectedCategory,
    handleBack,
}) {
    return (
        <div className="mb-5 flex min-h-0 w-full flex-1 flex-col rounded-2xl bg-white/90 px-4 pt-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm dark:bg-slate-900/70 dark:ring-white/15">
            <div className="mb-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-600 ring-1 ring-slate-200 transition hover:text-primary hover:ring-primary/50 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700"
                    aria-label="Kembali"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
                        Kategori
                    </h2>
                </div>
            </div>
            <div className="scrollbar-elegant flex-1 space-y-1 overflow-y-auto pr-1">
                {categoryOptions.map((category) => {
                    const isActive = String(selectedCategory) === String(category.id);
                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                                isActive
                                    ? 'border-primary/50 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40 dark:border-teal-400/40 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/40'
                                    : 'border-transparent text-slate-500 hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:text-slate-300 dark:hover:border-teal-400/30 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {(() => {
                                    if (category.id === 'all') {
                                        return <Coffee className="h-4 w-4" />;
                                    }

                                    const iconName = category.icon ?? null;
                                    const IconComponent = iconName && CATEGORY_ICON_MAP[iconName]
                                        ? CATEGORY_ICON_MAP[iconName]
                                        : Package2;

                                    return <IconComponent className="h-4 w-4" />;
                                })()}
                                <span>{category.name}</span>
                            </span>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                {category.product_count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}