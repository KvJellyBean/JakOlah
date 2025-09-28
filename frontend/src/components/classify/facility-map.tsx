import { useState } from "react";
import { MapPin, Navigation, Filter, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationCard } from "./location-card";

interface FacilityLocation {
  id: string;
  name: string;
  type: string;
  distance: string;
  address: string;
  hours: string;
  color: "emerald" | "blue" | "purple" | "orange" | "red";
  coordinates: { lat: number; lng: number };
}

interface FacilityMapProps {
  locations: FacilityLocation[];
  onLocationRoute?: (location: FacilityLocation) => void;
  onLocationInfo?: (location: FacilityLocation) => void;
  onFilterChange?: (filter: string) => void;
  currentFilter?: string;
  className?: string;
}

const FacilityMap = ({
  locations,
  onLocationRoute,
  onLocationInfo,
  onFilterChange,
  currentFilter = "Semua",
  className = "",
}: FacilityMapProps) => {
  const [visibleLocations, setVisibleLocations] = useState(4);

  const filters = [
    { label: "Semua", value: "Semua" },
    { label: "Bank Sampah", value: "Bank Sampah" },
    { label: "TPS", value: "TPS" },
    { label: "Daur Ulang", value: "Daur Ulang" },
  ];

  const handleFilterClick = (filter: string) => {
    onFilterChange?.(filter);
  };

  const handleLoadMore = () => {
    setVisibleLocations(prev => Math.min(prev + 4, locations.length));
  };

  return (
    <div className={`mt-8 md:mt-12 ${className}`}>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Lokasi Penampungan Sampah Terdekat
        </h2>
        <p className="text-lg md:text-xl text-gray-600">
          Temukan tempat penampungan sampah, bank sampah, dan fasilitas daur
          ulang di sekitar Anda
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Map Display */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-gray-200 !pt-0">
            <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Peta Lokasi</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Navigation className="w-3 md:w-4 h-3 md:h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Filter className="w-3 md:w-4 h-3 md:h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Map Placeholder */}
              <div className="h-64 md:h-96 bg-gray-100 relative">
                {/* Map Grid Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-8 grid-rows-6 h-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-gray-400"></div>
                    ))}
                  </div>
                </div>

                {/* Location Markers */}
                {locations.slice(0, 4).map((location, index) => (
                  <div
                    key={location.id}
                    className={`absolute ${getMarkerPosition(index)}`}
                  >
                    <div
                      className={`w-5 md:w-6 h-5 md:h-6 bg-${location.color}-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-xs">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                ))}

                {/* User Location */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 md:w-8 h-6 md:h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="w-3 md:w-4 h-3 md:h-4 text-white" />
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white shadow-md"
                  >
                    <Plus className="w-3 md:w-4 h-3 md:h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white shadow-md"
                  >
                    <Minus className="w-3 md:w-4 h-3 md:h-4" />
                  </Button>
                </div>
              </div>

              {/* Map Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-600">Bank Sampah</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Lokasi Anda</span>
                    </div>
                  </div>
                  <span className="text-gray-500 bg-gray-200 px-2 py-1 rounded text-xs md:text-sm">
                    Radius: 2 km
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location List */}
        <Card className="shadow-sm border border-gray-200 !pt-0">
          <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
            <CardTitle className="text-lg md:text-xl text-gray-900">
              Daftar Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Filter */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto flex-wrap gap-y-3">
                {filters.map(filter => (
                  <Button
                    key={filter.value}
                    variant={
                      currentFilter === filter.value ? "default" : "secondary"
                    }
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleFilterClick(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Items */}
            <div className="space-y-4">
              {locations.slice(0, visibleLocations).map((location, index) => (
                <LocationCard
                  key={location.id}
                  name={location.name}
                  type={location.type}
                  distance={location.distance}
                  address={location.address}
                  hours={location.hours}
                  color={location.color}
                  number={index + 1}
                  onRouteClick={() => onLocationRoute?.(location)}
                  onInfoClick={() => onLocationInfo?.(location)}
                />
              ))}
            </div>

            {/* Load More */}
            {visibleLocations < locations.length && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLoadMore}
                >
                  Lihat Lebih Banyak ({locations.length - visibleLocations}{" "}
                  lainnya)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get marker positions
const getMarkerPosition = (index: number): string => {
  const positions = [
    "top-12 md:top-16 left-16 md:left-20",
    "top-24 md:top-32 right-20 md:right-24",
    "bottom-16 md:bottom-20 left-24 md:left-32",
    "bottom-12 md:bottom-16 right-12 md:right-16",
  ];
  return positions[index] || positions[0] || "bottom-4 right-4";
};

export { FacilityMap, type FacilityLocation };
