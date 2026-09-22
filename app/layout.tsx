import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lanubefm.cl"),
  title: "Radio La Nube 99.5 FM | Una nube de éxitos",
  description:
    "Radio La Nube 99.5 FM: una nube de éxitos. Señal en vivo, música y programación local desde Chanco, Región del Maule.",
  applicationName: "Radio La Nube",
  keywords: [
    "Radio La Nube",
    "99.5 FM",
    "radio en vivo",
    "radio Chanco",
    "radio Maule",
    "emisora FM Chile",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Radio La Nube",
    locale: "es_CL",
    url: "https://lanubefm.cl",
    title: "Radio La Nube 99.5 FM | Una nube de éxitos",
    description:
      "Una nube de éxitos. Escucha Radio La Nube 99.5 FM en vivo con música y contenido local desde la Región del Maule.",
    images: [
      {
        url: "/logo-fondo.png",
        width: 1200,
        height: 1065,
        alt: "Radio La Nube 99.5 FM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radio La Nube 99.5 FM | Una nube de éxitos",
    description:
      "Una nube de éxitos: música y programación local en vivo por Radio La Nube 99.5 FM.",
    images: ["/logo-fondo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <div className="pt-[4.5rem]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
