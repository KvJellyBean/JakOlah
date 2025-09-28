"use client";

import { NavigationHeader } from "@/components/ui/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Edit, Trash2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        items={[
          { href: "/", label: "Beranda" },
          { href: "/klasifikasi", label: "Klasifikasi" },
          { href: "/informasi", label: "Informasi" },
          { href: "/akun", label: "Akun" },
          { href: "/dashboard", label: "Dashboard", active: true },
        ]}
        showLoginButton={false}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-8 md:mb-10 flex-col justify-center">
          <h1 className="text-3xl md:text-4xl max-md:text-center font-bold text-gray-900 mb-3">
            Admin Dashboard
          </h1>
          <p className="text-lg md:text-xl max-md:text-center text-gray-600">
            Ringkasan statistik dan riwayat aktivitas sistem JakOlah
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Klasifikasi
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    8
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Klasifikasi telah dilakukan
                  </p>
                </div>
                <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Jumlah Pengguna
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    5
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pengguna terdaftar
                  </p>
                </div>
                <div className="w-10 md:w-12 h-10 md:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 md:w-6 h-5 md:h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-4">
                  Klasifikasi per Kategori
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">Organik</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      3
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">Anorganik</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      3
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">Lainnya</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      2
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="mb-6 md:mb-8 shadow-sm border border-gray-200 !pt-0">
          <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
            <CardTitle className="text-lg md:text-xl text-gray-900">
              Distribusi Klasifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-center h-64 md:h-80">
              {/* Pie Chart Placeholder */}
              <div className="relative w-48 md:w-64 h-48 md:h-64">
                {/* Pie segments */}
                <svg
                  className="w-48 md:w-64 h-48 md:h-64 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {/* Organik - 38% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray="38 62"
                    strokeDashoffset="0"
                  />
                  {/* Anorganik - 38% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray="38 62"
                    strokeDashoffset="-38"
                  />
                  {/* Lainnya - 25% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray="25 75"
                    strokeDashoffset="-76"
                  />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      8
                    </p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>

                {/* Labels - Hidden on mobile for cleaner look */}
                <div className="hidden md:block">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="text-sm text-gray-600 font-medium">
                      Organik (38%)
                    </span>
                  </div>
                  <div className="absolute -bottom-4 -left-8">
                    <span className="text-sm text-gray-600 font-medium">
                      Lainnya (25%)
                    </span>
                  </div>
                  <div className="absolute -bottom-4 -right-8">
                    <span className="text-sm text-gray-600 font-medium">
                      Anorganik (38%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Organik (38%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Anorganik (38%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Lainnya (25%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification History */}
        <Card className="shadow-sm border border-gray-200 !pt-0">
          <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
            <CardTitle className="text-lg md:text-xl text-gray-900">
              Riwayat Klasifikasi Semua Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-600 text-sm">
                      User
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-600 text-sm">
                      Gambar
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-600 text-sm">
                      Label Hasil
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-600 text-sm">
                      Akurasi
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-600 text-sm hidden md:table-cell">
                      Tanggal & Waktu
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-600 text-sm">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Ahmad Rizki",
                      email: "ahmad.r@example.com",
                      result: "Organik",
                      accuracy: "92%",
                      date: "15 Jul 2024, 17:30",
                    },
                    {
                      name: "Sari Andini",
                      email: "sari.a@example.com",
                      result: "Anorganik",
                      accuracy: "88%",
                      date: "15 Jul 2024, 18:15",
                    },
                    {
                      name: "Kevin Natanael",
                      email: "kevin.535220084@stu.untar.ac.id",
                      result: "Lainnya",
                      accuracy: "75%",
                      date: "15 Jul 2024, 19:00",
                    },
                    {
                      name: "Ahmad Rizki",
                      email: "ahmad.r@example.com",
                      result: "Organik",
                      accuracy: "85%",
                      date: "14 Jul 2024, 21:45",
                    },
                    {
                      name: "Sari Andini",
                      email: "sari.a@example.com",
                      result: "Anorganik",
                      accuracy: "90%",
                      date: "14 Jul 2024, 23:20",
                    },
                  ].map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="w-6 md:w-8 h-6 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {item.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs md:text-sm text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate hidden md:block">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="w-8 md:w-12 h-8 md:h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.result === "Organik"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.result === "Anorganik"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.result}
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4 font-medium text-gray-900 text-sm">
                        {item.accuracy}
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                        {item.date}
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="w-6 md:w-8 h-6 md:h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded flex items-center justify-center transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3 md:w-4 h-3 md:h-4" />
                          </button>
                          <button
                            className="w-6 md:w-8 h-6 md:h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
