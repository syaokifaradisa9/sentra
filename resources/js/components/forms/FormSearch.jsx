export default function FormSearch({
    name,
    type = "text",
    placeholder,
    onChange,
    className,
    value,
}) {
    return (
        <input
            name={name}
            onChange={onChange}
            type={type}
            value={value}
            placeholder={placeholder}
            className={`text-xs w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 transition-all duration-200 ${className}`}
        />
    );
}
