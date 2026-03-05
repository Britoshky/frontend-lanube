import { MessageCircle } from "lucide-react";

const testimonios = [
  {
    nombre: "Camila R.",
    cargo: "Auditora fiel",
    mensaje:
      "¡La Nube me acompaña todos los días! Es como tener buena onda en el aire todo el tiempo.",
  },
  {
    nombre: "Jorge P.",
    cargo: "Emprendedor local",
    mensaje:
      "Gracias a la radio pude promocionar mi negocio. ¡Las entrevistas funcionan increíble!",
  },
  {
    nombre: "Valentina M.",
    cargo: "Estudiante de Chanco",
    mensaje:
      "Me encanta su programación, actual y cercana. ¡Siento que es una radio hecha para nosotros!",
  },
  {
    nombre: "Matías F.",
    cargo: "Músico independiente",
    mensaje:
      "Gracias a La Nube mi banda pudo sonar en la región. ¡Un espacio que apoya el talento local!",
  },
  {
    nombre: "Rocío T.",
    cargo: "Dueña de tienda artesanal",
    mensaje:
      "Anuncié por primera vez en la radio y fue la mejor decisión. ¡Llegaron más clientes!",
  },
  {
    nombre: "Diego A.",
    cargo: "Joven auditor",
    mensaje:
      "Es la única radio que pone lo que quiero escuchar, sin aburrirme. ¡Siempre arriba La Nube!",
  },
  {
    nombre: "Sandra V.",
    cargo: "Dirigenta vecinal",
    mensaje:
      "La Nube informa y apoya a nuestra comunidad. Siempre están cuando los necesitamos.",
  },
  {
    nombre: "Nicolás H.",
    cargo: "Locutor invitado",
    mensaje:
      "Una experiencia increíble. El equipo humano y profesional me hizo sentir como en casa.",
  },
  {
    nombre: "Alejandra L.",
    cargo: "Madre de familia",
    mensaje:
      "Mis hijos y yo escuchamos La Nube mientras desayunamos. Es parte de nuestras mañanas.",
  },
];


export default function Testimonios() {
  return (
    <section className="w-full bg-gradient-to-br from-purple-100 to-sky-100 py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-12 text-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-sky-800">
            Lo que dicen de nosotros
          </h2>
          <p className="text-gray-700 mt-4 text-lg max-w-2xl mx-auto">
            Escucha las voces que hacen de <strong>La Nube</strong> una radio con alma.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonios.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-4 text-sky-600">
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  Testimonio
                </span>
              </div>

              <p className="text-gray-800 text-base italic mb-6">“{t.mensaje}”</p>

              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900">{t.nombre}</p>
                <p className="text-sm text-gray-500">{t.cargo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
