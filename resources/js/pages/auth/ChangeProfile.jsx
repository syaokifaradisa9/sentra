import { useForm, usePage } from '@inertiajs/react';
import Button from '../../components/buttons/Button';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import ContentCard from '../../components/layouts/ContentCard';
import RootLayout from '../../components/layouts/RootLayout';

export default function ChangeProfile() {
    const { user } = usePage().props || {};

    const { data, setData, put, processing } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        position: user?.position || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/auth/update-profile');
    };

    return (
        <RootLayout title="Ubah Profile | Sentra">
            <ContentCard title="Ubah Profile">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInput
                            id="name"
                            name="name"
                            type="text"
                            label="Nama"
                            placeholder="Masukkan nama lengkap"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <FormInput
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="Masukkan alamat email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInput
                            id="phone"
                            name="phone"
                            type="tel"
                            prefix="+62"
                            label="No. Telepon"
                            placeholder="Masukkan nomor telepon"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <FormInput
                            id="position"
                            name="position"
                            type="text"
                            label="Jabatan"
                            placeholder="Masukkan jabatan Anda"
                            value={data.position}
                            onChange={(e) =>
                                setData('position', e.target.value)
                            }
                        />
                    </div>
                    <FormTextarea
                        id="address"
                        name="address"
                        label="Alamat"
                        placeholder="Masukkan alamat lengkap"
                        value={data.address}
                        className="mb-4"
                        onChange={(e) => setData('address', e.target.value)}
                        rows="3"
                    />
                    <Button
                        type="submit"
                        label="Simpan Perubahan"
                        className="w-full"
                        isLoading={processing}
                    />
                </form>
            </ContentCard>
        </RootLayout>
    );
}
