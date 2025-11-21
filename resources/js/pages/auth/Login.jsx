import { useForm, usePage, Head } from "@inertiajs/react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
        if (type === "success") toast.success(message);
        if (type === "error") toast.error(message);
    }, [flash]);

    const onSubmit = (e) => {
        e.preventDefault();
        post("/auth/verify");
    };

    return (
        <>
            <Head title="Login | Sentra" />
            <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
                <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

                <div className="flex min-h-screen">
                    {/* Left Side - Visual & Branding (Hidden on Mobile) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center"
                    >
                        {/* Abstract Background Elements */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/30 rounded-full blur-[120px]" />
                        </div>

                        {/* Content Overlay */}
                        <div className="relative z-10 p-12 text-white max-w-xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mb-8 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="text-3xl font-bold text-white">S</span>
                                </div>
                                <h1 className="text-5xl font-bold mb-6 leading-tight">
                                    Bisnis Lebih Praktis dalam Satu Genggaman
                                </h1>
                                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                                    Kelola operasional bisnis Anda dengan mudah, cepat, dan efisien bersama Sentra. Solusi terpadu untuk pertumbuhan usaha Anda.
                                </p>

                                <div className="flex gap-4">
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-medium">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="font-bold">1000+</span>
                                        <span className="text-xs text-slate-400">Bisnis Bergabung</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Glassmorphism Card Decoration */}
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 1, 0]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute bottom-20 right-[-50px] w-64 h-64 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 transform rotate-12 hidden xl:block"
                        >
                            <div className="h-4 w-1/2 bg-white/20 rounded-full mb-4" />
                            <div className="space-y-3">
                                <div className="h-3 w-full bg-white/10 rounded-full" />
                                <div className="h-3 w-3/4 bg-white/10 rounded-full" />
                                <div className="h-3 w-5/6 bg-white/10 rounded-full" />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950 relative">
                        <div className="absolute top-6 right-6">
                            <ThemeToggle />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-md space-y-8"
                        >
                            <div className="text-center lg:text-left">
                                <div className="lg:hidden flex justify-center mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <span className="text-2xl font-bold text-white">S</span>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Selamat Datang Kembali
                                </h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                                    Masuk ke akun Anda untuk melanjutkan
                                </p>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <FormInput
                                        name="email"
                                        label="Email"
                                        placeholder="nama@perusahaan.com"
                                        type="email"
                                        icon={<Mail className="size-4" />}
                                        onChange={(e) => setData("email", e.target.value)}
                                        error={errors?.email}
                                        className="transition-all duration-200 focus-within:scale-[1.01]"
                                    />

                                    <div className="space-y-1">
                                        <FormInput
                                            name="password"
                                            label="Kata Sandi"
                                            placeholder="••••••••"
                                            type="password"
                                            icon={<Lock className="size-4" />}
                                            onChange={(e) => setData("password", e.target.value)}
                                            error={errors?.password}
                                            className="transition-all duration-200 focus-within:scale-[1.01]"
                                        />
                                        <div className="flex items-center justify-end">
                                            <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                                Lupa kata sandi?
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    isLoading={processing}
                                    label="Masuk Sekarang"
                                    icon={<ArrowRight className="size-4 ml-1" />}
                                    type="submit"
                                    className="w-full h-12 text-base font-medium transition-all duration-300 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                />
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    Belum punya akun?{" "}
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                                        Hubungi Admin
                                    </a>
                                </p>
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                                <p className="text-xs text-gray-400 dark:text-slate-500">
                                    &copy; {new Date().getFullYear()} Sentra. All rights reserved.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}
