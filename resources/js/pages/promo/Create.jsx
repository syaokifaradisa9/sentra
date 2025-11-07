import { useForm } from "@inertiajs/react";
import { CalendarDays, Percent, Save, Tag } from "lucide-react";
import Button from "../../components/buttons/Button";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import ContentCard from "../../components/layouts/ContentCard";
import RootLayout from "../../components/layouts/RootLayout";

export default function PromoCreate({ products = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: "",
        start_date: "",
        end_date: "",
        percent_discount: "",
        price_discount: "",
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/promos");
    };

    return (
        <RootLayout title="Tambah Promo">
            <ContentCard title="Tambah Promo" backPath="/promos">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormSelect
                        name="product_id"
                        label="Produk"
                        value={data.product_id}
                        onChange={(event) =>
                            setData("product_id", event.target.value)
                        }
                        options={products}
                        placeholder="Pilih produk"
                        error={errors.product_id}
                        required
                        icon={<Tag className="size-4" />}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            name="start_date"
                            type="date"
                            label="Tanggal Mulai"
                            value={data.start_date}
                            onChange={(event) =>
                                setData("start_date", event.target.value)
                            }
                            error={errors.start_date}
                            required
                            icon={<CalendarDays className="size-4" />}
                        />
                        <FormInput
                            name="end_date"
                            type="date"
                            label="Tanggal Selesai"
                            value={data.end_date}
                            onChange={(event) =>
                                setData("end_date", event.target.value)
                            }
                            error={errors.end_date}
                            required
                            icon={<CalendarDays className="size-4" />}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            name="percent_discount"
                            type="number"
                            step="0.01"
                            label="Diskon Persen"
                            value={data.percent_discount}
                            onChange={(event) =>
                                setData("percent_discount", event.target.value)
                            }
                            error={errors.percent_discount}
                            icon={<Percent className="size-4" />}
                            placeholder="Contoh: 10"
                        />
                        <FormInput
                            name="price_discount"
                            type="number"
                            step="0.01"
                            label="Diskon Harga"
                            value={data.price_discount}
                            onChange={(event) =>
                                setData("price_discount", event.target.value)
                            }
                            error={errors.price_discount}
                            placeholder="Contoh: 5000"
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Isi minimal salah satu jenis diskon.
                    </p>

                    <Button
                        type="submit"
                        label="Simpan"
                        isLoading={processing}
                        icon={<Save className="size-4" />}
                        className="w-full"
                    />
                </form>
            </ContentCard>
        </RootLayout>
    );
}
