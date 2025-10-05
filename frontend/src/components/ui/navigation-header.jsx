import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

const NavigationHeader = ({
  items = [],
  showBackButton = false,
  backLabel = "Kembali ke Beranda",
  showLoginButton = true,
  className = "",
  onBackClick,
  onLoginClick,
  onItemClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleItemClick = href => {
    setIsMenuOpen(false);
    onItemClick?.(href);
  };

  return (
    <nav
      className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  item.active
                    ? "text-emerald-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => handleItemClick(item.href)}
              >
                {item.label}
              </Link>
            ))}

            {showBackButton && (
              <button
                onClick={onBackClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel}</span>
                <span className="sm:hidden">Beranda</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    item.active
                      ? "text-emerald-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleItemClick(item.href)}
                >
                  {item.label}
                </Link>
              ))}

              {showBackButton && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onBackClick?.();
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>{backLabel}</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export { NavigationHeader };
