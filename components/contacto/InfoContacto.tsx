import { Mail, MapPin, Phone, Instagram, Facebook } from "lucide-react";

export default function InfoContacto() {
  return (
    <section className="bg-white py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-4xl mx-auto space-y-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-sky-800">Contáctanos</h2>
        <p className="text-gray-700 text-lg">
          ¿Tienes una consulta, propuesta o mensaje para nuestro equipo? Aquí te dejamos todas las formas de comunicarte con Radio La Nube.
        </p>

        <div className="grid gap-6 md:grid-cols-2 text-left mt-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-purple-700" />
              <span>Federico Albert #421, Chanco, Región del Maule</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-purple-700" />
              <a href="mailto:britoshky@gmail.com" className="hover:underline">britoshky@gmail.com</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-purple-700" />
              <a href="https://wa.me/56926261971" target="_blank" rel="noopener noreferrer" className="hover:underline">
                +56 9 2626 1971 (WhatsApp)
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Instagram className="text-purple-700" />
              <a href="https://www.instagram.com/lanubefm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                @lanubefm
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Facebook className="text-purple-700" />
              <a href="https://www.facebook.com/radiolanubefm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                /radiolanubefm
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
