"use client";

import { Marker, Popup } from "react-leaflet";
import { icon } from "leaflet";
import { MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * FacilityMarker Component
 * Custom marker for waste disposal facilities on the map
 */
const FacilityMarker = ({ facility, onRouteClick, onInfoClick }) => {
  // Color mapping for different facility types
  const colorMap = {
    "Bank Sampah": "#22c55e", // emerald-500
    TPS: "#3b82f6", // blue-500
    "Daur Ulang": "#f97316", // orange-500
  };

  const color = colorMap[facility.type] || "#6b7280"; // gray-500 as default

  // Create custom icon for marker
  const customIcon = icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${color}"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
        <text x="16" y="20" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="${color}">${facility.number || "•"}</text>
      </svg>
    `)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });

  return (
    <Marker
      position={[facility.latitude, facility.longitude]}
      icon={customIcon}
    >
      <Popup className="custom-popup" maxWidth={280}>
        <div className="p-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {facility.name}
              </h4>
              <span
                className="inline-block px-2 py-1 text-xs font-medium rounded mt-1"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {facility.type}
              </span>
            </div>
            {facility.distance && (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {facility.distance}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-600 space-y-1 mb-3">
            <p className="flex items-start space-x-2">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{facility.address}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Buka: {facility.hours}</span>
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => onRouteClick?.(facility)}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Rute
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => onInfoClick?.(facility)}
            >
              Info
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export { FacilityMarker };
