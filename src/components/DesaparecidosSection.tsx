"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Clock,
  Heart,
  X,
  Camera,
  Phone,
  Loader2,
  User,
  Users,
  MessageCircle,
  Copy,
  Check,
  Link2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { comprimirImagen } from "@/lib/image-utils";
import {
  ZONAS_DB,
  ZonaDB,
  generarToken,
  tiempoRelativo,
  limpiarTelefono,
  waLink,
} from "@/lib/constants";

const ZONAS_FILTRO = ["Todas", ...ZONAS_DB] as const;
type Zona = (typeof ZONAS_FILTRO)[number];

const HASHTAGS: Record<ZonaDB, string> = {
  "Naiguatá": "#NaiguataDesaparecidos",
  "Caraballeda": "#CaraballedaDesaparecidos",
  "Catia La Mar": "#CatiaLaMarDesaparecidos",
  "Maiquetía": "#MaiquetiaDesaparecidos",
  "Tanaguarena": "#TanaguarenaDesaparecidos",
  "Macuto": "#MacutoDesaparecidos",
};

interface Reporte {
  id: number;
  nombre: string;
  apellido: string;
  zona: ZonaDB;
  telefono: string;
  foto_url: string | null;
  ultima_ubicacion: string | null;
  descripcion: string | null;
  estado: "buscando" | "encontrado_vivo" | "encontrado_fallecido";
  created_at: string;
}

interface Duplicado {
  id: number;
  nombre: string;
  apellido: string;
  zona: string;
}

const PAGE_SIZE = 20;

function StatusBadge({ estado }: { estado: string }) {
  if (estado === "buscando") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
        <Search className="w-3 h-3" />
        Buscando
      </span>
    );
  }
  if (estado === "encontrado_vivo") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-marca-verde/10 text-marca-verde rounded-full text-xs font-medium">
        <Check className="w-3 h-3" />
        Encontrado vivo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
      Encontrado fallecido
    </span>
  );
}

function TarjetaReporte({ pub, onSelect }: { pub: Reporte; onSelect: (r: Reporte) => void }) {
  return (
    <article
      onClick={() => onSelect(pub)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
    >
      {pub.foto_url ? (
        <img src={pub.foto_url} alt={`${pub.nombre} ${pub.apellido}`} className="w-full h-36 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-28 bg-marca-fondo flex items-center justify-center">
          <User className="w-10 h-10 text-slate-300" />
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-medium text-sm text-slate-800 leading-tight line-clamp-1 mb-1">
          {pub.nombre} {pub.apellido}
        </h3>
        <StatusBadge estado={pub.estado} />
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-marca-azul/10 text-marca-azul rounded-full text-[10px] font-medium">
            <MapPin className="w-2.5 h-2.5" />
            {pub.zona}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-2.5 h-2.5" />
            {tiempoRelativo(pub.created_at)}
          </span>
        </div>
        {pub.descripcion && (
          <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{pub.descripcion}</p>
        )}
      </div>
    </article>
  );
}

function ModalDetalleReporte({ pub, onClose }: { pub: Reporte; onClose: () => void }) {
  const telLimpio = limpiarTelefono(pub.telefono);
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {pub.foto_url && (
          <img src={pub.foto_url} alt={`${pub.nombre} ${pub.apellido}`} className="w-full h-52 object-cover" />
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold text-slate-800">{pub.nombre} {pub.apellido}</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <StatusBadge estado={pub.estado} />
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-marca-azul/10 text-marca-azul rounded-full font-medium">
              <MapPin className="w-3 h-3" />
              {pub.zona}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tiempoRelativo(pub.created_at)}
            </span>
          </div>
          {pub.ultima_ubicacion && (
            <p className="text-sm text-slate-600"><strong>Última ubicación:</strong> {pub.ultima_ubicacion}</p>
          )}
          {pub.descripcion && (
            <p className="text-sm text-slate-600">{pub.descripcion}</p>
          )}
          <div className="flex gap-2 pt-2">
            <a href={`tel:${telLimpio}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-azul text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
              <Phone className="w-4 h-4" />
              Llamar
            </a>
            <a href={waLink(pub.telefono)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-verde text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TwitterZona({ zona }: { zona: ZonaDB }) {
  const hashtag = HASHTAGS[zona];
  const query = encodeURIComponent(hashtag);
  return (
    <div className="mt-8 mb-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
        <p className="text-xs text-yellow-700 font-medium">Contenido externo de X, no verificado</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <a className="twitter-timeline" data-height="400" data-theme="light" data-lang="es" href={`https://twitter.com/search?q=${query}`}>
          Tweets de {hashtag}
        </a>
        <script async src="https://platform.twitter.com/widgets.js" />
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Usa <strong>{hashtag}</strong> en X para que tu publicación aparezca aquí
      </p>
    </div>
  );
}

export default function DesaparecidosSection() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [zonaActiva, setZonaActiva] = useState<Zona>("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [zona, setZona] = useState<ZonaDB>("Naiguatá");
  const [telefono, setTelefono] = useState("");
  const [ultimaUbicacion, setUltimaUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<"buscando" | "encontrado_vivo" | "encontrado_fallecido">("buscando");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [duplicados, setDuplicados] = useState<Duplicado[]>([]);
  const dupTimeout = useRef<NodeJS.Timeout | null>(null);

  const cargarReportes = useCallback(
    async (reset = true) => {
      if (reset) setCargando(true);
      else setCargandoMas(true);
      const offset = reset ? 0 : reportes.length;
      let query = supabase
        .from("desaparecidos")
        .select("id, nombre, apellido, zona, telefono, foto_url, ultima_ubicacion, descripcion, estado, created_at");
      if (busqueda.trim()) {
        const b = `%${busqueda.trim()}%`;
        query = query.or(`nombre.ilike.${b},apellido.ilike.${b}`);
      } else if (zonaActiva !== "Todas") {
        query = query.eq("zona", zonaActiva);
      }
      const { data } = await query.order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
      if (data) {
        const typed = data as Reporte[];
        if (reset) setReportes(typed);
        else setReportes((prev) => [...prev, ...typed]);
        setHayMas(typed.length === PAGE_SIZE);
      }
      setCargando(false);
      setCargandoMas(false);
    },
    [zonaActiva, busqueda]
  );

  useEffect(() => { cargarReportes(true); }, [cargarReportes]);

  const buscarDuplicados = (nom: string, ape: string) => {
    if (dupTimeout.current) clearTimeout(dupTimeout.current);
    if (nom.length < 2 && ape.length < 2) { setDuplicados([]); return; }
    dupTimeout.current = setTimeout(async () => {
      const termino = `%${nom}%`;
      const { data } = await supabase.from("desaparecidos").select("id, nombre, apellido, zona").or(`nombre.ilike.${termino},apellido.ilike.${termino}`).limit(5);
      if (data) setDuplicados(data as Duplicado[]);
    }, 400);
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("La imagen no puede superar 10MB"); return; }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !telefono.trim()) { alert("Completa nombre, apellido y teléfono"); return; }
    setEnviando(true);
    let foto_url: string | null = null;
    if (fotoFile) {
      try {
        const comprimida = await comprimirImagen(fotoFile, 800, 0.7);
        const fileName = `${Date.now()}_${generarToken().slice(0, 8)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("fotos-desaparecidos").upload(fileName, comprimida, { contentType: "image/jpeg" });
        if (uploadError) { alert("Error al subir foto: " + uploadError.message); setEnviando(false); return; }
        const { data: urlData } = supabase.storage.from("fotos-desaparecidos").getPublicUrl(uploadData.path);
        foto_url = urlData.publicUrl;
      } catch { alert("Error al procesar la imagen"); setEnviando(false); return; }
    }
    const edit_token = generarToken();
    const { error } = await supabase.from("desaparecidos").insert({ nombre: nombre.trim(), apellido: apellido.trim(), zona, telefono: telefono.trim(), foto_url, ultima_ubicacion: ultimaUbicacion.trim() || null, descripcion: descripcion.trim() || null, estado, edit_token });
    if (error) { alert("Error al publicar: " + error.message); setEnviando(false); return; }
    setEnviando(false);
    setTokenGenerado(edit_token);
    cargarReportes(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false); setTokenGenerado(null); setNombre(""); setApellido(""); setTelefono(""); setUltimaUbicacion(""); setDescripcion(""); setEstado("buscando"); setFotoFile(null); setFotoPreview(null); setDuplicados([]); setCopiado(false);
  };

  const copiarLink = () => {
    if (!tokenGenerado) return;
    navigator.clipboard.writeText(`${window.location.origin}/editar/${tokenGenerado}`);
    setCopiado(true); setTimeout(() => setCopiado(false), 2000);
  };

  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [mostrarConsentimiento, setMostrarConsentimiento] = useState(false);
  const [noVolverMostrar, setNoVolverMostrar] = useState(false);

  const intentarReportar = () => {
    const yaAcepto = typeof window !== "undefined" && localStorage.getItem("consentimiento_aceptado") === "1";
    if (yaAcepto) {
      setMostrarFormulario(true);
    } else {
      setMostrarConsentimiento(true);
    }
  };

  const aceptarConsentimiento = () => {
    if (noVolverMostrar) {
      localStorage.setItem("consentimiento_aceptado", "1");
    }
    setMostrarConsentimiento(false);
    setMostrarFormulario(true);
  };

  return (
    <div>
      {/* Tabs de zona */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
        {ZONAS_FILTRO.map((z) => (
          <button key={z} onClick={() => setZonaActiva(z)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${zonaActiva === z ? "bg-marca-azul text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {z}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar por nombre o apellido..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 focus:border-transparent" />
        </div>
      </div>

      {/* Botón reportar */}
      <button onClick={intentarReportar} className="w-full mt-3 bg-marca-dorado hover:opacity-90 text-white py-3.5 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2">
        <Heart className="w-4 h-4" />
        Reportar a alguien que buscamos
      </button>

      {/* Feed */}
      <div className="mt-4 pb-8">
        {cargando ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-marca-azul animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Cargando reportes...</p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="bg-marca-verde/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-marca-verde" />
            </div>
            {busqueda ? (
              <p className="text-slate-500 font-medium">No encontramos resultados para esa búsqueda</p>
            ) : (
              <>
                <p className="text-slate-700 font-medium">
                  Aún no hay reportes{zonaActiva !== "Todas" ? ` en ${zonaActiva}` : ""}
                </p>
                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                  Si conoces a alguien desaparecido, sé el primero en reportarlo. Cada publicación ayuda a alguien a encontrar a su familia.
                </p>
                <button
                  onClick={intentarReportar}
                  className="mt-4 bg-marca-dorado hover:opacity-90 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all inline-flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Reportar a alguien que buscamos
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {reportes.map((r) => (<TarjetaReporte key={r.id} pub={r} onSelect={setReporteSeleccionado} />))}
            </div>
            {hayMas && (
              <button onClick={() => cargarReportes(false)} disabled={cargandoMas} className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2">
                {cargandoMas ? <><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</> : "Cargar más reportes"}
              </button>
            )}
          </>
        )}
        {zonaActiva !== "Todas" && !busqueda && <TwitterZona zona={zonaActiva as ZonaDB} />}
      </div>

      {/* Modal formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <h2 className="font-medium text-lg">{tokenGenerado ? "Reporte publicado" : "Reportar a alguien que buscamos"}</h2>
              <button onClick={cerrarFormulario} className="p-1 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
            </div>

            {tokenGenerado ? (
              <div className="p-6 text-center space-y-4">
                <div className="bg-marca-verde/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-marca-verde" /></div>
                <h3 className="text-lg font-medium text-slate-800">Reporte publicado — gracias por ayudar</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <div className="flex items-start gap-2">
                    <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Guarda este enlace</p>
                      <p className="text-xs text-amber-700 mt-1">Es el único modo de actualizar o marcar como encontrado este reporte.</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input type="text" readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/editar/${tokenGenerado}`} className="flex-1 text-xs bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-700" />
                    <button onClick={copiarLink} className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition">
                      {copiado ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                    </button>
                  </div>
                </div>
                <button onClick={cerrarFormulario} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-marca-dorado">*</span></label>
                  <input type="text" value={nombre} onChange={(e) => { setNombre(e.target.value); buscarDuplicados(e.target.value, apellido); }} placeholder="Nombre" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido <span className="text-marca-dorado">*</span></label>
                  <input type="text" value={apellido} onChange={(e) => { setApellido(e.target.value); buscarDuplicados(nombre, e.target.value); }} placeholder="Apellido" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
                </div>
                {duplicados.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-medium text-yellow-800">Posibles reportes existentes:</p>
                    {duplicados.map((d) => (
                      <div key={d.id} className="flex items-center justify-between">
                        <span className="text-xs text-yellow-700">{d.nombre} {d.apellido} ({d.zona})</span>
                        <a href={`#reporte-${d.id}`} onClick={() => setMostrarFormulario(false)} className="text-xs text-yellow-600 underline font-medium">Ver reporte</a>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zona <span className="text-marca-dorado">*</span></label>
                  <select value={zona} onChange={(e) => setZona(e.target.value as ZonaDB)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white" required>
                    {ZONAS_DB.map((z) => (<option key={z} value={z}>{z}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Celular de contacto <span className="text-marca-dorado">*</span></label>
                  <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="0412-1234567" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-marca-azul/40 hover:bg-marca-azul/5 transition">
                  {fotoPreview ? (
                    <div className="flex items-center gap-3">
                      <img src={fotoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                      <p className="text-sm text-slate-500">Toca para cambiar</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Camera className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-500">Subir foto (opcional)</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Última ubicación conocida</label>
                  <input type="text" value={ultimaUbicacion} onChange={(e) => setUltimaUbicacion(e.target.value)} placeholder="Ej: Calle principal de Naiguatá" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción adicional</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Contextura, ropa, señas particulares..." rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white">
                    <option value="buscando">Buscando</option>
                    <option value="encontrado_vivo">Encontrado vivo</option>
                    <option value="encontrado_fallecido">Encontrado fallecido</option>
                  </select>
                </div>
                <button type="submit" disabled={enviando} className="w-full bg-marca-dorado hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                  {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</> : "Publicar reporte"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de consentimiento */}
      {mostrarConsentimiento && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-medium text-slate-800">Antes de continuar</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Al publicar un reporte, tu <strong>número de contacto será visible públicamente</strong> para
              que cualquier persona con información pueda comunicarse contigo.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Este sitio no se hace responsable del uso que terceros hagan de esa información.
              Lee nuestro{" "}
              <a href="/aviso-legal" target="_blank" className="text-marca-azul underline font-medium">
                aviso legal y política de privacidad
              </a>{" "}
              para más detalles.
            </p>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={noVolverMostrar}
                onChange={(e) => setNoVolverMostrar(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-marca-azul focus:ring-marca-azul/40"
              />
              <span className="text-xs text-slate-400">No volver a mostrar este aviso</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConsentimiento(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={aceptarConsentimiento}
                className="flex-1 py-2.5 bg-marca-dorado text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
              >
                Acepto, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle reporte */}
      {reporteSeleccionado && (
        <ModalDetalleReporte pub={reporteSeleccionado} onClose={() => setReporteSeleccionado(null)} />
      )}
    </div>
  );
}
