import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function CashierLayout({ title, children }) {
    useEffect(() => {
        const darkMode =
            localStorage.getItem("theme") === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

        document.documentElement.classList.toggle("dark", darkMode);
    }, []);

    const { flash } = usePage().props;
    useEffect(() => {
        if (!flash) {
            return;
        }
        const { type, message } = flash;
        if (!message) {
            return;
        }
        if (type === "success") {
            toast.success(message);
        }
        if (type === "error") {
            toast.error(message);
        }
    }, [flash]);

    return (
        <>
            <Head>
                <title>{title ?? "Kasir"}</title>
            </Head>
            <Toaster position="bottom-right" />
            <div className="flex h-screen flex-col overflow-hidden bg-[#E3E7F1] text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
                {children}
            </div>
        </>
    );
}
