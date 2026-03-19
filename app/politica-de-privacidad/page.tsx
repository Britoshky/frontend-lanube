import type { Metadata } from "next";
import PoliticaPrivacidad from "@/components/politicas/PoliticaPrivacidad";

export const metadata: Metadata = {
  title: "Politica de Privacidad | Radio La Nube 99.5 FM",
  description:
    "Revisa como Radio La Nube 99.5 FM recopila, usa y protege tus datos personales.",
  alternates: {
    canonical: "https://lanubefm.cl/politica-de-privacidad",
  },
  keywords: [
    "politica de privacidad",
    "proteccion de datos",
    "datos personales",
    "radio la nube",
    "privacidad chile",
  ],
  openGraph: {
    title: "Politica de Privacidad | Radio La Nube 99.5 FM",
    description:
      "Conoce como tratamos y protegemos tus datos personales en Radio La Nube 99.5 FM.",
    url: "https://lanubefm.cl/politica-de-privacidad",
    siteName: "Radio La Nube",
    locale: "es_CL",
    type: "article",
  },
  twitter: {
    title: "Politica de Privacidad | Radio La Nube 99.5 FM",
    description:
      "Consulta nuestra politica de privacidad y tratamiento de datos personales.",
    card: "summary_large_image",
  },
};

export default function PoliticaPrivacidadPage() {
  return (
    <main>
      <article>
        <PoliticaPrivacidad />
      </article>
    </main>
  );
}
