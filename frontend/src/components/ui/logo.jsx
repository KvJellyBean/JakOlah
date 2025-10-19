import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import LogoImage from "@/assets/jakolah-logo.png";

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
      text: "text-base",
    },
    md: {
      container: "w-8 h-8",
      text: "text-xl",
    },
    lg: {
      container: "w-16 h-16",
      text: "text-3xl",
    },
  };

  const currentSize = sizeClasses[size];

  const LogoContent = (
    <div className={cn("flex items-center space-x-3", className)}>
      <Image
        src={LogoImage}
        alt="JakOlah Logo"
        width={size === "lg" ? 64 : size === "md" ? 32 : 24}
        height={size === "lg" ? 32 : size === "md" ? 32 : 24}
        className={(cn(currentSize.container), "rounded-md")}
        priority
      />
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
