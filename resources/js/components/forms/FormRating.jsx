import React, { useState } from "react";
import { Star } from "lucide-react";

export default function FormRating({
    label,
    initialValue = 0,
    maxStars = 5,
    size = "default",
    onChange,
    error,
    required = false,
    readOnly = false,
    description,
}) {
    const [rating, setRating] = useState(initialValue);
    const [hoverRating, setHoverRating] = useState(0);

    const sizeVariants = {
        small: {
            container: "gap-1",
            star: "size-4",
            label: "text-sm",
        },
        default: {
            container: "gap-1.5",
            star: "size-5",
            label: "text-base",
        },
        large: {
            container: "gap-2",
            star: "size-6",
            label: "text-lg",
        },
    };

    const selectedSize = sizeVariants[size] || sizeVariants.default;

    const handleClick = (value) => {
        if (!readOnly) {
            setRating(value);
            onChange?.(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (!readOnly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
        }
    };

    return (
        <div className="space-y-1.5">
            {label && (
                <div className="flex items-center gap-2">
                    <label
                        className={`font-medium text-slate-700 dark:text-slate-200 ${selectedSize.label}`}
                    >
                        {label}
                    </label>
                    {required && (
                        <span className="text-sm font-medium text-red-500">
                            *
                        </span>
                    )}
                </div>
            )}

            <div
                className={`inline-flex items-center ${selectedSize.container}`}
                onMouseLeave={handleMouseLeave}
            >
                {[...Array(maxStars)].map((_, index) => {
                    const value = index + 1;
                    const isHovered = value <= hoverRating;
                    const isSelected = value <= rating;

                    return (
                        <button
                            key={`star-${index}`}
                            type="button"
                            className={`
                                group transition-colors
                                ${
                                    !readOnly &&
                                    "hover:scale-110 active:scale-95"
                                }
                                ${
                                    readOnly
                                        ? "cursor-default"
                                        : "cursor-pointer"
                                }
                            `}
                            onClick={() => handleClick(value)}
                            onMouseEnter={() => handleMouseEnter(value)}
                            disabled={readOnly}
                        >
                            <Star
                                className={`
                                    ${selectedSize.star}
                                    transition-all duration-150
                                    ${
                                        isHovered || isSelected
                                            ? "fill-yellow-400 stroke-yellow-400"
                                            : "fill-transparent stroke-slate-300 dark:stroke-slate-600"
                                    }
                                    ${
                                        !readOnly &&
                                        "group-hover:stroke-yellow-400"
                                    }
                                `}
                            />
                        </button>
                    );
                })}
            </div>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            )}
            {error && (
                <p className="text-sm text-red-500/70 dark:text-red-400/70">
                    {error}
                </p>
            )}
        </div>
    );
}
