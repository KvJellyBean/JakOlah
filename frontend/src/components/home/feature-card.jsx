import { Card, CardContent } from "@/components/ui/card";

const FeatureCard = ({
  title,
  description,
  icon,
  iconColor,
  className = "",
}) => {
  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card
      className={`border border-gray-200 hover:shadow-lg transition-shadow ${className}`}
    >
      <CardContent className="p-6 md:p-8 text-center">
        <div
          className={`w-12 md:w-16 h-12 md:h-16 ${iconColorClasses[iconColor]} rounded-full mx-auto mb-6 flex items-center justify-center`}
        >
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

export { FeatureCard };
