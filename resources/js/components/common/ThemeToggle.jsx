import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const darkMode =
            localStorage.getItem("theme") === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);
        setIsDark(darkMode);
        document.documentElement.classList.toggle("dark", darkMode);
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", !isDark ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed z-40 p-2 text-gray-700 transition-all border border-gray-200 rounded-full shadow-sm bottom-6 right-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm dark:border-slate-700/50 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
        >
            {isDark ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
}
