import { router } from '@inertiajs/react';
import { Building2, Eye, EyeOff, Save, User } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/buttons/Button';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import FormTextArea from '../../components/forms/FormTextArea';
import RootLayout from '../../components/layouts/RootLayout';
import ContentCard from '../../components/layouts/ContentCard';

export default function EmployeeEdit({
    employee,
    businesses = [],
    branches = [],
    currentRole = '',
}) {
    const isBusinessman = currentRole === 'Businessman';
    const isSmallBusinessOwner = currentRole === 'SmallBusinessOwner';

    const initialBusinessId = isBusinessman
        ? String(employee.business_id || businesses[0]?.id || '')
        : '';

    const initialBranchId = employee.branch_id
        ? String(employee.branch_id)
        : '';

    const [formData, setFormData] = useState({
        name: employee.name || '',
        email: employee.email || '',
        password: '',
        password_confirmation: '',
        phone: employee.phone || '',
        address: employee.address || '',
        position: employee.position || '',
        business_id: initialBusinessId,
        branch_id: initialBranchId, // Changed to single branch_id
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleBusinessChange = (event) => {
        const { value } = event.target;
        setFormData((prev) => ({
            ...prev,
            business_id: value,
            branch_id: '', // Reset branch when business changes
        }));

        setErrors((prev) => ({
            ...prev,
            business_id: null,
            branch_id: null,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            branch_id: formData.branch_id
                ? parseInt(formData.branch_id, 10)
                : null,
        };

        if (!isBusinessman) {
            delete payload.business_id;
        }

        if (isSmallBusinessOwner) {
            delete payload.branch_id;
        }

        if (!payload.password) {
            delete payload.password;
        }

        router.put(`/employees/${employee.id}`, payload, {
            onError: (errors) => {
                setErrors(errors);
                setIsLoading(false);
            },
            onSuccess: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <RootLayout title="Edit Karyawan">
            <ContentCard
                title={`Edit Karyawan #${employee.id}`}
                backPath="/employees"
            >
                <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                    Edit data karyawan yang sudah ada
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <FormInput
                            name="name"
                            label="Nama Lengkap"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Masukkan nama lengkap"
                            icon={<User className="h-5 w-5" />}
                        />

                        <FormInput
                            name="phone"
                            label="Nomor Telepon"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="Masukkan nomor telepon"
                            icon={<User className="h-5 w-5" />}
                        />

                        <FormInput
                            name="position"
                            label="Jabatan"
                            value={formData.position}
                            onChange={handleChange}
                            error={errors.position}
                            placeholder="Masukkan jabatan"
                            icon={<User className="h-5 w-5" />}
                        />
                    </div>

                    <FormTextArea
                        name="address"
                        label="Alamat"
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                        placeholder="Masukkan alamat lengkap"
                        rows={3}
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {isBusinessman && (
                            <FormSelect
                                name="business_id"
                                label="Bisnis"
                                value={formData.business_id}
                                onChange={handleBusinessChange}
                                options={businesses.map((business) => ({
                                    value: business.id,
                                    label: business.name,
                                }))}
                                placeholder="Pilih bisnis"
                                error={errors.business_id}
                                icon={<Building2 className="h-5 w-5" />}
                            />
                        )}

                        {isSmallBusinessOwner ? (
                            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 sm:col-span-2">
                                Cabang untuk karyawan ini akan mengikuti cabang
                                pemilik saat ini.
                            </div>
                        ) : (
                            <FormSelect
                                name="branch_id"
                                label="Cabang"
                                value={formData.branch_id}
                                onChange={handleChange}
                                options={
                                    isBusinessman
                                        ? branches
                                              .filter(
                                                  (branch) =>
                                                      String(
                                                          branch.business_id,
                                                      ) ===
                                                      String(
                                                          formData.business_id,
                                                      ),
                                              )
                                              .map((branch) => ({
                                                  value: branch.id,
                                                  label: branch.name,
                                              }))
                                        : branches.map((branch) => ({
                                              value: branch.id,
                                              label: branch.name,
                                          }))
                                }
                                placeholder="Pilih cabang"
                                error={errors.branch_id}
                            />
                        )}
                    </div>

                    <FormInput
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="Masukkan alamat email"
                        icon={<User className="h-5 w-5" />}
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FormInput
                            name="password"
                            label="Kata Sandi Baru (Opsional)"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Masukkan kata sandi baru (kosongkan jika tidak diubah)"
                            icon={
                                showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )
                            }
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            }
                        />

                        <FormInput
                            name="password_confirmation"
                            label="Konfirmasi Kata Sandi Baru (Opsional)"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            error={errors.password_confirmation}
                            placeholder="Ulangi kata sandi baru (kosongkan jika tidak diubah)"
                            icon={
                                showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )
                            }
                        />
                    </div>
                    <Button
                        icon={<Save className="size-4" />}
                        className="w-full"
                        type="submit"
                        label="Simpan"
                        isLoading={isLoading}
                    />
                </form>
            </ContentCard>
        </RootLayout>
    );
}
