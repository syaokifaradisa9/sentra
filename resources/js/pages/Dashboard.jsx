import { Head, router } from "@inertiajs/react";
import ThemeToggle from "../Components/Common/ThemeToggle";

export default function Dashboard() {
    const handleLogout = () => {
        // Use Inertia router to submit POST request to logout
        router.post('/logout');
    };

    return (
        <>
            <Head title="Dashboard | Sentra" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Selamat Datang</h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Anda telah berhasil masuk ke sistem Sentra.
                        </p>
                    </div>
                </div>

                {/* Theme toggle positioned at bottom right */}
                <div className="fixed bottom-4 right-4 z-50">
                    <ThemeToggle />
                </div>
            </div>
        </>
    );
}