"use client";

import { useState } from "react";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { Footer } from "@/components/home/footer";
import {
  ProfileHeader,
  ClassificationHistory,
  ProfileSettings,
  DataDeletion,
  type ClassificationHistoryItem,
  type ProfileSettingsData,
} from "@/components/account";

export default function AkunPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview"
  );

  // Mock data
  const profileData = {
    name: "Kevin Natanael",
    email: "kevin.535220084@stu.untar.ac.id",
    joinDate: "25 Juni 2025",
  };

  const classificationHistory: ClassificationHistoryItem[] = [
    {
      id: "1",
      imageUrl: "/images/kulit_pisang.jpg",
      result: "Organik",
      confidence: 0.92,
      date: "20 Juli 2025",
      status: "success",
    },
    {
      id: "2",
      imageUrl: "/images/botol_plastik.jpg",
      result: "Anorganik",
      confidence: 0.88,
      date: "19 Juli 2025",
      status: "success",
    },
    {
      id: "3",
      imageUrl: "/images/baterai_bekas.jpg",
      result: "Lainnya",
      confidence: 0.72,
      date: "18 Juli 2025",
      status: "success",
    },
  ];

  const handleSaveSettings = async (data: ProfileSettingsData) => {
    // Implement save settings logic
    // TODO: Save settings data to backend
    // eslint-disable-next-line no-console
    console.log("Settings to save:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleDeleteAccount = async () => {
    // Implement delete account logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleClearHistory = async () => {
    // Implement clear history logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        items={[
          { href: "/", label: "Beranda" },
          { href: "/klasifikasi", label: "Klasifikasi" },
          { href: "/informasi", label: "Informasi" },
          { href: "/akun", label: "Akun", active: true },
        ]}
        showLoginButton={false}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Akun Pengguna
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Kelola profil dan lihat riwayat klasifikasi Anda
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Ringkasan
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pengaturan & Keamanan
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid xl:grid-cols-3 gap-6 md:gap-8">
            <div className="xl:col-span-1">
              <ProfileHeader
                name={profileData.name}
                email={profileData.email}
                joinDate={profileData.joinDate}
                onEditClick={() => setActiveTab("settings")}
              />
            </div>
            <div className="xl:col-span-2 min-w-0">
              <div className="overflow-x-auto">
                <ClassificationHistory
                  history={classificationHistory}
                  onViewDetails={() => {
                    /* View details logic */
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ProfileSettings
                initialData={profileData}
                onSave={handleSaveSettings}
              />
            </div>
            <div className="space-y-6">
              <DataDeletion
                onDeleteAccount={handleDeleteAccount}
                onClearHistory={handleClearHistory}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
