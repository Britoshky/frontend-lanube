export default function CompromisoComunitario() {
  return (
    <section className="bg-gradient-to-br from-sky-100 to-purple-100 py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-sky-800">
          Comprometidos con la Comunidad
        </h2>

        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          En Radio La Nube creemos en la comunicación como herramienta para el cambio y el desarrollo.
          Participamos activamente en causas sociales, apoyamos el emprendimiento local, difundimos
          cultura regional y damos espacio a voces jóvenes y diversas.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-sky-700 mb-2">Emprendimiento</h3>
            <p className="text-gray-600 text-sm">
              Promocionamos negocios locales, dando visibilidad a quienes construyen desde el territorio.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-sky-700 mb-2">Cultura</h3>
            <p className="text-gray-600 text-sm">
              Apoyamos iniciativas artísticas, festivales y actividades de identidad maulina.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-sky-700 mb-2">Juventud</h3>
            <p className="text-gray-600 text-sm">
              Damos espacio a estudiantes, organizaciones juveniles y talentos emergentes de la zona.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
