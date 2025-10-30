import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FormSelect({
    name,
    label,
    onChange,
    options = [],
    placeholder = "Select an option",
    error,
    value,
    className = "",
    required = false,
    disabled = false,
    readonly = false,
    icon,
    helpText,
}) {
    // State untuk mengelola fokus pada select
    const [isFocused, setIsFocused] = useState(false);

    // Mendefinisikan gaya dasar yang akan digunakan pada komponen select
    const baseStyles = `
        w-full
        h-11
        pl-4
        pr-10
        text-sm
        rounded-lg
        transition-all
        duration-200
        outline-none
        appearance-none
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        ${
            readonly
                ? "cursor-not-allowed bg-gray-50 dark:bg-slate-800/40"
                : "bg-white dark:bg-slate-800/40"
        }
    `;

    // Fungsi untuk menentukan gaya border berdasarkan status komponen
    const getBorderStyles = () => {
        if (error) {
            return "border-red-500/40 dark:border-red-500/40";
        }
        if (isFocused) {
            return "border-[#60C0D0] dark:border-[#60C0D0]/60";
        }
        return "border-gray-300 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-600/50";
    };

    // Fungsi untuk menentukan gaya ring focus
    const getFocusRingStyles = () => {
        if (error) {
            return "focus:ring-red-500/10 dark:focus:ring-red-500/10";
        }
        return "focus:ring-[#60C0D0]/20 dark:focus:ring-[#60C0D0]/10";
    };

    // Fungsi untuk menentukan warna teks berdasarkan status dan nilai
    const getTextColorStyle = () => {
        if (disabled) return "text-gray-400 dark:text-slate-500";
        // Menggunakan strict comparison untuk memastikan 0 dianggap sebagai nilai valid
        if (value === undefined || value === null || value === "") {
            return "text-gray-400 dark:text-slate-400"; // Warna placeholder
        }
        return "text-gray-900 dark:text-slate-200"; // Warna nilai terpilih
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* Bagian Label */}
            {label && (
                <div className="flex items-center justify-between">
                    <label
                        htmlFor={name}
                        className={`
                            text-sm
                            font-medium
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
            )}

            {/* Container Select */}
            <div className="relative">
                {/* Icon Kiri (jika ada) */}
                {icon && (
                    <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 dark:text-slate-400">
                        {icon}
                    </div>
                )}

                {/* Elemen Select */}
                <select
                    id={name}
                    name={name}
                    // Memastikan value 0 dianggap sebagai nilai valid
                    value={value === undefined || value === null ? "" : value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    required={required}
                    className={`
                        ${baseStyles}
                        ${getTextColorStyle()}
                        border
                        ${getBorderStyles()}
                        ${getFocusRingStyles()}
                        focus:ring-2
                        ${icon ? "pl-10" : ""}
                    `}
                >
                    {/* Option placeholder */}
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>

                    {/* Daftar options */}
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

                {/* Icon Chevron (panah bawah) */}
                <div className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-slate-400">
                    <ChevronDown className="size-4" />
                </div>
            </div>

            {/* Teks Bantuan */}
            {helpText && !error && (
                <p className="text-sm text-gray-500 dark:text-slate-400/80">
                    {helpText}
                </p>
            )}

            {/* Pesan Error */}
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
