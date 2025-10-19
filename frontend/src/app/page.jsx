"use client";

import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { HeroSection } from "@/components/home/hero-section";
import { FeatureSection } from "@/components/home/feature-section";
import { WasteGuideSection } from "@/components/home/waste-guide-section";
import { CTASection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader
        items={[
          { href: "/", label: "Beranda", active: true },
          { href: "/klasifikasi", label: "Klasifikasi" },
          { href: "/informasi", label: "Informasi" },
        ]}
        showLoginButton
        onLoginClick={() => router.push("/masuk")}
      />

      <HeroSection onGetStartedClick={() => router.push("/klasifikasi")} />

      <FeatureSection />

      <WasteGuideSection />

      <CTASection onGetStartedClick={() => router.push("/daftar")} />

      <Footer />
    </div>
  );
}
