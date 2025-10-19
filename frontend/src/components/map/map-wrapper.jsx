"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * MapWrapper Component
 * Client-side wrapper untuk Leaflet map yang menghindari SSR issues
 */
const MapWrapper = ({
  center,
  zoom,
  userLocation,
  facilities,
  onRouteClick,
  onInfoClick,
}) => {
  const [Map, setMap] = useState(null);

  useEffect(() => {
    // Import SimpleLeafletMap only on client-side
    const loadMap = async () => {
      try {
        const mapModule = await import("./simple-leaflet-map");
        setMap(() => mapModule.SimpleLeafletMap);
      } catch (error) {
        console.error("Failed to load map:", error);
      }
    };

    loadMap();
  }, []);

  if (!Map) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      center={center}
      zoom={zoom}
      userLocation={userLocation}
      facilities={facilities}
      onRouteClick={onRouteClick}
      onInfoClick={onInfoClick}
    />
  );
};

export { MapWrapper };
