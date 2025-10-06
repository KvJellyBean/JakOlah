"use client";

import { useEffect, useRef } from "react";

/**
 * SimpleLeafletMap Component
 * Minimal Leaflet implementation untuk menghindari SSR/hydration issues
 */
const SimpleLeafletMap = ({
  center,
  zoom,
  userLocation,
  facilities,
  onRouteClick,
  onInfoClick,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined" || !mapRef.current) return;

    // Import Leaflet dynamically
    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        // Initialize map if not already initialized
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapInstanceRef.current);
        } else {
          // Update view if map exists
          mapInstanceRef.current.setView(center, zoom);
        }

        const map = mapInstanceRef.current;

        // Clear existing markers
        map.eachLayer(layer => {
          if (layer instanceof L.Marker || layer instanceof L.Circle) {
            map.removeLayer(layer);
          }
        });

        // Add user location marker
        if (userLocation) {
          const userIcon = L.divIcon({
            className: "custom-user-marker",
            html: `
              <div style="
                width: 32px;
                height: 32px;
                background: radial-gradient(circle, #ef4444 30%, transparent 70%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  background: white;
                  border: 2px solid #ef4444;
                  border-radius: 50%;
                "></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          L.marker([userLocation.latitude, userLocation.longitude], {
            icon: userIcon,
          })
            .addTo(map)
            .bindPopup("Lokasi Anda");

          // Accuracy circle
          L.circle([userLocation.latitude, userLocation.longitude], {
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.1,
            radius: userLocation.accuracy || 100,
          }).addTo(map);
        }

        // Add facility markers
        facilities.forEach(facility => {
          const colorMap = {
            "Bank Sampah": "#22c55e",
            TPS: "#3b82f6",
            "Daur Ulang": "#f97316",
          };
          const color = colorMap[facility.type] || "#6b7280";

          const facilityIcon = L.divIcon({
            className: "custom-facility-marker",
            html: `
              <div style="
                width: 32px;
                height: 40px;
                position: relative;
              ">
                <svg width="32" height="40" viewBox="0 0 32 40">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${color}"/>
                  <circle cx="16" cy="16" r="6" fill="white"/>
                  <text x="16" y="20" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="${color}">${facility.number || "•"}</text>
                </svg>
              </div>
            `,
            iconSize: [32, 40],
            iconAnchor: [16, 40],
          });

          const marker = L.marker([facility.latitude, facility.longitude], {
            icon: facilityIcon,
          }).addTo(map);

          // Popup content
          const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>
                  <h4 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${facility.name}</h4>
                  <span style="display: inline-block; padding: 2px 8px; background: ${color}20; color: ${color}; border-radius: 4px; font-size: 11px; font-weight: 500;">
                    ${facility.type}
                  </span>
                </div>
                ${facility.distance ? `<span style="font-size: 12px; color: #666; background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">${facility.distance}</span>` : ""}
              </div>
              <div style="font-size: 12px; color: #666; margin: 8px 0;">
                <p style="margin: 4px 0;">📍 ${facility.address}</p>
                <p style="margin: 4px 0;">🕐 Buka: ${facility.hours}</p>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button 
                  onclick="window.routeToFacility(${facility.id})"
                  style="flex: 1; padding: 6px 12px; background: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                  🧭 Rute
                </button>
                <button
                  onclick="window.showFacilityInfo(${facility.id})"
                  style="flex: 1; padding: 6px 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                  ℹ️ Info
                </button>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 280 });
        });

        // Setup global functions for popup buttons
        if (typeof window !== "undefined") {
          window.routeToFacility = id => {
            const facility = facilities.find(f => f.id === id);
            if (facility && onRouteClick) {
              onRouteClick(facility);
            }
          };

          window.showFacilityInfo = id => {
            const facility = facilities.find(f => f.id === id);
            if (facility && onInfoClick) {
              onInfoClick(facility);
            }
          };
        }
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, userLocation, facilities, onRouteClick, onInfoClick]);

  return <div ref={mapRef} className="h-full w-full" />;
};

export { SimpleLeafletMap };
