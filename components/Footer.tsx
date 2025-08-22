import Link from "next/link";
import { Mail, MapPin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-sky-900 text-white py-12 px-6 md:px-10 lg:px-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-sm">
        
        {/* Datos de contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contacto</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:britoshky@gmail.com">britoshky@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Federico Albert #421, Chanco, Región del Maule
            </li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Síguenos</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              <a
                href="https://www.instagram.com/lanubefm"
                target="_blank"
                rel="noopener noreferrer"
              >
                @lanubefm
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              <a
                href="https://www.facebook.com/radiolanubefm"
                target="_blank"
                rel="noopener noreferrer"
              >
                /radiolanubefm
              </a>
            </li>
          </ul>
        </div>

        {/* Enlaces legales */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/politicas-de-seguridad" className="hover:underline">
                Política de Seguridad
              </Link>
            </li>
            <li>
              <Link href="/condiciones-de-servicio" className="hover:underline">
                Condiciones del Servicio
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs mt-12 text-white/70">
        © {new Date().getFullYear()} Radio La Nube 99.5 FM - Todos los derechos reservados
      </div>
    </footer>
  );
}
