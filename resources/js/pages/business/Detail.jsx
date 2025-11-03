import RootLayout from "../../components/layouts/RootLayout";
import ContentCard from "../../components/layouts/ContentCard";
import Button from "../../components/buttons/Button";

export default function BusinessDetail({ business }) {
    return (
        <RootLayout title={`Detail Bisnis - ${business.name}`}>
            <ContentCard title="Detail Bisnis" backPath="/business">
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                            Nama Bisnis
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {business.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                            Deskripsi
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">
                            {business.description || "-"}
                        </p>
                    </div>
                    <div className="pt-4">
                        <Button label="Kembali" href="/business" className="w-full sm:w-auto" />
                    </div>
                </div>
            </ContentCard>
        </RootLayout>
    );
}

