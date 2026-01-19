import type { Metadata } from "next";
import { Geist, Geist_Mono, Hedvig_Letters_Serif } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { StructuredData } from "@/components/StructuredData";

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
  title: "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
  description:
    "Consulta médica en línea con doctores verificados en México. Telemedicina segura, videoconsultas HD, y Dr. Simeon - tu asistente de salud con IA. Más de 500 especialistas disponibles 24/7.",
  keywords:
    "telemedicina México, doctores en línea, consulta médica virtual, doctores verificados México, videoconsulta médica, Dr Simeon, salud digital México, cita médica en línea, especialistas certificados, segunda opinión médica",
  authors: [{ name: "Doctor.mx" }],
  creator: "Doctor.mx",
  publisher: "Doctor.mx",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://doctor.mx",
  },
  openGraph: {
    title: "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
    description:
      "Consulta médica en línea con doctores verificados en México. Telemedicina segura, videoconsultas HD, y Dr. Simeon - tu asistente de salud con IA. Más de 500 especialistas disponibles 24/7.",
    type: "website",
    locale: "es_MX",
    url: "https://doctor.mx",
    siteName: "Doctor.mx",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Doctor.mx - Telemedicina y Doctores Verificados en México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
    description:
      "Consulta médica en línea con doctores verificados en México. Telemedicina segura, videoconsultas HD, y Dr. Simeon - tu asistente de salud con IA.",
    images: ["/og-image.png"],
    creator: "@doctormx",
    site: "@doctormx",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${hedvigLettersSerif.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
        <StructuredData />
      </body>
    </html>
  );
}
