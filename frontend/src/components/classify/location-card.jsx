import { MapPin, Recycle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const LocationCard = ({
  name,
  type,
  distance,
  address,
  hours,
  color,
  number,
  wasteTypes = [],
  onRouteClick,
  className = "",
}) => {
  const colorClasses = {
    emerald: {
      bg: "bg-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
    },
    blue: {
      bg: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700",
    },
    purple: {
      bg: "bg-purple-500",
      badge: "bg-purple-100 text-purple-700",
    },
    orange: {
      bg: "bg-orange-500",
      badge: "bg-orange-100 text-orange-700",
    },
    red: {
      bg: "bg-red-500",
      badge: "bg-red-100 text-red-700",
    },
  };

  // Fallback to emerald if color not found
  const currentColor = colorClasses[color] || colorClasses.emerald;

  return (
    <div
      className={`p-3 md:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-5 md:w-6 h-5 md:h-6 ${currentColor.bg} rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs`}
          >
            {number}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm md:text-base">
              {name}
            </h4>
            <div
              className={`px-2 py-1 ${currentColor.badge} rounded text-xs font-medium inline-block mt-1`}
            >
              {type}
            </div>
          </div>
        </div>
        <span className="text-xs md:text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {distance}
        </span>
      </div>

      <div className="text-xs md:text-sm text-gray-600 space-y-1 mb-3">
        <p className="flex items-center space-x-2">
          <MapPin className="w-3 md:w-4 h-3 md:h-4" />
          <span>{address}</span>
        </p>
        {wasteTypes && wasteTypes.length > 0 && (
          <p className="flex items-start space-x-2">
            <Recycle className="w-3 md:w-4 h-3 md:h-4 mt-0.5 text-emerald-600" />
            <span>Menerima: {wasteTypes.join(", ")}</span>
          </p>
        )}
      </div>

      <Button
        size="sm"
        className="w-full text-xs md:text-sm font-semibold"
        onClick={onRouteClick}
      >
        <Navigation className="w-4 h-4 mr-2" />
        Lihat Rute ke Lokasi
      </Button>
    </div>
  );
};

export { LocationCard };
