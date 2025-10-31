import { router } from '@inertiajs/react';
import { Calendar, Clock, TrendingUp, Users } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import RootLayout from '../../components/layouts/RootLayout';

export default function Dashboard() {
    const handleLogout = () => {
        // Use Inertia router to submit POST request to logout
        router.post('/logout');
    };

    // Sample data for dashboard cards
    const stats = [
        {
            title: 'Total Users',
            value: '1,234',
            icon: Users,
            change: '+12%',
            positive: true,
        },
        {
            title: 'Pending Tasks',
            value: '56',
            icon: Clock,
            change: '+3%',
            positive: true,
        },
        {
            title: 'Schedule',
            value: '24',
            icon: Calendar,
            change: '-2%',
            positive: false,
        },
        {
            title: 'Performance',
            value: '92%',
            icon: TrendingUp,
            change: '+5%',
            positive: true,
        },
    ];

    return (
        <RootLayout title="Dashboard | Sentra">
            <div className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            Dashboard
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-full p-3 ${stat.positive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                                    >
                                        <stat.icon
                                            className={`h-6 w-6 ${stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                        />
                                    </div>
                                </div>
                                <p
                                    className={`mt-3 text-xs ${stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                >
                                    {stat.change} from last month
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Welcome Section */}
                    <div className="mb-8 rounded-xl bg-gradient-to-r from-[#00A7A1] to-teal-500 p-6 text-white">
                        <h2 className="mb-2 text-2xl font-bold">
                            Selamat Datang di Sentra Dashboard
                        </h2>
                        <p className="opacity-90">
                            Sistem Informasi Terpadu untuk manajemen data dan
                            pengawasan laboratorium.
                        </p>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="mr-3 rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                            New user registered
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            2 minutes ago
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                            Performance report generated
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            1 hour ago
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mr-3 rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                            New schedule added
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            3 hours ago
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="rounded-lg bg-[#00A7A1] px-4 py-3 text-center text-white transition-colors hover:bg-[#008a85]">
                                    Create Report
                                </button>
                                <button className="rounded-lg bg-blue-500 px-4 py-3 text-center text-white transition-colors hover:bg-blue-600">
                                    Schedule Task
                                </button>
                                <button className="rounded-lg bg-green-500 px-4 py-3 text-center text-white transition-colors hover:bg-green-600">
                                    Add User
                                </button>
                                <button className="rounded-lg bg-purple-500 px-4 py-3 text-center text-white transition-colors hover:bg-purple-600">
                                    View Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Theme toggle positioned at bottom right */}
                <div className="fixed right-4 bottom-4 z-50">
                    <ThemeToggle />
                </div>
            </div>
        </RootLayout>
    );
}
