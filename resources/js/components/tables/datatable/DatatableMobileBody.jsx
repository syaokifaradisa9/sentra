export default function DatatableMobileBody({ dataTable, cardItem }) {
    return (
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {dataTable.data?.length ? (
                dataTable.data.map((item, index) => (
                    <div key={`mobile-${item.id}-${index}`}>{cardItem(item)}</div>
                ))
            ) : (
                <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    Data Masih Kosong
                </div>
            )}
        </div>
    );
}
