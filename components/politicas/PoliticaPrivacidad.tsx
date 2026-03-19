const LAST_UPDATED = "18/03/2026";

export default function PoliticaPrivacidad() {
  return (
    <main className="max-w-4xl mx-auto px-6 md:px-8 py-20 text-gray-800">
      <h1 className="text-4xl font-bold text-sky-800 mb-8 text-center">
        Politica de Privacidad
      </h1>

      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          En <strong>Radio La Nube 99.5 FM</strong> respetamos tu privacidad y
          protegemos tus datos personales cuando navegas en <strong>lanubefm.cl</strong>,
          nos contactas por formularios o interactuas con nuestros servicios digitales.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          1. Datos que recopilamos
        </h2>
        <p>
          Podemos recopilar datos de contacto que tu mismo proporcionas, como nombre,
          correo electronico, telefono y contenido de mensajes enviados por formularios
          o canales de contacto.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          2. Uso de los datos
        </h2>
        <p>
          Usamos estos datos para responder consultas, coordinar servicios publicitarios,
          mejorar la atencion a la audiencia y cumplir obligaciones legales aplicables.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          3. Comparticion con terceros
        </h2>
        <p>
          No vendemos datos personales. Solo podemos compartir informacion con proveedores
          tecnologicos necesarios para operar el sitio o con autoridades cuando exista una
          obligacion legal.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          4. Cookies y analitica
        </h2>
        <p>
          Este sitio puede usar cookies tecnicas y herramientas de analitica para
          funcionamiento, seguridad y medicion de trafico. Puedes gestionar cookies
          desde la configuracion de tu navegador.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          5. Conservacion de datos
        </h2>
        <p>
          Conservamos los datos solo durante el tiempo necesario para las finalidades
          descritas o segun lo exija la normativa vigente.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          6. Derechos del usuario
        </h2>
        <p>
          Puedes solicitar acceso, correccion o eliminacion de tus datos personales
          escribiendo al correo de contacto indicado en esta pagina.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          7. Contacto
        </h2>
        <p>
          Para consultas sobre privacidad y tratamiento de datos, escribe a:
          <a href="mailto:britoshky@gmail.com" className="text-sky-700 underline ml-1">
            britoshky@gmail.com
          </a>
        </p>

        <p className="mt-8 text-sm text-gray-600">Ultima actualizacion: {LAST_UPDATED}</p>

        <p className="mt-4 text-sm text-gray-700">
          Responsable: <strong>Hector Brito Tapia</strong>, Radio La Nube 99.5 FM.
        </p>
      </section>
    </main>
  );
}
