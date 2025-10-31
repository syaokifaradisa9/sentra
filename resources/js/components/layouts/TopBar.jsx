import React from "react";
import { Menu, Sun, Moon } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

export default function Topbar({ toggleSidebar, isDark, toggleTheme }) {
    return (
        <header className="fixed inset-x-0 top-0 z-30 border-b border-gray-300/90 dark:border-slate-700/50">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="flex items-center justify-between h-16 pl-4 pr-4 mx-auto lg:pl-0 max-w-8xl">
                    <div className="flex items-center gap-4 border-r border-[#00A7A1]/10 w-64">
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-[#E6F5F5] lg:hidden dark:text-slate-400 dark:hover:bg-slate-700/50"
                        >
                            <Menu className="size-6" />
                        </button>
                        <span className="hidden text-lg font-bold text-[#00A7A1] dark:text-teal-400 lg:mx-auto sm:flex">SENTRA</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[#00A7A1] hover:bg-[#E6F5F5] dark:text-teal-400 dark:hover:bg-slate-700/50"
                        >
                            {isDark ? (
                                <Sun className="size-5" />
                            ) : (
                                <Moon className="size-5" />
                            )}
                        </button>
                        <ProfileDropdown />
                    </div>
                </div>
            </div>
        </header>
    );
}
