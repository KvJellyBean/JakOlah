import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Logo = ({
  size = "md",
  showText = true,
  clickable = true,
  className,
  textClassName,
}) => {
  const sizeClasses = {
    sm: {
      container: "w-6 h-6",
      icon: "w-3 h-3",
      text: "text-base",
    },
    md: {
      container: "w-8 h-8",
      icon: "w-5 h-5",
      text: "text-xl",
    },
    lg: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
      text: "text-3xl",
    },
  };

  const currentSize = sizeClasses[size];

  const LogoContent = (
    <div className={cn("flex items-center space-x-3", className)}>
      <div
        className={cn(
          "bg-emerald-600 rounded-lg flex items-center justify-center",
          size === "lg" ? "rounded-2xl" : "rounded-lg",
          currentSize.container
        )}
      >
        <Leaf className={cn("text-white", currentSize.icon)} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold text-gray-900",
            currentSize.text,
            textClassName
          )}
        >
          JakOlah
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
};

export { Logo };
