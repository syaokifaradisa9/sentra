import React from "react";
import { ChevronDown } from "lucide-react";

export default function FormSearchSelect({
    name,
    onChange,
    options = [],
    placeholder = "Select an option",
    value,
    className = "",
    icon,
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="relative">
                {icon && (
                    <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 dark:text-slate-400">
                        {icon}
                    </div>
                )}

                <select
                    id={name}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    className={`
                        appearance-none text-xs w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2
                        focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-700
                        dark:placeholder-slate-400 transition-all duration-200
                        ${icon ? "pl-10" : ""} ${
                        value ? "dark:text-white" : "dark:text-gray-400"
                    }
                    `}
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    {options.map((option, index) => (
                        <option
                            key={index}
                            value={option.value}
                            className="py-2 text-gray-900 bg-white dark:text-slate-200 dark:bg-slate-800"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-slate-400">
                    <ChevronDown className="size-4" />
                </div>
            </div>
        </div>
    );
}
