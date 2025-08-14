import {
  Megaphone,
  Mic,
  CalendarCheck,
  Volume2,
  Radio,
  Sparkles,
} from "lucide-react";

const servicios = [
  {
    titulo: "Publicidad Radial",
    descripcion: "Difunde tu marca o negocio en la radio más escuchada de Chanco y alrededores.",
    icono: Megaphone,
  },
  {
    titulo: "Entrevistas Personalizadas",
    descripcion: "Espacios de conversación para emprendedores, artistas y líderes locales.",
    icono: Mic,
  },
  {
    titulo: "Cobertura de Eventos",
    descripcion: "Transmitimos en vivo desde ferias, festivales y actividades culturales.",
    icono: CalendarCheck,
  },
  {
    titulo: "Creación de Cuñas",
    descripcion: "Producción profesional de spots radiales para campañas o promociones.",
    icono: Volume2,
  },
  {
    titulo: "Programas a Medida",
    descripcion: "Creamos y adaptamos programas radiales según los intereses de tu público.",
    icono: Radio,
  },
  {
    titulo: "Difusión en Redes",
    descripcion: "Complementa tu pauta con menciones en nuestras plataformas digitales.",
    icono: Sparkles,
  },
];

export default function Servicios() {
  return (
    <section className="w-full bg-white py-16 px-6 md:px-10 lg:px-20">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-sky-700">
            Nuestros Servicios
          </h2>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            Conectamos tu mensaje con miles de auditores de manera creativa, directa y profesional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicios.map(({ titulo, descripcion, icono: Icon }, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 bg-gray-50 text-left"
            >
              <Icon className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {titulo}
              </h3>
              <p className="text-gray-600 text-base">{descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
