import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => void;
  error?: string;
  loading?: boolean;
  className?: string;
  showLinks?: boolean;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm = ({
  onSubmit,
  error,
  loading = false,
  className = "",
  showLinks = true,
}: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Partial<RegisterFormData> = {};
    if (!formData.fullName) newErrors.fullName = "Nama lengkap harus diisi";
    if (!formData.email) newErrors.email = "Email harus diisi";
    if (!formData.password) newErrors.password = "Password harus diisi";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Konfirmasi password tidak sama";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit?.(formData);
  };

  const handleChange =
    (field: keyof RegisterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 ${className}`}
    >
      <h3 className="text-xl font-semibold text-center mb-8 text-gray-900">
        Daftar
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Nama Lengkap"
          type="text"
          placeholder="Masukkan nama lengkap"
          value={formData.fullName}
          onChange={handleChange("fullName")}
          icon={<User className="w-5 h-5" />}
          error={errors.fullName}
        />

        <FormField
          label="Email"
          type="email"
          placeholder="nama@email.com"
          value={formData.email}
          onChange={handleChange("email")}
          icon={<Mail className="w-5 h-5" />}
          error={errors.email}
        />

        <FormField
          label="Password"
          type="password"
          placeholder="Masukkan password"
          value={formData.password}
          onChange={handleChange("password")}
          icon={<Lock className="w-5 h-5" />}
          error={errors.password}
          showPasswordToggle
        />

        <FormField
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          icon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword}
          showPasswordToggle
        />

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      {/* Navigation Links */}
      {showLinks && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <a
              href="/masuk"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Masuk di sini
            </a>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6">
          <Alert variant="destructive">
            <AlertIcon variant="destructive" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export { RegisterForm, type RegisterFormData };
