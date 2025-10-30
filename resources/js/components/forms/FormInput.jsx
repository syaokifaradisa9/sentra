import { useState, useRef, forwardRef } from "react";
import {
    Eye,
    EyeOff,
    Upload,
    X,
    FileText,
    Image,
    Calendar,
    Plus,
} from "lucide-react";

function FormInputComponent({
    name,
    label,
    type = "text",
    value,
    placeholder,
    onChange,
    onKeyDown,
    error,
    readonly = false,
    required = false,
    disabled = false,
    autoFocus = false,

    // Additional features
    icon,
    helpText,
    accept,
    className = "",
    prefix,
    suffix,
    min,
    max,

    multiple = false,
}, forwardedRef) {
    // State management for various input features
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Internal refs for specialized input types
    const fileInputRef = useRef(null);
    const dateInputRef = useRef(null);

    // Helper functions
    const isDateType = (type) =>
        ["date", "month", "time", "datetime-local"].includes(type);

    // Style definitions
    const baseStyles = `
                h-11 text-sm transition-all duration-200 outline-none flex-1 flex items-center leading-normal
                ${disabled ? "opacity-60 cursor-not-allowed" : ""}
                ${
                    readonly
                        ? "cursor-not-allowed bg-gray-50 dark:bg-slate-800/40"
                        : "bg-white dark:bg-slate-800/40"
                }
            `;

    const getInputPadding = () => {
        let paddingClasses = "px-4";
        if (icon) paddingClasses = `${paddingClasses} pl-10`;
        if (type === "password" || isDateType(type))
            paddingClasses = `${paddingClasses} pr-10`;
        return paddingClasses;
    };

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

    const getInputClassName = () => {
        return `
                ${baseStyles}
                ${getFocusRingStyles()}
                ${getInputPadding()}
                w-full
                focus:ring-2
                text-gray-900
                dark:text-slate-200
                placeholder:text-gray-400
                dark:placeholder:text-slate-400
                border-0
                min-w-0
                text-sm
                leading-[44px]
                flex
                items-center
                h-11
                ${
                    isDateType(type)
                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        : ""
                }
            `;
    };

    const handleFileChange = (e) => {
        const newlySelectedFiles = Array.from(e.target.files);

        if (newlySelectedFiles.length > 0) {
            // Combine existing files with newly selected files
            const combinedFiles = [...files, ...newlySelectedFiles];

            // Update our state
            setFiles(combinedFiles);

            // Generate previews for new image files
            const newImageFiles = newlySelectedFiles.filter((file) =>
                file.type.startsWith("image/")
            );

            if (newImageFiles.length > 0) {
                const currentPreviewUrls = [...previewUrls];

                newImageFiles.forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        currentPreviewUrls.push({
                            name: file.name,
                            url: reader.result,
                        });
                        setPreviewUrls([...currentPreviewUrls]);
                    };
                    reader.readAsDataURL(file);
                });
            }

            // Create a new DataTransfer object to update the actual file input
            const dataTransfer = new DataTransfer();

            // Add all files to the DataTransfer object
            combinedFiles.forEach((file) => {
                dataTransfer.items.add(file);
            });

            // Update the file input's files property
            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;
            }

            // Trigger onChange with the updated file input
            if (onChange) {
                const updatedEvent = {
                    ...e,
                    target: { ...e.target, files: dataTransfer.files },
                };
                onChange(updatedEvent);
            }
        }
    };

    const clearAllFiles = () => {
        setFiles([]);
        setPreviewUrls([]);

        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // Notify parent component
        if (onChange) {
            const emptyDataTransfer = new DataTransfer();
            const emptyEvent = {
                target: {
                    name,
                    files: emptyDataTransfer.files,
                    value: null,
                    type: "file",
                },
            };
            onChange(emptyEvent);
        }
    };

    const removeFile = (indexToRemove) => {
        // Create a new FileList-like object without the removed file
        const dataTransfer = new DataTransfer();

        const newFiles = files.filter((file, index) => {
            if (index !== indexToRemove) {
                dataTransfer.items.add(file);
                return true;
            }
            return false;
        });

        // Update state
        setFiles(newFiles);

        // Update the input's files
        if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files;
        }

        // Update previews - remove the preview for the removed file
        const newPreviewUrls = previewUrls.filter(
            (_, index) => index !== indexToRemove
        );
        setPreviewUrls(newPreviewUrls);

        // Trigger onChange with the updated file input
        if (onChange && fileInputRef.current) {
            const updatedEvent = {
                target: fileInputRef.current,
            };
            onChange(updatedEvent);
        }
    };

    // Date picker handler
    const handleDateFieldClick = (e) => {
        if (!disabled && !readonly && dateInputRef.current) {
            e.preventDefault();
            dateInputRef.current.showPicker();
        }
    };

    // Render helper functions
    const renderPrefix = () => {
        if (!prefix) return null;

        const prefixBaseStyles =
            "flex items-center justify-center h-full whitespace-nowrap border-r border-gray-400/50 dark:border-slate-600";
        const prefixContentStyles =
            "flex items-center justify-center h-full px-4";
        const prefixSpecificStyles = "text-gray-500 dark:text-slate-300";

        return (
            <div className={`${prefixBaseStyles} ${prefixSpecificStyles}`}>
                <div className={prefixContentStyles}>
                    <span className="text-sm inline-flex items-center leading-[44px]">
                        {prefix}
                    </span>
                </div>
            </div>
        );
    };

    const renderSuffix = () => {
        if (!suffix) return null;

        const suffixBaseStyles =
            "flex items-center justify-center h-full whitespace-nowrap border-l border-gray-400/50 dark:border-slate-600";
        const suffixContentStyles =
            "flex items-center justify-center h-full px-4";
        const suffixSpecificStyles = "text-gray-500 dark:text-slate-300";

        return (
            <div className={`${suffixBaseStyles} ${suffixSpecificStyles}`}>
                <div className={suffixContentStyles}>
                    <span className="text-sm inline-flex items-center leading-[44px]">
                        {suffix}
                    </span>
                </div>
            </div>
        );
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

    const renderDateTimeInput = () => {
        return (
            <div className="relative flex-1" onClick={handleDateFieldClick}>
                <input
                    ref={dateInputRef}
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    readOnly={readonly}
                    required={required}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={getInputClassName()}
                />
                <button
                    type="button"
                    onClick={handleDateFieldClick}
                    className="absolute z-10 text-gray-400 transition-colors -translate-y-1/2 dark:hover:text-slate-300 dark:text-slate-400 hover:text-gray-600 right-3 top-1/2"
                >
                    <Calendar className="size-4" />
                </button>
            </div>
        );
    };

    // File input render
    if (type === "file") {
        return (
            <div className={`space-y-1.5 ${className}`}>
                {renderLabel()}
                <div className="relative group">
                    <input
                        ref={fileInputRef}
                        type="file"
                        id={name}
                        name={name}
                        onChange={handleFileChange}
                        accept={accept}
                        className="hidden"
                        disabled={disabled}
                        multiple={multiple}
                    />
                    <div
                        className={`
                                relative flex items-center p-4 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
                                ${
                                    files.length > 0
                                        ? "bg-primary/5 dark:bg-primary/5"
                                        : "bg-gray-50 dark:bg-slate-800/40"
                                }
                                ${getBorderStyles()}
                                hover:border-primary dark:hover:border-primary/60
                                ${
                                    disabled
                                        ? "cursor-not-allowed opacity-60"
                                        : ""
                                }
                            `}
                        onClick={() =>
                            !disabled && fileInputRef.current?.click()
                        }
                    >
                        {files.length > 0 ? (
                            <div className="flex flex-col w-full gap-2">
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                        {files.length}{" "}
                                        {files.length === 1 ? "file" : "files"}{" "}
                                        selected
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearAllFiles();
                                        }}
                                        className="p-1 rounded-full dark:hover:bg-slate-700/50 hover:bg-gray-100"
                                    >
                                        <X className="text-gray-500 dark:text-slate-400 size-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 overflow-y-auto max-h-40">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md dark:bg-slate-800 dark:border-slate-700"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {file.type.startsWith(
                                                    "image/"
                                                ) ? (
                                                    <Image className="text-blue-500 dark:text-blue-400 size-4" />
                                                ) : (
                                                    <FileText className="text-primary dark:text-primary/80 size-4" />
                                                )}
                                                <span className="text-sm text-gray-700 truncate dark:text-slate-300">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(index);
                                                }}
                                                className="p-1 rounded-full dark:hover:bg-slate-700/50 hover:bg-gray-100"
                                            >
                                                <X className="text-gray-500 dark:text-slate-400 size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {multiple && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className="flex items-center justify-center w-full gap-1 p-1 mt-2 text-sm font-medium transition-colors rounded-md text-primary hover:bg-primary/10"
                                    >
                                        <Plus className="size-3" /> Add more
                                        files
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full gap-2">
                                <Upload className="text-primary dark:text-primary/80 size-5" />
                                <div className="text-sm text-center">
                                    <span className="font-semibold text-primary dark:text-primary/80">
                                        Click to upload
                                    </span>{" "}
                                    <span className="text-gray-600 dark:text-slate-400">
                                        or drag and drop
                                    </span>
                                </div>
                                {multiple && (
                                    <p className="text-xs text-gray-600 dark:text-slate-400">
                                        You can select multiple files
                                    </p>
                                )}
                                {accept && (
                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                        {accept.split(",").join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Show previews for image files */}
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {previewUrls.map((preview, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden border border-gray-200 rounded-lg bg-gray-50 dark:bg-slate-800/40 dark:border-slate-700"
                                >
                                    <img
                                        src={preview.url}
                                        alt={`Preview of ${preview.name}`}
                                        className="object-cover w-full h-32"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {renderHelpText()}
                {renderError()}
            </div>
        );
    }

    // Standard input render
    return (
        <div className={`space-y-1.5 ${className}`}>
            {renderLabel()}
            <div className="relative w-full">
                {icon && (
                    <div className="absolute z-10 text-gray-400 -translate-y-1/2 dark:text-slate-400 left-3 top-1/2">
                        {icon}
                    </div>
                )}

                <div
                    className={`flex rounded-lg border ${getBorderStyles()} overflow-hidden`}
                >
                    {prefix && renderPrefix()}
                    {isDateType(type) ? (
                        renderDateTimeInput()
                    ) : (
                        <input
                            ref={forwardedRef}
                            id={name}
                            type={
                                type === "password"
                                    ? showPassword
                                        ? "text"
                                        : "password"
                                    : type
                            }
                            name={name}
                            value={value}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            disabled={disabled}
                            readOnly={readonly}
                            required={required}
                            placeholder={placeholder}
                            min={min}
                            max={max}
                            autoFocus={autoFocus}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={getInputClassName()}
                        />
                    )}
                    {suffix && renderSuffix()}
                </div>

                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-10 text-gray-400 transition-colors -translate-y-1/2 dark:hover:text-slate-300 dark:text-slate-400 hover:text-gray-600 right-3 top-1/2"
                    >
                        {showPassword ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                )}
            </div>

            {renderHelpText()}
            {renderError()}
        </div>
    );
}

export default forwardRef(FormInputComponent);
