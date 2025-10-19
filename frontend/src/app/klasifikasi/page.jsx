"use client";

import { useState, useEffect, useRef } from "react";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { LiveCameraView } from "@/components/classify/live-camera-view";
import { FacilityMap } from "@/components/map/facility-map";
import { Footer } from "@/components/home/footer";
import { useClassificationSession } from "@/hooks/useClassificationSession";

export default function KlasifikasiPage() {
  const [activeTab, setActiveTab] = useState("camera");
  const [currentFilter, setCurrentFilter] = useState("Semua");
  const [detectedWasteCategories, setDetectedWasteCategories] = useState([]);
  const liveCameraRef = useRef(null);

  // T052: Session management
  const { addClassification, getSessionSummary } = useClassificationSession();

  // Cleanup camera when page unmounts OR switching tabs
  useEffect(() => {
    // Stop camera when switching from camera tab to lokasi tab
    if (activeTab !== "camera") {
      liveCameraRef.current?.stopStream();
    }

    return () => {
      // Force stop camera when leaving page completely
      liveCameraRef.current?.stopStream();
    };
  }, [activeTab]);

  const navItems = [
    { label: "Beranda", href: "/", active: false },
    { label: "Klasifikasi", href: "/klasifikasi", active: true },
    { label: "Informasi", href: "/informasi", active: false },
  ];

  const handleLocationRoute = location => {
    // Route visualization handled by map component
  };

  const handleLocationInfo = location => {
    // Info feature removed - simplified UX
  };

  const handleFilterChange = filter => {
    setCurrentFilter(filter);
  };

  const handleClassificationResult = result => {
    // T052: Add to session tracking
    addClassification(result);

    // Extract unique waste categories from detections and ACCUMULATE
    // Include ALL categories (even "Lainnya") to show map after any detection
    if (result.detections && result.detections.length > 0) {
      const newCategories = result.detections
        .map(d => d.category)
        .filter(c => c); // Just filter null/undefined

      // Merge with existing categories (keep unique)
      setDetectedWasteCategories(prev => {
        const combined = [...new Set([...prev, ...newCategories])];
        return combined;
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <NavigationHeader items={navItems} className="bg-white text-gray-900" />

      {/* Tabs: Camera / Lokasi */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "camera"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("camera")}
            >
              Kamera
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "lokasi"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("lokasi")}
            >
              Lokasi
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === "camera" ? (
          <LiveCameraView
            ref={liveCameraRef}
            key="camera-view"
            onTabChange={setActiveTab}
            enableRealTimeClassification={true}
            classificationInterval={2000}
            onClassificationResult={handleClassificationResult}
          />
        ) : (
          <div
            key="map-view"
            className="flex-1 bg-gray-50 text-gray-900 flex flex-col"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex-1">
              <FacilityMap
                onLocationRoute={handleLocationRoute}
                onLocationInfo={handleLocationInfo}
                onFilterChange={handleFilterChange}
                onTabChange={setActiveTab}
                currentFilter={currentFilter}
                detectedWasteCategories={detectedWasteCategories}
                hasDetections={detectedWasteCategories.length > 0} // Only show list if detected
              />
            </div>
            <Footer />
          </div>
        )}
      </main>
    </div>
  );
}
