import { useForm } from "@inertiajs/react";
import RootLayout from "../../components/layouts/RootLayout";
import ContentCard from "../../components/layouts/ContentCard";
import FormInput from "../../components/forms/FormInput";
import FormCheckbox from "../../components/forms/FormCheckBox";
import Button from "../../components/buttons/Button";
import { CATEGORY_ICONS } from "../../constants/categoryIcons";

export default function CategoryCreate({ branches = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        branch_ids: [],
        icon: null,
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
                            Ikon Kategori
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Pilih ikon dari koleksi Lucide. Anda dapat melewati pilihan ini.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                            {CATEGORY_ICONS.map((option) => {
                                const IconComponent = option.icon;
                                const isActive = data.icon === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setData("icon", option.value)}
                                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                                            isActive
                                                ? "border-primary bg-primary/10 text-primary shadow-sm dark:border-teal-400 dark:bg-teal-400/10 dark:text-teal-200"
                                                : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400/40 dark:hover:text-teal-200"
                                        }`}
                                        aria-pressed={isActive}
                                    >
                                        <IconComponent className="h-4 w-4" />
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.icon && (
                            <p className="text-sm text-red-600">{errors.icon}</p>
                        )}
                    </div>

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
