/**
 * Education Content Component
 *
 * Comprehensive educational system for waste management guidance
 * specifically tailored for Jakarta context with Indonesian language
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Leaf,
  Recycle,
  AlertTriangle,
  MapPin,
  Target,
  Users,
  TrendingUp,
  Phone,
  Star,
  Heart,
  CheckCircle2,
} from "lucide-react";

interface EducationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  color: "emerald" | "blue" | "amber" | "red";
}

interface EducationContentProps {
  category?: "ORG" | "ANO" | "LAI" | "ALL";
  compact?: boolean;
  className?: string;
}

export function EducationContent({
  category = "ALL",
  compact = false,
  className = "",
}: EducationContentProps) {
  const [activeSection, setActiveSection] = useState<string>("organik");

  // Jakarta-specific waste management data
  const jakartaStats = {
    dailyWaste: "7,700 ton",
    recyclingRate: "12%",
    composingPotential: "60%",
    tpsCount: "5,400+",
    bankSampahCount: "2,800+",
  };

  // Comprehensive educational sections
  const educationSections: EducationSection[] = [
    {
      id: "organik",
      title: "Sampah Organik",
      icon: <Leaf className="w-5 h-5" />,
      color: "emerald",
      content: (
        <div className="space-y-6">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Apa itu Sampah Organik?
            </h4>
            <p className="text-emerald-800 text-sm leading-relaxed">
              Sampah organik adalah sampah yang berasal dari makhluk hidup yang
              mudah terurai secara alami. Di Jakarta, sampah organik mencakup
              60% dari total sampah rumah tangga.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Contoh Sampah Organik:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Sisa makanan dan kulit buah</li>
                <li>• Daun kering dan potongan rumput</li>
                <li>• Tulang ikan dan ayam</li>
                <li>• Ampas kopi dan teh</li>
                <li>• Kertas bekas yang tidak dilapisi</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Cara Pengelolaan:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Kompos rumahan → pupuk alami</li>
                <li>• Biogas → energi alternatif</li>
                <li>• Bank Sampah dengan unit kompos</li>
                <li>• Program TPS 3R di lingkungan</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dampak Positif untuk Jakarta
            </h4>
            <p className="text-yellow-800 text-sm">
              <strong>Potensi besar:</strong> Jika 50% sampah organik Jakarta
              dikompos, dapat mengurangi beban TPA Bantargebang hingga 2,300
              ton/hari dan menghasilkan 460 ton pupuk berkualitas.
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              🏠 Tips Kompos Rumahan Jakarta
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium mb-2">
                  Metode Takakura (untuk apartemen):
                </p>
                <ul className="space-y-1">
                  <li>• Bahan: kotak styrofoam + sekam</li>
                  <li>• Waktu: 4-6 minggu matang</li>
                  <li>• Cocok: ruang terbatas</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">
                  Metode Tumpukan (untuk rumah):
                </p>
                <ul className="space-y-1">
                  <li>• Bahan: campuran hijau + coklat</li>
                  <li>• Waktu: 3-4 bulan matang</li>
                  <li>• Hasil: pupuk lebih banyak</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "anorganik",
      title: "Sampah Anorganik",
      icon: <Recycle className="w-5 h-5" />,
      color: "blue",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Apa itu Sampah Anorganik?
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              Sampah anorganik adalah sampah yang tidak mudah terurai dan
              memiliki nilai ekonomis tinggi jika dikelola dengan baik. Di
              Jakarta, potensi nilai ekonomis mencapai Rp 2.5 triliun/tahun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Jenis dan Nilai Ekonomis:
              </h4>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      Plastik PET
                    </span>
                    <span className="text-blue-600 font-semibold">
                      Rp 4.000-6.000/kg
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Botol minuman, wadah makanan
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      Kertas Putih
                    </span>
                    <span className="text-blue-600 font-semibold">
                      Rp 2.500-3.500/kg
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Kertas HVS, buku, koran
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Aluminium</span>
                    <span className="text-blue-600 font-semibold">
                      Rp 15.000-18.000/kg
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Kaleng minuman, kemasan
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      Kaca Bening
                    </span>
                    <span className="text-blue-600 font-semibold">
                      Rp 1.000-1.500/kg
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Botol kaca, peralatan kaca
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Persiapan Sebelum Dijual:
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Pembersihan</p>
                    <p className="text-sm text-gray-600">
                      Cuci dengan air bersih, keringkan, hilangkan label
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Pemilahan</p>
                    <p className="text-sm text-gray-600">
                      Pisahkan berdasarkan jenis dan warna material
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Penyimpanan</p>
                    <p className="text-sm text-gray-600">
                      Kumpulkan hingga minimal 5-10 kg per jenis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Bank Sampah Jakarta Terdekat
            </h4>
            <p className="text-emerald-800 text-sm mb-3">
              Jakarta memiliki 2,800+ Bank Sampah aktif. Cari yang terdekat
              dengan aplikasi Jakarta Smart City atau hubungi Call Center 106.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-emerald-900">
                  Jadwal Operasional Umum:
                </p>
                <ul className="text-emerald-800 space-y-1">
                  <li>• Senin - Sabtu: 08:00 - 16:00</li>
                  <li>• Minggu: Tutup/sesuai kebijakan</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-emerald-900">
                  Fasilitas Tersedia:
                </p>
                <ul className="text-emerald-800 space-y-1">
                  <li>• Timbangan digital</li>
                  <li>• Tabungan sampah</li>
                  <li>• Edukasi daur ulang</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "lainnya",
      title: "Sampah Lainnya/B3",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "red",
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Sampah Berbahaya dan Beracun (B3)
            </h4>
            <p className="text-red-800 text-sm leading-relaxed">
              Sampah B3 rumah tangga yang memerlukan penanganan khusus karena
              dapat membahayakan kesehatan dan lingkungan jika tidak dikelola
              dengan benar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Jenis Sampah B3 Rumah Tangga:
              </h4>
              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="font-medium text-red-900">
                    ⚡ Elektronik & Baterai
                  </p>
                  <p className="text-xs text-red-800">
                    HP lama, laptop rusak, baterai AA/AAA, power bank
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <p className="font-medium text-orange-900">
                    💊 Obat Kadaluarsa
                  </p>
                  <p className="text-xs text-orange-800">
                    Tablet, sirup, salep, vitamin expired
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="font-medium text-yellow-900">
                    💡 Lampu & Bohlam
                  </p>
                  <p className="text-xs text-yellow-800">
                    LED rusak, lampu TL, bohlam pijar
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="font-medium text-gray-900">🧴 Kemasan Kimia</p>
                  <p className="text-xs text-gray-800">
                    Botol cat, pengharum ruangan, pembersih toilet
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                ⚠️ Bahaya Pembuangan Sembarangan:
              </h4>
              <div className="space-y-4">
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="font-medium text-red-900">Kesehatan Manusia:</p>
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• Keracunan logam berat</li>
                    <li>• Gangguan pernapasan</li>
                    <li>• Iritasi kulit dan mata</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <p className="font-medium text-orange-900">Lingkungan:</p>
                  <ul className="text-xs text-orange-800 space-y-1">
                    <li>• Pencemaran tanah & air</li>
                    <li>• Kerusakan ekosistem</li>
                    <li>• Bioakumulasi racun</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Drop Point B3 di Jakarta
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-emerald-900">📱 E-Waste:</p>
                <ul className="text-emerald-800 space-y-1">
                  <li>• Erafone (program trade-in)</li>
                  <li>• Samsung Service Center</li>
                  <li>• Indonesia E-Waste Program</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-emerald-900">
                  💊 Obat Kadaluarsa:
                </p>
                <ul className="text-emerald-800 space-y-1">
                  <li>• Apotek Guardian</li>
                  <li>• Apotek K24 (beberapa cabang)</li>
                  <li>• Puskesmas wilayah</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-emerald-100 rounded border border-emerald-300">
              <p className="text-emerald-900 text-sm">
                📞 <strong>Hotline DLH Jakarta:</strong> (021) 5703-285 untuk
                konsultasi lokasi drop point terdekat
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "jakarta-program",
      title: "Program Jakarta",
      icon: <Users className="w-5 h-5" />,
      color: "amber",
      content: (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Inisiatif Pemerintah DKI Jakarta
            </h4>
            <p className="text-amber-800 text-sm leading-relaxed">
              Berbagai program inovatif untuk mendukung pengelolaan sampah
              berkelanjutan di Jakarta dengan partisipasi masyarakat aktif.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Recycle className="w-4 h-4 mr-2" />
                  Program Bank Sampah
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 2,800+ bank sampah aktif se-Jakarta</li>
                  <li>• Tabungan sampah dengan bunga 2-3%/bulan</li>
                  <li>• Pelatihan daur ulang gratis</li>
                  <li>• Aplikasi JSC untuk pencarian lokasi</li>
                </ul>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                  💰 <strong>Pendapatan rata-rata:</strong> Rp
                  50.000-200.000/bulan per KK
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center">
                  <Leaf className="w-4 h-4 mr-2" />
                  Program Kompos Mandiri
                </h4>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• Bantuan komposter gratis (terbatas)</li>
                  <li>• Pelatihan pembuatan kompos</li>
                  <li>• Mentoring dari PKK setempat</li>
                  <li>• Pameran hasil kompos berkala</li>
                </ul>
                <div className="mt-3 p-2 bg-emerald-100 rounded text-xs">
                  🌱 <strong>Target:</strong> Mengurangi 40% sampah organik ke
                  TPA
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  TPS 3R (Reduce, Reuse, Recycle)
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• 200+ lokasi TPS 3R modern</li>
                  <li>• Fasilitas pemilahan otomatis</li>
                  <li>• Area edukasi interaktif</li>
                  <li>• Kerjasama RT/RW setempat</li>
                </ul>
                <div className="mt-3 p-2 bg-purple-100 rounded text-xs">
                  📊 <strong>Kapasitas:</strong> 50-100 ton/hari per lokasi
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Jakarta B3 Care
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Program pengumpulan B3 rumah tangga</li>
                  <li>• Event bulanan di mall-mall besar</li>
                  <li>• Edukasi bahaya sampah B3</li>
                  <li>• Kerjasama dengan produsen</li>
                </ul>
                <div className="mt-3 p-2 bg-red-100 rounded text-xs">
                  ⚠️ <strong>Layanan:</strong> Gratis untuk warga Jakarta
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Kontak Penting Program Jakarta
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <p className="font-medium text-gray-900">
                    Call Center DKI Jakarta:
                  </p>
                  <p className="text-blue-600">📞 106 (24 jam)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Dinas Lingkungan Hidup:
                  </p>
                  <p className="text-blue-600">📞 (021) 5703-285</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="font-medium text-gray-900">
                    Jakarta Smart City App:
                  </p>
                  <p className="text-green-600">
                    📱 Download di Play Store/App Store
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Website Resmi:</p>
                  <p className="text-blue-600">🌐 jakarta.go.id/lingkungan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Filter sections based on category
  const filteredSections =
    category === "ALL"
      ? educationSections
      : educationSections.filter(section => {
          switch (category) {
            case "ORG":
              return section.id === "organik";
            case "ANO":
              return section.id === "anorganik";
            case "LAI":
              return section.id === "lainnya";
            default:
              return true;
          }
        });

  if (compact) {
    // Compact version for results page
    const primarySection = filteredSections[0];
    if (!primarySection) return null;

    return (
      <Card className={`shadow-sm border border-gray-200 ${className}`}>
        <CardHeader
          className={`border-b border-gray-100 bg-${primarySection.color}-50`}
        >
          <CardTitle
            className={`text-lg text-${primarySection.color}-900 flex items-center space-x-2`}
          >
            {primarySection.icon}
            <span>Panduan Pengelolaan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">{primarySection.content}</CardContent>
      </Card>
    );
  }

  // Full educational content
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Statistics */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🏙️ Statistik Sampah Jakarta Hari Ini
            </h2>
            <p className="text-gray-600">
              Data real-time pengelolaan sampah DKI Jakarta
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <p className="text-2xl font-bold text-red-600">
                {jakartaStats.dailyWaste}
              </p>
              <p className="text-xs text-gray-600">Sampah/Hari</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <p className="text-2xl font-bold text-blue-600">
                {jakartaStats.recyclingRate}
              </p>
              <p className="text-xs text-gray-600">Tingkat Daur Ulang</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <p className="text-2xl font-bold text-emerald-600">
                {jakartaStats.composingPotential}
              </p>
              <p className="text-xs text-gray-600">Potensi Kompos</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <p className="text-2xl font-bold text-purple-600">
                {jakartaStats.tpsCount}
              </p>
              <p className="text-xs text-gray-600">TPS Aktif</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <p className="text-2xl font-bold text-orange-600">
                {jakartaStats.bankSampahCount}
              </p>
              <p className="text-xs text-gray-600">Bank Sampah</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap border-b">
            {filteredSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeSection === section.id
                    ? `border-${section.color}-500 text-${section.color}-600 bg-${section.color}-50`
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {section.icon}
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Section Content */}
      {filteredSections.map(section => (
        <div
          key={section.id}
          className={activeSection === section.id ? "block" : "hidden"}
        >
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">{section.content}</CardContent>
          </Card>
        </div>
      ))}

      {/* Action Call-to-Action */}
      <Card className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            Mari Bersama Wujudkan Jakarta Bebas Sampah!
          </h3>
          <p className="text-emerald-50 mb-6 leading-relaxed">
            Setiap tindakan kecil Anda berkontribusi pada Jakarta yang lebih
            bersih dan hijau. Mulai dari rumah, spread the awareness!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              📸 Mulai Klasifikasi
            </button>
            <button className="bg-emerald-600 text-white border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              🗺️ Cari Fasilitas Terdekat
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
