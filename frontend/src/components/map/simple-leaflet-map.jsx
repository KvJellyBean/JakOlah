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
  const routingControlRef = useRef(null);

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
          const color = facility.color || colorMap[facility.type] || "#6b7280";
          // Text color should be dark for visibility on white circle
          const textColor = "#1f2937";

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
                  <text x="16" y="20" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="${textColor}">${facility.number || "•"}</text>
                </svg>
              </div>
            `,
            iconSize: [32, 40],
            iconAnchor: [16, 40],
          });

          // Get coordinates from position object or flat properties
          const lat = facility.position?.lat ?? facility.latitude;
          const lng = facility.position?.lng ?? facility.longitude;

          // Skip if coordinates are invalid
          if (lat === undefined || lng === undefined) {
            console.warn(
              `Skipping facility ${facility.name} - invalid coordinates`,
              facility
            );
            return;
          }

          const marker = L.marker([lat, lng], {
            icon: facilityIcon,
          }).addTo(map);

          // Popup content (no emojis/complex SVG to avoid syntax errors)
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
                <p style="margin: 4px 0;">Koordinat: ${facility.address}</p>
                <p style="margin: 4px 0;">Jam Buka: ${facility.hours}</p>
              </div>
              <button 
                id="route-btn-${facility.id}"
                style="width: 100%; padding: 8px 12px; background: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-top: 8px; transition: background 0.2s;"
                onmouseover="this.style.background='#16a34a'"
                onmouseout="this.style.background='#22c55e'">
                Lihat Rute ke Lokasi
              </button>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 280 });

          // Add click handler after popup opens
          marker.on("popupopen", () => {
            const btn = document.getElementById(`route-btn-${facility.id}`);
            if (btn) {
              btn.addEventListener("click", () => {
                if (window.routeToFacility) {
                  window.routeToFacility(facility.id);
                }
              });
            }
          });
        });

        // Setup global functions for popup buttons
        if (typeof window !== "undefined") {
          window.routeToFacility = async id => {
            const facility = facilities.find(f => f.id === id);
            if (!facility || !userLocation) return;

            try {
              // Import Leaflet Routing Machine
              const L = (await import("leaflet")).default;

              // Remove existing routing control if any
              if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
              }

              const facilityLat = facility.position?.lat ?? facility.latitude;
              const facilityLng = facility.position?.lng ?? facility.longitude;

              // Try to load Leaflet Routing Machine with walking profile
              try {
                // Use direct OSRM API call for walking route
                const response = await fetch(
                  `https://router.project-osrm.org/route/v1/foot/${userLocation.longitude},${userLocation.latitude};${facilityLng},${facilityLat}?overview=full&geometries=geojson`
                );

                if (response.ok) {
                  const data = await response.json();
                  if (data.routes && data.routes[0]) {
                    const route = data.routes[0];
                    const coordinates = route.geometry.coordinates.map(
                      coord => [coord[1], coord[0]]
                    );

                    // Red glowing route line
                    const polyline = L.polyline(coordinates, {
                      color: "#ef4444",
                      weight: 6,
                      opacity: 0.9,
                      className: "route-line-glow",
                    }).addTo(map);

                    // Fit bounds to show route
                    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                    // Store for cleanup
                    routingControlRef.current = polyline;

                    if (onRouteClick) {
                      onRouteClick(facility);
                    }
                  } else {
                    throw new Error("No route found");
                  }
                } else {
                  throw new Error("Routing API failed");
                }
              } catch (routingError) {
                // Fallback: Draw simple line if routing machine not available
                console.warn(
                  "Routing machine not available, drawing simple line:",
                  routingError
                );

                const polyline = L.polyline(
                  [
                    [userLocation.latitude, userLocation.longitude],
                    [facilityLat, facilityLng],
                  ],
                  {
                    color: "#ef4444",
                    weight: 6,
                    opacity: 0.9,
                    className: "route-line-glow",
                  }
                ).addTo(map);

                // Fit bounds to show both points
                map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                // Store polyline for cleanup
                routingControlRef.current = polyline;

                if (onRouteClick) {
                  onRouteClick(facility);
                }
              }
            } catch (error) {
              console.error("Failed to create route:", error);
              // Silent fail - no alert popup
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
      // Remove routing control if exists
      if (routingControlRef.current && mapInstanceRef.current) {
        try {
          if (typeof routingControlRef.current.remove === "function") {
            routingControlRef.current.remove();
          } else if (mapInstanceRef.current.removeControl) {
            mapInstanceRef.current.removeControl(routingControlRef.current);
          }
        } catch (e) {
          console.warn("Error removing routing control:", e);
        }
        routingControlRef.current = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, userLocation, facilities, onRouteClick, onInfoClick]);

  return <div ref={mapRef} className="h-full w-full" />;
};

export { SimpleLeafletMap };
