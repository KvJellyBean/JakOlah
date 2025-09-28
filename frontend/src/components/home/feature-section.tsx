import { Camera, BookOpen, Users } from "lucide-react";
import { FeatureCard } from "./feature-card";

interface FeatureSectionProps {
  className?: string;
}

const FeatureSection = ({ className = "" }: FeatureSectionProps) => {
  const features = [
    {
      title: "Klasifikasi Otomatis",
      description:
        "Identifikasi jenis sampah secara otomatis menggunakan teknologi AI dengan akurasi tinggi",
      icon: <Camera className="w-6 md:w-8 h-6 md:h-8" />,
      iconColor: "blue" as const,
    },
    {
      title: "Edukasi Lengkap",
      description:
        "Pelajari cara memilah, mengolah, dan mendaur ulang berbagai jenis sampah dengan benar",
      icon: <BookOpen className="w-6 md:w-8 h-6 md:h-8" />,
      iconColor: "emerald" as const,
    },
    {
      title: "Komunitas Peduli",
      description:
        "Bergabung dengan komunitas yang peduli lingkungan dan berbagi tips daur ulang",
      icon: <Users className="w-6 md:w-8 h-6 md:h-8" />,
      iconColor: "purple" as const,
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
