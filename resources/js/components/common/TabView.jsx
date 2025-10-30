import { useState } from "react";

export default function TabView({ tabItems = [], children, className }) {
    const [activeTab, setActiveTab] = useState(tabItems[0]?.id || "");

    if (!tabItems.length) {
        return (
            <div className="p-4 text-sm text-red-600 rounded-lg bg-red-50 dark:bg-red-900/50 dark:text-red-200">
                Please provide tab items array
            </div>
        );
    }

    const activeChild = Array.isArray(children)
        ? children.find((child, index) => tabItems[index]?.id === activeTab)
        : children;

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex flex-col gap-2 overflow-x-auto md:flex-row">
                {tabItems.map((tab) =>
                    tab.is_hidden ?? false ? null : (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                ${
                                    activeTab === tab.id
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    )
                )}
            </div>
            <div className="min-h-[100px]">{activeChild}</div>
        </div>
    );
}
