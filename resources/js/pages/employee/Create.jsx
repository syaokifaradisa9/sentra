import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Eye, EyeOff, User } from 'lucide-react';
import RootLayout from '../../components/layouts/RootLayout';
import Button from '../../components/buttons/Button';
import FormInput from '../../components/forms/FormInput';
import FormTextArea from '../../components/forms/FormTextArea';
import FormSelect from '../../components/forms/FormSelect';
import FormCheckBox from '../../components/forms/FormCheckBox';

export default function EmployeeCreate({ branches = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        position: '',
        branch_ids: [],
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleBranchChange = (branchId) => {
        setFormData((prev) => {
            const newBranchIds = prev.branch_ids.includes(branchId)
                ? prev.branch_ids.filter((id) => id !== branchId)
                : [...prev.branch_ids, branchId];

            return { ...prev, branch_ids: newBranchIds };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        router.post('/employees', formData, {
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
        <RootLayout title="Tambah Karyawan">
            <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm dark:bg-slate-900/80 dark:ring-slate-700">
                <div className="mb-5">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Tambah Karyawan Baru
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Tambahkan data karyawan baru ke sistem
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FormInput
                            name="name"
                            label="Nama Lengkap"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Masukkan nama lengkap"
                            required
                            icon={<User className="h-5 w-5" />}
                        />

                        <FormInput
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="Masukkan alamat email"
                            required
                            icon={<User className="h-5 w-5" />}
                        />

                        <FormInput
                            name="password"
                            label="Kata Sandi"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Masukkan kata sandi"
                            required
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
                                    onClick={() => setShowPassword(!showPassword)}
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
                            name="phone"
                            label="Nomor Telepon"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="Masukkan nomor telepon"
                            required
                            icon={<User className="h-5 w-5" />}
                        />

                        <FormInput
                            name="position"
                            label="Jabatan"
                            value={formData.position}
                            onChange={handleChange}
                            error={errors.position}
                            placeholder="Masukkan jabatan"
                            required
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
                        required
                        rows={3}
                    />

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Cabang
                        </label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {branches.map((branch) => (
                                <FormCheckBox
                                    key={branch.id}
                                    name={`branch_${branch.id}`}
                                    label={branch.name}
                                    checked={formData.branch_ids.includes(branch.id)}
                                    onChange={() => handleBranchChange(branch.id)}
                                    error={errors.branch_ids}
                                />
                            ))}
                        </div>
                        {errors.branch_ids && (
                            <p className="text-sm text-red-500/70 dark:text-red-400/70">
                                {errors.branch_ids}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/employees')}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </RootLayout>
    );
}