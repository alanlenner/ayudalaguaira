"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  X,
  Check,
  Copy,
  Link2,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Package,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ZONAS_DB,
  CATEGORIAS_RECURSO,
  generarToken,
  tiempoRelativo,
  limpiarTelefono,
  waLink,
  ZonaDB,
} from "@/lib/constants";

interface Recurso {
  id: string;
  tipo_publicacion: "necesito" | "ofrezco";
  categoria: string;
  descripcion: string;
  direccion: string;
  zona: ZonaDB;
  celular_contacto: string;
  estado: "activo" | "resuelto";
  created_at: string;
}

const PAGE_SIZE = 20;

function catInfo(val: string) {
  return CATEGORIAS_RECURSO.find((c) => c.value === val) || { value: val, label: val, icon: "📦" };
}

function TarjetaRecurso({ rec }: { rec: Recurso }) {
  const cat = catInfo(rec.categoria);
  const telLimpio = limpiarTelefono(rec.celular_contacto);
  const esActivo = rec.estado === "activo";
  const esNecesito = rec.tipo_publicacion === "necesito";

  return (
    <article
      className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm ${
        !esActivo
          ? "border-green-300 opacity-75"
          : esNecesito
          ? "border-orange-300"
          : "border-blue-300"
      }`}
    >
      {/* Barra de estado */}
      <div
        className={`text-white text-center py-1.5 text-xs font-bold tracking-wide ${
          !esActivo
            ? "bg-green-500"
            : esNecesito
            ? "bg-orange-500"
            : "bg-blue-500"
        }`}
      >
        {!esActivo ? "RESUELTO" : esNecesito ? "SE NECESITA" : "SE OFRECE"}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-2xl">{cat.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium mb-1">
              {cat.label}
            </span>
            <p className="text-sm text-slate-800 leading-relaxed line-clamp-3">
              {rec.descripcion}
            </p>
          </div>
        </div>

        <div className="space-y-1 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{rec.direccion}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              {rec.zona}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {tiempoRelativo(rec.created_at)}
          </span>
          <div className="flex gap-2">
            <a
              href={`tel:${telLimpio}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              Llamar
            </a>
            <a
              href={waLink(rec.celular_contacto)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RecursosSection() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [tipo, setTipo] = useState<"necesito" | "ofrezco">("necesito");
  const [filtroZona, setFiltroZona] = useState<string>("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoFormulario, setTipoFormulario] = useState<"necesito" | "ofrezco">("necesito");
  const [enviando, setEnviando] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Form
  const [categoria, setCategoria] = useState("alimentos");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState<ZonaDB>("Naiguatá");
  const [celular, setCelular] = useState("");
  const [estadoForm, setEstadoForm] = useState<"activo" | "resuelto">("activo");

  const cargar = useCallback(
    async (reset = true) => {
      if (reset) setCargando(true);
      else setCargandoMas(true);

      const offset = reset ? 0 : recursos.length;

      let query = supabase
        .from("recursos")
        .select("*")
        .eq("tipo_publicacion", tipo);

      if (filtroZona !== "todas") query = query.eq("zona", filtroZona);
      if (filtroCategoria !== "todas") query = query.eq("categoria", filtroCategoria);

      const { data } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (data) {
        const typed = data as Recurso[];
        if (reset) setRecursos(typed);
        else setRecursos((prev) => [...prev, ...typed]);
        setHayMas(typed.length === PAGE_SIZE);
      }
      setCargando(false);
      setCargandoMas(false);
    },
    [tipo, filtroZona, filtroCategoria]
  );

  useEffect(() => {
    cargar(true);
  }, [cargar]);

  const abrirFormulario = (t: "necesito" | "ofrezco") => {
    setTipoFormulario(t);
    setMostrarFormulario(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !direccion.trim() || !celular.trim()) {
      alert("Completa descripción, dirección y celular de contacto");
      return;
    }

    setEnviando(true);
    const edit_token = generarToken();

    const { error } = await supabase.from("recursos").insert({
      tipo_publicacion: tipoFormulario,
      categoria,
      descripcion: descripcion.trim(),
      direccion: direccion.trim(),
      zona,
      celular_contacto: celular.trim(),
      estado: estadoForm,
      edit_token,
    });

    if (error) {
      alert("Error: " + error.message);
      setEnviando(false);
      return;
    }

    setEnviando(false);
    setTokenGenerado(edit_token);
    cargar(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setTokenGenerado(null);
    setCategoria("alimentos");
    setDescripcion("");
    setDireccion("");
    setZona("Naiguatá");
    setCelular("");
    setEstadoForm("activo");
    setCopiado(false);
  };

  const copiarLink = () => {
    if (!tokenGenerado) return;
    navigator.clipboard.writeText(`${window.location.origin}/editar/${tokenGenerado}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div>
      {/* Toggle Necesito / Ofrezco */}
      <div className="mt-3 flex bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setTipo("necesito")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tipo === "necesito"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Necesito
        </button>
        <button
          onClick={() => setTipo("ofrezco")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tipo === "ofrezco"
              ? "bg-blue-500 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Ofrezco
        </button>
      </div>

      {/* Botones publicar */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => abrirFormulario("necesito")}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md"
        >
          Publicar necesidad
        </button>
        <button
          onClick={() => abrirFormulario("ofrezco")}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md"
        >
          Publicar oferta
        </button>
      </div>

      {/* Filtros */}
      <div className="mt-4 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFiltroZona("todas")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filtroZona === "todas"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            Todas las zonas
          </button>
          {ZONAS_DB.map((z) => (
            <button
              key={z}
              onClick={() => setFiltroZona(z)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filtroZona === z
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFiltroCategoria("todas")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filtroCategoria === "todas"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            Todas
          </button>
          {CATEGORIAS_RECURSO.map((c) => (
            <button
              key={c.value}
              onClick={() => setFiltroCategoria(c.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filtroCategoria === c.value
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="mt-4 pb-8 space-y-3">
        {cargando ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Cargando recursos...</p>
          </div>
        ) : recursos.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              No hay publicaciones de tipo &quot;{tipo === "necesito" ? "Necesito" : "Ofrezco"}&quot;
            </p>
          </div>
        ) : (
          <>
            {recursos.map((r) => (
              <TarjetaRecurso key={r.id} rec={r} />
            ))}
            {hayMas && (
              <button
                onClick={() => cargar(false)}
                disabled={cargandoMas}
                className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                {cargandoMas ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</>
                ) : (
                  "Cargar más"
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <h2 className="font-bold text-lg">
                {tokenGenerado
                  ? "Publicación exitosa"
                  : tipoFormulario === "necesito"
                  ? "Publicar necesidad"
                  : "Publicar oferta"}
              </h2>
              <button onClick={cerrarFormulario} className="p-1 hover:bg-slate-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tokenGenerado ? (
              <div className="p-6 text-center space-y-4">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">¡Publicado!</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <div className="flex items-start gap-2">
                    <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Guarda este enlace</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Úsalo para marcar como resuelto o editar tu publicación.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/editar/${tokenGenerado}`}
                      className="flex-1 text-xs bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-700"
                    />
                    <button
                      onClick={copiarLink}
                      className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition"
                    >
                      {copiado ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                    </button>
                  </div>
                </div>
                <button onClick={cerrarFormulario} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Aviso de privacidad */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    Tu dirección será pública. Si te sientes insegura/o compartiéndola, considera
                    dar solo un punto de referencia cercano (ej. una plaza o avenida).
                  </p>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    {CATEGORIAS_RECURSO.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Qué específicamente, cantidad aproximada..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    required
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Zona <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={zona}
                    onChange={(e) => setZona(e.target.value as ZonaDB)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    {ZONAS_DB.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección o punto de referencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej: Frente a la plaza Bolívar de Naiguatá"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Celular de contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="0412-1234567"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                    tipoFormulario === "necesito"
                      ? "bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300"
                      : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
                  }`}
                >
                  {enviando ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                  ) : (
                    "Publicar"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
