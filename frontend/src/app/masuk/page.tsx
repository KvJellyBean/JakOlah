"use client";

import { useRouter } from "next/navigation";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function MasukPage() {
  const router = useRouter();

  const handleLogin = async (data: { email: string; password: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock login logic - in real app, validate with backend
    if (data.email === "admin@jakolah.id" && data.password === "password") {
      router.push("/dashboard");
    } else {
      throw new Error("Email atau password salah");
    }
  };

  return (
    <AuthPageLayout
      title="Masuk ke Akun Anda"
      subtitle="Selamat datang kembali! Silakan masuk ke akun Anda."
      showBackButton
      onBackClick={() => router.push("/")}
    >
      <LoginForm onSubmit={handleLogin} />
    </AuthPageLayout>
  );
}
