"use client";

import { useState } from "react";
import { ExternalLink, Filter, Phone } from "lucide-react";
import { ORGANIZACIONES, type CategoriaOrg } from "@/lib/organizaciones";

const CATEGORIAS: Record<CategoriaOrg, { label: string; className: string }> = {
  reconexion: {
    label: "Reconexión familiar",
    className: "bg-marca-azul/10 text-marca-azul",
  },
  donacion: {
    label: "Donación",
    className: "bg-marca-dorado/10 text-marca-dorado",
  },
  voluntariado: {
    label: "Voluntariado",
    className: "bg-marca-verde/10 text-marca-verde",
  },
  oficial: {
    label: "Canal oficial",
    className: "bg-slate-100 text-slate-700",
  },
};

const OPCIONES_FILTRO: Array<{ value: "todas" | CategoriaOrg; label: string }> = [
  { value: "todas", label: "Todas" },
  ...Object.entries(CATEGORIAS).map(([value, categoria]) => ({
    value: value as CategoriaOrg,
    label: categoria.label,
  })),
];

export default function HubAyudaSection() {
  const [categoriaActiva, setCategoriaActiva] = useState<"todas" | CategoriaOrg>("todas");
  const organizacionesFiltradas =
    categoriaActiva === "todas"
      ? ORGANIZACIONES
      : ORGANIZACIONES.filter((organizacion) => organizacion.categoria === categoriaActiva);

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-6">
        <span className="inline-flex items-center rounded-full bg-marca-azul/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-marca-azul">
          Hub de ayuda confiable
        </span>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Organizaciones serias para donar, ayudar o reconectar familias
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          Este espacio reúne enlaces oficiales y canales reconocidos para orientar ayuda de forma
          más segura.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <Filter className="h-4 w-4 text-marca-azul" />
          <span>Filtrar por categoría</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {OPCIONES_FILTRO.map((opcion) => (
            <button
              key={opcion.value}
              type="button"
              onClick={() => setCategoriaActiva(opcion.value)}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                categoriaActiva === opcion.value
                  ? "border-marca-azul bg-marca-azul text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {organizacionesFiltradas.map((organizacion) => {
          const categoria = CATEGORIAS[organizacion.categoria];
          const telefonos = organizacion.telefonos ?? (organizacion.telefono ? [organizacion.telefono] : []);

          return (
            <article
              key={`${organizacion.nombre}-${organizacion.url ?? "sin-url"}`}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{organizacion.nombre}</h3>
                <span
                  className={`inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${categoria.className}`}
                >
                  {categoria.label}
                </span>
              </div>

              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {organizacion.descripcion}
              </p>

              {telefonos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {telefonos.map((telefono) => (
                    <div
                      key={`${organizacion.nombre}-${telefono}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"
                    >
                      <Phone className="h-4 w-4 text-marca-azul" />
                      <span>{telefono}</span>
                    </div>
                  ))}
                </div>
              )}

              {organizacion.url && (
                <a
                  href={organizacion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-marca-azul px-4 py-3 text-sm font-medium text-white transition hover:bg-marca-azul-oscuro"
                >
                  Página oficial
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        Estos enlaces llevan a organizaciones externas. ayudalaguaira no gestiona sus donaciones
        ni operaciones.
      </p>
    </section>
  );
}
