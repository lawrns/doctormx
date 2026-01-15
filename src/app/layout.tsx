import type { Metadata } from "next";
import { Geist, Geist_Mono, Hedvig_Letters_Serif } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hedvigLettersSerif = Hedvig_Letters_Serif({
  variable: "--font-serif",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doctor.mx - Tu Doctor AI Personal | Consultas Médicas 24/7",
  description: "Consultas médicas con IA, segundas opiniones y conexión con especialistas certificados. Dr. Simeon, tu asistente médico inteligente disponible 24/7.",
  keywords: "doctor, médico, consulta médica, IA médica, telemedicina, México, salud digital",
  openGraph: {
    title: "Doctor.mx - Tu Doctor AI Personal",
    description: "Consultas médicas con IA y especialistas certificados. Disponible 24/7.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hedvigLettersSerif.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
