import { useState } from "react";
import { Mail } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";

interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormData) => void;
  error?: string;
  success?: boolean;
  loading?: boolean;
  className?: string;
  showLinks?: boolean;
}

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordForm = ({
  onSubmit,
  error,
  success = false,
  loading = false,
  className = "",
  showLinks = true,
}: ForgotPasswordFormProps) => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Partial<ForgotPasswordFormData> = {};
    if (!formData.email) newErrors.email = "Email harus diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit?.(formData);
  };

  const handleChange =
    (field: keyof ForgotPasswordFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    };

  if (success) {
    return (
      <div
        className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 ${className}`}
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Email Terkirim!
          </h3>
          <Alert variant="success" className="mb-6">
            <AlertIcon variant="success" />
            <AlertDescription>
              Kami telah mengirimkan instruksi reset password ke email Anda.
              Silakan periksa inbox dan ikuti petunjuk yang diberikan.
            </AlertDescription>
          </Alert>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Tidak menerima email?</p>
            <Button
              variant="outline"
              onClick={() => onSubmit?.(formData)}
              disabled={loading}
            >
              Kirim Ulang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 ${className}`}
    >
      <h3 className="text-xl font-semibold text-center mb-4 text-gray-900">
        Reset Password
      </h3>
      <p className="text-center text-gray-600 mb-8">
        Masukkan alamat email Anda dan kami akan mengirimkan instruksi untuk
        reset password.
      </p>

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

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Instruksi"}
        </Button>
      </form>

      {/* Navigation Links */}
      {showLinks && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Ingat password Anda?{" "}
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

export { ForgotPasswordForm, type ForgotPasswordFormData };
