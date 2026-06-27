"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { ZONAS_DB } from "@/lib/constants";

const REPORTE_BORRADOR_KEY = "reporte_borrador";

type ZonaDB = (typeof ZONAS_DB)[number];
type EstadoReporte = "buscando" | "encontrado_vivo" | "encontrado_fallecido" | "hospitalizado";

type ReporteBorrador = {
  nombre: string;
  apellido: string;
  zona: ZonaDB;
  codigoPais?: string;
  telefono: string;
  ultimaUbicacion: string;
  descripcion: string;
  estado: EstadoReporte;
};

const BORRADOR_VACIO: ReporteBorrador = {
  nombre: "",
  apellido: "",
  zona: "Macuto",
  codigoPais: "+58",
  telefono: "",
  ultimaUbicacion: "",
  descripcion: "",
  estado: "buscando",
};

function leerBorradorGuardado(): ReporteBorrador | null {
  if (typeof window === "undefined") {
    return null;
  }

  const borradorGuardado = window.localStorage.getItem(REPORTE_BORRADOR_KEY);
  if (!borradorGuardado) {
    return null;
  }

  try {
    const borrador = JSON.parse(borradorGuardado) as Partial<ReporteBorrador>;
    if (
      typeof borrador.nombre !== "string" ||
      typeof borrador.apellido !== "string" ||
      typeof borrador.zona !== "string" ||
      typeof borrador.telefono !== "string" ||
      typeof borrador.ultimaUbicacion !== "string" ||
      typeof borrador.descripcion !== "string" ||
      typeof borrador.estado !== "string"
    ) {
      window.localStorage.removeItem(REPORTE_BORRADOR_KEY);
      return null;
    }

    const zona = ZONAS_DB.includes(borrador.zona as ZonaDB) ? (borrador.zona as ZonaDB) : BORRADOR_VACIO.zona;
    return {
      ...BORRADOR_VACIO,
      ...borrador,
      zona,
      codigoPais: typeof borrador.codigoPais === "string" ? borrador.codigoPais : BORRADOR_VACIO.codigoPais,
      estado: borrador.estado as EstadoReporte,
    };
  } catch {
    window.localStorage.removeItem(REPORTE_BORRADOR_KEY);
    return null;
  }
}

export default function EditarBorradorPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [borrador, setBorrador] = useState<ReporteBorrador | null>(null);

  useEffect(() => {
    setBorrador(leerBorradorGuardado());
    setCargando(false);
  }, []);

  const zonaEsOtro = useMemo(() => borrador?.zona === "Otro", [borrador?.zona]);

  const setCampo = <K extends keyof ReporteBorrador>(campo: K, valor: ReporteBorrador[K]) => {
    setBorrador((previo) => (previo ? { ...previo, [campo]: valor } : previo));
  };

  const guardarCambios = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!borrador) {
      return;
    }

    setGuardando(true);
    window.localStorage.setItem(REPORTE_BORRADOR_KEY, JSON.stringify(borrador));
    router.push("/desaparecidos?reportar=1");
  };

  const eliminarBorrador = () => {
    window.localStorage.removeItem(REPORTE_BORRADOR_KEY);
    setBorrador(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-marca-fondo flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-marca-azul" />
          <p className="text-sm text-slate-500">Cargando borrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-marca-fondo">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/desaparecidos?reportar=1" className="rounded-lg p-1 transition hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <h1 className="text-base font-semibold text-slate-800">Editar borrador de reporte</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {!borrador ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-medium text-slate-800">No hay borrador guardado</h2>
            <p className="mt-2 text-sm text-slate-500">Cuando empieces un reporte y lo dejes incompleto, aparecerá aquí para retomarlo o eliminarlo.</p>
            <Link
              href="/desaparecidos?reportar=1"
              className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Ir al formulario
            </Link>
          </div>
        ) : (
          <form onSubmit={guardarCambios} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Edita el borrador y guárdalo. Al volver al formulario, se cargará con estos cambios.
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={borrador.nombre}
                onChange={(event) => setCampo("nombre", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Apellido <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={borrador.apellido}
                onChange={(event) => setCampo("apellido", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Zona <span className="text-red-500">*</span></label>
              <select
                value={borrador.zona}
                onChange={(event) => setCampo("zona", event.target.value as ZonaDB)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                required
              >
                {ZONAS_DB.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Código de país</label>
              <input
                type="text"
                value={borrador.codigoPais ?? "+58"}
                onChange={(event) => setCampo("codigoPais", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Celular de contacto <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={borrador.telefono}
                onChange={(event) => setCampo("telefono", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {zonaEsOtro ? "Ubicación" : "Última ubicación conocida"}
                {zonaEsOtro ? <span className="text-red-500"> *</span> : null}
              </label>
              <input
                type="text"
                value={borrador.ultimaUbicacion}
                onChange={(event) => setCampo("ultimaUbicacion", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                required={zonaEsOtro}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Descripción adicional</label>
              <textarea
                value={borrador.descripcion}
                onChange={(event) => setCampo("descripcion", event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
              <select
                value={borrador.estado}
                onChange={(event) => setCampo("estado", event.target.value as EstadoReporte)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
              >
                <option value="buscando">Buscando</option>
                <option value="encontrado_vivo">Encontrado vivo</option>
                <option value="encontrado_fallecido">Encontrado fallecido</option>
                <option value="hospitalizado">Hospitalizado</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 rounded-xl bg-marca-dorado px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Guardar borrador
              </button>
              <button
                type="button"
                onClick={eliminarBorrador}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar borrador
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
