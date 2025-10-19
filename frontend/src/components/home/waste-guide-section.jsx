import { Leaf } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const WasteGuideSection = ({ className = "" }) => {
  const wasteTypes = [
    {
      title: "Sampah Organik",
      badge: "Mudah terurai",
      badgeColor: "bg-emerald-100 text-emerald-700",
      borderColor: "border-l-emerald-500",
      icon: <Leaf className="w-6 h-6 text-emerald-600" />,
      examples: "Sisa makanan, kulit buah, daun kering, sayuran busuk",
      methods: [
        "• Kompos untuk pupuk tanaman",
        "• Biogas untuk energi alternatif",
        "• Pakan ternak (yang aman)",
      ],
    },
    {
      title: "Sampah Anorganik",
      badge: "Sulit terurai",
      badgeColor: "bg-blue-100 text-blue-700",
      borderColor: "border-l-blue-500",
      icon: (
        <div className="w-6 h-8 text-blue-600 text-center text-2xl">♻</div>
      ),
      examples: "Plastik, kertas, logam, kaca, karet",
      methods: [
        "• Daur ke bank sampah",
        "• Kerajinan tangan (upcycling)",
        "• Dijual menjadi produk baru",
      ],
    },
    {
      title: "Sampah B3 & Lainnya",
      badge: "Berbahaya",
      badgeColor: "bg-red-100 text-red-700",
      borderColor: "border-l-red-500",
      icon: <div className="w-6 h-8 text-red-600 text-center text-2xl">⚠</div>,
      examples: "Baterai, lampu, obat kadaluarsa, cat, pestisida",
      methods: [
        "• Serahkan ke fasilitas khusus",
        "• Jangan buang sembarangan",
        "• Ikuti program take-back",
      ],
    },
  ];

  return (
    <section className={`py-12 md:py-20 px-4 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Panduan Daur Ulang Sampah
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Pelajari cara mengelola berbagai jenis sampah untuk lingkungan yang
            lebih bersih
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {wasteTypes.map((waste, index) => (
            <Card
              key={index}
              className={`${waste.borderColor} border-l-4 shadow-lg bg-white`}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg mr-4 flex items-center justify-center">
                    {waste.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">
                    {waste.title}
                  </CardTitle>
                </div>

                <div
                  className={`${waste.badgeColor} px-3 py-1 rounded-full inline-block mb-4`}
                >
                  <span className="text-sm font-medium">{waste.badge}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Contoh:
                    </h4>
                    <p className="text-gray-600 text-sm">{waste.examples}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {waste.title === "Sampah B3 & Lainnya"
                        ? "Cara Pengelolaan:"
                        : "Cara Daur Ulang:"}
                    </h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {waste.methods.map((method, methodIndex) => (
                        <li key={methodIndex}>{method}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { WasteGuideSection };
