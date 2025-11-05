import { Building, CalendarDays, GitBranch, Home, MonitorDot, Package, ShoppingCart, Tags } from 'lucide-react';
import SidebarLink from './SideBarLink';

export default function Sidebar({ isOpen, setIsOpen }) {
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
                        <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1 overflow-y-auto">
                            <div className="px-3 py-5">
                                <div className="py-2">
                                    <h3 className="text-xs font-medium tracking-wider text-slate-500 dark:text-slate-400">
                                        Halaman Utama
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    <SidebarLink
                                        name="Dashboard"
                                        href="/dashboard"
                                        icon={Home}
                                    />
                                    <SidebarLink
                                        roles={[
                                            'yantek',
                                            'head_of_pk_laboratory',
                                            'supervisor_of_pk_laboratory',
                                            'admin_pk',
                                            'officer_pk',
                                            'head_of_ukpr_laboratory',
                                            'supervisor_of_ukpr_laboratory',
                                            'admin_ukpr',
                                            'officer_ukpr',
                                            'head_of_sarpras_laboratory',
                                            'supervisor_of_sarpras_laboratory',
                                            'admin_sarpras',
                                            'officer_sarpras',
                                        ]}
                                        name="Penjadwalan"
                                        href="/schedule"
                                        icon={CalendarDays}
                                    />
                                    <SidebarLink
                                        roles={[
                                            'yantek',
                                            'head_of_pk_laboratory',
                                            'it',
                                        ]}
                                        name="Monitong Petugas"
                                        href="/report/lab/kak/officer-monitoring"
                                        icon={MonitorDot}
                                    />
                                </div>
                                <div className="py-2 mt-4">
                                    <h3 className="text-xs font-medium tracking-wider text-slate-500 dark:text-slate-400">
                                        Bisnis
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    <SidebarLink
                                        name="Bisnis"
                                        href="/business"
                                        icon={Building}
                                    />
                                    <SidebarLink
                                        name="Kasir"
                                        href="/cashier"
                                        icon={ShoppingCart}
                                    />
                                    <SidebarLink
                                        name="Cabang"
                                        href="/branches"
                                        icon={GitBranch}
                                    />
                                    <SidebarLink
                                        name="Kategori"
                                        href="/categories"
                                        icon={Tags}
                                    />
                                    <SidebarLink
                                        name="Produk"
                                        href="/products"
                                        icon={Package}
                                    />
                                    <SidebarLink
                                        name="Karyawan"
                                        href="/employees"
                                        icon={Package} // Using the same icon as products for now
                                    />
                                </div>
                            </div>
                        </div>
                        {/* <div className="flex-shrink-0 p-3">
                            <div className="px-3 py-2.5 rounded-lg bg-[#E6F5F5] dark:bg-slate-700/30">
                                <div className="mt-1.5 flex flex-col items-center">
                                    <div className="flex text-xs text-slate-500 dark:text-slate-400">
                                        Developed By
                                        <span className="ml-1 font-semibold text-[#00A7A1] dark:text-teal-400">Nocturnal Projects</span>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </aside>
        </>
    );
}
