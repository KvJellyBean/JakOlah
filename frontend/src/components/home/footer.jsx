import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

const Footer = ({ className = "" }) => {
  const navigationItems = [
    { href: "/", label: "Beranda" },
    { href: "/klasifikasi", label: "Klasifikasi" },
    { href: "/informasi", label: "Informasi" },
  ];

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      text: "info@jakolah.id",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      text: "+62 21 1234 5678",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      text: "Jakarta, Indonesia",
    },
  ];

  return (
    <footer
      className={`bg-gray-900 text-white py-12 md:py-14 px-4 !pb-10 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <Logo
              size="md"
              textClassName="text-white"
              className="mb-6"
              clickable={false}
            />
            <p className="text-gray-300 leading-relaxed">
              Aplikasi klasifikasi sampah real-time berbasis web dengan
              teknologi Machine Learning. Membantu warga Jakarta mengenali jenis
              sampah dan menemukan lokasi TPS terdekat.
            </p>
          </div>

          {/* Navigation Section */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-6">Navigasi</h3>
            <ul className="space-y-3 text-gray-300">
              {navigationItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-6">Kontak</h3>
            <ul className="space-y-3 text-gray-300">
              {contactInfo.map((contact, index) => (
                <li key={index} className="flex items-center space-x-3">
                  {contact.icon}
                  <span>{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-gray-400">
            © 2025 JakOlah. Dikembangkan untuk bumi yang lebih baik.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
