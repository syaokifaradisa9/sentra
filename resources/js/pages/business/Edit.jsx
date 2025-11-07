import ContentCard from "../../components/layouts/ContentCard";
import RootLayout from "../../components/layouts/RootLayout";
import { useForm } from "@inertiajs/react";
import { Save } from "lucide-react";
import Button from "../../components/buttons/Button";
import FormInput from "../../components/forms/FormInput";
import FormTextArea from "../../components/forms/FormTextArea";

export default function BusinessEdit({ business }) {
    const { data, setData, put, processing, errors } = useForm({
        name: business?.name || '',
        description: business?.description || '',
    });

    function onSubmit(e) {
        e.preventDefault();
        put(`/business/${business.id}/update`, {
            onSuccess: () => {
                // Redirect to business index on success
            }
        });
    }

    return (
        <RootLayout title="Edit Data Bisnis">
            <ContentCard title={`Edit Data Bisnis #${business.id}`} backPath="/business">
                <form onSubmit={onSubmit} className="space-y-4" method="post">
                    <div className="grid gap-4 md:grid-cols-1">
                        <FormInput
                            label="Nama Bisnis"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Isikan Nama Bisnis"
                            error={errors.name}
                        />
                        <FormTextArea
                            label="Deskripsi Bisnis"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Isikan Deskripsi Bisnis"
                            error={errors.description}
                        />
                    </div>
                    <Button
                        icon={<Save className="size-4" />}
                        label="Simpan Perubahan"
                        type="submit"
                        isLoading={processing}
                        className="w-full"
                    />
                </form>
            </ContentCard>
        </RootLayout>
    );
}
