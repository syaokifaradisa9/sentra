import { useForm } from "@inertiajs/react";
import RootLayout from "../../components/layouts/RootLayout";
import ContentCard from "../../components/layouts/ContentCard";
import FormInput from "../../components/forms/FormInput";
import FormCheckbox from "../../components/forms/FormCheckBox";
import Button from "../../components/buttons/Button";

export default function CategoryCreate({ branches = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        branch_ids: [],
    });

    const branchErrorKey = Object.keys(errors).find((key) =>
        key.startsWith("branch_ids.")
    );
    const branchErrorMessage =
        errors.branch_ids ?? (branchErrorKey ? errors[branchErrorKey] : null);

    const toggleBranch = (branchId) => {
        const selected = data.branch_ids.includes(branchId)
            ? data.branch_ids.filter((id) => id !== branchId)
            : [...data.branch_ids, branchId];

        setData("branch_ids", selected);
    };

    const onSubmit = (event) => {
        event.preventDefault();
        post("/categories", {
            preserveScroll: true,
        });
    };

    return (
        <RootLayout title="Tambah Kategori">
            <ContentCard title="Tambah Kategori" backPath="/categories">
                <form onSubmit={onSubmit} className="space-y-6">
                    <FormInput
                        label="Nama Kategori"
                        name="name"
                        value={data.name}
                        onChange={(event) => setData("name", event.target.value)}
                        placeholder="Masukkan nama kategori"
                        error={errors.name}
                    />

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Cabang
                        </p>
                        {branches.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Tidak ada cabang yang tersedia untuk pengguna ini.
                            </p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {branches.map((branch) => (
                                    <FormCheckbox
                                        key={branch.id}
                                        label={branch.name}
                                        name="branch_ids[]"
                                        checked={data.branch_ids.includes(branch.id)}
                                        onChange={() => toggleBranch(branch.id)}
                                    />
                                ))}
                            </div>
                        )}
                        {branchErrorMessage && (
                            <p className="text-sm text-red-600">
                                {branchErrorMessage}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        label="Simpan"
                        isLoading={processing}
                        className="w-full"
                    />
                </form>
            </ContentCard>
        </RootLayout>
    );
}
