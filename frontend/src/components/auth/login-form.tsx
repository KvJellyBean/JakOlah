import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  error?: string;
  loading?: boolean;
  className?: string;
  showLinks?: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = ({
  onSubmit,
  error,
  loading = false,
  className = "",
  showLinks = true,
}: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.email) newErrors.email = "Email harus diisi";
    if (!formData.password) newErrors.password = "Password harus diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit?.(formData);
  };

  const handleChange =
    (field: keyof LoginFormData) =>
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
        Masuk
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      {/* Navigation Links */}
      {showLinks && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Belum punya akun?{" "}
            <a
              href="/daftar"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Daftar di sini
            </a>
          </p>
          <p className="text-gray-600">
            <a
              href="/lupa-password"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Lupa password?
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

export { LoginForm, type LoginFormData };
