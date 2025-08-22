import PoliticaDeSeguridad from '@/components/politicas/PoliticasSeguridad'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "Política de Seguridad | Radio La Nube 99.5 FM",
  description:
    "Consulta la política de seguridad y protección de datos personales de Radio La Nube 99.5 FM.",
  keywords: [
    "política de seguridad",
    "protección de datos",
    "radio segura Chile",
    "privacidad radio",
    "radio La Nube legal",
    "confidencialidad digital",
    "radio Maule seguridad"
  ],
  openGraph: {
    title: "Política de Seguridad | Radio La Nube 99.5 FM",
    description:
      "Tu privacidad es importante para nosotros. Revisa nuestras medidas de protección de datos y comunicación.",
    url: "https://lanubefm.cl/politica-de-seguridad",
    siteName: "Radio La Nube",
    locale: "es_CL",
    type: "article",
  },
  twitter: {
    title: "Política de Seguridad | Radio La Nube 99.5 FM",
    description:
      "Lee cómo protegemos tu información en Radio La Nube 99.5 FM.",
    card: "summary_large_image",
  },
};

export default function pagePoliticas() {
  return (
    <main>
      <article>
        <PoliticaDeSeguridad />
      </article>
    </main>
  );
}