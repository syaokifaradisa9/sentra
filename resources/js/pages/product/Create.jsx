import { useMemo } from "react";
import { useForm } from "@inertiajs/react";
import RootLayout from "../../components/layouts/RootLayout";
import ContentCard from "../../components/layouts/ContentCard";
import FormSelect from "../../components/forms/FormSelect";
import FormInput from "../../components/forms/FormInput";
import FormTextArea from "../../components/forms/FormTextArea";
import FormCheckbox from "../../components/forms/FormCheckBox";
import FormFile from "../../components/forms/FormFile";
import Button from "../../components/buttons/Button";

export default function ProductCreate({ categories = [], categoryOptions: categoryOptionsProp = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
        branch_ids: [],
        price: "",
        description: "",
        photo: null,
    });

    const categorySelectOptions = useMemo(() => {
        const source = categoryOptionsProp.length > 0 ? categoryOptionsProp : categories;

        return source.map((category) => ({
            value: category.id,
            label: category.name,
        }));
    }, [categoryOptionsProp, categories]);

    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === Number(data.category_id)),
        [categories, data.category_id]
    );

    const availableBranches = selectedCategory?.branches ?? [];
    const hasSelectedCategory = Boolean(selectedCategory);

    const toggleBranch = (branchId) => {
        const numericId = Number(branchId);
        setData((prev) => {
            const list = Array.isArray(prev.branch_ids) ? prev.branch_ids : [];
            const branchIds = list.includes(numericId)
                ? list.filter((id) => id !== numericId)
                : [...list, numericId];

            return {
                ...prev,
                branch_ids: branchIds,
            };
        });
    };

    const onCategoryChange = (event) => {
        const { value } = event.target;
        setData((prev) => ({
            ...prev,
            category_id: value,
            branch_ids: [],
        }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0] ?? null;
        setData((prev) => ({
            ...prev,
            photo: file,
        }));
    };

    const onSubmit = (event) => {
        event.preventDefault();
        post("/products", {
            forceFormData: true,
        });
    };

    const branchValidationMessage = errors.branch_ids
        ?? Object.entries(errors)
            .find(([key]) => key.startsWith("branch_ids."))?.[1];

    return (
        <RootLayout title="Tambah Produk">
            <ContentCard title="Tambah Produk" backPath="/products">
                <form onSubmit={onSubmit} className="space-y-6" encType="multipart/form-data">
                    <div className="grid gap-6 md:grid-cols-2">
                        <FormInput
                            label="Nama Produk"
                            name="name"
                            value={data.name}
                            onChange={(event) => setData("name", event.target.value)}
                            placeholder="Masukkan nama produk"
                            error={errors.name}
                            required
                        />

                        <FormSelect
                            name="category_id"
                            label="Kategori"
                            value={data.category_id}
                            onChange={onCategoryChange}
                            options={categorySelectOptions}
                            placeholder="Pilih kategori"
                            error={errors.category_id}
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Cabang
                        </p>
                        {!hasSelectedCategory ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Pilih kategori untuk menampilkan cabang yang tersedia.
                            </p>
                        ) : availableBranches.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Tidak ada cabang yang tersedia untuk kategori ini.
                            </p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {availableBranches.map((branch) => (
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
                        {branchValidationMessage && (
                            <p className="text-sm text-red-600">{branchValidationMessage}</p>
                        )}
                    </div>

                    <FormInput
                        label="Harga"
                        name="price"
                        type="number"
                        step="0.01"
                        value={data.price}
                        onChange={(event) => setData("price", event.target.value)}
                        placeholder="Masukkan harga"
                        error={errors.price}
                        required
                    />

                    <FormTextArea
                        label="Deskripsi"
                        name="description"
                        value={data.description}
                        onChange={(event) => setData("description", event.target.value)}
                        placeholder="Tulis deskripsi produk (opsional)"
                        error={errors.description}
                        rows={4}
                    />

                    <FormFile
                        name="photo"
                        label="Foto Produk"
                        onChange={handlePhotoChange}
                        error={errors.photo}
                        accept="image/*"
                        maxSize={2}
                    />

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
