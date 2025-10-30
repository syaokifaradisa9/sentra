import React, { useRef, useEffect, useState } from "react";
import { Undo, Redo, Trash2, Edit3, Square } from "lucide-react";

export default function AnnotatableCanvas({
    base64Image,
    maxContainerHeight = "80vh",
    onChange, // callback receives latest raw base64 string
}) {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState("#FF0000");
    const [lineWidth, setLineWidth] = useState(2);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const imageRef = useRef(null);

    const stripPrefix = (dataUrl) => dataUrl.split(",")[1] || "";

    const saveHistory = () => {
        const dataUrl = canvasRef.current.toDataURL();
        const rawBase64 = stripPrefix(dataUrl);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(dataUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onChange?.(rawBase64);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        contextRef.current = ctx;

        const img = new Image();
        imageRef.current = img;
        const src = base64Image.startsWith("data:")
            ? base64Image
            : `data:image/png;base64,${base64Image}`;
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
            const containerWidth = canvas.parentElement.clientWidth;
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerWidth * aspectRatio}px`;
            ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
            ctx.drawImage(img, 0, 0);
            const initialUrl = canvas.toDataURL();
            setHistory([initialUrl]);
            setHistoryIndex(0);
            onChange?.(stripPrefix(initialUrl));
        };
    }, [base64Image]);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = strokeColor;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [strokeColor, lineWidth]);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const { x, y } = getCoords(e.nativeEvent);
        contextRef.current.strokeStyle = strokeColor;
        contextRef.current.lineWidth = lineWidth;
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const finishDrawing = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        contextRef.current.closePath();
        setIsDrawing(false);
        saveHistory();
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const { x, y } = getCoords(e.nativeEvent);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const undo = (e) => {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const img = new Image();
            const url = history[newIndex];
            img.src = url;
            img.onload = () => {
                const ctx = contextRef.current;
                ctx.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );
                ctx.drawImage(img, 0, 0);
                onChange?.(stripPrefix(url));
            };
        }
    };

    const redo = (e) => {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const img = new Image();
            const url = history[newIndex];
            img.src = url;
            img.onload = () => {
                const ctx = contextRef.current;
                ctx.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );
                ctx.drawImage(img, 0, 0);
                onChange?.(stripPrefix(url));
            };
        }
    };

    const clearCanvas = (e) => {
        e.preventDefault();
        const ctx = contextRef.current;
        const img = imageRef.current;
        if (img && img.complete) {
            ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
            ctx.drawImage(img, 0, 0);
            saveHistory();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 p-2 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700">
                    <div
                        className="relative w-6 h-6 overflow-hidden border-2 border-gray-200 rounded-full shadow-sm dark:border-gray-600"
                        style={{ backgroundColor: strokeColor }}
                    >
                        <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => {
                                e.preventDefault();
                                setStrokeColor(e.target.value);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ukuran
                    </span>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => {
                            e.preventDefault();
                            setLineWidth(parseInt(e.target.value));
                        }}
                        className="w-24 accent-blue-500 dark:accent-blue-400"
                    />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[2rem]">
                        {lineWidth}px
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition duration-200 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        <Undo className="w-4 h-4" />
                        <span>Undo</span>
                    </button>

                    <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition duration-200 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        <Redo className="w-4 h-4" />
                        <span>Redo</span>
                    </button>

                    <button
                        onClick={clearCanvas}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white transition duration-200 bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            <div className="w-full border border-gray-200 rounded-lg shadow-md dark:border-gray-700">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    onMouseLeave={finishDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={finishDrawing}
                    onTouchMove={draw}
                    className="block w-full cursor-crosshair"
                    style={{ touchAction: "none" }}
                />
            </div>
        </div>
    );
}
