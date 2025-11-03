import { useMemo } from "react";
import { useForm } from "@inertiajs/react";
import RootLayout from "../../components/layouts/RootLayout";
import ContentCard from "../../components/layouts/ContentCard";
import FormSelect from "../../components/forms/FormSelect";
import FormInput from "../../components/forms/FormInput";
import FormTextArea from "../../components/forms/FormTextArea";
import Button from "../../components/buttons/Button";

export default function BranchCreate({ businesses = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        business_id: "",
        name: "",
        address: "",
        opening_time: "",
        closing_time: "",
    });

    const businessOptions = useMemo(
        () =>
            businesses.map((business) => ({
                value: business.id,
                label: business.name,
            })),
        [businesses]
    );

    const onSubmit = (event) => {
        event.preventDefault();

        post("/branches", {
            preserveScroll: true,
            onSuccess: () => reset("name", "address", "opening_time", "closing_time"),
        });
    };

    return (
        <RootLayout title="Tambah Cabang">
            <ContentCard title="Tambah Cabang" backPath="/branches">
                <form onSubmit={onSubmit} className="space-y-6">
                    <FormSelect
                        name="business_id"
                        label="Pilih Bisnis"
                        value={data.business_id}
                        onChange={(event) =>
                            setData("business_id", event.target.value)
                        }
                        options={businessOptions}
                        placeholder="Pilih bisnis"
                        error={errors.business_id}
                        required
                    />

                    <FormInput
                        label="Nama Cabang"
                        name="name"
                        value={data.name}
                        onChange={(event) => setData("name", event.target.value)}
                        placeholder="Masukkan nama cabang"
                        error={errors.name}
                        required
                    />

                    <FormTextArea
                        label="Alamat"
                        name="address"
                        value={data.address}
                        onChange={(event) => setData("address", event.target.value)}
                        placeholder="Masukkan alamat lengkap"
                        error={errors.address}
                        rows={4}
                        required
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Waktu Buka"
                            name="opening_time"
                            type="time"
                            value={data.opening_time}
                            onChange={(event) =>
                                setData("opening_time", event.target.value)
                            }
                            error={errors.opening_time}
                            required
                        />
                        <FormInput
                            label="Waktu Tutup"
                            name="closing_time"
                            type="time"
                            value={data.closing_time}
                            onChange={(event) =>
                                setData("closing_time", event.target.value)
                            }
                            error={errors.closing_time}
                            required
                        />
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

