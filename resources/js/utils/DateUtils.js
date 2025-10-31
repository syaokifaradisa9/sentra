export function formatDateTimeID(value) {
    if (!value && value !== 0) return "-";
    let date;
    try {
        if (typeof value === "number") {
            // If seconds (typical from backend), convert to ms if too small
            date = new Date(value < 1e12 ? value * 1000 : value);
        } else if (typeof value === "string") {
            const n = Number(value);
            if (!Number.isNaN(n) && value.trim() !== "") {
                date = new Date(n < 1e12 ? n * 1000 : n);
            } else {
                date = new Date(value);
            }
        } else if (value instanceof Date) {
            date = value;
        }
        if (!date || isNaN(date.getTime())) return "-";

        return new Intl.DateTimeFormat("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(date);
    } catch (e) {
        return "-";
    }
}

