import { useState, useCallback, useEffect } from "react";
import { Upload, Trash2, File, Image } from "lucide-react";

const FileListItem = ({ file, onRemove }) => {
    const isImage = file.type.startsWith("image/");
    const [preview, setPreview] = useState(null);

    // Create preview for images
    useEffect(() => {
        if (isImage && file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [file, isImage]);

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10">
                    {preview ? (
                        <img
                            src={preview}
                            alt={file.name}
                            className="object-cover w-10 h-10 rounded"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded dark:bg-gray-700">
                            {isImage ? (
                                <Image className="w-6 h-6 text-gray-500" />
                            ) : (
                                <File className="w-6 h-6 text-gray-500" />
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                        {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onRemove(file)}
                className="p-2 ml-4 text-gray-400 hover:text-red-500"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
};

const FileUploadForm = ({
    name,
    label,
    onChange,
    error,
    accept = "image/*",
    maxSize = 5,
    multiple = false,
    placeholder = "Drop files here or click to upload",
    className = "",
}) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback(
        (newFiles) => {
            const validFiles = Array.from(newFiles).filter((file) => {
                const isValidSize = file.size <= maxSize * 1024 * 1024;
                if (!isValidSize) {
                }
                return isValidSize;
            });

            setFiles((prevFiles) => {
                const updatedFiles = multiple
                    ? [...prevFiles, ...validFiles]
                    : validFiles.slice(0, 1);

                if (onChange) {
                    onChange({
                        target: {
                            name,
                            value: multiple ? updatedFiles : updatedFiles[0] ?? null,
                            files: updatedFiles,
                        },
                    });
                }

                return updatedFiles;
            });
        },
        [multiple, maxSize, name, onChange]
    );

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileChange(e.dataTransfer.files);
        },
        [handleFileChange]
    );

    const handleRemove = useCallback(
        (fileToRemove) => {
            setFiles((prevFiles) => {
                const newFiles = prevFiles.filter((f) => f !== fileToRemove);
                if (onChange) {
                    onChange({
                        target: {
                            name,
                            value: multiple ? newFiles : newFiles[0] ?? null,
                            files: newFiles,
                        },
                    });
                }

                return newFiles;
            });
        },
        [multiple, name, onChange]
    );

    return (
        <div className={`space-y-4 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    {label}
                </label>
            )}

            <div
                className={`relative border-2 border-dashed rounded-lg transition-colors
            ${
                isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 dark:bg-gray-800"
            }
            ${error ? "border-red-500 dark:border-red-500" : ""}
            hover:border-gray-400 dark:hover:border-gray-500`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    name={name}
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => {
                        handleFileChange(e.target.files);
                        e.target.value = ""; // Reset input
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-3 mb-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                        <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {placeholder}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {multiple
                            ? "Upload multiple files up to "
                            : "Maximum file size: "}
                        {maxSize} MB {multiple && "each"}
                    </p>
                </div>
            </div>

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

            {/* Files List */}
            {files.length > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Uploaded Files
                        </h4>
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {files.length} files
                        </span>
                    </div>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <FileListItem
                                key={`${file.name}-${index}`}
                                file={file}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadForm;
