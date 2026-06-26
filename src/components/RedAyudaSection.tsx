"use client";

import { ExternalLink } from "lucide-react";

type RecursoRed = {
  titulo: string;
  descripcion: string;
  url: string;
  embebible?: boolean;
};

const RECURSOS: RecursoRed[] = [
  {
    titulo: "Red Ayuda Venezuela",
    descripcion: "Consulta la plataforma de Red Ayuda Venezuela directamente desde aquí.",
    url: "https://redayudavenezuela.com/",
  },
  {
    titulo: "Desaparecidos Terremoto Venezuela",
    descripcion: "Consulta la plataforma de Desaparecidos Terremoto Venezuela directamente desde aquí.",
    url: "https://desaparecidosterremotovenezuela.com/",
  },
  {
    titulo: "Hospitales en Venezuela",
    descripcion: "Consulta la plataforma de hospitales en Venezuela directamente desde aquí.",
    url: "https://hospitalesenvenezuela.com/",
    embebible: false,
  },
];

export default function RedAyudaSection() {
  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-6">
        <span className="inline-flex items-center rounded-full bg-marca-azul/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-marca-azul">
          Red de ayuda Venezuela
        </span>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Plataformas de la red de ayuda
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          Accede a otras plataformas ciudadanas de búsqueda y ayuda directamente desde aquí.
        </p>
      </div>

      <div className="space-y-8">
        {RECURSOS.map((recurso) => (
          <div key={recurso.url}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-slate-900">{recurso.titulo}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{recurso.descripcion}</p>
              <a
                href={recurso.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-marca-azul hover:underline"
              >
                Abrir en una pestaña nueva
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            {recurso.embebible !== false && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <iframe
                  src={recurso.url}
                  title={recurso.titulo}
                  className="w-full h-[75vh] min-h-[500px] bg-white"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
