export default function ForEachUtils({ lists, child, empty }) {
    if (lists.length === 0) return empty;
    return <>{lists.map((item, index) => child(item, index))}</>;
}
