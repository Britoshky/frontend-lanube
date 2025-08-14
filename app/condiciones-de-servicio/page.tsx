import CondicionesDelServicio from '@/components/condiciones/CondicionesServicios'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "Condiciones del Servicio | Radio La Nube 99.5 FM",
  description:
    "Lee las condiciones de uso de nuestros servicios digitales y de transmisión en Radio La Nube.",
  keywords: [
    "términos de servicio radio",
    "condiciones legales",
    "uso del sitio",
    "streaming radial",
    "radio La Nube condiciones",
    "radio Maule legal"
  ],
  openGraph: {
    title: "Condiciones del Servicio | Radio La Nube 99.5 FM",
    description:
      "Accede a las condiciones legales que regulan el uso de nuestros contenidos y plataformas digitales.",
    url: "https://lanubefm.cl/condiciones-del-servicio",
    siteName: "Radio La Nube",
    locale: "es_CL",
    type: "article",
  },
  twitter: {
    title: "Condiciones del Servicio | Radio La Nube 99.5 FM",
    description:
      "Conoce las reglas de uso de nuestros servicios online y radiales.",
    card: "summary_large_image",
  },
};


export default function pageCondiciones() {
  return (
    <main>
      <article>
        <CondicionesDelServicio />
      </article>
    </main>
  );
}