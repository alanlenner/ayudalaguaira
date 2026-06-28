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

function TarjetaRecurso({ rec, onSelect }: { rec: Recurso; onSelect: (r: Recurso) => void }) {
  const cat = catInfo(rec.categoria);
  const esActivo = rec.estado === "activo";
  const esNecesito = rec.tipo_publicacion === "necesito";

  return (
    <article
      onClick={() => onSelect(rec)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{cat.icon}</span>
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">
              {cat.label}
            </span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
            !esActivo
              ? "bg-marca-verde/10 text-marca-verde"
              : esNecesito
              ? "bg-amber-100 text-amber-700"
              : "bg-marca-azul/10 text-marca-azul"
          }`}>
            {!esActivo ? "Resuelto" : esNecesito ? "Necesita" : "Ofrece"}
          </span>
        </div>

        <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-2 mb-1.5">
          {rec.descripcion}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-marca-azul/10 text-marca-azul rounded-full text-[10px] font-medium">
            <MapPin className="w-2.5 h-2.5" />
            {rec.zona}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-2.5 h-2.5" />
            {tiempoRelativo(rec.created_at)}
          </span>
        </div>
      </div>
    </article>
  );
}

function ModalDetalleRecurso({ rec, onClose }: { rec: Recurso; onClose: () => void }) {
  const cat = catInfo(rec.categoria);
  const telLimpio = limpiarTelefono(rec.celular_contacto);
  const esActivo = rec.estado === "activo";
  const esNecesito = rec.tipo_publicacion === "necesito";

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-stretch sm:items-center justify-center sm:px-4" onClick={onClose}>
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] sm:rounded-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="text-lg font-semibold text-slate-800">{cat.label}</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            !esActivo
              ? "bg-marca-verde/10 text-marca-verde"
              : esNecesito
              ? "bg-amber-100 text-amber-700"
              : "bg-marca-azul/10 text-marca-azul"
          }`}>
            {!esActivo ? "Resuelto" : esNecesito ? "Se necesita" : "Se ofrece"}
          </span>
          <p className="text-sm text-slate-600">{rec.descripcion}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-marca-azul/10 text-marca-azul rounded-full font-medium">
              <MapPin className="w-3 h-3" />
              {rec.zona}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tiempoRelativo(rec.created_at)}
            </span>
          </div>
          {rec.direccion && (
            <p className="text-sm text-slate-600"><strong>Dirección:</strong> {rec.direccion}</p>
          )}
          <div className="flex gap-2 pt-2">
            <a href={`tel:${telLimpio}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-azul text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
              <Phone className="w-4 h-4" />
              Llamar
            </a>
            <a href={waLink(rec.celular_contacto)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-verde text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
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
  const [seleccionado, setSeleccionado] = useState<Recurso | null>(null);

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
      <div className="mt-3 flex bg-white border border-slate-200 rounded-2xl p-1">
        <button
          onClick={() => setTipo("necesito")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tipo === "necesito"
              ? "bg-marca-azul text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Necesito
        </button>
        <button
          onClick={() => setTipo("ofrezco")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tipo === "ofrezco"
              ? "bg-marca-azul text-white"
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
          className="flex-1 bg-marca-dorado hover:opacity-90 text-white py-3 rounded-2xl font-medium text-sm transition-all"
        >
          Publicar necesidad
        </button>
        <button
          onClick={() => abrirFormulario("ofrezco")}
          className="flex-1 bg-marca-dorado hover:opacity-90 text-white py-3 rounded-2xl font-medium text-sm transition-all"
        >
          Publicar oferta
        </button>
      </div>

      {/* Filtros */}
      <div className="mt-4 space-y-2">
        <div className="relative">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-slate-50 to-transparent" />
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 pr-8 scrollbar-hide">
            <button
              onClick={() => setFiltroZona("todas")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filtroZona === "todas"
                  ? "bg-marca-azul text-white"
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
                    ? "bg-marca-azul text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-slate-50 to-transparent" />
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 pr-8 scrollbar-hide">
            <button
              onClick={() => setFiltroCategoria("todas")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filtroCategoria === "todas"
                  ? "bg-marca-azul/80 text-white"
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
                    ? "bg-marca-azul/80 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="mt-4 pb-8">
        {cargando ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-marca-azul animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Cargando recursos...</p>
          </div>
        ) : recursos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="bg-marca-verde/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-marca-verde" />
            </div>
            <p className="text-slate-700 font-medium">
              Aún no hay publicaciones de tipo "{tipo === "necesito" ? "Necesito" : "Ofrezco"}"
            </p>
            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
              {tipo === "necesito" ? "Si necesitas algo, publica tu solicitud para que otros puedan ayudarte." : "Si tienes algo para ofrecer, publícalo para que llegue a quien lo necesita."}
            </p>
            <button
              onClick={() => abrirFormulario(tipo)}
              className="mt-4 bg-marca-dorado hover:opacity-90 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all"
            >
              {tipo === "necesito" ? "Publicar necesidad" : "Publicar oferta"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recursos.map((r) => (
                <TarjetaRecurso key={r.id} rec={r} onSelect={setSeleccionado} />
              ))}
            </div>
            {hayMas && (
              <button
                onClick={() => cargar(false)}
                disabled={cargandoMas}
                className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-stretch sm:items-center justify-center sm:px-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[92vh] sm:rounded-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <h2 className="font-medium text-lg">
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
                <div className="bg-marca-verde/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-marca-verde" />
                </div>
                <h3 className="text-lg font-medium text-slate-800">¡Publicado — gracias por ayudar!</h3>
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
                    Categoría <span className="text-marca-dorado">*</span>
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white"
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
                    Descripción <span className="text-marca-dorado">*</span>
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Qué específicamente, cantidad aproximada..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none"
                    required
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Zona <span className="text-marca-dorado">*</span>
                  </label>
                  <select
                    value={zona}
                    onChange={(e) => setZona(e.target.value as ZonaDB)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white"
                  >
                    {ZONAS_DB.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección o punto de referencia <span className="text-marca-dorado">*</span>
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej: Frente a la plaza Bolívar de Naiguatá"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                    required
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Celular de contacto <span className="text-marca-dorado">*</span>
                  </label>
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="0412-1234567"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 bg-marca-dorado hover:opacity-90 disabled:opacity-50"
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

      {/* Modal detalle */}
      {seleccionado && (
        <ModalDetalleRecurso rec={seleccionado} onClose={() => setSeleccionado(null)} />
      )}
    </div>
  );
}
