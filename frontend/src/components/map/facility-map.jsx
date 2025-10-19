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
import { getFacilities } from "@/lib/api";

/**
 * FacilityMap Component
 * Real Leaflet map with facility markers, user location, and filtering
 */
const FacilityMap = ({
  onLocationRoute,
  onLocationInfo,
  onFilterChange,
  onTabChange,
  currentFilter = "Semua",
  detectedWasteCategories = [],
  hasDetections = false, // New prop: show list only after camera detection
  className = "",
}) => {
  const [locations, setLocations] = useState([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
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
    { label: "TPA", value: "TPA" },
    { label: "TPS3R", value: "TPS3R" },
    { label: "Komposting", value: "Komposting" },
    { label: "Produk Kreatif", value: "Produk Kreatif" },
  ];

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setIsLoadingFacilities(true);
        setFacilitiesError(null);

        const data = await getFacilities();

        // Transform Supabase data - show coordinates for simplicity
        const transformedData = data.map(facility => {
          const lat = parseFloat(facility.latitude);
          const lng = parseFloat(facility.longitude);

          return {
            id: facility.facility_id,
            name: facility.facility_name,
            type: facility.facility_type,
            position: {
              lat: lat,
              lng: lng,
            },
            address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, // Show coordinates
            wasteTypes: facility.waste_categories || [],
          };
        });

        setLocations(transformedData);
      } catch (error) {
        setFacilitiesError(error.message);
      } finally {
        setIsLoadingFacilities(false);
      }
    };

    fetchFacilities();
  }, []);

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
        setLocationError(error.message);
        // Fallback to Jakarta center
        setMapCenter([JAKARTA_CENTER.latitude, JAKARTA_CENTER.longitude]);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchUserLocation();
  }, []);

  // Helper to calculate distance for limiting (defined before useMemo)
  const calculateDistanceForLimit = (facility, userLoc) => {
    const lat = facility.position?.lat ?? facility.latitude;
    const lng = facility.position?.lng ?? facility.longitude;
    if (!lat || !lng) return Infinity;

    const R = 6371; // Earth radius in km
    const dLat = ((lat - userLoc.latitude) * Math.PI) / 180;
    const dLng = ((lng - userLoc.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLoc.latitude * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Sort and filter locations with max 5 closest per category
  const processedLocations = useMemo(() => {
    let filtered = locations;

    // SMART FILTERING: Auto-filter based on detected waste categories
    if (detectedWasteCategories && detectedWasteCategories.length > 0) {
      // Filter facilities that accept ANY of the detected waste types
      filtered = locations.filter(facility => {
        // Check if facility accepts any of the detected waste categories
        return (
          facility.wasteTypes &&
          facility.wasteTypes.some(wasteType =>
            detectedWasteCategories.includes(wasteType)
          )
        );
      });

      // If no matching facilities found, fallback to all locations
      if (filtered.length === 0) {
        filtered = locations;
      }
    }

    // Apply manual category filter on top (if not "Semua")
    if (currentFilter && currentFilter !== "Semua") {
      // Apply category filter (manual filter)
      filtered = filtered.filter(loc => loc.type === currentFilter);
    }

    // Always limit to 5 closest per category (for all filters)
    if (userLocation) {
      const byCategory = {};

      // Group by category
      filtered.forEach(facility => {
        const category = facility.type || "Unknown";
        if (!byCategory[category]) byCategory[category] = [];
        byCategory[category].push(facility);
      });

      // Take 5 closest from each category
      filtered = [];
      Object.keys(byCategory).forEach(category => {
        const sorted = byCategory[category]
          .map(f => ({
            ...f,
            tempDistance: calculateDistanceForLimit(f, userLocation),
          }))
          .sort((a, b) => a.tempDistance - b.tempDistance)
          .slice(0, 5); // Max 5 closest per category
        filtered.push(...sorted);
      });
    }

    // Sort by distance if user location available
    if (userLocation) {
      filtered = sortFacilitiesByDistance(filtered, userLocation);
    }

    // Map facility type to colors (hex codes for map markers)
    const typeColorMap = {
      TPA: "#ef4444",
      TPS3R: "#3b82f6",
      "Bank Sampah": "#10b981",
      Komposting: "#f97316",
      "Produk Kreatif": "#8b5cf6",
      TPS: "#3b82f6",
      "Daur Ulang": "#f97316",
    };

    // Add number, color, hours, distance for display
    return filtered.map((loc, index) => ({
      ...loc,
      number: index + 1,
      color: typeColorMap[loc.type] || "#10b981",
      hours: loc.hours || "08:00 - 17:00",
      distance: loc.distance || null,
    }));
  }, [locations, currentFilter, userLocation, detectedWasteCategories]);

  // Pagination calculations
  const totalPages = Math.ceil(processedLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLocations = processedLocations.slice(startIndex, endIndex);

  const handleFilterClick = filter => {
    onFilterChange?.(filter);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
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
              <div className="h-[280px] sm:h-[320px] md:h-[400px] lg:h-[500px] w-full min-w-[280px] relative overflow-hidden">
                {/* Loading Facilities */}
                {isLoadingFacilities && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1001]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Memuat fasilitas...
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading Location */}
                {!isLoadingFacilities && isLoadingLocation && (
                  <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-[1000]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Mencari lokasi Anda...
                      </p>
                    </div>
                  </div>
                )}

                {/* Facilities Error */}
                {facilitiesError && (
                  <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 z-[1000]">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-red-800">
                        <p className="font-medium">Gagal memuat fasilitas</p>
                        <p>{facilitiesError}</p>
                      </div>
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
                  facilities={hasDetections ? processedLocations : []} // Hide markers if no detection
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

        {/* Location List - Show only after camera detection */}
        {hasDetections ? (
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
                  paginatedLocations.map(location => (
                    <LocationCard
                      key={location.id}
                      name={location.name}
                      type={location.type}
                      distance={location.distance}
                      address={location.address}
                      hours={location.hours}
                      wasteTypes={location.wasteTypes}
                      color={location.color}
                      number={location.number}
                      onRouteClick={() => {
                        // Trigger routing on map
                        if (
                          typeof window !== "undefined" &&
                          window.routeToFacility
                        ) {
                          window.routeToFacility(location.id);
                        }
                        // Also call parent handler if provided
                        onLocationRoute?.(location);
                      }}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    ← Sebelumnya
                  </Button>
                  <div className="text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <MapPin className="w-12 h-12 mx-auto opacity-30" />
              </div>
              <p className="text-gray-600 font-medium mb-1">
                Belum Ada Deteksi
              </p>
              <p className="text-sm text-gray-500">
                Gunakan kamera untuk mendeteksi sampah terlebih dahulu
              </p>
            </CardContent>
          </Card>
        )}
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
