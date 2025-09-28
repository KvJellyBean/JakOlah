import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EducationMethod {
  title: string;
  description: string[];
  borderColor: "emerald" | "blue" | "red" | "amber" | "purple";
}

interface EducationCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  methods: EducationMethod[];
  icon?: ReactNode;
  className?: string;
}

const EducationCard = ({
  title,
  subtitle,
  description,
  methods,
  icon,
  className = "",
}: EducationCardProps) => {
  const borderColorClasses = {
    emerald: "border-l-emerald-400",
    blue: "border-l-blue-400",
    red: "border-l-red-400",
    amber: "border-l-amber-400",
    purple: "border-l-purple-400",
  };

  return (
    <Card className={`border border-emerald-200 ${className}`}>
      <CardHeader className="pb-3 bg-emerald-50 border-b border-emerald-200">
        <CardTitle className="text-base md:text-lg text-emerald-900 flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-emerald-700 mt-1">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {description && (
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        )}

        <div className="space-y-4">
          {methods.map((method, index) => (
            <div
              key={index}
              className={`border-l-4 pl-4 ${borderColorClasses[method.borderColor]}`}
            >
              <h4 className="font-semibold text-gray-900 mb-2">
                {method.title}
              </h4>
              <ul className="text-gray-600 text-sm space-y-1">
                {method.description.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { EducationCard, type EducationMethod };
