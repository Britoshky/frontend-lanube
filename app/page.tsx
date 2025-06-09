import FormularioContacto from "@/components/home/FormularioContacto";
import Hero from "@/components/home/Hero";
import QuienesSomos from "@/components/home/QuienesSomos";
import Servicios from "@/components/home/Servicios";
import Testimonios from "@/components/home/Testimonios";
import VisionMision from "@/components/home/VisionMision";

export default function Home() {
  return (
        <div>
        <Hero />
        <QuienesSomos />
        <VisionMision />
        <Servicios />
        <Testimonios />
        <FormularioContacto />
        </div>
  );
}
