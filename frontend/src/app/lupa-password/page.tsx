"use client";

import { useRouter } from "next/navigation";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function LupaPasswordPage() {
  const router = useRouter();

  const handleForgotPassword = async (data: { email: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock forgot password logic
    if (data.email) {
      // Show success message (in real app, send email)
      alert("Kode reset password telah dikirim ke email Anda");
    } else {
      throw new Error("Email harus diisi");
    }
  };

  return (
    <AuthPageLayout
      title="Lupa Password"
      subtitle="Masukkan email Anda untuk menerima kode reset password"
      showBackButton
      onBackClick={() => router.push("/")}
    >
      <ForgotPasswordForm onSubmit={handleForgotPassword} />
    </AuthPageLayout>
  );
}
