import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTASection = ({ className = "" }) => {
  return (
    <section
      className={`py-12 md:py-20 px-4 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 relative overflow-hidden ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-32 md:-translate-y-48 translate-x-32 md:translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full translate-y-24 md:translate-y-32 -translate-x-24 md:-translate-x-32"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
          Mulai Berkontribusi untuk Bumi yang Lebih Bersih
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-emerald-100 mb-6 sm:mb-8">
          Bergabunglah dengan ribuan pengguna yang sudah memulai perubahan
          positif
        </p>
        <Link href="/klasifikasi">
          <Button
            variant="outline"
            size="lg"
            className="bg-white text-emerald-600 border-white hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm sm:text-base"
          >
            Mulai Sekarang
          </Button>
        </Link>
      </div>
    </section>
  );
};

export { CTASection };
