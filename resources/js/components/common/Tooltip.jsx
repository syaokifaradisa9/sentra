export default function Tooltip({ children, text }) {
    return (
        <div className="relative inline-block group">
            {children}
            <span className="absolute z-10 hidden px-2 py-1 mb-2 text-xs text-white -translate-x-1/2 bg-gray-800 rounded left-1/2 bottom-full group-hover:block whitespace-nowrap">
                {text}
            </span>
        </div>
    );
}
