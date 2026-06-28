import Link from "next/link";

export default function AvisoLegalApadrina() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <h1 className="text-xl font-bold text-slate-800">Aviso legal y política de privacidad</h1>
        <p className="text-xs text-slate-400">Módulo Apadrina Venezuela</p>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="font-semibold text-slate-800 mb-1">1. Naturaleza del servicio</h2>
            <p>
              Apadrina Venezuela es una plataforma voluntaria y gratuita que conecta a personas que
              necesitan apoyo ("solicitantes") con personas dispuestas a ayudar ("padrinos"). La plataforma
              no procesa pagos, no verifica identidades y no garantiza la prestación efectiva de ningún tipo de apoyo.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-800 mb-1">2. Datos recopilados</h2>
            <p>
              Se recopilan: nombre, ubicación, celular de contacto, y opcionalmente una descripción de la
              situación del solicitante. Para los padrinos: nombre, contacto, categoría de apoyo, ubicación
              y capacidad. Estos datos se consideran sensibles ya que pueden revelar situación económica,
              necesidad de ayuda o vulnerabilidad de las personas.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-800 mb-1">3. Uso y compartición de datos</h2>
            <p>
              Los datos del solicitante serán compartidos con el padrino cuando este apruebe una postulación,
              y viceversa. El contacto del padrino solo es visible para solicitantes con postulación aprobada.
              No se comparten datos con terceros ni se utilizan con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-800 mb-1">4. Consentimiento</h2>
            <p>
              Al registrarse, tanto solicitantes como padrinos aceptan voluntariamente compartir su
              información con la contraparte. Este consentimiento puede revocarse desactivando el perfil
              desde el panel personal.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-800 mb-1">5. Responsabilidad</h2>
            <p>
              Los administradores de la plataforma no se hacen responsables de la veracidad de la
              información proporcionada por los usuarios, ni de los acuerdos, transacciones o interacciones
              que ocurran fuera de la plataforma entre solicitantes y padrinos. Todo apoyo financiero,
              logístico o de cualquier tipo se coordina directamente entre las partes.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-800 mb-1">6. Seguridad</h2>
            <p>
              Los datos se almacenan en servidores seguros con cifrado. El acceso a los paneles personales
              se realiza mediante un código de acceso único — no se utilizan contraseñas ni se requiere
              correo electrónico. Es responsabilidad del usuario guardar su enlace de acceso.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-800 mb-1">7. Eliminación de datos</h2>
            <p>
              Los usuarios pueden solicitar la eliminación de sus datos contactando a los administradores
              de la plataforma. Los datos asociados a postulaciones finalizadas o rechazadas se conservan
              como registro histórico.
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Link href="/apadrina" className="text-sm text-[#185FA5] font-medium underline">
            ← Volver a Apadrina Venezuela
          </Link>
        </div>
      </div>
    </div>
  );
}
