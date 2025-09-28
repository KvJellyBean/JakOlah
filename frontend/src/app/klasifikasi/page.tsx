"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { ImageUpload } from "@/components/classify/image-upload";
import { ClassificationResult } from "@/components/classify/classification-result";
import { FacilityMap } from "@/components/classify/facility-map";

interface ClassificationCategory {
  name: string;
  percentage: number;
  color: "emerald" | "blue" | "red" | "amber" | "purple";
}

export default function KlasifikasiPage() {
  const router = useRouter();
  const [classification, setClassification] = useState<
    ClassificationCategory[] | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock facilities data
  // Mock data untuk facilities
  const facilities = [
    {
      id: "1",
      name: "Bank Sampah Berkah",
      type: "Bank Sampah",
      distance: "0.8 km",
      address: "Jl. Kebon Jeruk No. 15, Jakarta Barat",
      hours: "08:00 - 16:00",
      color: "emerald" as const,
      coordinates: { lat: -6.2088, lng: 106.8456 },
    },
    {
      id: "2",
      name: "TPS 3R Melati",
      type: "TPS 3R",
      distance: "1.2 km",
      address: "Jl. Melati Raya No. 45, Jakarta Barat",
      hours: "06:00 - 18:00",
      color: "blue" as const,
      coordinates: { lat: -6.2188, lng: 106.8356 },
    },
    {
      id: "3",
      name: "Komposting Hijau",
      type: "Pengolahan Organik",
      distance: "2.1 km",
      address: "Jl. Daun Hijau No. 88, Jakarta Barat",
      hours: "07:00 - 17:00",
      color: "emerald" as const,
      coordinates: { lat: -6.1988, lng: 106.8556 },
    },
  ];

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);

    // Simulasi API call dengan file yang di-upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock classification result berdasarkan nama file
    const filename = file.name.toLowerCase();
    let mockResult;

    if (
      filename.includes("organic") ||
      filename.includes("banana") ||
      filename.includes("apple")
    ) {
      mockResult = [
        { name: "Organik", percentage: 85, color: "emerald" as const },
        { name: "Anorganik", percentage: 10, color: "blue" as const },
        { name: "Lainnya", percentage: 5, color: "red" as const },
      ];
    } else if (filename.includes("plastic") || filename.includes("bottle")) {
      mockResult = [
        { name: "Anorganik", percentage: 90, color: "blue" as const },
        { name: "Organik", percentage: 8, color: "emerald" as const },
        { name: "Lainnya", percentage: 2, color: "red" as const },
      ];
    } else {
      mockResult = [
        { name: "Anorganik", percentage: 70, color: "blue" as const },
        { name: "Organik", percentage: 25, color: "emerald" as const },
        { name: "Lainnya", percentage: 5, color: "red" as const },
      ];
    }

    setClassification(mockResult);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setClassification(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        items={[
          { href: "/", label: "Beranda" },
          { href: "/klasifikasi", label: "Klasifikasi", active: true },
          { href: "/informasi", label: "Informasi" },
        ]}
        showLoginButton
        onLoginClick={() => router.push("/masuk")}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-10 md:mb-10 flex-col justtify-center">
          <h1 className="text-3xl md:text-4xl max-md:text-center font-bold text-gray-900 mb-3">
            Klasifikasi Sampah
          </h1>
          <p className="text-lg md:text-xl max-md:text-center text-gray-600">
            Upload gambar sampah untuk mengidentifikasi jenisnya dan mendapatkan
            rekomendasi pengelolaan
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          <ImageUpload
            onImageUpload={file => handleImageUpload(file)}
            onImageRemove={handleReset}
            loading={isProcessing}
          />

          <ClassificationResult
            results={classification || []}
            loading={isProcessing}
          />
        </div>

        {classification && (
          <div className="mt-8 md:mt-12">
            <FacilityMap locations={facilities} />
          </div>
        )}
      </div>
    </div>
  );
}
