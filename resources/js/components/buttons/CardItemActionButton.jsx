import { Link } from "@inertiajs/react";

export default function CardItemActionButton({
    icon: Icon,
    label,
    href,
    onClick,
    className,
    target,
}) {
    if (target) {
        return (
            <a
                target={target}
                onClick={onClick}
                href={href}
                className={`flex items-center justify-center flex-1 px-4 py-2 text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 ${className}`}
            >
                <Icon className="mr-2 size-4" />
                <span className="text-sm">{label}</span>
            </a>
        );
    }

    return (
        <Link
            onClick={onClick}
            href={href}
            className={`flex items-center justify-center flex-1 px-4 py-2 text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 ${className}`}
        >
            <Icon className="mr-2 size-4" />
            <span className="text-sm">{label}</span>
        </Link>
    );
}
