export default function Home() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-red-200 p-6 sm:p-8 space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.56 20h18.88a1 1 0 00.87-1.28l-8.6-14.86a1 1 0 00-1.72 0z" />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Plataforma dada de baja</h1>
          <p className="text-sm text-red-600 font-semibold uppercase tracking-wide">Aviso urgente &middot; 30 de junio de 2026</p>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Han comenzado a surgir <strong>casos documentados de voluntarios que están siendo
            perseguidos por fuerzas del estado</strong> (SEBIN, DGCIM y otros cuerpos) por el simple
            hecho de colaborar como voluntarios en plataformas de ayuda humanitaria.
          </p>
          <p>
            Por esta razón, <strong>esta plataforma queda dada de baja de forma inmediata</strong> y
            todos los datos de los voluntarios han sido eliminados de la base de datos, con el
            único fin de cuidar y preservar la integridad de quienes solo querían ayudar.
          </p>
          <p>
            Este proyecto nació como una <strong>iniciativa personal</strong> de colaborar y ayudar
            en medio de una emergencia. Lamentamos profundamente que actos de solidaridad sean
            motivo de persecución.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400 text-center">
            Si eres voluntario y sientes que estás en riesgo, contacta a organizaciones de derechos humanos.
          </p>
        </div>
      </div>
    </div>
  );
}
