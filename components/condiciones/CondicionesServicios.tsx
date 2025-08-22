"use client";

export default function CondicionesDelServicio() {
  return (
    <main className="max-w-4xl mx-auto px-6 md:px-8 py-20 text-gray-800">
      <h1 className="text-4xl font-bold text-sky-800 mb-8 text-center">
        Condiciones del Servicio
      </h1>

      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          Bienvenido/a al sitio oficial de <strong>Radio La Nube 99.5 FM</strong>, con
          domicilio en Chanco, Región del Maule, Chile. Al navegar en nuestro sitio
          web o utilizar nuestros servicios de contacto y streaming, aceptas las
          siguientes condiciones de uso.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          1. Uso del Sitio
        </h2>
        <p>
          El contenido presente en este sitio es propiedad de Radio La Nube. Puedes
          navegar libremente, pero queda prohibida la reproducción total o parcial
          del contenido sin autorización expresa.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          2. Streaming y Acceso a la Radio
        </h2>
        <p>
          El servicio de streaming entregado en <strong>lanubefm.cl</strong> es de
          acceso libre y gratuito para fines personales. No está permitido utilizarlo
          para retransmisiones sin permiso previo.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          3. Comunicaciones y Formularios
        </h2>
        <p>
          Toda información enviada a través de formularios o por WhatsApp será tratada
          con confidencialidad. Nos reservamos el derecho de responder o difundir
          contenido según nuestro criterio editorial.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          4. Publicidad y Colaboraciones
        </h2>
        <p>
          Los servicios publicitarios contratados estarán sujetos a condiciones
          específicas, las cuales se establecerán por escrito entre las partes.
          Radio La Nube se reserva el derecho de rechazar campañas que atenten contra
          nuestros valores o el bienestar comunitario.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          5. Cambios y Actualizaciones
        </h2>
        <p>
          Nos reservamos el derecho de modificar estas condiciones en cualquier
          momento. Las actualizaciones serán publicadas en esta página con fecha de
          revisión.
        </p>

        <p className="mt-8 text-base italic">
          Si tienes dudas o sugerencias, puedes escribirnos a:
          <a
            href="mailto:britoshky@gmail.com"
            className="text-sky-700 underline ml-1"
          >
            britoshky@gmail.com
          </a>
        </p>

        <p className="mt-8 text-sm text-gray-600">
          Última actualización: {new Date().toLocaleDateString("es-CL")}
        </p>

        <p className="mt-4 text-sm text-gray-700">
          Responsable legal: <strong>Héctor Brito Tapia</strong>, propietario de
          Radio La Nube 99.5 FM.
        </p>
      </section>
    </main>
  );
}
