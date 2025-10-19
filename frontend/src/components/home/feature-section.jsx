import { Camera, MapPin, Smartphone } from "lucide-react";
import { FeatureCard } from "./feature-card";

const FeatureSection = ({ className = "" }) => {
  const features = [
    {
      title: "Klasifikasi Real-time",
      description:
        "Klasifikasi sampah secara real-time melalui kamera dengan teknologi Machine Learning",
      icon: <Camera className="w-6 md:w-8 h-6 md:h-8" />,
      iconColor: "blue",
    },
    {
      title: "Peta Lokasi TPS",
      description:
        "Temukan lokasi Tempat Penampungan Sampah (TPS) terdekat di Jakarta dengan peta interaktif",
      icon: <MapPin className="w-6 md:w-8 h-6 md:h-8" />,
      iconColor: "emerald",
    },
    {
      title: "Kompatibel Semua Perangkat",
      description:
        "Akses dari perangkat apapun seperti PC, laptop, smartphone Android dan iOS melalui browser",
      icon: <Smartphone className="w-6 md:w-8 h-6 md:h-8" />,
      iconColor: "purple",
    },
  ];

  return (
    <section className={`py-12 md:py-20 px-4 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Fitur Unggulan JakOlah
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-12 md:mb-16">
          Teknologi canggih untuk membantu Anda mengelola sampah dengan lebih
          baik
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              iconColor={feature.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeatureSection };
