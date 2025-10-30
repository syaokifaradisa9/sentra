import React from "react";

export default function FormRadio({
    label,
    name,
    options = [],
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = "",
}) {
    const RadioOption = ({
        id,
        name,
        label,
        value,
        checked,
        onChange,
        disabled = false,
    }) => (
        <div className="relative flex items-center">
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="hidden peer"
            />
            <label
                htmlFor={id}
                className={`
                    flex items-center w-full p-3
                    border rounded-lg
                    transition-all duration-200
                    hover:bg-gray-50 dark:hover:bg-slate-800/50
                    ${
                        checked
                            ? "border-primary bg-primary/5 dark:border-primary/70 dark:bg-primary/10"
                            : "border-gray-400/50 dark:border-gray-600"
                    }
                    ${
                        disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                    }
                `}
            >
                <div
                    className={`
                    flex items-center justify-center
                    size-4 rounded-full border-2
                    mr-3 transition-all duration-200
                    ${
                        checked
                            ? "border-primary dark:border-primary/70"
                            : "border-gray-300 dark:border-slate-600"
                    }
                `}
                >
                    <div
                        className={`
                        size-2 rounded-full
                        transition-all duration-200
                        ${
                            checked
                                ? "bg-primary dark:bg-primary/70 scale-100"
                                : "bg-transparent scale-0"
                        }
                    `}
                    />
                </div>
                <span
                    className={`
                    text-sm
                    ${
                        checked
                            ? "text-gray-900 font-medium dark:text-white"
                            : "text-gray-700 dark:text-slate-300"
                    }
                `}
                >
                    {label}
                </span>
            </label>
        </div>
    );

    const handleChange = (e) => {
        if (onChange) {
            onChange(e); // Passing the entire event object
        }
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* Label */}
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {label}
                        {required && (
                            <span className="ml-1 text-red-500/70 dark:text-red-400/70">
                                *
                            </span>
                        )}
                    </label>
                </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
                {options.map((option, index) => (
                    <RadioOption
                        key={index}
                        id={`${name}-${option.value}`}
                        name={name}
                        label={option.label}
                        value={option.value}
                        checked={value === option.value}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-1.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4 text-red-500/70 dark:text-red-400/70"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <p className="text-sm text-red-500/70 dark:text-red-400/70">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}
