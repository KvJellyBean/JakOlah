import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string | undefined;
  showPasswordToggle?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      icon,
      error,
      className,
      showPasswordToggle = false,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [currentType, setCurrentType] = React.useState(type);

    React.useEffect(() => {
      if (showPasswordToggle && type === "password") {
        setCurrentType(showPassword ? "text" : "password");
      } else {
        setCurrentType(type);
      }
    }, [showPassword, type, showPasswordToggle]);

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            type={currentType}
            className={cn(
              "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500",
              icon && "pl-10",
              showPasswordToggle && "pr-10",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
