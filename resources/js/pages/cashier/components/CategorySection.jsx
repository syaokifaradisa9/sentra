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
    const containerClassName = `scrollbar-hide flex-1 space-y-2 overflow-y-auto transition-all duration-300 ease-in-out ${
        isCollapsed ? 'px-2' : 'px-3'
    }`;
    const displayName = userName ?? 'Pengguna';
    const displayPosition = userPosition ?? 'Kasir';

    return (
        <div className="flex h-full flex-col bg-white/50 backdrop-blur-xl transition-all duration-300 dark:bg-slate-900/50 lg:rounded-2xl lg:border lg:border-slate-200/60 lg:shadow-sm lg:dark:border-slate-800/60">
            {/* Header Section */}
            <div className={`flex items-center justify-between border-b border-slate-100 p-4 transition-all dark:border-slate-800 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    {handleBack && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-primary hover:text-white hover:ring-primary dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-teal-500 dark:hover:text-white dark:hover:ring-teal-500"
                            aria-label="Kembali"
                        >
                            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                        </button>
                    )}
                    
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                                {displayName}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Briefcase className="h-3 w-3" />
                                <span className="truncate">{displayPosition}</span>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onToggleCollapse?.(!isCollapsed)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Categories List */}
            <div className={containerClassName}>
                {!isCollapsed && (
                    <div className="px-1 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Kategori
                        </p>
                    </div>
                )}

                <div className="space-y-1 pb-4">
                    {categoryOptions.map((category) => {
                        const isActive = String(selectedCategory) === String(category.id);
                        const isAll = category.id === 'all';
                        
                        // Icon resolution
                        let IconComponent = Package2;
                        if (isAll) IconComponent = Coffee;
                        else if (category.icon && CATEGORY_ICON_MAP[category.icon]) {
                            IconComponent = CATEGORY_ICON_MAP[category.icon];
                        }

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.id)}
                                title={category.name}
                                className={`group relative flex w-full items-center rounded-xl transition-all duration-200 ${
                                    isCollapsed 
                                        ? 'justify-center p-3' 
                                        : 'justify-between px-3 py-2.5'
                                } ${
                                    isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/25 dark:bg-teal-500 dark:shadow-teal-500/20'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                                    <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary dark:text-slate-500 dark:group-hover:text-teal-400'} transition-colors`} />
                                    
                                    {!isCollapsed && (
                                        <span className={`text-[13px] font-medium ${isActive ? 'text-white' : ''}`}>
                                            {category.name}
                                        </span>
                                    )}
                                </div>

                                {!isCollapsed && (
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        isActive 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                        {category.product_count}
                                    </span>
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 translate-x-2 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 opacity-0 shadow-xl transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        {category.name}
                                        <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
