"use client";

import { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { LiveCameraView } from "@/components/classify/live-camera-view";
import { FacilityMap } from "@/components/map/facility-map";
import { useClassificationSession } from "@/hooks/useClassificationSession";

export default function KlasifikasiPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("camera");
  const [currentFilter, setCurrentFilter] = useState("Semua");

  // T052: Session management
  const { addClassification, getSessionSummary } = useClassificationSession();

  const handleLocationRoute = location => {
    console.log("Navigate to:", location);
    // Route visualization handled by map component
  };

  const handleLocationInfo = location => {
    console.log("Show info for:", location);
    // Info feature removed - simplified UX
  };

  const handleFilterChange = filter => {
    setCurrentFilter(filter);
  };

  const handleClassificationResult = result => {
    // T052: Add to session tracking
    addClassification(result);

    // Optional: Log session summary for debugging
    if (process.env.NODE_ENV === "development") {
      const summary = getSessionSummary();
      console.log("Classification added. Session summary:", summary);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-white text-gray-900 border-b border-gray-200 sticky top-0 z-[9999]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">JakOlah</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Beranda
              </a>
              <a href="/klasifikasi" className="text-emerald-600 font-medium">
                Klasifikasi
              </a>
              <a
                href="/informasi"
                className="text-gray-600 hover:text-gray-900"
              >
                Informasi
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a
                  href="/"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Beranda
                </a>
                <a
                  href="/klasifikasi"
                  className="block px-3 py-2 text-emerald-600 font-medium rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Klasifikasi
                </a>
                <a
                  href="/informasi"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Informasi
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

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
            key="camera-view"
            onTabChange={setActiveTab}
            enableRealTimeClassification={true}
            classificationInterval={2000}
            onClassificationResult={handleClassificationResult}
          />
        ) : (
          <div key="map-view" className="flex-1 bg-gray-50 text-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
              <FacilityMap
                onLocationRoute={handleLocationRoute}
                onLocationInfo={handleLocationInfo}
                onFilterChange={handleFilterChange}
                onTabChange={setActiveTab}
                currentFilter={currentFilter}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
