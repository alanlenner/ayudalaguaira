import { ArrowLeft } from "lucide-react";

export default function AvisoLegal() {
  return (
    <div className="min-h-screen bg-marca-fondo">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="hover:bg-slate-100 p-1 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </a>
          <h1 className="text-base font-semibold text-slate-800">Aviso legal y privacidad</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Naturaleza del sitio</h2>
            <p>
              Este sitio web es una herramienta ciudadana, voluntaria y sin fines de lucro,
              creada para facilitar la búsqueda de personas tras el sismo del 24 de junio de 2025
              en el estado La Guaira, Venezuela. No es operado por ningún organismo gubernamental,
              ONG o empresa. No recibe financiamiento externo ni cobra por su uso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Publicación de datos personales</h2>
            <p>
              Al crear un reporte en este sitio, el usuario publica voluntariamente datos
              como nombres, zona geográfica, descripción física y un número de teléfono de
              contacto. <strong>Estos datos quedan visibles públicamente</strong> para que
              cualquier persona con información pueda comunicarse directamente.
            </p>
            <p className="mt-2">
              El sitio no verifica la identidad de quien publica ni la veracidad de la
              información reportada. El usuario es el único responsable de los datos que
              decide publicar y asume los riesgos derivados de ello, incluyendo la posibilidad
              de recibir contactos no solicitados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Responsabilidad limitada</h2>
            <p>
              Los creadores y administradores de este sitio no se hacen responsables de:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>La exactitud, veracidad o actualidad de la información publicada por los usuarios.</li>
              <li>El uso que terceros hagan de los datos de contacto publicados en los reportes.</li>
              <li>Daños directos o indirectos derivados del uso de esta plataforma.</li>
              <li>La disponibilidad o continuidad del servicio, que puede interrumpirse sin previo aviso.</li>
              <li>Errores, omisiones o fallas técnicas que puedan ocurrir en la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Edición y eliminación de reportes</h2>
            <p>
              Al crear un reporte se genera un enlace privado de edición. Este enlace es la
              <strong> única forma</strong> de modificar o actualizar un reporte. Si pierdes
              el enlace, no podremos recuperarlo. No existe panel de administración ni
              mecanismo de recuperación de acceso.
            </p>
            <p className="mt-2">
              Si necesitas que un reporte sea eliminado y no conservas el enlace de edición,
              puedes solicitar su remoción escribiendo a{" "}
              <a href="mailto:alanlenner@gmail.com" className="text-marca-azul underline">
                alanlenner@gmail.com
              </a>{" "}
              indicando los datos del reporte que deseas remover y el motivo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Números de emergencia</h2>
            <p>
              Los números telefónicos de organismos de emergencia mostrados en este sitio
              fueron obtenidos de fuentes públicas y oficiales al momento de la creación de la
              plataforma. Sin embargo, estos números pueden cambiar durante una emergencia
              prolongada. Verifica siempre la vigencia de cualquier número antes de depender
              exclusivamente de él.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Verificación de información</h2>
            <p>
              Toda la información publicada en este sitio debe ser verificada de forma
              independiente antes de ser compartida o utilizada para tomar decisiones.
              Ante una emergencia médica real, contacta directamente a los organismos
              de rescate y seguridad de tu localidad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Uso aceptable</h2>
            <p>
              Está prohibido utilizar este sitio para publicar información falsa, difamatoria
              o que pueda poner en riesgo la seguridad de cualquier persona. Nos reservamos el
              derecho de remover contenido que consideremos inapropiado sin necesidad de
              notificación previa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-2">Contacto</h2>
            <p>
              Para consultas, reportar problemas o solicitar la remoción de un reporte:{" "}
              <a href="mailto:alanlenner@gmail.com" className="text-marca-azul underline">
                alanlenner@gmail.com
              </a>
            </p>
          </section>

          <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
            <p>Última actualización: junio 2025</p>
          </div>
        </article>
      </div>
    </div>
  );
}
