import CompromisoComunitario from '@/components/quienes-somos/CompromisoComunitario'
import EquipoRadio from '@/components/quienes-somos/EquipoRadio'
import HistoriaRadio from '@/components/quienes-somos/HistoriaRadio'
import IntroQuienesSomos from '@/components/quienes-somos/IntroQuienesSomos'
import ValoresRadio from '@/components/quienes-somos/ValoresRadio'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "Quiénes Somos | Radio La Nube 99.5 FM",
  description:
    "Conoce la historia, misión y visión de Radio La Nube 99.5 FM, una emisora juvenil desde Chanco, Región del Maule.",
  keywords: [
    "quiénes somos radio",
    "radio juvenil chile",
    "radio La Nube",
    "emisora Chanco",
    "radio Maule",
    "historia de radio",
    "música regional"
  ],
  openGraph: {
    title: "Quiénes Somos | Radio La Nube 99.5 FM",
    description:
      "Somos una radio hecha con pasión y compromiso. Conoce nuestro equipo, valores e historia.",
    url: "https://lanubefm.cl/quienes-somos",
    siteName: "Radio La Nube",
    locale: "es_CL",
    type: "article",
  },
  twitter: {
    title: "Quiénes Somos | Radio La Nube 99.5 FM",
    description:
      "Desde Chanco al Maule: conoce el equipo detrás de La Nube 99.5 FM.",
    card: "summary_large_image",
  },
};


export default function pageQuienesSomos() {
  return (
    <main>
      {/* Introducción principal */}
      <header>
        <IntroQuienesSomos />
      </header>

      {/* Secciones informativas semánticas */}
      <section id="valores">
        <ValoresRadio />
      </section>

      <section id="equipo">
        <EquipoRadio />
      </section>

      <section id="historia">
        <HistoriaRadio />
      </section>

      <section id="comunidad">
        <CompromisoComunitario />
      </section>
    </main>
  );
}
