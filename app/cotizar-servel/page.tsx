import CotizadorServel from "@/components/cotizar-servel/CotizadorServel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotizar Servel | Radio La Nube 99.5 FM",
  description: "Calcula el valor de tu aviso o entrevista para Servel en Radio La Nube.",
};

export default function CotizarServelPage() {
  return (
    <main
      className="max-w-2xl mx-auto px-4 min-h-[calc(100vh-64px-80px)] pt-28 pb-20 flex flex-col justify-start"
      // min-h: alto total menos navbar (aprox 64px) y footer (aprox 80px)
    >
      <h1 className="text-3xl font-bold text-sky-800 mb-8 text-center">Cotizador Servel</h1>
      <CotizadorServel />
    </main>
  );
}
