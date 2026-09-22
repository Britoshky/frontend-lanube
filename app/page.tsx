import FormularioContacto from "@/components/home/FormularioContacto";
import Hero from "@/components/home/Hero";
import QuienesSomos from "@/components/home/QuienesSomos";
import Servicios from "@/components/home/Servicios";
import Testimonios from "@/components/home/Testimonios";
import VisionMision from "@/components/home/VisionMision";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radio La Nube 99.5 FM | Una nube de éxitos",
  description:
    "Una nube de éxitos. Escucha Radio La Nube 99.5 FM en vivo desde Chanco, Región del Maule.",
  alternates: {
    canonical: "https://lanubefm.cl/",
  },
  keywords: [
    "radio juvenil",
    "Radio La Nube",
    "99.5 FM",
    "radio en vivo Chanco",
    "radio Maule",
    "emisora Chile",
    "entrevistas radiales",
    "música en línea",
    "radio online Chile",
    "radiolanubefm"
  ],
  openGraph: {
    title: "Radio La Nube 99.5 FM | Una nube de éxitos",
    description:
      "Una nube de éxitos. Sintoniza Radio La Nube 99.5 FM en vivo desde Chanco.",
    url: "https://lanubefm.cl",
    siteName: "Radio La Nube",
    locale: "es_CL",
    type: "website",
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
    title: "Radio La Nube 99.5 FM | Una nube de éxitos",
    description:
      "Una nube de éxitos. Radio La Nube 99.5 FM desde Chanco, Chile.",
    card: "summary_large_image",
    images: ["/logo-fondo.png"],
  },
};


export default function Home() {
  return (
    <main>
      {/* Hero principal */}
      <header>
        <Hero />
      </header>

      {/* Contenido principal en secciones semánticas */}
      <section id="quienes-somos">
        <QuienesSomos />
      </section>

      <section id="vision-mision">
        <VisionMision />
      </section>

      <section id="servicios">
        <Servicios />
      </section>

      <section id="testimonios">
        <Testimonios />
      </section>

      <section id="contacto">
        <FormularioContacto />
      </section>
    </main>
  );
}
