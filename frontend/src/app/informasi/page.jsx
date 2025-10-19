"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { Footer } from "@/components/home/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Code, Database, ChevronDown, HelpCircle } from "lucide-react";

export default function InformasiPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
      question: "Bagaimana cara menggunakan aplikasi ini?",
      answer:
        "Buka halaman Klasifikasi, lalu pilih tab 'Kamera' untuk mengklasifikasi sampah secara real-time dengan mengarahkan kamera. Aplikasi akan menampilkan hasil dengan bounding box berwarna. Untuk mencari lokasi TPS, klik tab 'Lokasi' dan aplikasi akan menampilkan TPS terdekat dengan Anda di Jakarta.",
    },
    {
      question: "Apa saja jenis sampah yang dapat dikenali aplikasi?",
      answer:
        "JakOlah dapat mengenali tiga kategori utama: Sampah Organik (sisa makanan, daun, kulit buah pisang), Sampah Anorganik (plastik, kertas, logam, kaca), dan Sampah Lainnya (masker bekas, baterai, bohlam, korek gas, kabel, styrofoam, kain perca, popok bekas).",
    },
    {
      question: "Apakah data dan gambar saya aman?",
      answer:
        "Ya, keamanan data Anda terjamin. Semua proses klasifikasi dilakukan dengan mengirim frame kamera ke server ML untuk dianalisis, kemudian server langsung mengembalikan hasil tanpa menyimpan gambar. Tidak ada gambar atau data pribadi yang tersimpan di server kami.",
    },
    {
      question: "Apa teknologi yang digunakan untuk klasifikasi?",
      answer:
        "JakOlah menggunakan kombinasi model deteksi objek sampah dalam frame kamera, dan gabungan CNN (Convolutional Neural Network) dengan SVM (Support Vector Machine) untuk mengklasifikasikan kategori sampah. Model dilatih dengan 18,000+ gambar sampah.",
    },
    {
      question: "Seberapa akurat hasil klasifikasi aplikasi ini?",
      answer:
        "Aplikasi JakOlah memiliki tingkat akurasi rata-rata 87% pada dataset testing. Akurasi terus ditingkatkan melalui feedback pengguna dan penambahan data training.",
    },
    {
      question: "Apakah aplikasi ini gratis? Ada biaya tersembunyi?",
      answer:
        "JakOlah sepenuhnya gratis untuk digunakan. Tidak ada biaya tersembunyi atau langganan premium. Aplikasi ini dikembangkan sebagai kontribusi untuk edukasi lingkungan.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        items={[
          { href: "/", label: "Beranda" },
          { href: "/klasifikasi", label: "Klasifikasi" },
          { href: "/informasi", label: "Informasi", active: true },
        ]}
        showLoginButton
        onLoginClick={() => router.push("/masuk")}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-10 md:mb-12 flex-col justify-center">
          <h1 className="text-3xl md:text-4xl max-md:text-center font-bold text-gray-900 mb-3">
            Informasi & Bantuan
          </h1>
          <p className="text-lg md:text-xl max-md:text-center text-gray-600">
            Pelajari lebih lanjut tentang JakOlah dan temukan jawaban atas
            pertanyaan Anda
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* About JakOlah */}
          <Card className="shadow-sm border border-gray-200 !pt-0">
            <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
              <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Tentang JakOlah</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Apa itu JakOlah?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    JakOlah adalah aplikasi klasifikasi sampah real-time
                    berbasis web menggunakan teknologi Machine Learning.
                    Aplikasi ini dirancang khusus untuk membantu masyarakat
                    Jakarta mengenali jenis sampah secara otomatis menggunakan
                    kamera dan menemukan lokasi TPS terdekat.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Fitur Utama
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-700">
                      <li>• Klasifikasi sampah real-time</li>
                      <li>• Deteksi multi-objek dengan bounding box</li>
                      <li>• Interface yang mudah digunakan</li>
                    </ul>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Peta lokasi 4000+ TPS di Jakarta</li>
                      <li>• Kompatibel semua perangkat (PWA)</li>
                      <li>• Tidak perlu install aplikasi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer */}
          <Card className="shadow-sm border border-gray-200 !pt-0">
            <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
              <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Pengembang</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 md:w-16 h-12 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xl md:text-2xl">
                    KN
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Kevin Natanael
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Mahasiswa Informatika yang passionate terhadap teknologi
                    Machine Learning dan pengembangan web. <br />
                    JakOlah dikembangkan sebagai proyek untuk membantu
                    masyarakat Jakarta mengelola sampah melalui teknologi
                    modern.
                  </p>
                  <div className="flex space-x-4 text-sm max-md:flex-col max-md:space-x-0 max-md:space-y-2">
                    <span className="text-gray-600">
                      {/* email logo */}
                      📧 Email: kevin.535220084@stu.untar.ac.id
                    </span>
                    <span className="text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="inline-block mr-1"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.94.4.07.55-.17.55-.39 0-.19-.01-.83-.01-1.5-2.24.49-2.71-1.08-2.71-1.08-.36-.91-.87-1.15-.87-1.15-.71-.49.05-.48.05-.48.78.05 1.19.8 1.19.8.69 1.18 1.81.84 2.25.64.07-.5.27-.84.49-1.03-1.73-.2-3.55-.87-3.55-3.87 0-.85.3-1.55.79-2.1-.08-.2-.34-1.02.07-2.12 0 0 .66-.21 2.16.79.63-.18 1.31-.27 1.99-.27.68 0 1.36.09 1.99.27 1.5-1 2.16-.79 2.16-.79.41 1.1.15 1.92.07 2.12.49.55.79 1.25.79 2.1 0 3-1.82 3.67-3.55 3.87.27.23.51.68.51 1.37 0 .22-.02.43-.05.63A5.57 5.57 0 0016 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      GitHub:{" "}
                      <a
                        href="https://github.com/KvJellyBean"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        KvJellyBean
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology & Dataset */}
          <Card className="shadow-sm border border-gray-200 !pt-0">
            <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
              <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Teknologi & Dataset</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Technology Stack
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Next.js 15 + TypeScript</li>
                    <li>• Python FastAPI</li>
                    <li>• TensorFlow/PyTorch</li>
                    <li>• Supabase Database</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Dataset & Model
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 18,000+ gambar sampah untuk training</li>
                    <li>• Akurasi model: ~87%</li>
                    <li>• 3 kategori: Organik, Anorganik, Lainnya</li>
                    <li>• CNN-SVM untuk klasifikasi kategori</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="shadow-sm border border-gray-200 !pt-0">
            <CardHeader className="border-b border-gray-100 border-l-4 border-l-emerald-500 pt-6 rounded-t-lg">
              <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <Card
                    key={index}
                    className="border border-gray-200 !py-0 !gap-0"
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                      className="w-full text-left rounded-xl"
                    >
                      <CardHeader className="border-b border-gray-100 transition-colors !gap-0 !py-4">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <HelpCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-base md:text-lg">
                              {faq.question}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${
                              openFaq === index ? "rotate-180" : ""
                            }`}
                          />
                        </CardTitle>
                      </CardHeader>
                    </button>
                    {openFaq === index && (
                      <CardContent className="p-4 md:p-6">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="bg-emerald-50 border border-emerald-200">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <HelpCircle className="w-6 md:w-8 h-6 md:h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-gray-900">
                Masih ada pertanyaan?
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Jika Anda memerlukan pertanyaan lain yang tidak tercantum di
                atas, jangan ragu untuk menghubungi pengembang JakOlah.
              </p>
              <button
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                onClick={() =>
                  window.open(
                    "mailto:info@jakolah.id?subject=Pertanyaan tentang JakOlah&body=Halo, saya memiliki pertanyaan tentang aplikasi JakOlah:%0A%0A",
                    "_blank"
                  )
                }
              >
                Hubungi Kami
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
