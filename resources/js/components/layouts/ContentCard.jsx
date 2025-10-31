import { Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

export default function ContentCard({
    title,
    children,
    className = "",
    backPath,
    additionalButton,
}) {
    return (
        <div
            className={`
                bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg md:rounded-xl border border-gray-300/90 dark:border-slate-700/50 shadow-sm shadow-[#00A7A1]/5 dark:shadow-slate-900/50
                ${className}
            `}
        >
            {(title || backPath || additionalButton) && (
                <div className="flex flex-col gap-3 px-4 py-3 border-b md:px-6 md:py-4 border-gray-300/70 dark:border-slate-700/50">
                    <div className="flex items-center min-w-0 gap-2 md:gap-3">
                        {backPath && (
                            <Link
                                href={backPath}
                                className="flex items-center justify-center -ml-1.5 size-8 rounded-lg text-[#00A7A1] hover:bg-[#E6F5F5] dark:text-teal-400 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <ChevronLeft className="size-4 md:size-5" />
                            </Link>
                        )}
                        {title && (
                            <h2 className="text-base md:text-lg font-semibold text-[#00A7A1] dark:text-white truncate">
                                {title}
                            </h2>
                        )}
                    </div>
                    {additionalButton && (
                        <div className="md:hidden">{additionalButton}</div>
                    )}
                    {additionalButton && (
                        <div className="hidden md:block md:absolute md:right-6 md:top-4">
                            {additionalButton}
                        </div>
                    )}
                </div>
            )}
            <div className="p-4 md:p-6">{children}</div>
        </div>
    );
}
