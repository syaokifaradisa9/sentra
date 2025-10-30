import { useState } from "react";

export default function FormTextArea({
    name,
    label,
    value,
    placeholder,
    onChange,
    error,
    readonly = false,
    required = false,
    disabled = false,
    helpText,
    rows = 4,
    maxLength,
    className = "",
}) {
    const [isFocused, setIsFocused] = useState(false);
    const characterCount = value?.length || 0;

    const baseStyles = `
        w-full px-4 py-3 text-sm rounded-lg transition-all duration-200 outline-none
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        ${
            readonly
                ? "cursor-not-allowed bg-gray-50 dark:bg-slate-800/40"
                : "bg-white dark:bg-slate-800/40"
        }
    `;

    const getBorderStyles = () => {
        if (error) {
            return "border-red-500/40 dark:border-red-500/40";
        }
        if (isFocused) {
            return "border-[#60C0D0] dark:border-[#60C0D0]/60";
        }
        return "border-gray-400/50 dark:border-slate-600 dark:hover:border-slate-600/50";
    };

    const getFocusRingStyles = () => {
        if (error) {
            return "focus:ring-red-500/10 dark:focus:ring-red-500/10";
        }
        return "focus:ring-[#60C0D0]/20 dark:focus:ring-[#60C0D0]/10";
    };

    const renderLabel = () => {
        if (!label) return null;

        return (
            <div className="flex items-center justify-between">
                <label
                    htmlFor={name}
                    className={`
                        text-sm font-medium
                        ${
                            disabled
                                ? "text-gray-400 dark:text-slate-500"
                                : "text-gray-700 dark:text-slate-300"
                        }
                    `}
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-red-500/70 dark:text-red-400/70">
                            *
                        </span>
                    )}
                </label>
                {maxLength && (
                    <span
                        className={`text-xs ${
                            characterCount > maxLength * 0.9
                                ? "text-amber-500"
                                : "text-gray-500 dark:text-slate-400"
                        }`}
                    >
                        {characterCount}/{maxLength}
                    </span>
                )}
            </div>
        );
    };

    const renderHelpText = () => {
        if (!helpText || error) return null;

        return (
            <p className="text-sm text-gray-500 dark:text-slate-400/80">
                {helpText}
            </p>
        );
    };

    const renderError = () => {
        if (!error) return null;

        return (
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
        );
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            {renderLabel()}
            <div className="relative">
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    readOnly={readonly}
                    required={required}
                    rows={rows}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        ${baseStyles} ${getBorderStyles()} ${getFocusRingStyles()}
                        border focus:ring-2 text-gray-900 dark:text-slate-200
                        placeholder:text-gray-400 dark:placeholder:text-slate-400/60
                        resize-y
                    `}
                />
            </div>
            {renderHelpText()}
            {renderError()}
        </div>
    );
}
