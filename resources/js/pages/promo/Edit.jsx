import { useForm } from '@inertiajs/react';
import { CalendarDays, Percent, Save } from 'lucide-react';
import Button from '../../components/buttons/Button';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import ContentCard from '../../components/layouts/ContentCard';
import RootLayout from '../../components/layouts/RootLayout';

export default function PromoEdit({
    promo,
    products = { all: [], by_business: {}, by_branch: {} },
    businesses = [],
    branches = [],
}) {
    const { data, setData, put, processing, errors } = useForm({
        product_id: promo?.product?.id ? String(promo.product.id) : '',
        scope_type: promo?.scope_type ?? 'business',
        scope_id: promo?.scope_id ? String(promo.scope_id) : '',
        start_date: promo?.start_date ?? '',
        end_date: promo?.end_date ?? '',
        percent_discount: promo?.percent_discount ?? '',
        price_discount: promo?.price_discount ?? '',
        usage_limit: promo?.usage_limit ?? '',
    });

    const scopeType = data.scope_type;
    const businessProductOptions = products.by_business ?? {};
    const branchProductOptions = products.by_branch ?? {};

    const handleScopeTypeChange = (event) => {
        const { value } = event.target;
        setData((prev) => ({
            ...prev,
            scope_type: value,
            scope_id: '',
            product_id: '',
        }));
    };

    const handleScopeChange = (event) => {
        const { value } = event.target;
        setData((prev) => ({
            ...prev,
            scope_id: value,
            product_id: '',
        }));
    };

    const scopedProducts = () => {
        if (scopeType === 'business' && data.scope_id) {
            return businessProductOptions[data.scope_id] ?? [];
        }

        if (scopeType === 'branch' && data.scope_id) {
            return branchProductOptions[data.scope_id] ?? [];
        }

        return products.all ?? [];
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        put(`/promos/${promo.id}`);
    };

    return (
        <RootLayout title={`Edit Promo #${promo.id}`}>
            <ContentCard title="Edit Promo" backPath="/promos">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div
                        className={`grid gap-4 ${
                            scopeType === 'product'
                                ? 'md:grid-cols-2'
                                : 'md:grid-cols-3'
                        }`}
                    >
                        <FormSelect
                            name="scope_type"
                            label="Jenis Promo"
                            value={data.scope_type}
                            onChange={handleScopeTypeChange}
                            options={[
                                {
                                    value: 'product',
                                    label: 'Per Produk (Semua Cabang)',
                                },
                                { value: 'business', label: 'Per Bisnis' },
                                { value: 'branch', label: 'Per Cabang' },
                            ]}
                            placeholder="Pilih cakupan promo"
                            error={errors.scope_type}
                            required
                        />

                        {scopeType !== 'product' && (
                            <FormSelect
                                name="scope_id"
                                label={
                                    scopeType === 'business'
                                        ? 'Pilih Bisnis'
                                        : 'Pilih Cabang'
                                }
                                value={data.scope_id}
                                onChange={handleScopeChange}
                                options={
                                    scopeType === 'business'
                                        ? businesses.map((business) => ({
                                              value: business.id,
                                              label: business.name,
                                          }))
                                        : branches.map((branch) => ({
                                              value: branch.id,
                                              label: branch.name,
                                          }))
                                }
                                placeholder={
                                    scopeType === 'business'
                                        ? 'Pilih bisnis'
                                        : 'Pilih cabang'
                                }
                                error={errors.scope_id}
                                required
                            />
                        )}

                        <FormSelect
                            name="product_id"
                            label="Produk"
                            value={data.product_id}
                            onChange={(event) =>
                                setData('product_id', event.target.value)
                            }
                            options={scopedProducts()}
                            placeholder="Pilih produk"
                            error={errors.product_id}
                            required
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilih cakupan promo: semua cabang, bisnis tertentu, atau
                        cabang tertentu untuk produk yang dipilih.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            name="start_date"
                            type="date"
                            label="Tanggal Mulai"
                            value={data.start_date}
                            onChange={(event) =>
                                setData('start_date', event.target.value)
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
                                setData('end_date', event.target.value)
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
                                setData('percent_discount', event.target.value)
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
                                setData('price_discount', event.target.value)
                            }
                            error={errors.price_discount}
                            placeholder="Contoh: 5000"
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Isi minimal salah satu jenis diskon.
                    </p>

                    <FormInput
                        name="usage_limit"
                        type="number"
                        label="Kuota Promo (opsional)"
                        value={data.usage_limit}
                        onChange={(event) =>
                            setData('usage_limit', event.target.value)
                        }
                        error={errors.usage_limit}
                        placeholder="Contoh: 100"
                    />

                    <Button
                        type="submit"
                        label="Simpan Perubahan"
                        isLoading={processing}
                        icon={<Save className="size-4" />}
                        className="w-full"
                    />
                </form>
            </ContentCard>
        </RootLayout>
    );
}
