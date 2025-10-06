"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationCard } from "../classify/location-card";
import { MapWrapper } from "./map-wrapper";
import {
  getUserLocation,
  sortFacilitiesByDistance,
  JAKARTA_CENTER,
} from "@/lib/geolocation";

/**
 * FacilityMap Component
 * Real Leaflet map with facility markers, user location, and filtering
 */
const FacilityMap = ({
  locations = [],
  onLocationRoute,
  onLocationInfo,
  onFilterChange,
  onTabChange,
  currentFilter = "Semua",
  className = "",
}) => {
  const [visibleLocations, setVisibleLocations] = useState(4);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [mapCenter, setMapCenter] = useState([
    JAKARTA_CENTER.latitude,
    JAKARTA_CENTER.longitude,
  ]);
  const [mapZoom, setMapZoom] = useState(13);

  const filters = [
    { label: "Semua", value: "Semua" },
    { label: "Bank Sampah", value: "Bank Sampah" },
    { label: "TPS", value: "TPS" },
    { label: "Daur Ulang", value: "Daur Ulang" },
  ];

  // Get user location on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        setIsLoadingLocation(true);
        setLocationError(null);
        const location = await getUserLocation();
        setUserLocation(location);
        setMapCenter([location.latitude, location.longitude]);
        setMapZoom(14);
      } catch (error) {
        console.error("Error getting user location:", error);
        setLocationError(error.message);
        // Fallback to Jakarta center
        setMapCenter([JAKARTA_CENTER.latitude, JAKARTA_CENTER.longitude]);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchUserLocation();
  }, []);

  // Sort and filter locations
  const processedLocations = useMemo(() => {
    let filtered = locations;

    // Apply filter
    if (currentFilter && currentFilter !== "Semua") {
      filtered = locations.filter(loc => loc.type === currentFilter);
    }

    // Sort by distance if user location available
    if (userLocation) {
      filtered = sortFacilitiesByDistance(filtered, userLocation);
    }

    // Add number for display
    return filtered.map((loc, index) => ({
      ...loc,
      number: index + 1,
    }));
  }, [locations, currentFilter, userLocation]);

  const handleFilterClick = filter => {
    onFilterChange?.(filter);
  };

  const handleLoadMore = () => {
    setVisibleLocations(prev => Math.min(prev + 4, processedLocations.length));
  };

  const handleRecenterMap = () => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(14);
    }
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecenterMap}
                  disabled={!userLocation}
                  title="Pusatkan ke lokasi saya"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Real Leaflet Map */}
              <div className="h-64 md:h-96 relative">
                {isLoadingLocation && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Mencari lokasi Anda...
                      </p>
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="absolute top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 z-[1000]">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium">Lokasi tidak tersedia</p>
                        <p>{locationError}. Menampilkan peta Jakarta.</p>
                      </div>
                    </div>
                  </div>
                )}

                <MapWrapper
                  center={mapCenter}
                  zoom={mapZoom}
                  userLocation={userLocation}
                  facilities={processedLocations}
                  onRouteClick={onLocationRoute}
                  onInfoClick={onLocationInfo}
                />
              </div>{" "}
              {/* Map Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                  <div className="flex items-center space-x-4 md:space-x-6 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-600">Bank Sampah</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">TPS</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600">Daur Ulang</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Lokasi Anda</span>
                    </div>
                  </div>
                  <span className="text-gray-500 bg-gray-200 px-2 py-1 rounded text-xs md:text-sm">
                    {processedLocations.length} lokasi
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
              {processedLocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada lokasi ditemukan</p>
                </div>
              ) : (
                processedLocations
                  .slice(0, visibleLocations)
                  .map(location => (
                    <LocationCard
                      key={location.id}
                      name={location.name}
                      type={location.type}
                      distance={location.distance}
                      address={location.address}
                      hours={location.hours}
                      color={location.color}
                      number={location.number}
                      onRouteClick={() => onLocationRoute?.(location)}
                      onInfoClick={() => onLocationInfo?.(location)}
                    />
                  ))
              )}
            </div>

            {/* Load More */}
            {visibleLocations < processedLocations.length && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLoadMore}
                >
                  Lihat Lebih Banyak (
                  {processedLocations.length - visibleLocations} lainnya)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Back to Camera on mobile */}
      <div className="mt-6 md:hidden">
        <button
          onClick={() => onTabChange?.("camera")}
          className="w-full bg-black text-white px-4 py-3 rounded-lg font-medium"
        >
          Kembali ke Kamera
        </button>
      </div>
    </div>
  );
};

export { FacilityMap };
