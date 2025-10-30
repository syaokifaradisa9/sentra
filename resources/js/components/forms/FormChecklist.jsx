import React from "react";
import FormCheckbox from "./FormCheckBox";

export default function FormChecklist({
    label,
    options = [],
    values = [],
    onChange,
    className = "",
    emptyText = "Data tidak tersedia",
}) {
    const normalize = (collection) => {
        if (!collection) {
            return [];
        }

        if (Array.isArray(collection)) {
            return collection.map((value) => String(value));
        }

        if (typeof collection[Symbol.iterator] === "function") {
            return Array.from(collection).map((value) => String(value));
        }

        if (
            typeof collection === "object" &&
            collection !== null &&
            typeof collection.length === "number"
        ) {
            return Array.from({ length: collection.length }, (_, index) =>
                String(collection[index])
            ).filter((value) => value !== "undefined");
        }

        return [];
    };

    const normalizedValues = normalize(values);

    const handleToggle = (optionValue) => {
        if (!onChange) {
            return;
        }

        const optionKey = String(optionValue);
        const isSelected = normalizedValues.includes(optionKey);
        const nextValues = isSelected
            ? normalizedValues.filter((value) => value !== optionKey)
            : [...normalizedValues, optionKey];

        onChange(nextValues);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    {label}
                </p>
            )}
            {options.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    {emptyText}
                </p>
            )}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {options.map((option) => (
                    <FormCheckbox
                        key={option.id}
                        label={option.label}
                        checked={normalizedValues.includes(String(option.id))}
                        onChange={() => handleToggle(option.id)}
                    />
                ))}
            </div>
        </div>
    );
}
