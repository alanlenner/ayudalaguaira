"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  validarTelefono,
  waLink,
} from "@/lib/constants";
import { buildUrlWithUpdatedQuery } from "@/lib/url-filters";

const ZONAS_FILTRO = ["Todas", ...ZONAS_DB] as const;
type Zona = (typeof ZONAS_FILTRO)[number];
const CODIGOS_PAIS = [
  { value: "+58", label: "VE (+58)" },
  { value: "+57", label: "CO (+57)" },
  { value: "+1", label: "US (+1)" },
  { value: "+34", label: "ES (+34)" },
  { value: "+51", label: "PE (+51)" },
] as const;
type CodigoPais = (typeof CODIGOS_PAIS)[number]["value"];

const HASHTAGS: Record<ZonaDB, string> = {
  "Naiguatá": "#NaiguataDesaparecidos",
  "Caraballeda": "#CaraballedaDesaparecidos",
  "Catia La Mar": "#CatiaLaMarDesaparecidos",
  "Maiquetía": "#MaiquetiaDesaparecidos",
  "Tanaguarena": "#TanaguarenaDesaparecidos",
  "Macuto": "#MacutoDesaparecidos",
  "Hospital Pérez Carreño": "#PerezCarrenoDesaparecidos",
  "Domingo Luciani": "#DomingoLucianiDesaparecidos",
  "Otro": "#OtroDesaparecidos",
};

const ACENTOS_BUSQUEDA: Record<string, string[]> = {
  a: ["a", "á", "à", "ä", "â"],
  e: ["e", "é", "è", "ë", "ê"],
  i: ["i", "í", "ì", "ï", "î"],
  o: ["o", "ó", "ò", "ö", "ô"],
  u: ["u", "ú", "ù", "ü", "û"],
  n: ["n", "ñ"],
};

function normalizarBusqueda(valor: string) {
  return valor
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function crearPatronesBusqueda(valor: string) {
  const base = normalizarBusqueda(valor);
  if (!base) return [];

  const variantes = base.split("").reduce<string[]>((acc, char) => {
    const reemplazos = ACENTOS_BUSQUEDA[char] ?? [char];
    const siguientes = acc.flatMap((actual) => reemplazos.map((reemplazo) => `${actual}${reemplazo}`));
    return siguientes.slice(0, 32);
  }, [""]);

  return Array.from(new Set([base, ...variantes])).map((patron) => `%${patron}%`);
}

interface Reporte {
  id: number;
  nombre: string;
  apellido: string;
  zona: ZonaDB;
  telefono: string;
  foto_url: string | null;
  ultima_ubicacion: string | null;
  descripcion: string | null;
  estado: "buscando" | "encontrado_vivo" | "encontrado_fallecido" | "hospitalizado";
  created_at: string;
}

interface Duplicado {
  id: number;
  nombre: string;
  apellido: string;
  zona: string;
  estado: Reporte["estado"];
  created_at: string;
  ultima_ubicacion: string | null;
  telefono: string;
  foto_url: string | null;
  descripcion: string | null;
}

interface DesaparecidosSectionProps {
  abrirFormulario?: boolean;
  onFormularioCerrado?: () => void;
  filtros?: {
    zona: Zona;
    busqueda: string;
    estado: FiltroEstado | null;
    pagina: number;
  };
}

const PAGE_SIZE = 20;
const REPORTE_BORRADOR_KEY = "reporte_borrador";

interface ReporteBorrador {
  nombre: string;
  apellido: string;
  zona: ZonaDB;
  codigoPais?: string;
  telefono: string;
  ultimaUbicacion: string;
  descripcion: string;
  estado: "buscando" | "encontrado_vivo" | "encontrado_fallecido";
}

type FiltroEstado = "buscando" | "encontrados" | "hospitalizado";
type EstadoAparecio = "encontrado_vivo" | "encontrado_fallecido" | "hospitalizado";

function StatusBadge({ estado }: { estado: string }) {
  if (estado === "buscando") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-buscando-border bg-status-buscando-bg px-2.5 py-1 text-[13px] font-medium text-status-buscando-fg">
        <Search className="w-3 h-3" />
        Buscando
      </span>
    );
  }
  if (estado === "encontrado_vivo") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-encontrado-border bg-status-encontrado-bg px-2.5 py-1 text-[13px] font-medium text-status-encontrado-fg">
        <Check className="w-3 h-3" />
        Encontrado vivo
      </span>
    );
  }
  if (estado === "hospitalizado") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-hospitalizado-border bg-status-hospitalizado-bg px-2.5 py-1 text-[13px] font-medium text-status-hospitalizado-fg">
        🏥 Ingresado en Hospital
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-status-fallecido-border bg-status-fallecido-bg px-2.5 py-1 text-[13px] font-medium text-status-fallecido-fg">
      <Heart className="w-3 h-3 fill-current" />
      Fallecido/a
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
        <img src={pub.foto_url} alt={`${pub.nombre} ${pub.apellido}`} className="w-full h-44 object-cover object-top" loading="lazy" />
      ) : (
        <div className="w-full h-28 bg-marca-fondo flex items-center justify-center">
          <User className="w-10 h-10 text-slate-300" />
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="mb-2 text-[17px] font-semibold leading-tight text-slate-800 line-clamp-2">
          {pub.nombre} {pub.apellido}
        </h3>
        <StatusBadge estado={pub.estado} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-marca-azul/10 px-2.5 py-1 text-[13px] font-medium text-marca-azul">
            <MapPin className="w-2.5 h-2.5" />
            {pub.zona}
          </span>
          <span className="flex items-center gap-1 text-[13px] text-slate-500">
            <Clock className="w-2.5 h-2.5" />
            {tiempoRelativo(pub.created_at)}
          </span>
        </div>
        {pub.descripcion && (
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500 line-clamp-2">{pub.descripcion}</p>
        )}
      </div>
    </article>
  );
}

function ModalDetalleReporte({ pub, onClose, onActualizado }: { pub: Reporte; onClose: () => void; onActualizado?: (r: Reporte) => void }) {
  const telLimpio = limpiarTelefono(pub.telefono);
  const [mostrarAparecio, setMostrarAparecio] = useState(false);
  const [datosAparecio, setDatosAparecio] = useState({
    contacto: "",
    nombreContacto: "",
    codigoPais: "+58" as CodigoPais,
    telefono: "",
    estado: "encontrado_vivo" as EstadoAparecio,
    hospital: "",
    parentesco: "",
  });
  const [errorVerif, setErrorVerif] = useState("");
  const [enviandoAparecio, setEnviandoAparecio] = useState(false);
  const [exito, setExito] = useState(false);

  const confirmarAparecio = async () => {
    const telefonoValidacion = validarTelefono(`${datosAparecio.codigoPais}${datosAparecio.telefono}`.trim());
    if (!datosAparecio.contacto.trim()) {
      setErrorVerif("Indica nombre y apellido de quien confirma.");
      return;
    }
    if (!telefonoValidacion.valido) {
      setErrorVerif(telefonoValidacion.mensaje);
      return;
    }
    if (datosAparecio.estado === "hospitalizado" && !datosAparecio.hospital.trim()) {
      setErrorVerif("Indica el nombre del hospital.");
      return;
    }
    setEnviandoAparecio(true);
    setErrorVerif("");
    const descripcionActualizada = [
      pub.descripcion,
      `Confirmado por: ${datosAparecio.contacto.trim()}`,
      datosAparecio.nombreContacto.trim() ? `Contacto alterno: ${datosAparecio.nombreContacto.trim()}` : null,
      datosAparecio.parentesco.trim() ? `Parentesco: ${datosAparecio.parentesco.trim()}` : null,
      datosAparecio.estado === "hospitalizado" ? `Hospital: ${datosAparecio.hospital.trim()}` : null,
    ].filter(Boolean).join("\n");
    const { error } = await supabase
      .from("desaparecidos")
      .update({
        estado: datosAparecio.estado,
        telefono: telefonoValidacion.telefonoNormalizado,
        descripcion: descripcionActualizada || null,
      })
      .eq("id", pub.id);
    setEnviandoAparecio(false);
    if (error) {
      setErrorVerif("Error al actualizar. Intenta de nuevo.");
      return;
    }
    setExito(true);
    if (onActualizado) {
      onActualizado({
        ...pub,
        estado: datosAparecio.estado,
        telefono: telefonoValidacion.telefonoNormalizado,
        descripcion: descripcionActualizada || null,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-4" onClick={onClose}>
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto modal-scroll" onClick={(e) => e.stopPropagation()}>
        {pub.foto_url && (
          <img src={pub.foto_url} alt={`${pub.nombre} ${pub.apellido}`} className="w-full" />
        )}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:bg-slate-50"
          aria-label="Cerrar detalle"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-5 pt-12 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">{pub.nombre} {pub.apellido}</h2>
          <StatusBadge estado={exito ? "encontrado_vivo" : pub.estado} />
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

          {pub.estado === "buscando" && !exito && (
            <>
              {!mostrarAparecio ? (
                <button
                  onClick={() => setMostrarAparecio(true)}
                  className="w-full py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  ¡Apareció!
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-3">
                  <p className="text-xs text-emerald-700 font-medium">Confirma los datos de la persona localizada:</p>
                  <input
                    type="text"
                    value={datosAparecio.contacto}
                    onChange={(e) => setDatosAparecio((actual) => ({ ...actual, contacto: e.target.value }))}
                    placeholder="Nombre y apellido"
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="text"
                    value={datosAparecio.nombreContacto}
                    onChange={(e) => setDatosAparecio((actual) => ({ ...actual, nombreContacto: e.target.value }))}
                    placeholder="Nombre de contacto (opcional)"
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-2">
                    <select
                      value={datosAparecio.codigoPais}
                      onChange={(e) => setDatosAparecio((actual) => ({ ...actual, codigoPais: e.target.value as CodigoPais }))}
                      className="px-3 py-2 border border-emerald-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      aria-label="Código de país"
                    >
                      {CODIGOS_PAIS.map((codigo) => (
                        <option key={codigo.value} value={codigo.value}>{codigo.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={datosAparecio.telefono}
                      onChange={(e) => setDatosAparecio((actual) => ({ ...actual, telefono: e.target.value }))}
                      placeholder="4121234567"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <select
                    value={datosAparecio.estado}
                    onChange={(e) => setDatosAparecio((actual) => ({ ...actual, estado: e.target.value as EstadoAparecio }))}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="encontrado_vivo">Con vida</option>
                    <option value="encontrado_fallecido">Fallecido</option>
                    <option value="hospitalizado">Hospitalizado</option>
                  </select>
                  {datosAparecio.estado === "hospitalizado" && (
                    <input
                      type="text"
                      value={datosAparecio.hospital}
                      onChange={(e) => setDatosAparecio((actual) => ({ ...actual, hospital: e.target.value }))}
                      placeholder="Nombre del hospital"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  )}
                  <input
                    type="text"
                    value={datosAparecio.parentesco}
                    onChange={(e) => setDatosAparecio((actual) => ({ ...actual, parentesco: e.target.value }))}
                    placeholder="Parentesco (opcional)"
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {errorVerif && <p className="text-xs text-red-500">{errorVerif}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMostrarAparecio(false);
                        setDatosAparecio({ contacto: "", nombreContacto: "", codigoPais: "+58", telefono: "", estado: "encontrado_vivo", hospital: "", parentesco: "" });
                        setErrorVerif("");
                      }}
                      className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarAparecio}
                      disabled={enviandoAparecio || !datosAparecio.contacto.trim() || !datosAparecio.telefono.trim()}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-1"
                    >
                      {enviandoAparecio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {exito && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <p className="text-sm text-emerald-700 font-medium">Registro actualizado</p>
            </div>
          )}
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

export default function DesaparecidosSection({
  abrirFormulario,
  onFormularioCerrado,
  filtros,
}: DesaparecidosSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const zonaActiva = filtros?.zona ?? "Todas";
  const busqueda = filtros?.busqueda ?? "";
  const filtroEstado = filtros?.estado ?? null;
  const paginaActual = filtros?.pagina ?? 1;
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [busquedaInput, setBusquedaInput] = useState(busqueda);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [borradorPendiente, setBorradorPendiente] = useState<ReporteBorrador | null>(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [zona, setZona] = useState<ZonaDB>("Naiguatá");
  const [codigoPais, setCodigoPais] = useState<CodigoPais>("+58");
  const [telefono, setTelefono] = useState("");
  const [telefonoTocado, setTelefonoTocado] = useState(false);
  const [ultimaUbicacion, setUltimaUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<"buscando" | "encontrado_vivo" | "encontrado_fallecido">("buscando");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [duplicados, setDuplicados] = useState<Duplicado[]>([]);
  const [continuarConDuplicado, setContinuarConDuplicado] = useState(false);
  const dupTimeout = useRef<NodeJS.Timeout | null>(null);
  const [contadores, setContadores] = useState({ buscando: 0, encontrado_vivo: 0, encontrado_fallecido: 0, hospitalizado: 0 });
  const zonaEsOtro = zona === "Otro";
  const telefonoCompleto = `${codigoPais}${telefono}`.trim();
  const telefonoValidacion = telefono.trim() ? validarTelefono(telefonoCompleto) : null;
  const telefonoError =
    telefonoTocado && telefonoValidacion && !telefonoValidacion.valido
      ? telefonoValidacion.mensaje
      : "";

  useEffect(() => {
    setBusquedaInput(busqueda);
  }, [busqueda]);

  const cargarReportes = useCallback(
    async () => {
      setCargando(true);
      let query = supabase
        .from("desaparecidos")
        .select("id, nombre, apellido, zona, telefono, foto_url, ultima_ubicacion, descripcion, estado, created_at", { count: "exact" });
      if (busqueda.trim()) {
        const filtrosBusqueda = crearPatronesBusqueda(busqueda).flatMap((patron) => [
          `nombre.ilike.${patron}`,
          `apellido.ilike.${patron}`,
        ]);
        query = query.or(filtrosBusqueda.join(","));
      } else if (zonaActiva !== "Todas") {
        query = query.eq("zona", zonaActiva);
      }
      if (filtroEstado) {
        if (filtroEstado === "encontrados") {
          query = query.in("estado", ["encontrado_vivo", "encontrado_fallecido"]);
        } else {
          query = query.eq("estado", filtroEstado);
        }
      }
      const from = (paginaActual - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);
      if (data) {
        setReportes(data as Reporte[]);
      }
      setTotalPaginas(Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)));
      setCargando(false);
    },
    [zonaActiva, busqueda, filtroEstado, paginaActual]
  );

  useEffect(() => { cargarReportes(); }, [cargarReportes]);

  useEffect(() => {
    const fetchContadores = async () => {
      const estados = ["buscando", "encontrado_vivo", "encontrado_fallecido", "hospitalizado"] as const;
      const counts = { buscando: 0, encontrado_vivo: 0, encontrado_fallecido: 0, hospitalizado: 0 };
      for (const est of estados) {
        const { count } = await supabase.from("desaparecidos").select("*", { count: "exact", head: true }).eq("estado", est);
        counts[est] = count ?? 0;
      }
      setContadores(counts);
    };
    fetchContadores();
  }, [reportes]);

  useEffect(() => {
    if (!mostrarFormulario || tokenGenerado || typeof window === "undefined") {
      return;
    }

    const borradorActual: ReporteBorrador = {
      nombre,
      apellido,
      zona,
      codigoPais,
      telefono,
      ultimaUbicacion,
      descripcion,
      estado,
    };
    const tieneContenido =
      nombre.trim().length > 0 ||
      apellido.trim().length > 0 ||
      telefono.trim().length > 0 ||
      ultimaUbicacion.trim().length > 0 ||
      descripcion.trim().length > 0;

    if (!tieneContenido) {
      return;
    }

    localStorage.setItem(REPORTE_BORRADOR_KEY, JSON.stringify(borradorActual));
  }, [mostrarFormulario, tokenGenerado, nombre, apellido, zona, codigoPais, telefono, ultimaUbicacion, descripcion, estado]);

  useEffect(() => {
    if (!mostrarFormulario || tokenGenerado || typeof window === "undefined") {
      return;
    }

    const borradorGuardado = localStorage.getItem(REPORTE_BORRADOR_KEY);
    if (!borradorGuardado) {
      setBorradorPendiente(null);
      return;
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
        localStorage.removeItem(REPORTE_BORRADOR_KEY);
        setBorradorPendiente(null);
        return;
      }

      setBorradorPendiente(borrador as ReporteBorrador);
    } catch {
      localStorage.removeItem(REPORTE_BORRADOR_KEY);
      setBorradorPendiente(null);
    }
  }, [mostrarFormulario, tokenGenerado]);

  const buscarDuplicados = (nom: string, ape: string) => {
    if (dupTimeout.current) clearTimeout(dupTimeout.current);
    setContinuarConDuplicado(false);
    const nombreBuscado = nom.trim();
    const apellidoBuscado = ape.trim();
    if (nombreBuscado.length < 2 && apellidoBuscado.length < 2) { setDuplicados([]); return; }
    dupTimeout.current = setTimeout(async () => {
      const filtros = [
        nombreBuscado ? `nombre.ilike.%${nombreBuscado}%` : null,
        apellidoBuscado ? `apellido.ilike.%${apellidoBuscado}%` : null,
      ].filter(Boolean).join(",");
      const { data } = await supabase
        .from("desaparecidos")
        .select("id, nombre, apellido, zona, estado, created_at, ultima_ubicacion, telefono, foto_url, descripcion")
        .or(filtros)
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setDuplicados(data as Duplicado[]);
    }, 400);
  };

  const verReporteExistente = (duplicado: Duplicado) => {
    setMostrarFormulario(false);
    setReporteSeleccionado({
      id: duplicado.id,
      nombre: duplicado.nombre,
      apellido: duplicado.apellido,
      zona: duplicado.zona as ZonaDB,
      telefono: duplicado.telefono,
      foto_url: duplicado.foto_url,
      ultima_ubicacion: duplicado.ultima_ubicacion,
      descripcion: duplicado.descripcion,
      estado: duplicado.estado,
      created_at: duplicado.created_at,
    });
  };

  const confirmarContinuarConDuplicado = () => {
    const confirmado = window.confirm("Ya hay reportes parecidos. Confirma que quieres publicar otro reporte de todos modos.");
    if (confirmado) {
      setContinuarConDuplicado(true);
    }
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

  const eliminarFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTelefonoTocado(true);
    if (!nombre.trim() || !apellido.trim() || !telefono.trim()) { alert("Completa nombre, apellido y teléfono"); return; }
    if (!telefonoValidacion || !telefonoValidacion.valido) {
      return;
    }
    if (zonaEsOtro && !ultimaUbicacion.trim()) {
      alert("Indica la ubicación para la zona 'Otro'.");
      return;
    }
    if (duplicados.length > 0 && !continuarConDuplicado) {
      alert("Revisa el reporte existente o confirma que quieres continuar de todos modos.");
      return;
    }
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
    const { error } = await supabase.from("desaparecidos").insert({ nombre: nombre.trim(), apellido: apellido.trim(), zona, telefono: telefonoValidacion.telefonoNormalizado, foto_url, ultima_ubicacion: ultimaUbicacion.trim() || null, descripcion: descripcion.trim() || null, estado, edit_token });
    if (error) { alert("Error al publicar: " + error.message); setEnviando(false); return; }
    if (typeof window !== "undefined") {
      localStorage.removeItem(REPORTE_BORRADOR_KEY);
    }
    setEnviando(false);
    setTokenGenerado(edit_token);
    if (paginaActual === 1) {
      cargarReportes();
    } else {
      actualizarFiltros({ pagina: null });
    }
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false); setTokenGenerado(null); setNombre(""); setApellido(""); setCodigoPais("+58"); setTelefono(""); setTelefonoTocado(false); setUltimaUbicacion(""); setDescripcion(""); setEstado("buscando"); setFotoFile(null); setFotoPreview(null); setDuplicados([]); setContinuarConDuplicado(false); setCopiado(false); setBorradorPendiente(null);
    onFormularioCerrado?.();
  };

  const restaurarBorrador = () => {
    if (!borradorPendiente) return;
    setNombre(borradorPendiente.nombre);
    setApellido(borradorPendiente.apellido);
    setZona(borradorPendiente.zona);
    const codigoGuardado = borradorPendiente.codigoPais;
    if (codigoGuardado && CODIGOS_PAIS.some(({ value }) => value === codigoGuardado)) {
      const codigoValido = codigoGuardado as CodigoPais;
      setCodigoPais(codigoValido);
      setTelefono(borradorPendiente.telefono);
    } else {
      const telefonoGuardado = borradorPendiente.telefono.trim();
      const codigoDetectado = CODIGOS_PAIS.find(({ value }) => telefonoGuardado.startsWith(value));
      setCodigoPais(codigoDetectado?.value ?? "+58");
      setTelefono(codigoDetectado ? telefonoGuardado.slice(codigoDetectado.value.length).trim() : telefonoGuardado);
    }
    setTelefonoTocado(false);
    setUltimaUbicacion(borradorPendiente.ultimaUbicacion);
    setDescripcion(borradorPendiente.descripcion);
    setEstado(borradorPendiente.estado);
    setBorradorPendiente(null);
  };

  const descartarBorrador = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REPORTE_BORRADOR_KEY);
    }
    setBorradorPendiente(null);
  };

  const copiarLink = () => {
    if (!tokenGenerado) return;
    navigator.clipboard.writeText(`${window.location.origin}/editar/${tokenGenerado}`);
    setCopiado(true); setTimeout(() => setCopiado(false), 2000);
  };

  const actualizarFiltros = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const url = buildUrlWithUpdatedQuery(pathname, window.location.search, updates);
      router.replace(url, { scroll: false });
    },
    [pathname, router]
  );

  const verReportesCoincidentes = useCallback(() => {
    const termino = nombre.trim() || apellido.trim();
    if (!termino) return;
    setBusquedaInput(termino);
    setMostrarFormulario(false);
    actualizarFiltros({ q: termino, pagina: null });
  }, [actualizarFiltros, apellido, nombre]);

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

  useEffect(() => {
    if (abrirFormulario) {
      intentarReportar();
    }
  }, [abrirFormulario]);

  useEffect(() => {
    const handleAbrirFormulario = () => {
      intentarReportar();
    };

    window.addEventListener("desaparecidos:abrir-formulario", handleAbrirFormulario);
    return () => {
      window.removeEventListener("desaparecidos:abrir-formulario", handleAbrirFormulario);
    };
  }, []);


  return (
    <div>
      {/* Métricas de estado */}
      {/* TODO(DTV-FILT-02): el PDF no define aún este caso de filtros; detallarlo con QA y ajustar la interacción cuando exista una definición cerrada. */}
      <p className="text-xs text-slate-500 mt-4 mb-1">Selecciona un recuadro para filtrar por estado. Selecciónalo de nuevo para quitar el filtro.</p>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => actualizarFiltros({ estado: filtroEstado === "buscando" ? null : "buscando", pagina: null })} className={`rounded-xl border p-2 text-center transition-all ${filtroEstado === "buscando" ? "ring-2 ring-[var(--color-status-buscando-border)] bg-status-buscando-bg border-status-buscando-border" : "bg-status-buscando-bg/60 border-status-buscando-border/40"}`}>
          <p className="text-lg font-bold text-status-buscando-fg">{contadores.buscando}</p>
          <p className="text-[10px] text-status-buscando-fg/80">Buscando</p>
        </button>
        <button onClick={() => actualizarFiltros({ estado: filtroEstado === "encontrados" ? null : "encontrados", pagina: null })} className={`rounded-xl p-2 text-center transition-all ${filtroEstado === "encontrados" ? "ring-2 ring-status-encontrado-border bg-status-encontrado-bg border border-status-encontrado-border" : "bg-status-encontrado-bg/60 border border-status-encontrado-border/40"}`}>
          <p className="text-lg font-bold text-status-encontrado-fg">{contadores.encontrado_vivo + contadores.encontrado_fallecido}</p>
          <p className="text-[10px] text-status-encontrado-fg/80">Encontrados</p>
        </button>
        <button onClick={() => actualizarFiltros({ estado: filtroEstado === "hospitalizado" ? null : "hospitalizado", pagina: null })} className={`rounded-xl border p-2 text-center transition-all ${filtroEstado === "hospitalizado" ? "ring-2 ring-status-hospitalizado-border bg-status-hospitalizado-bg border-status-hospitalizado-border" : "bg-status-hospitalizado-bg/60 border-status-hospitalizado-border/40"}`}>
          <p className="text-lg font-bold text-status-hospitalizado-fg">{contadores.hospitalizado}</p>
          <p className="text-[10px] text-status-hospitalizado-fg/80">Hospitalizados</p>
        </button>
      </div>

      {/* Filtro activo indicador */}
      {(filtroEstado || zonaActiva !== "Todas" || busqueda) && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-600">Filtros activos</span>
            {filtroEstado && (
              <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 ring-1 ring-slate-200">
                {filtroEstado === "buscando"
                  ? "Estado: Buscando"
                  : filtroEstado === "encontrados"
                    ? "Estado: Encontrados"
                    : "Estado: Hospitalizados"}
              </span>
            )}
            {zonaActiva !== "Todas" && (
              <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 ring-1 ring-slate-200">
                Zona: {zonaActiva}
              </span>
            )}
            {busqueda && (
              <span className="rounded-full bg-marca-azul/10 px-2.5 py-1 font-semibold text-marca-azul ring-1 ring-marca-azul/15">
                Búsqueda: "{busqueda}"
              </span>
            )}
            <button onClick={() => { setBusquedaInput(""); actualizarFiltros({ estado: null, zona: null, q: null, pagina: null }); }} className="font-medium text-marca-azul underline underline-offset-2">
              Quitar filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabs de zona */}
      <p className="text-xs text-slate-500 mt-3 mb-1">Seleccione una zona para ver solo esa localidad:</p>
      <div className="flex flex-wrap gap-2">
        {ZONAS_FILTRO.map((z) => (
          <button key={z} onClick={() => actualizarFiltros({ zona: z === "Todas" ? null : z, pagina: null })} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${zonaActiva === z ? "bg-marca-azul text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {z}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <label htmlFor="busqueda-reportes" className="text-sm font-medium text-slate-700">
            Buscar por nombre o apellido
          </label>
          {busqueda && (
            <span className="rounded-full bg-marca-azul px-2.5 py-1 text-[11px] font-semibold text-white">
              Buscando ahora
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input id="busqueda-reportes" type="text" placeholder="Buscar por nombre o apellido..." value={busquedaInput} onChange={(e) => { const value = e.target.value; setBusquedaInput(value); actualizarFiltros({ q: value.trim() || null, pagina: null }); }} className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 focus:border-transparent ${busqueda ? "border-marca-azul bg-marca-azul/5 text-slate-900" : "bg-white border border-slate-200"}`} />
        </div>
        {busqueda && (
          <p className="mt-2 text-xs font-medium text-marca-azul">
            Mostrando coincidencias para "{busqueda}".
          </p>
        )}
      </div>

      {/* Botón reportar */}
      <button onClick={intentarReportar} className="w-full mt-3 bg-marca-dorado hover:opacity-90 text-white py-3.5 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2">
        <Heart className="w-4 h-4" />
        Reportar a alguien que buscamos
      </button>

      {/* Disclaimer hospitales */}
      {(zonaActiva === "Hospital Pérez Carreño" || zonaActiva === "Domingo Luciani") && (
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-700 font-medium text-center">
          ⚠️ Información no confirmada, cargada de forma voluntaria
        </div>
      )}

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
            {totalPaginas > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => actualizarFiltros({ pagina: paginaActual - 1 === 1 ? null : paginaActual - 1 })}
                  disabled={paginaActual === 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <p className="text-center text-xs text-slate-500">
                  Página {paginaActual} de {totalPaginas}
                </p>
                <button
                  type="button"
                  onClick={() => actualizarFiltros({ pagina: Math.min(totalPaginas, paginaActual + 1) })}
                  disabled={paginaActual === totalPaginas}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto modal-scroll">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between gap-3 z-10">
              <button
                onClick={cerrarFormulario}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
                Volver
              </button>
              <h2 className="flex-1 text-right font-medium text-lg">{tokenGenerado ? "Reporte publicado" : "Reportar a alguien que buscamos"}</h2>
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
            ) : borradorPendiente ? (
              <div className="p-6 space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <h3 className="text-base font-medium text-amber-900">Tienes un borrador guardado</h3>
                  <p className="text-sm text-amber-800">
                    Puedes continuar con los datos guardados o descartarlos y empezar de nuevo.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={descartarBorrador}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={restaurarBorrador}
                    className="flex-1 rounded-xl bg-marca-dorado px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Continuar
                  </button>
                </div>
                <a
                  href="/editar/borrador"
                  className="block rounded-xl border border-amber-200 px-4 py-3 text-center text-sm font-medium text-amber-900 transition hover:bg-amber-100"
                >
                  Editar o eliminar borrador
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" value={nombre} onChange={(e) => { setNombre(e.target.value); buscarDuplicados(e.target.value, apellido); }} placeholder="Nombre" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido <span className="text-red-500">*</span></label>
                  <input type="text" value={apellido} onChange={(e) => { setApellido(e.target.value); buscarDuplicados(nombre, e.target.value); }} placeholder="Apellido" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
                </div>
                {duplicados.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-yellow-800">Ya encontramos reportes que podrían coincidir.</p>
                      <p className="mt-1 text-xs text-yellow-700">Revisa si ya existe antes de publicar otro reporte.</p>
                    </div>
                    <div className="space-y-2">
                      {duplicados.map((d) => (
                        <div key={d.id} className="rounded-lg border border-yellow-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{d.nombre} {d.apellido}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {d.zona} · {tiempoRelativo(d.created_at)}
                              </p>
                              {d.ultima_ubicacion && (
                                <p className="mt-1 text-xs text-slate-500">Zona o referencia: {d.ultima_ubicacion}</p>
                              )}
                            </div>
                            <StatusBadge estado={d.estado} />
                          </div>
                          <button
                            type="button"
                            onClick={() => verReporteExistente(d)}
                            className="mt-3 w-full rounded-lg bg-yellow-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-yellow-700"
                          >
                            Ver reporte existente
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={confirmarContinuarConDuplicado}
                      className="w-full rounded-lg border border-yellow-300 bg-white px-3 py-2 text-xs font-medium text-yellow-800 transition hover:bg-yellow-100"
                    >
                      {continuarConDuplicado ? "Continuar de todos modos confirmado" : "Continuar de todos modos"}
                    </button>
                    <button
                      type="button"
                      onClick={verReportesCoincidentes}
                      className="w-full rounded-lg px-3 py-2 text-xs font-medium text-yellow-800 underline-offset-2 transition hover:underline"
                    >
                      Ver todos los reportes coincidentes en el listado
                    </button>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zona <span className="text-red-500">*</span></label>
                  <select value={zona} onChange={(e) => setZona(e.target.value as ZonaDB)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white" required>
                    {ZONAS_DB.map((z) => (<option key={z} value={z}>{z}</option>))}
                  </select>
                </div>
                {zonaEsOtro && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={ultimaUbicacion}
                      onChange={(e) => setUltimaUbicacion(e.target.value)}
                      placeholder="Ej: Urbanización, calle, sector o referencia"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Se guardará como última ubicación conocida para poder ubicar mejor el reporte.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Celular de contacto <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                    <select
                      value={codigoPais}
                      onChange={(e) => setCodigoPais(e.target.value as CodigoPais)}
                      className={`px-3 py-2.5 border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 ${telefonoError ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-marca-azul/40"}`}
                      aria-label="Código de país"
                    >
                      {CODIGOS_PAIS.map((codigo) => (
                        <option key={codigo.value} value={codigo.value}>{codigo.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      onBlur={() => setTelefonoTocado(true)}
                      placeholder="4121234567"
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${telefonoError ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-marca-azul/40"}`}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Selecciona el código de país e introduce el número completo sin omitir dígitos.</p>
                  {telefonoError && <p className="mt-1 text-xs text-red-600">{telefonoError}</p>}
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-marca-azul/40 hover:bg-marca-azul/5 transition">
                  {fotoPreview ? (
                    <div className="space-y-3">
                      <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 cursor-pointer">
                        <img src={fotoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                        <p className="text-sm text-slate-500 text-left">Toca para cambiar</p>
                      </div>
                      <button
                        type="button"
                        onClick={eliminarFoto}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar foto
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 cursor-pointer">
                      <Camera className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-500">Subir foto (opcional)</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {zonaEsOtro ? "Detalles adicionales de ubicación" : "Última ubicación conocida"}
                  </label>
                  <input
                    type="text"
                    value={ultimaUbicacion}
                    onChange={(e) => setUltimaUbicacion(e.target.value)}
                    placeholder={zonaEsOtro ? "Ej: edificio, piso, punto de referencia" : "Ej: Calle principal de Naiguatá"}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                  />
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-4">
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
                onClick={() => {
                  setMostrarConsentimiento(false);
                  onFormularioCerrado?.();
                }}
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
        <ModalDetalleReporte
          pub={reporteSeleccionado}
          onClose={() => setReporteSeleccionado(null)}
          onActualizado={(r) => {
            setReportes((prev) => prev.map((p) => (p.id === r.id ? r : p)));
          }}
        />
      )}
    </div>
  );
}
