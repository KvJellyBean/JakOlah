/**
 * Location Permission Component
 *
 * Provides a privacy-aware interface for requesting user location access
 * with clear benefits and privacy controls.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getUserLocation,
  checkLocationPermission,
  isGeolocationSupported,
  getLocationSharingPrompt,
  type GeolocationResult,
  type LocationError,
  type LocationPermissionStatus,
} from "@/lib/location-service";

interface LocationPermissionProps {
  onLocationGranted: (location: GeolocationResult) => void;
  onLocationDenied?: (error: LocationError) => void;
  onClose?: () => void;
  isOpen: boolean;
  trigger?: React.ReactNode;
  showFallback?: boolean;
}

interface LocationRequestState {
  status: "idle" | "requesting" | "success" | "error";
  location?: GeolocationResult;
  error?: LocationError;
  permissionStatus?: LocationPermissionStatus;
}

export function LocationPermission({
  onLocationGranted,
  onLocationDenied,
  onClose,
  isOpen,
  showFallback = true,
}: LocationPermissionProps) {
  const [state, setState] = useState<LocationRequestState>({ status: "idle" });
  const [isSupported, setIsSupported] = useState(true);

  const promptData = getLocationSharingPrompt();

  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, status: "requesting" }));

    try {
      const location = await getUserLocation({
        timeout: 15000, // 15 seconds
        highAccuracy: true,
        maxAge: 300000, // 5 minutes
      });

      setState(prev => ({
        ...prev,
        status: "success",
        location,
      }));

      onLocationGranted(location);
      onClose?.();
    } catch (error) {
      const locationError = error as LocationError;
      setState(prev => ({
        ...prev,
        status: "error",
        error: locationError,
      }));

      if (onLocationDenied) {
        onLocationDenied(locationError);
      }
    }
  }, [onLocationGranted, onLocationDenied, onClose]);

  const checkPermissionStatus = useCallback(async () => {
    try {
      const permissionStatus = await checkLocationPermission();
      setState(prev => ({ ...prev, permissionStatus }));

      // If permission is already granted, automatically get location
      if (permissionStatus.granted) {
        await requestLocation();
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: "Failed to check permission status",
          type: "NOT_SUPPORTED",
        },
      }));
    }
  }, [requestLocation]);

  useEffect(() => {
    // Check if geolocation is supported
    setIsSupported(isGeolocationSupported());

    // Check current permission status when dialog opens
    if (isOpen) {
      checkPermissionStatus();
    }
  }, [isOpen, checkPermissionStatus]);

  const handleClose = () => {
    setState({ status: "idle" });
    onClose?.();
  };

  const handleRequestLocation = () => {
    requestLocation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {!isSupported ? (
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Browser Tidak Mendukung
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Browser Anda tidak mendukung fitur lokasi. Anda tetap dapat
                  menggunakan aplikasi dengan pencarian manual fasilitas.
                </p>
              </div>
              {showFallback && (
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Gunakan Tanpa Lokasi
                </button>
              )}
            </div>
          ) : state.status === "requesting" ? (
            <div className="text-center space-y-4">
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Mengakses Lokasi...
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Mohon tunggu sebentar, kami sedang mengakses lokasi Anda.
                </p>
              </div>
            </div>
          ) : state.status === "success" && state.location ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Lokasi Berhasil Diperoleh!
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {state.location.isWithinJakarta
                    ? "Lokasi Anda di Jakarta telah terdeteksi."
                    : "Lokasi Anda di luar Jakarta, menampilkan semua fasilitas."}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Akurasi: {Math.round(state.location.accuracy)}m
                </div>
              </div>
            </div>
          ) : state.status === "error" && state.error ? (
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Tidak Dapat Mengakses Lokasi
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {state.error.type === "PERMISSION_DENIED"
                    ? "Akses lokasi ditolak. Anda dapat mengaktifkannya kembali di pengaturan browser."
                    : state.error.type === "TIMEOUT"
                      ? "Waktu akses lokasi habis. Silakan coba lagi."
                      : state.error.message}
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={requestLocation}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Coba Lagi
                </button>
                {showFallback && (
                  <button
                    onClick={handleClose}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Gunakan Tanpa Lokasi
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Default: Permission request UI
            <div className="space-y-6">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {promptData.title}
                </h3>
                <p className="text-sm text-gray-600">{promptData.message}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Manfaat Berbagi Lokasi
                  </h4>
                  <ul className="space-y-2">
                    {promptData.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-gray-600"
                      >
                        <div className="flex items-center space-x-2">
                          {index === 0 && (
                            <Navigation className="h-4 w-4 text-blue-500" />
                          )}
                          {index === 1 && (
                            <Clock className="h-4 w-4 text-blue-500" />
                          )}
                          {index === 2 && (
                            <MapPin className="h-4 w-4 text-blue-500" />
                          )}
                          {index === 3 && (
                            <Shield className="h-4 w-4 text-blue-500" />
                          )}
                          <span>{benefit}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Shield className="h-4 w-4 text-gray-500 mr-2" />
                    Jaminan Privasi
                  </h4>
                  <ul className="space-y-1">
                    {promptData.privacy_notes.map((note, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 flex items-start"
                      >
                        <span className="mr-2">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleRequestLocation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Bagikan Lokasi
                </button>
                {showFallback && (
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Tidak Sekarang
                  </button>
                )}
              </div>

              {state.permissionStatus?.denied && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Tips:</strong> Jika tombol tidak berfungsi, coba
                    refresh halaman atau aktifkan lokasi di pengaturan browser
                    Anda.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationPermission;
