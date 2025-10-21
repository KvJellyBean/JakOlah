/**
 * Utilitas Geolokasi
 * Fungsi untuk menangani lokasi pengguna dan kalkulasi jarak
 */

// Untuk menghitung jarak antara dua koordinat
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Format jarak untuk ditampilkan
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Dapatkan posisi pengguna saat ini menggunakan Geolocation API
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      error => {
        let message = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache selama 1 menit
      }
    );
  });
}

// Urutkan fasilitas berdasarkan jarak dari lokasi pengguna
export function sortFacilitiesByDistance(facilities, userLocation) {
  if (!userLocation) return facilities;

  return facilities
    .map(facility => {
      // Handle struktur posisi flat dan nested
      const facilityLat = facility.position?.lat ?? facility.latitude;
      const facilityLng = facility.position?.lng ?? facility.longitude;

      if (facilityLat === undefined || facilityLng === undefined) {
        return {
          ...facility,
          distanceKm: Infinity,
          distance: "N/A",
        };
      }

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        facilityLat,
        facilityLng
      );
      return {
        ...facility,
        distanceKm: distance,
        distance: formatDistance(distance),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Lokasi default untuk Jakarta (digunakan sebagai fallback)
export const JAKARTA_CENTER = {
  latitude: -6.2088,
  longitude: 106.8456,
};
