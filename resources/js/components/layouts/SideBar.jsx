import { usePage } from '@inertiajs/react';
import {
    Building,
    GitBranch,
    Home,
    Package,
    Percent,
    ShoppingCart,
    Tags,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import SidebarLink from './SideBarLink';

const ROLE_PERMISSIONS = {
    Businessman: 'all',
    BusinessOwner: [
        'dashboard',
        'cashier',
        'branches',
        'categories',
        'products',
        'promos',
        'employees',
    ],
    SmallBusinessOwner: [
        'dashboard',
        'cashier',
        'categories',
        'products',
        'promos',
        'employees',
    ],
    Manager: ['dashboard', 'cashier', 'categories', 'products', 'promos'],
    Cashier: ['dashboard', 'cashier', 'categories', 'products', 'promos'],
};

const NAV_SECTIONS = [
    {
        title: 'Halaman Utama',
        items: [
            {
                key: 'dashboard',
                name: 'Dashboard',
                href: '/dashboard',
                icon: Home,
            },
            {
                key: 'cashier',
                name: 'Kasir',
                href: '/cashier',
                icon: ShoppingCart,
            },
        ],
    },
    {
        title: 'Data Bisnis',
        items: [
            {
                key: 'business',
                name: 'Bisnis',
                href: '/business',
                icon: Building,
            },
            {
                key: 'branches',
                name: 'Cabang',
                href: '/branches',
                icon: GitBranch,
            },
        ],
    },
    {
        title: 'Data Produk',
        items: [
            {
                key: 'categories',
                name: 'Kategori',
                href: '/categories',
                icon: Tags,
            },
            {
                key: 'products',
                name: 'Produk',
                href: '/products',
                icon: Package,
            },
            { key: 'promos', name: 'Promo', href: '/promos', icon: Percent },
        ],
    },
    {
        title: 'SDM',
        items: [
            {
                key: 'employees',
                name: 'Pegawai',
                href: '/employees',
                icon: Users,
            },
        ],
    },
];

export default function Sidebar({ isOpen, setIsOpen }) {
    const { loggedrole = [] } = usePage().props;

    const allowedKeys = useMemo(() => {
        const allKeys = NAV_SECTIONS.flatMap((section) =>
            section.items.map((item) => item.key),
        );
        if (!loggedrole || loggedrole.length === 0) {
            return new Set(allKeys);
        }

        const allowedSet = new Set();
        let allowAll = false;

        loggedrole.forEach((role) => {
            const permission = ROLE_PERMISSIONS[role];
            if (!permission) {
                return;
            }
            if (permission === 'all') {
                allowAll = true;
            } else {
                permission.forEach((key) => allowedSet.add(key));
            }
        });

        return allowAll ? new Set(allKeys) : allowedSet;
    }, [loggedrole]);

    const shouldShowSection = (section) =>
        section.items.some((item) => allowedKeys.has(item.key));

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/60 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-gray-300/90 bg-white transition-transform duration-300 ease-in-out lg:z-0 lg:translate-x-0 dark:border-slate-700/50 dark:bg-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 flex-shrink-0 items-center justify-center border-b border-gray-300/90 dark:border-slate-700/50">
                        <span className="text-lg font-bold text-[#00A7A1] dark:text-teal-400">
                            SENTRA
                        </span>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="scrollbar-elegant flex-1 overflow-y-auto">
                            <div className="px-3 py-5">
                                <nav className="space-y-6">
                                    {NAV_SECTIONS.filter(shouldShowSection).map(
                                        (section) => (
                                            <div key={section.title}>
                                                <div className="py-2">
                                                    <h3 className="text-xs font-medium tracking-wider text-slate-500 dark:text-slate-400">
                                                        {section.title}
                                                    </h3>
                                                </div>
                                                <div className="space-y-1">
                                                    {section.items
                                                        .filter((item) =>
                                                            allowedKeys.has(
                                                                item.key,
                                                            ),
                                                        )
                                                        .map((item) => (
                                                            <SidebarLink
                                                                key={item.key}
                                                                name={item.name}
                                                                href={item.href}
                                                                icon={item.icon}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </nav>
                            </div>
                        </div>
                        <div className="flex-shrink-0 p-3">
                            <div className="rounded-lg bg-[#E6F5F5] px-3 py-2.5 dark:bg-slate-700/30">
                                <div className="mt-1.5 flex flex-col items-center">
                                    <div className="flex text-xs text-slate-500 dark:text-slate-400">
                                        Developed By
                                        <span className="ml-1 font-semibold text-[#00A7A1] dark:text-teal-400">
                                            Nocturnal Projects
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
