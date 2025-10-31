import { Link, usePage } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import CheckRoles from "../../utils/CheckRoles";

export default function SidebarLink({
    name,
    href,
    icon: Icon,
    children,
    roles,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { url } = usePage();

    const isActive = url.startsWith(href);
    const hasChildren = children && children.length > 0;
    const isChildActive =
        hasChildren && children.some((child) => url.startsWith(child.href));

    useEffect(() => {
        if ((isActive || isChildActive) && hasChildren) {
            setIsOpen(true);
        }
    }, [isActive, isChildActive]);

    const baseClasses = `
        group flex items-center w-full px-3 py-2.5
        rounded-lg transition-all duration-200
        ${
            isActive || isChildActive
                ? "text-white bg-primary dark:text-teal-400 dark:bg-teal-400/10"
                : "text-slate-700/80 hover:bg-[#E6F5F5]/70 dark:text-slate-300 dark:hover:bg-slate-700/30"
        }
    `;

    if (!hasChildren) {
        return (
            <CheckRoles
                roles={roles}
                children={
                    <Link href={href} className={baseClasses}>
                        <Icon
                            className="flex-shrink-0 size-5"
                            strokeWidth={1.5}
                        />
                        <span className="ml-3 text-sm font-medium">{name}</span>
                    </Link>
                }
            />
        );
    }

    return (
        <CheckRoles
            roles={roles}
            children={
                <div className="space-y-0.5">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={baseClasses}
                    >
                        <Icon
                            className="flex-shrink-0 size-5"
                            strokeWidth={1.5}
                        />
                        <span className="ml-3 text-sm font-medium">{name}</span>
                        <ChevronRight
                            className={`size-4.5 ml-auto transition-transform duration-200 text-slate-400 ${
                                isOpen
                                    ? "rotate-90"
                                    : "group-hover:translate-x-0.5"
                            }`}
                        />
                    </button>

                    {isOpen && children && (
                        <div className="pl-8 pb-0.5 mt-0.5 space-y-0.5">
                            {children.map((child, index) =>
                                child.roles ? (
                                    <CheckRoles
                                        roles={child.roles}
                                        children={
                                            <Link
                                                key={index}
                                                href={child.href}
                                                className={`
                                            flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200
                                            ${
                                                url.startsWith(child.href)
                                                    ? "text-primary bg-blue-50/80 dark:bg-primary/10"
                                                    : "text-slate-600 hover:bg-blue-50/50 dark:text-slate-300 dark:hover:bg-slate-700/30"
                                            }
                                        `}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                                                <span className="ml-3 text-sm font-medium">
                                                    {child.name}
                                                </span>
                                            </Link>
                                        }
                                    />
                                ) : (
                                    <Link
                                        key={index}
                                        href={child.href}
                                        className={`
                                    flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200
                                    ${
                                        url.startsWith(child.href)
                                            ? "text-primary bg-blue-50/80 dark:bg-primary/10"
                                            : "text-slate-600 hover:bg-blue-50/50 dark:text-slate-300 dark:hover:bg-slate-700/30"
                                    }
                                `}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                                        <span className="ml-3 text-sm font-medium">
                                            {child.name}
                                        </span>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </div>
            }
        />
    );
}
