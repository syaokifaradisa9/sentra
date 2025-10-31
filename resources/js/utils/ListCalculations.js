export const sumList = (list) => {
    if (!Array.isArray(list)) return 0;
    return list.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
};

export const sumListByKey = (list, key) => {
    if (!Array.isArray(list) || !key) return 0;
    return list.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
};

export const calculateTotal = (
    list,
    priceKey = "price",
    qtyKey = "quantity"
) => {
    if (!Array.isArray(list)) return 0;
    return list.reduce(
        (acc, curr) =>
            acc + (Number(curr[priceKey]) || 0) * (Number(curr[qtyKey]) || 0),
        0
    );
};

export const formatCurrency = (amount, locale = "id-ID", currency = "IDR") => {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
};

export const sumMultipleKeys = (list, keys) => {
    if (!Array.isArray(list) || !Array.isArray(keys)) return {};

    return keys.reduce(
        (result, key) => ({
            ...result,
            [key]: sumListByKey(list, key),
        }),
        {}
    );
};

export const findMaxByKey = (list, key) => {
    if (!Array.isArray(list) || !key) return 0;
    return Math.max(...list.map((item) => Number(item[key]) || 0));
};

export const findMinByKey = (list, key) => {
    if (!Array.isArray(list) || !key) return 0;
    return Math.min(...list.map((item) => Number(item[key]) || 0));
};
