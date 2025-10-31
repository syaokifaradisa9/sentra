import { useForm } from '@inertiajs/react';
import Button from '../../components/buttons/Button';
import FormInput from '../../components/forms/FormInput';
import ContentCard from '../../components/layouts/ContentCard';
import RootLayout from '../../components/layouts/RootLayout';

export default function ChangePassword() {
    const { data, setData, put, processing, errors } = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/auth/update-password');
    };

    return (
        <RootLayout title="Ubah Password | Sentra">
            <ContentCard title="Ubah Password">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 md:grid-cols-1"
                >
                    <div>
                        <FormInput
                            id="current_password"
                            name="current_password"
                            type="password"
                            label="Password Saat Ini"
                            placeholder="Masukkan password saat ini"
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            error={errors.current_password}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <FormInput
                                id="new_password"
                                name="new_password"
                                type="password"
                                label="Password Baru"
                                placeholder="Masukkan password baru"
                                value={data.new_password}
                                onChange={(e) =>
                                    setData('new_password', e.target.value)
                                }
                                minLength="8"
                                helpText="Minimal 8 karakter"
                                error={errors.new_password}
                            />
                        </div>
                        <FormInput
                            id="new_password_confirmation"
                            name="new_password_confirmation"
                            type="password"
                            label="Konfirmasi Password Baru"
                            placeholder="Konfirmasi password baru"
                            value={data.new_password_confirmation}
                            onChange={(e) =>
                                setData(
                                    'new_password_confirmation',
                                    e.target.value,
                                )
                            }
                            minLength="8"
                            error={errors.new_password_confirmation}
                        />
                    </div>

                    <Button
                        type="submit"
                        label="Ganti Password"
                        className="w-full"
                        isLoading={processing}
                    />
                </form>
            </ContentCard>
        </RootLayout>
    );
}
