/**
 * Educational Info Cards
 *
 * Interactive educational cards for information page
 * with Jakarta-specific waste management content
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Leaf,
  Recycle,
  AlertTriangle,
  MapPin,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  Calculator,
  Star,
  ChevronRight,
} from "lucide-react";

interface EducationalCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "red" | "purple";
  stats: { label: string; value: string }[];
  tips: string[];
  actionText: string;
  gradient: string;
}

interface EducationalInfoCardsProps {
  onActionClick?: (cardId: string) => void;
  className?: string;
}

export function EducationalInfoCards({
  onActionClick,
  className = "",
}: EducationalInfoCardsProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const educationalCards: EducationalCard[] = [
    {
      id: "organik",
      title: "Sampah Organik",
      subtitle: "Potensi Terbesar Jakarta untuk Kompos",
      icon: <Leaf className="w-6 h-6" />,
      color: "emerald",
      gradient: "from-emerald-500 to-green-600",
      stats: [
        { label: "Komposisi", value: "60%" },
        { label: "Potensi Kompos", value: "2,300 ton/hari" },
        { label: "Pengurangan TPA", value: "40%" },
        { label: "Nilai Ekonomi", value: "Rp 1.2M/hari" },
      ],
      tips: [
        "Pisahkan sisa makanan dari kemasan",
        "Potong kecil untuk mempercepat dekomposisi",
        "Campurkan bahan hijau (N) dan coklat (C) dengan rasio 1:3",
        "Kompos siap dalam 4-12 minggu",
      ],
      actionText: "Pelajari Cara Kompos",
    },
    {
      id: "anorganik",
      title: "Sampah Anorganik",
      subtitle: "Peluang Ekonomi Circular di Jakarta",
      icon: <Recycle className="w-6 h-6" />,
      color: "blue",
      gradient: "from-blue-500 to-cyan-600",
      stats: [
        { label: "Tingkat Daur Ulang", value: "12%" },
        { label: "Potensi Ekonomi", value: "Rp 2.5T/tahun" },
        { label: "Bank Sampah Aktif", value: "2,800+" },
        { label: "Pekerja Informal", value: "~30,000 orang" },
      ],
      tips: [
        "Bersihkan wadah sebelum disimpan",
        "Pisahkan berdasarkan jenis material",
        "Kumpulkan minimal 5kg per kategori",
        "Manfaatkan aplikasi JSC untuk lokasi Bank Sampah",
      ],
      actionText: "Cari Bank Sampah",
    },
    {
      id: "lainnya",
      title: "Sampah B3 Rumah Tangga",
      subtitle: "Penanganan Khusus untuk Keamanan",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "red",
      gradient: "from-red-500 to-pink-600",
      stats: [
        { label: "Komposisi", value: "3-5%" },
        { label: "Bahaya Lingkungan", value: "Tinggi" },
        { label: "Drop Point", value: "200+ lokasi" },
        { label: "Program B3 Care", value: "Bulanan" },
      ],
      tips: [
        "Jangan campur dengan sampah biasa",
        "Kemas dalam wadah tertutup & berlabel",
        "Manfaatkan program take-back produsen",
        "Ikuti event B3 Care di mall-mall Jakarta",
      ],
      actionText: "Lokasi Drop Point",
    },
    {
      id: "program",
      title: "Program Pemerintah",
      subtitle: "Inisiatif DKI Jakarta untuk Warga",
      icon: <Users className="w-6 h-6" />,
      color: "purple",
      gradient: "from-purple-500 to-indigo-600",
      stats: [
        { label: "TPS 3R", value: "200+" },
        { label: "Subsidi Komposter", value: "Tersedia" },
        { label: "Pelatihan/Bulan", value: "~50 sesi" },
        { label: "Call Center", value: "106 (24 jam)" },
      ],
      tips: [
        "Daftar program melalui RT/RW setempat",
        "Manfaatkan aplikasi Jakarta Smart City",
        "Ikuti pelatihan gratis setiap bulan",
        "Gunakan layanan konsultasi Call Center 106",
      ],
      actionText: "Info Program",
    },
  ];

  return (
    <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
      {educationalCards.map(card => (
        <Card
          key={card.id}
          className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
            activeCard === card.id
              ? `ring-2 ring-${card.color}-500 ring-offset-2`
              : ""
          }`}
          onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
        >
          {/* Header with Gradient */}
          <CardHeader
            className={`text-white bg-gradient-to-r ${card.gradient} relative`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <CardTitle className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {card.icon}
                <div>
                  <h3 className="text-lg font-bold">{card.title}</h3>
                  <p className="text-sm text-white text-opacity-90 font-normal">
                    {card.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 transition-transform ${
                  activeCard === card.id ? "rotate-90" : ""
                }`}
              />
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {/* Stats Section */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                {card.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className={`text-lg font-bold text-${card.color}-600`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                activeCard === card.id ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="p-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Tips Praktis
                </h4>
                <ul className="space-y-2 mb-4">
                  {card.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <span
                        className={`w-2 h-2 rounded-full bg-${card.color}-500 mt-2 mr-3 flex-shrink-0`}
                      ></span>
                      {tip}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onActionClick?.(card.id);
                  }}
                  className={`w-full bg-${card.color}-500 hover:bg-${card.color}-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2`}
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Jakarta Statistics Summary Card */}
      <Card className="md:col-span-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
        <CardHeader className="border-b border-emerald-200 bg-white bg-opacity-70">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>
              Target Jakarta 2030: Smart & Sustainable Waste Management
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Calculator className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">50%</p>
              <p className="text-sm text-gray-600">Target Pengurangan Sampah</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Recycle className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">30%</p>
              <p className="text-sm text-gray-600">Target Tingkat Daur Ulang</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">24/7</p>
              <p className="text-sm text-gray-600">Sistem Monitoring Digital</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">100%</p>
              <p className="text-sm text-gray-600">Cakupan Layanan Digital</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong>Jakarta Smart Waste 2030:</strong> Menuju pengelolaan
              sampah yang terintegrasi, berkelanjutan, dan berbasis teknologi
              untuk kualitas hidup warga yang lebih baik.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
