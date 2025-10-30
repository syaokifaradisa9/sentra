import React from "react";

export default function FormCheckbox({
    label,
    checked,
    onChange,
    name,
    disabled = false,
    className = "",
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="flex items-center gap-2">
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={onChange}
                        name={name}
                        disabled={disabled}
                        className="sr-only peer"
                    />
                    <div
                        className={`
                            size-4.5
                            rounded
                            border
                            flex
                            items-center
                            justify-center
                            transition-colors
                            ${
                                disabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:border-primary dark:hover:border-primary"
                            }
                            ${
                                checked
                                    ? "bg-primary border-primary text-white dark:bg-primary dark:border-primary"
                                    : "bg-white border-gray-300 dark:bg-slate-800 dark:border-slate-600"
                            }
                            peer-focus:ring-2
                            peer-focus:ring-primary/20
                            peer-focus:ring-offset-1
                            dark:peer-focus:ring-primary/20
                            dark:peer-focus:ring-offset-slate-800
                        `}
                    >
                        <svg
                            className={`
                                size-3
                                duration-200
                                ${checked ? "scale-100" : "scale-0"}
                            `}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>
                {label && (
                    <span
                        className={`
                            text-sm
                            select-none
                            ${
                                disabled
                                    ? "text-slate-400 dark:text-slate-500"
                                    : "text-slate-700 dark:text-slate-300"
                            }
                        `}
                    >
                        {label}
                    </span>
                )}
            </label>
        </div>
    );
}
