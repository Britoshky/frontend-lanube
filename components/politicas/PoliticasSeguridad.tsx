"use client";

export default function PoliticaDeSeguridad() {
  return (
    <main className="max-w-4xl mx-auto px-6 md:px-8 py-20 text-gray-800">
      <h1 className="text-4xl font-bold text-sky-800 mb-8 text-center">
        Política de Seguridad
      </h1>

      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          En <strong>Radio La Nube 99.5 FM</strong>, ubicada en Chanco, Región del
          Maule, Chile, nos comprometemos a proteger la información personal y la
          privacidad de nuestros oyentes, colaboradores y clientes. Esta Política de
          Seguridad ha sido diseñada para garantizar un entorno seguro en todas
          nuestras plataformas digitales y procesos internos.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          1. Protección de Datos Personales
        </h2>
        <p>
          Todos los datos recolectados a través de formularios, encuestas o canales
          de contacto son tratados con estricta confidencialidad. No compartimos ni
          vendemos información personal a terceros.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          2. Seguridad en la Comunicación
        </h2>
        <p>
          Utilizamos canales seguros de comunicación para proteger los mensajes que
          nos envían los usuarios, incluyendo correo electrónico y formularios en
          nuestro sitio web.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          3. Responsabilidad en la Difusión de Contenido
        </h2>
        <p>
          Nos aseguramos de que toda la información emitida en nuestra radio,
          incluyendo entrevistas, promociones y campañas, cumpla con los estándares
          legales y éticos de comunicación.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          4. Seguridad Digital y Tecnológica
        </h2>
        <p>
          Nuestro sitio web y sistema de streaming están protegidos mediante
          herramientas de seguridad actualizadas. Monitoreamos constantemente posibles
          amenazas digitales para ofrecer una experiencia segura a nuestros usuarios.
        </p>

        <h2 className="text-2xl font-semibold text-purple-700 mt-10">
          5. Actualización y Revisión
        </h2>
        <p>
          Esta política puede ser modificada con el fin de mejorar nuestras medidas
          de protección. Toda actualización será publicada en esta misma página con
          fecha correspondiente.
        </p>

        <p className="mt-8 text-base italic">
          Para más información o dudas sobre esta política, puedes escribirnos a:
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
