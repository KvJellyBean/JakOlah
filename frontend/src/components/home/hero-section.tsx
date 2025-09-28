import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroSectionProps {
  onGetStartedClick?: () => void;
  className?: string;
}

const HeroSection = ({
  onGetStartedClick,
  className = "",
}: HeroSectionProps) => {
  return (
    <section
      className={`py-10 md:py-20 px-4 bg-gradient-to-b from-emerald-50 to-white ${className} `}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl max-md:text-center font-bold text-gray-900 mb-6 !leading-snug">
              Kenali Sampah,
              <br />
              <span className="text-emerald-600">Selamatkan Bumi</span>
            </h1>
            <p className="text-lg md:text-xl max-md:text-center text-gray-600 mb-9 !leading-relaxed">
              Aplikasi pintar yang membantu Anda mengidentifikasi jenis sampah
              rumah tangga dengan teknologi AI dan memberikan panduan daur ulang
              yang tepat.
            </p>
            <Link
              href="/klasifikasi"
              className="max-md:flex max-md:justify-center mb-4"
            >
              <Button
                size="lg"
                onClick={onGetStartedClick}
                className="flex items-center space-x-2"
              >
                <span>Mulai Klasifikasi</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 md:p-12 text-center bg-emerald-50">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-6 md:w-8 h-6 md:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-emerald-700 font-medium mb-4">
                Mulai Klasifikasi Sampah
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
