import { useState, forwardRef } from "react";

function FormTextareaComponent({
    name,
    label,
    value,
    placeholder,
    onChange,
    error,
    readonly = false,
    required = false,
    disabled = false,
    autoFocus = false,
    helpText,
    className = "",
    rows = 3,
    cols,
}, forwardedRef) {
    const [isFocused, setIsFocused] = useState(false);
    
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
            </div>
        );
    };

    const renderHelpText = () => {
        if (!helpText || error) return null;

        return (
            <p className="text-sm text-gray-700 dark:text-slate-300/80">
                {helpText}
            </p>
        );
    };

    const renderError = () => {
        if (!error) return null;

        return (
            <div className="flex gap-1.5 items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="text-red-500/70 dark:text-red-400/70 size-4"
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
            <div className="relative w-full">
                <textarea
                    ref={forwardedRef}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    readOnly={readonly}
                    required={required}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    rows={rows}
                    cols={cols}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        w-full h-auto transition-all duration-200 outline-none flex-1
                        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
                        ${
                            readonly
                                ? "cursor-not-allowed bg-gray-50 dark:bg-slate-800/40"
                                : "bg-white dark:bg-slate-800/40"
                        }
                        ${getFocusRingStyles()} px-4 py-3 rounded-lg border ${getBorderStyles()}
                        text-gray-900 dark:text-slate-200 placeholder:text-gray-400
                        dark:placeholder:text-slate-400 focus:ring-2
                    `}
                />
            </div>
            {renderHelpText()}
            {renderError()}
        </div>
    );
}

export default forwardRef(FormTextareaComponent);