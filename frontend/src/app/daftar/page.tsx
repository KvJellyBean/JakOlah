"use client";

import { useRouter } from "next/navigation";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function DaftarPage() {
  const router = useRouter();

  const handleRegister = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock registration logic - in real app, send to backend
    if (
      data.email &&
      data.password &&
      data.fullName &&
      data.password === data.confirmPassword
    ) {
      // Registration successful
      router.push("/masuk");
    } else {
      throw new Error(
        "Data registrasi tidak lengkap atau password tidak cocok"
      );
    }
  };

  return (
    <AuthPageLayout
      title="Buat Akun Baru"
      subtitle="Bergabunglah dengan JakOlah untuk memulai perjalanan ramah lingkungan Anda"
      showBackButton
      onBackClick={() => router.push("/")}
    >
      <RegisterForm onSubmit={handleRegister} />
    </AuthPageLayout>
  );
}
