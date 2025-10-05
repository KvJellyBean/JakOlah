import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "JakOlah - Klasifikasi Sampah Jakarta",
  description:
    "Aplikasi klasifikasi sampah real-time untuk warga Jakarta menggunakan teknologi machine learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
