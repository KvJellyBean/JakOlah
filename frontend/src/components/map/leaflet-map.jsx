"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import { icon } from "leaflet";
import { FacilityMarker } from "./facility-marker";

// Import Leaflet CSS
if (typeof window !== "undefined") {
  require("leaflet/dist/leaflet.css");
}

/**
 * MapUpdater Component
 * Helper component to update map view when center changes
 */
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

/**
 * LeafletMap Component
 * Actual Leaflet map implementation (client-side only)
 */
const LeafletMap = ({
  center,
  zoom,
  userLocation,
  facilities,
  onRouteClick,
  onInfoClick,
}) => {
  // Custom user location icon
  const userIcon = icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#ef4444" opacity="0.3"/>
        <circle cx="16" cy="16" r="8" fill="#ef4444"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} zoom={zoom} />

      {/* User location marker */}
      {userLocation && (
        <>
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          />
          {/* Accuracy circle */}
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={userLocation.accuracy || 100}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        </>
      )}

      {/* Facility markers */}
      {facilities.map(facility => (
        <FacilityMarker
          key={facility.id}
          facility={facility}
          onRouteClick={onRouteClick}
          onInfoClick={onInfoClick}
        />
      ))}
    </MapContainer>
  );
};

export { LeafletMap };
