import { Briefcase, ChevronLeft, ChevronRight, Coffee, Package2 } from 'lucide-react';
import { CATEGORY_ICON_MAP } from '../../../constants/categoryIcons';

export default function CategorySection({
    categoryOptions = [],
    selectedCategory,
    setSelectedCategory,
    handleBack,
    userName,
    userPosition,
    productListOffset = 0,
    isCollapsed = false,
    onToggleCollapse,
}) {
    const containerClassName = `scrollbar-elegant flex-1 space-y-1 overflow-y-auto ${
        isCollapsed ? 'pr-0' : 'pr-1'
    }`;
    const adjustedMarginTop = 0;
    const displayName = userName ?? 'Pengguna';
    const displayPosition = userPosition ?? 'Kasir';

    return (
        <div
            className={containerClassName}
            style={
                adjustedMarginTop > 0
                    ? {
                          marginTop: adjustedMarginTop,
                          overflow: 'visible',
                      }
                    : { overflow: 'visible' }
            }
        >
            <div className="pl-0.5 pr-1 pb-4">
                <div className="flex items-center gap-2">
                    {handleBack && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center text-slate-500 transition hover:text-primary dark:text-slate-300 dark:hover:text-teal-300"
                            aria-label="Kembali"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}
                    {!isCollapsed && (
                        <div className="flex flex-col leading-tight text-left text-[13px] text-slate-500 dark:text-slate-400">
                            <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                                {displayName}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs">
                                <Briefcase className="h-3.5 w-3.5" />
                                {displayPosition}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div
                className={`flex items-center gap-2 px-1 pb-3 ${
                    isCollapsed ? 'flex-col-reverse' : 'justify-between'
                }`}
            >
                {!isCollapsed && (
                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                        Filter Kategori
                    </p>
                )}
                <button
                    type="button"
                    onClick={() => onToggleCollapse?.(!isCollapsed)}
                    aria-label={
                        isCollapsed
                            ? 'Tampilkan filter kategori'
                            : 'Sembunyikan filter kategori'
                    }
                    className={`inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-300 ${
                        isCollapsed ? 'w-full' : 'w-7'
                    }`}
                    aria-expanded={!isCollapsed}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </div>
            {!isCollapsed &&
                categoryOptions.map((category) => {
                    const isActive =
                        String(selectedCategory) === String(category.id);
                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`ml-1 flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-[13px] font-medium transition ${
                                isActive
                                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/40'
                                    : 'text-slate-500 hover:bg-primary/5 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {(() => {
                                    if (category.id === 'all') {
                                        return <Coffee className="h-4 w-4" />;
                                    }

                                    const iconName = category.icon ?? null;
                                    const IconComponent =
                                        iconName && CATEGORY_ICON_MAP[iconName]
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
            {isCollapsed && (
                <div className="mt-1 flex flex-col gap-3 px-0.5">
                    {categoryOptions.map((category) => {
                        const isActive =
                            String(selectedCategory) === String(category.id);
                        return (
                            <div
                                key={category.id}
                                className="group relative flex w-full justify-center"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedCategory(category.id)
                                    }
                                    className={`flex h-10 w-full items-center justify-center rounded-xl text-slate-500 transition ${
                                        isActive
                                            ? 'text-primary dark:text-teal-300'
                                            : 'hover:text-primary dark:text-slate-300 dark:hover:text-teal-300'
                                    }`}
                                    aria-label={category.name}
                                >
                                    {(() => {
                                        if (category.id === 'all') {
                                            return (
                                                <Coffee className="h-5 w-5" />
                                            );
                                        }

                                        const iconName =
                                            category.icon ?? null;
                                        const IconComponent =
                                            iconName &&
                                            CATEGORY_ICON_MAP[iconName]
                                                ? CATEGORY_ICON_MAP[iconName]
                                                : Package2;

                                        return (
                                            <IconComponent className="h-5 w-5" />
                                        );
                                    })()}
                                    <span className="sr-only">
                                        {category.name}
                                    </span>
                                </button>
                                <span className="pointer-events-none absolute left-full top-1/2 z-[999] ml-3 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-md border border-slate-700/60 bg-slate-900/95 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-xl transition group-hover:translate-x-0 group-hover:opacity-100 dark:border-slate-600/60 dark:bg-slate-800/95">
                                    {category.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
