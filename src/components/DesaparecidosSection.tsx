"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  X,
  Camera,
  Phone,
  Loader2,
  User,
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

function TarjetaReporte({ pub }: { pub: Reporte }) {
  const esBuscando = pub.estado === "buscando";
  const esVivo = pub.estado === "encontrado_vivo";
  const telLimpio = limpiarTelefono(pub.telefono);

  const borderColor = esBuscando
    ? "border-orange-300"
    : esVivo
    ? "border-green-300"
    : "border-gray-400";
  const statusBg = esBuscando
    ? "bg-orange-500"
    : esVivo
    ? "bg-green-500"
    : "bg-gray-600";
  const statusText = esBuscando
    ? "BUSCANDO"
    : esVivo
    ? "ENCONTRADO VIVO"
    : "ENCONTRADO FALLECIDO";

  return (
    <article className={`bg-white rounded-2xl border-2 ${borderColor} overflow-hidden shadow-sm`}>
      <div className={`${statusBg} text-white text-center py-1.5 text-xs font-bold tracking-wide`}>
        {statusText}
      </div>
      <div className="flex p-4 gap-4">
        <div className="flex-shrink-0">
          {pub.foto_url ? (
            <img src={pub.foto_url} alt={`${pub.nombre} ${pub.apellido}`} className="w-20 h-20 rounded-xl object-cover" loading="lazy" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center">
              <User className="w-8 h-8 text-slate-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-slate-900 leading-tight truncate">
            {pub.nombre} {pub.apellido}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              <MapPin className="w-3 h-3" />
              {pub.zona}
            </span>
          </div>
          {pub.ultima_ubicacion && (
            <p className="text-xs text-slate-500 mt-1 truncate">Visto en: {pub.ultima_ubicacion}</p>
          )}
          {pub.descripcion && (
            <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{pub.descripcion}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 pb-3">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          {tiempoRelativo(pub.created_at)}
        </span>
        <div className="flex gap-2">
          <a href={`tel:${telLimpio}`} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition">
            <Phone className="w-3.5 h-3.5" />
            Llamar
          </a>
          <a href={waLink(pub.telefono)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition">
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
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

  return (
    <div>
      {/* Buscador */}
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar por nombre o apellido..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
      </div>

      {/* Botón reportar */}
      <button onClick={() => setMostrarFormulario(true)} className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md">
        <AlertTriangle className="w-4 h-4" />
        Reportar persona desaparecida
      </button>

      {/* Tabs de zona */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
        {ZONAS_FILTRO.map((z) => (
          <button key={z} onClick={() => setZonaActiva(z)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${zonaActiva === z ? "bg-red-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {z}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="mt-4 pb-8 space-y-3">
        {cargando ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Cargando reportes...</p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">
              {busqueda ? "No se encontraron resultados" : `No hay reportes${zonaActiva !== "Todas" ? ` en ${zonaActiva}` : ""}`}
            </p>
          </div>
        ) : (
          <>
            {reportes.map((r) => (<TarjetaReporte key={r.id} pub={r} />))}
            {hayMas && (
              <button onClick={() => cargarReportes(false)} disabled={cargandoMas} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2">
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
              <h2 className="font-bold text-lg">{tokenGenerado ? "Reporte publicado" : "Reportar desaparecido"}</h2>
              <button onClick={cerrarFormulario} className="p-1 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
            </div>

            {tokenGenerado ? (
              <div className="p-6 text-center space-y-4">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-lg font-bold text-slate-900">Reporte publicado correctamente</h3>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" value={nombre} onChange={(e) => { setNombre(e.target.value); buscarDuplicados(e.target.value, apellido); }} placeholder="Nombre" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido <span className="text-red-500">*</span></label>
                  <input type="text" value={apellido} onChange={(e) => { setApellido(e.target.value); buscarDuplicados(nombre, e.target.value); }} placeholder="Apellido" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zona <span className="text-red-500">*</span></label>
                  <select value={zona} onChange={(e) => setZona(e.target.value as ZonaDB)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" required>
                    {ZONAS_DB.map((z) => (<option key={z} value={z}>{z}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Celular de contacto <span className="text-red-500">*</span></label>
                  <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="0412-1234567" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition">
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
                  <input type="text" value={ultimaUbicacion} onChange={(e) => setUltimaUbicacion(e.target.value)} placeholder="Ej: Calle principal de Naiguatá" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción adicional</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Contextura, ropa, señas particulares..." rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                    <option value="buscando">Buscando</option>
                    <option value="encontrado_vivo">Encontrado vivo</option>
                    <option value="encontrado_fallecido">Encontrado fallecido</option>
                  </select>
                </div>
                <button type="submit" disabled={enviando} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                  {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</> : "Publicar reporte"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
