import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Webixo payment",
  description: "C'est une applicaion de facture en ligne avec envoi de notification par sms et par email et paiement en ligne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
