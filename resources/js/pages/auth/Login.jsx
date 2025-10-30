import { useForm, usePage, Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { LogIn } from "lucide-react";
import FormInput from "../../Components/Forms/FormInput";
import Button from "../../Components/Buttons/Button";
import ThemeToggle from "../../Components/Common/ThemeToggle";

export default function Login() {
    const { setData, post, processing, errors } = useForm({
        email: "",
        password: "",
    });

    const { flash } = usePage().props;
    useEffect(() => {
        const { type, message } = flash || {};

        if (type == "success") toast.success(message);
        if (type == "error") toast.error(message);
    }, [flash]);

    const onSubmit = (e) => {
        e.preventDefault();
        post("/auth/verify");
    };

    return (
        <>
            <Head title="Login | Sentra" />
            <div className="min-h-screen transition-colors duration-200 bg-primary/30 dark:bg-slate-900">
                <Toaster position="bottom-right" />

                <main className="relative flex items-center justify-center min-h-screen">
                    <div className="relative w-full h-screen bg-white md:h-auto md:max-w-4xl md:m-4 dark:bg-slate-800/80 md:rounded-2xl md:shadow-lg md:shadow-primary/5 dark:md:shadow-slate-900/50 md:border md:border-gray-200 dark:md:border-slate-700/50 md:backdrop-blur-sm">
                        <div className="grid h-full md:h-auto md:grid-cols-2">
                            <div className="relative hidden overflow-hidden md:block bg-primary md:rounded-l-2xl">
                                <div className="absolute inset-0">
                                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#70D0E0] rounded-full -translate-x-1/2 -translate-y-1/2" />
                                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#70D0E0] rounded-full translate-x-1/2 translate-y-1/2" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#70D0E0]/50" />
                                </div>
                                <div className="relative flex flex-col items-center justify-center h-full p-8 text-center lg:p-12">
                                    <div className="w-full max-w-xs space-y-8">
                                        <div className="space-y-3">
                                            <h2 className="text-2xl font-medium text-white">
                                                Selamat Datang di Sentra
                                            </h2>
                                            <p className="text-sm leading-relaxed text-white/80">
                                                Bisnis Lebih Praktis dalam Satu Genggaman
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center h-screen px-6 py-8 md:h-auto md:p-12">
                                <div className="w-full max-w-sm mx-auto space-y-6">
                                    <div className="flex items-center justify-center gap-4 md:gap-6">
                                        {/* FarmalkesLogo removed */}
                                    </div>
                                    <div className="pb-2 text-center md:hidden">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Selamat Datang di Sentra
                                        </h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="hidden md:block">
                                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Masuk
                                            </h1>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                                                Masukkan kredensial Anda untuk
                                                mengakses akun
                                            </p>
                                        </div>
                                        <form
                                            onSubmit={onSubmit}
                                            className="space-y-4"
                                        >
                                            <FormInput
                                                name="email"
                                                label="Email"
                                                placeholder="nama@perusahaan.com"
                                                type="email"
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors?.email}
                                            />
                                            <FormInput
                                                name="password"
                                                label="Kata Sandi"
                                                placeholder="••••••••"
                                                type="password"
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors?.password}
                                            />

                                            <div className="pt-2 space-y-3">
                                                <Button
                                                    isLoading={processing}
                                                    label="Masuk"
                                                    icon={
                                                        <LogIn className="size-4" />
                                                    }
                                                    type="submit"
                                                    className="w-full h-10 transition-colors rounded-lg bg-primary hover:bg-darkprimary md:h-11"
                                                />
                                            </div>
                                        </form>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Theme toggle positioned at bottom right */}
                <div className="fixed bottom-4 right-4 z-50">
                    <ThemeToggle />
                </div>
            </div>
        </>
    );
}
