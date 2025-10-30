import { Link } from "@inertiajs/react";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Optional for smooth animations

export default function DropdownButton({ icon, items }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex items-center p-2 text-sm font-medium rounded-lg
                          text-[#00A7A1] hover:bg-[#E6F5F5]
                          dark:text-teal-400 dark:hover:bg-slate-700/50
                          transition-colors duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-[#00A7A1] focus:ring-offset-2
                          dark:focus:ring-teal-500 dark:focus:ring-offset-slate-800"
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {icon}
            </button>
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 z-50 mt-2 min-w-[11rem] origin-top-right
                             bg-white dark:bg-slate-800
                             border border-gray-300/90 dark:border-slate-700/50
                             rounded-lg shadow-lg shadow-gray-200/80 dark:shadow-slate-900/30
                             backdrop-blur-sm"
                >
                    <div className="py-1">
                        {items.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={() => {
                                    setIsOpen(false);
                                    item.onClick?.();
                                }}
                                className="flex items-center px-4 py-2.5 text-sm
                                         text-slate-700 hover:text-[#00A7A1] hover:bg-[#E6F5F5]
                                         dark:text-slate-300 dark:hover:text-teal-400 dark:hover:bg-slate-700/50
                                         transition-colors duration-200 ease-in-out"
                            >
                                {item.icon && (
                                    <span className="mr-2 text-slate-400 dark:text-slate-500">
                                        {item.icon}
                                    </span>
                                )}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
