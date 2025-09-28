import { ReactNode } from "react";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { Logo } from "@/components/ui/logo";

interface AuthPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  footerText?: string;
}

const AuthPageLayout = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  onBackClick,
  footerText = "Dengan menggunakan layanan ini, Anda menyetujui syarat dan ketentuan yang berlaku untuk JakOlah.",
}: AuthPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <NavigationHeader
        showBackButton={showBackButton}
        showLoginButton={false}
        onBackClick={onBackClick}
      />

      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Logo and Title Section */}
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-4" clickable={false} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>

          {/* Form Content */}
          {children}

          {/* Footer */}
          {footerText && (
            <div className="text-center mt-8 text-sm text-gray-500">
              <p>
                Dengan menggunakan layanan ini, Anda menyetujui syarat dan
                ketentuan yang berlaku untuk JakOlah.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { AuthPageLayout };
