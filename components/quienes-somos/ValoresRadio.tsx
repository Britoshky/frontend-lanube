const valores = [
  { titulo: "Cercanía", descripcion: "Conectamos con nuestra audiencia de forma auténtica y directa." },
  { titulo: "Juventud", descripcion: "Somos una plataforma para las nuevas ideas, sonidos y voces." },
  { titulo: "Compromiso", descripcion: "Apoyamos causas locales, emprendimientos y cultura regional." },
  { titulo: "Calidad", descripcion: "Entregamos contenidos bien producidos, actuales y entretenidos." },
];

export default function ValoresRadio() {
  return (
    <section className="bg-white py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-700">Nuestros Valores</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valores.map((valor, i) => (
            <div
              key={i}
              className="bg-sky-50 border border-sky-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-sky-800 mb-2">{valor.titulo}</h3>
              <p className="text-gray-700 text-sm">{valor.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
