import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Settings, Save, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ProfileSettingsData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileSettingsProps {
  initialData?: Partial<ProfileSettingsData>;
  onSave?: (data: ProfileSettingsData) => Promise<void>;
  className?: string;
}

const ProfileSettings = ({
  initialData = {},
  onSave,
  className = "",
}: ProfileSettingsProps) => {
  const [formData, setFormData] = useState<ProfileSettingsData>({
    name: initialData.name || "",
    email: initialData.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileSettingsData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field: keyof ProfileSettingsData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileSettingsData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama tidak boleh kosong";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email tidak boleh kosong";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword =
          "Password lama diperlukan untuk mengganti password";
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password baru minimal 6 karakter";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi password tidak cocok";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      await onSave?.(formData);
      setSuccessMessage("Profil berhasil diperbarui");
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch {
      setErrors({ email: "Terjadi kesalahan saat menyimpan data" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`border border-gray-200 bg-white ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Pengaturan Profil</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Umum
            </h3>

            <FormField
              label="Nama Lengkap"
              name="name"
              value={formData.name}
              onChange={e => handleChange("name", e.target.value)}
              error={errors.name}
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={e => handleChange("email", e.target.value)}
              error={errors.email}
              required
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ubah Password
            </h3>

            <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Kosongkan jika tidak ingin mengganti password</span>
            </Alert>

            <div className="space-y-4">
              <FormField
                label="Password Lama"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={e => handleChange("currentPassword", e.target.value)}
                error={errors.currentPassword}
              />

              <FormField
                label="Password Baru"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={e => handleChange("newPassword", e.target.value)}
                error={errors.newPassword}
              />

              <FormField
                label="Konfirmasi Password Baru"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={e => handleChange("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export { ProfileSettings };
export type { ProfileSettingsData };
