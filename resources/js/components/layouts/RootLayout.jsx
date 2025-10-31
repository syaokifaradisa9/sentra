import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SideBar from './SideBar';
import Topbar from './TopBar';

export default function RootLayout({ title, children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const darkMode =
            localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(darkMode);
        document.documentElement.classList.toggle('dark', darkMode);
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    };

    const { flash } = usePage().props;
    useEffect(() => {
        const { type, message } = flash;

        if (type == 'success') toast.success(message);
        if (type == 'error') toast.error(message);
    }, [flash]);

    return (
        <>
            <div
                className="fixed inset-0 bg-[#F5FAFA] dark:bg-slate-900"
                aria-hidden="true"
            />
            <div className="relative flex min-h-screen flex-col">
                <Toaster position="bottom-right" />
                <Head>
                    <title>{title ?? ''}</title>
                </Head>

                <Topbar
                    toggleSidebar={() => setSidebarOpen(true)}
                    isDark={isDark}
                    toggleTheme={toggleTheme}
                />

                <div className="flex flex-1 pt-16">
                    <SideBar
                        isOpen={isSidebarOpen}
                        setIsOpen={setSidebarOpen}
                    />
                    <main className="flex flex-1 flex-col overflow-hidden p-4 transition-all duration-300 md:p-6 lg:p-8 lg:pl-[calc(theme(spacing.8)+256px)]">
                        <div className="mx-auto flex w-full max-w-[1920px] flex-1 flex-col space-y-6">
                            {children}
                        </div>
                    </main>
                </div>

                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-[#00A7A1]/10 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}
            </div>
        </>
    );
}
