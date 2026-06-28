"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Loader2,
  X,
  Check,
  Copy,
  Link2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  HandHeart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  TIPOS_AYUDA,
  generarToken,
  tiempoRelativo,
  limpiarTelefono,
  waLink,
} from "@/lib/constants";
import { buildUrlWithUpdatedQuery } from "@/lib/url-filters";

interface Colaborador {
  id: string;
  nombre: string;
  tipo_ayuda: string[];
  ubicacion: string;
  disponibilidad: string | null;
  telefono: string | null;
  email: string | null;
  redes: string | null;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

function tipoLabel(value: string) {
  return TIPOS_AYUDA.find((t) => t.value === value)?.label || value;
}

function logContacto(colaboradorId: string, tipo: "llamada" | "whatsapp" | "email") {
  supabase.from("contactos_log").insert({ colaborador_id: colaboradorId, tipo_contacto: tipo }).then();
}

function TarjetaColaborador({ col, onSelect }: { col: Colaborador; onSelect: (c: Colaborador) => void }) {
  return (
    <article
      onClick={() => onSelect(col)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-medium text-sm text-slate-800 mb-1 break-words">{col.nombre}</h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {col.tipo_ayuda.map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-marca-azul/10 text-marca-azul rounded-full text-[10px] font-medium">
              {tipoLabel(t)}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="line-clamp-1">{col.ubicacion}</span>
        </div>
        {col.descripcion && (
          <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-3">{col.descripcion}</p>
        )}
        <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
          <Clock className="w-2.5 h-2.5" />
          {tiempoRelativo(col.created_at)}
        </span>
      </div>
    </article>
  );
}

const TIPOS_CON_SOLICITUD = ["albergue", "alimentos", "transporte", "ropa_abrigo", "insumos_medicos", "mano_obra"];

const PLACEHOLDER_DESC: Record<string, string> = {
  albergue: "Ej: Casa dañada, necesitamos donde quedarnos...",
  alimentos: "Ej: Familia de 4, no tenemos acceso a comida...",
  transporte: "Ej: Necesito ir de Caraballeda a Caracas...",
  ropa_abrigo: "Ej: Perdimos todo, necesitamos ropa para 3 niños...",
  insumos_medicos: "Ej: Necesito insulina, tensiómetro...",
  mano_obra: "Ej: Necesito ayuda para limpiar escombros...",
};

const LABEL_SOLICITAR: Record<string, string> = {
  albergue: "Solicitar albergue",
  alimentos: "Solicitar alimentos",
  transporte: "Solicitar transporte",
  ropa_abrigo: "Solicitar ropa / abrigo",
  insumos_medicos: "Solicitar insumos médicos",
  mano_obra: "Solicitar mano de obra",
};

function ModalDetalleColaborador({ col, onClose }: { col: Colaborador; onClose: () => void }) {
  const limpio = col.telefono ? limpiarTelefono(col.telefono) : "";
  const tipoSolicitud = col.tipo_ayuda.find(t => TIPOS_CON_SOLICITUD.includes(t));
  const usaSolicitud = !!tipoSolicitud;
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [solNombre, setSolNombre] = useState("");
  const [solTelefono, setSolTelefono] = useState("");
  const [solZona, setSolZona] = useState("");
  const [solPersonas, setSolPersonas] = useState("");
  const [solDescripcion, setSolDescripcion] = useState("");
  const [solTipo, setSolTipo] = useState(tipoSolicitud || col.tipo_ayuda[0] || "");
  const [solDestino, setSolDestino] = useState("");

  const formularioValido = solNombre.trim() && solTelefono.trim() && solZona.trim();

  const construirMensaje = () => {
    const tipo = tipoLabel(solTipo);
    return `Hola ${col.nombre}, necesito ayuda.\n\n` +
      `*Solicitud:* ${tipo}\n` +
      `*Nombre:* ${solNombre.trim()}\n` +
      `*Teléfono:* ${solTelefono.trim()}\n` +
      `*Zona:* ${solZona.trim()}\n` +
      (solPersonas.trim() ? `*Personas:* ${solPersonas.trim()}\n` : "") +
      (solDestino.trim() ? `*Destino:* ${solDestino.trim()}\n` : "") +
      (solDescripcion.trim() ? `*Situación:* ${solDescripcion.trim()}\n` : "") +
      `\n(Enviado desde ayudalaguaira.com)`;
  };

  const enviarWhatsApp = () => {
    if (!col.telefono) return;
    logContacto(col.id, "whatsapp");
    const url = waLink(col.telefono) + `&text=${encodeURIComponent(construirMensaje())}`;
    window.open(url, "_blank");
  };

  const enviarEmail = () => {
    if (!col.email) return;
    logContacto(col.id, "email");
    const subject = encodeURIComponent(`Solicitud de ayuda - ${tipoLabel(solTipo)}`);
    const body = encodeURIComponent(construirMensaje());
    window.location.href = `mailto:${col.email}?subject=${subject}&body=${body}`;
  };

  const enviarSolicitud = async () => {
    if (!formularioValido) return;
    setEnviandoSolicitud(true);
    const desc = [
      solDescripcion.trim(),
      solDestino.trim() ? `Destino: ${solDestino.trim()}` : "",
    ].filter(Boolean).join(" | ") || null;

    const { error } = await supabase.from("solicitudes_ayuda").insert({
      colaborador_id: col.id,
      tipo_ayuda: solTipo,
      nombre: solNombre.trim(),
      telefono: solTelefono.trim(),
      zona: solZona.trim(),
      personas: solPersonas.trim() ? parseInt(solPersonas) : null,
      descripcion: desc,
    });
    setEnviandoSolicitud(false);
    if (error) {
      alert("Error al enviar solicitud: " + error.message);
      return;
    }
    logContacto(col.id, "solicitud" as any);
    setSolicitudEnviada(true);
  };

  const esAlbergueCol = col.tipo_ayuda.includes("albergue");

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto pb-20 sm:pb-0" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold text-slate-800">{col.nombre}</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {col.tipo_ayuda.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-marca-azul/10 text-marca-azul rounded-full text-xs font-medium">
                {tipoLabel(t)}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            {col.ubicacion}
          </div>
          {col.disponibilidad && (
            <p className="text-sm text-slate-600"><strong>Disponibilidad:</strong> {col.disponibilidad}</p>
          )}
          {esAlbergueCol && col.descripcion ? (() => {
            const partes = col.descripcion.split(" | ");
            const capacidad = partes.find(p => p.startsWith("Capacidad:"))?.replace("Capacidad: ", "") || null;
            const mascotas = partes.some(p => p === "Acepta mascotas");
            const serviciosStr = partes.find(p => p.startsWith("Servicios:"))?.replace("Servicios: ", "") || null;
            const estadia = partes.find(p => p.startsWith("Estadía máx:"))?.replace("Estadía máx: ", "") || null;
            const textoLibre = partes.filter(p => !p.startsWith("Capacidad:") && !p.startsWith("Servicios:") && !p.startsWith("Estadía máx:") && p !== "Acepta mascotas").join(" ");
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-800">Detalles del albergue</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  {capacidad && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">👥</span>
                      <span><strong>{capacidad}</strong></span>
                    </div>
                  )}
                  {estadia && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">📅</span>
                      <span>Máx: <strong>{estadia}</strong></span>
                    </div>
                  )}
                  {mascotas && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🐾</span>
                      <span>Acepta mascotas</span>
                    </div>
                  )}
                </div>
                {serviciosStr && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {serviciosStr.split(", ").map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-white border border-blue-200 rounded-full text-[10px] font-medium text-blue-700">{s}</span>
                    ))}
                  </div>
                )}
                {textoLibre && <p className="text-xs text-slate-600 pt-1">{textoLibre}</p>}
              </div>
            );
          })() : col.descripcion && (
            <p className="text-sm text-slate-600">{col.descripcion}</p>
          )}

          {solicitudEnviada ? (
            <div className="text-center py-4 space-y-3">
              <div className="bg-marca-verde/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-marca-verde" />
              </div>
              <h3 className="text-base font-medium text-slate-800">Solicitud enviada</h3>
              <p className="text-sm text-slate-600">El voluntario revisará tu solicitud y te contactará por teléfono para coordinar.</p>
              <button onClick={onClose} className="w-full py-2.5 bg-marca-azul text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
                Cerrar
              </button>
            </div>
          ) : !mostrarSolicitud ? (
            <>
              {!usaSolicitud && (
                <div className="flex gap-2 pt-2 flex-wrap">
                  {col.telefono && (
                    <>
                      <a href={`tel:${limpio}`} onClick={() => logContacto(col.id, "llamada")} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-azul text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
                        <Phone className="w-4 h-4" />
                        Llamar
                      </a>
                      <a href={waLink(col.telefono)} target="_blank" rel="noopener noreferrer" onClick={() => logContacto(col.id, "whatsapp")} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-verde text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </>
                  )}
                  {col.email && (
                    <a href={`mailto:${col.email}`} onClick={() => logContacto(col.id, "email")} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                </div>
              )}
              {usaSolicitud && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                  El contacto se realiza mediante solicitud. El voluntario te contactará por teléfono para coordinar.
                </div>
              )}
              <button
                onClick={() => setMostrarSolicitud(true)}
                className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition flex items-center justify-center gap-2"
              >
                <HandHeart className="w-4 h-4" />
                {usaSolicitud ? (LABEL_SOLICITAR[tipoSolicitud!] || "Solicitar ayuda") : "Solicitar ayuda"}
              </button>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-800 font-medium">
                  {usaSolicitud
                    ? "Completa tus datos. El voluntario recibirá tu solicitud y te contactará por teléfono."
                    : `Completa tus datos para que ${col.nombre} pueda ayudarte mejor`}
                </p>
              </div>
              {col.tipo_ayuda.filter(t => TIPOS_CON_SOLICITUD.includes(t)).length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">¿Qué tipo de ayuda necesitas?</label>
                  <select value={solTipo} onChange={(e) => setSolTipo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40">
                    {col.tipo_ayuda.filter(t => TIPOS_CON_SOLICITUD.includes(t)).map((t) => (
                      <option key={t} value={t}>{tipoLabel(t)}</option>
                    ))}
                  </select>
                </div>
              )}
              {!usaSolicitud && col.tipo_ayuda.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">¿Qué tipo de ayuda necesitas?</label>
                  <select value={solTipo} onChange={(e) => setSolTipo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40">
                    {col.tipo_ayuda.map((t) => (
                      <option key={t} value={t}>{tipoLabel(t)}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tu nombre *</label>
                <input type="text" value={solNombre} onChange={(e) => setSolNombre(e.target.value)} placeholder="Nombre completo" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tu teléfono *</label>
                <input type="tel" value={solTelefono} onChange={(e) => setSolTelefono(e.target.value)} placeholder="Ej: 04141234567" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Zona donde estás *</label>
                <input type="text" value={solZona} onChange={(e) => setSolZona(e.target.value)} placeholder="Ej: Caraballeda, sector..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
              </div>
              {(solTipo === "albergue" || solTipo === "alimentos" || solTipo === "ropa_abrigo") && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cantidad de personas</label>
                  <input type="number" value={solPersonas} onChange={(e) => setSolPersonas(e.target.value)} placeholder="Ej: 4" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
                </div>
              )}
              {solTipo === "transporte" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">¿A dónde necesitas ir?</label>
                  <input type="text" value={solDestino} onChange={(e) => setSolDestino(e.target.value)} placeholder="Ej: Hospital Pérez Carreño, Caracas..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {solTipo === "insumos_medicos" ? "¿Qué insumos necesitas?" : solTipo === "mano_obra" ? "¿Qué tipo de trabajo necesitas?" : "Describe tu situación"}
                </label>
                <textarea value={solDescripcion} onChange={(e) => setSolDescripcion(e.target.value)} rows={2} placeholder={PLACEHOLDER_DESC[solTipo] || "Describe brevemente tu situación..."} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none" />
              </div>
              {usaSolicitud ? (
                <button
                  onClick={enviarSolicitud}
                  disabled={!formularioValido || enviandoSolicitud}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition disabled:opacity-40"
                >
                  {enviandoSolicitud ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><HandHeart className="w-4 h-4" /> Enviar solicitud</>}
                </button>
              ) : (
                <div className="flex gap-2 pt-1">
                  {col.telefono && (
                    <button onClick={enviarWhatsApp} disabled={!formularioValido} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-verde text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40">
                      <MessageCircle className="w-4 h-4" />
                      Enviar por WhatsApp
                    </button>
                  )}
                  {col.email && (
                    <button onClick={enviarEmail} disabled={!formularioValido} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40">
                      <Mail className="w-4 h-4" />
                      Enviar por Email
                    </button>
                  )}
                </div>
              )}
              <button onClick={() => setMostrarSolicitud(false)} className="w-full text-slate-400 text-xs py-1 hover:text-slate-600 transition">
                ← Volver
              </button>
            </div>
          )}

          {col.redes && !mostrarSolicitud && !solicitudEnviada && (
            <p className="text-xs text-slate-500 pt-1">Redes: <a href={col.redes.startsWith("http") ? col.redes : `https://instagram.com/${col.redes.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-marca-azul underline">{col.redes}</a></p>
          )}
        </div>
      </div>
    </div>
  );
}

type Orden = "menos_contactados" | "mas_contactados";

interface ColaboradoresProps {
  abrirFormulario?: boolean;
  onFormularioCerrado?: () => void;
  filtros?: {
    tipo: string;
    orden: Orden;
    pagina: number;
  };
}

export default function ColaboradoresSection({
  abrirFormulario,
  onFormularioCerrado,
  filtros,
}: ColaboradoresProps) {
  const router = useRouter();
  const pathname = usePathname();
  const filtroTipo = filtros?.tipo ?? "todos";
  const orden = filtros?.orden ?? "menos_contactados";
  const paginaActual = filtros?.pagina ?? 1;
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalColaboradores, setTotalColaboradores] = useState(0);
  const [seleccionado, setSeleccionado] = useState<Colaborador | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    if (abrirFormulario) setMostrarFormulario(true);
  }, [abrirFormulario]);
  const [enviando, setEnviando] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Form
  const [nombre, setNombre] = useState("");
  const [tipoAyuda, setTipoAyuda] = useState<string[]>([]);
  const [ubicacion, setUbicacion] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRedes, setFormRedes] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [contactoError, setContactoError] = useState("");
  // Campos específicos albergue
  const [capacidad, setCapacidad] = useState("");
  const [aceptaMascotas, setAceptaMascotas] = useState(false);
  const [servicios, setServicios] = useState<string[]>([]);
  const [duracionEstadia, setDuracionEstadia] = useState("");

  const esAlbergue = tipoAyuda.includes("albergue");

  const toggleServicio = (s: string) => {
    setServicios((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const cargarConteos = useCallback(async () => {
    const { data } = await supabase
      .from("contactos_log")
      .select("colaborador_id");
    if (data) {
      const map: Record<string, number> = {};
      data.forEach((row: { colaborador_id: string }) => {
        map[row.colaborador_id] = (map[row.colaborador_id] || 0) + 1;
      });
      setConteos(map);
    }
  }, []);

  const cargar = useCallback(
    async () => {
      setCargando(true);
      let query = supabase
        .from("colaboradores")
        .select("id, nombre, tipo_ayuda, ubicacion, disponibilidad, telefono, email, redes, descripcion, activo, created_at", { count: "exact" })
        .eq("activo", true);

      if (filtroTipo !== "todos") {
        query = query.contains("tipo_ayuda", [filtroTipo]);
      }

      const from = (paginaActual - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (data) {
        setColaboradores(data as Colaborador[]);
      }
      setTotalColaboradores(count ?? 0);
      setTotalPaginas(Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)));
      setCargando(false);
    },
    [filtroTipo, paginaActual]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    cargarConteos();
  }, [cargarConteos]);

  const actualizarFiltros = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const url = buildUrlWithUpdatedQuery(pathname, window.location.search, updates);
      router.replace(url, { scroll: false });
    },
    [pathname, router]
  );

  const colaboradoresOrdenados = [...colaboradores].sort((a, b) => {
    const ca = conteos[a.id] || 0;
    const cb = conteos[b.id] || 0;
    return orden === "menos_contactados" ? ca - cb : cb - ca;
  });

  const toggleTipoAyuda = (val: string) => {
    setTipoAyuda((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ubicacion.trim() || tipoAyuda.length === 0 || (!formTelefono.trim() && !formEmail.trim())) {
      setContactoError("Indica al menos un dato de contacto: celular o email.");
      alert("Completa nombre, tipo de ayuda, ubicación y al menos un contacto (celular o email)");
      return;
    }
    setContactoError("");

    setEnviando(true);
    const edit_token = generarToken();

    const tieneDatosExtra = servicios.length > 0 || capacidad.trim() || duracionEstadia.trim() || aceptaMascotas;

    const descParts: string[] = [];
    if (descripcion.trim()) descParts.push(descripcion.trim());
    if (capacidad.trim()) descParts.push(`Capacidad: ${capacidad.trim()}`);
    if (aceptaMascotas) descParts.push("Acepta mascotas");
    if (servicios.length > 0) descParts.push(`Servicios: ${servicios.join(", ")}`);
    if (duracionEstadia.trim()) descParts.push(`Estadía máx: ${duracionEstadia.trim()}`);

    const descFinal = descParts.length > 0 ? descParts.join(" | ") : null;

    const { error } = await supabase.from("colaboradores").insert({
      nombre: nombre.trim(),
      tipo_ayuda: tipoAyuda,
      ubicacion: ubicacion.trim(),
      disponibilidad: disponibilidad.trim() || null,
      telefono: formTelefono.trim() || null,
      email: formEmail.trim() || null,
      redes: formRedes.trim() || null,
      descripcion: descFinal || null,
      edit_token,
      activo: true,
    });

    if (error) {
      alert("Error: " + error.message);
      setEnviando(false);
      return;
    }

    setEnviando(false);
    setTokenGenerado(edit_token);
    if (paginaActual === 1) {
      cargar();
    } else {
      actualizarFiltros({ pagina: null });
    }
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setTokenGenerado(null);
    setNombre("");
    setTipoAyuda([]);
    setUbicacion("");
    setDisponibilidad("");
    setFormTelefono("");
    setFormEmail("");
    setFormRedes("");
    setDescripcion("");
    setContactoError("");
    setCapacidad("");
    setAceptaMascotas(false);
    setServicios([]);
    setDuracionEstadia("");
    setCopiado(false);
    onFormularioCerrado?.();
  };

  const copiarLink = () => {
    if (!tokenGenerado) return;
    navigator.clipboard.writeText(`${window.location.origin}/editar/${tokenGenerado}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const totalContactos = Object.values(conteos).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Métricas */}
      {!cargando && colaboradores.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-6 mb-5">
          <div className="bg-marca-azul/10 border border-marca-azul/20 rounded-xl py-3 px-4 text-center">
            <p className="text-2xl font-bold text-marca-azul tabular-nums">{totalColaboradores}</p>
            <p className="text-xs text-slate-600 mt-0.5">Colaboradores activos</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl py-3 px-4 text-center">
            <p className="text-2xl font-bold text-marca-verde tabular-nums">{totalContactos}</p>
            <p className="text-xs text-slate-600 mt-0.5">Contactos realizados</p>
          </div>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setMostrarFormulario(true)}
        className="w-full mt-3 bg-marca-dorado hover:opacity-90 text-white py-3.5 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2"
      >
        <HandHeart className="w-4 h-4" />
        Quiero ayudar
      </button>

      {/* Orden */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() =>
            actualizarFiltros({
              orden: orden === "menos_contactados" ? "mas_contactados" : null,
            })
          }
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all"
        >
          {orden === "menos_contactados" ? "Ver más contactados" : "Ver menos contactados"}
        </button>
      </div>

      {/* Filtro por tipo */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => actualizarFiltros({ tipo: null, pagina: null })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filtroTipo === "todos"
              ? "bg-marca-azul text-white"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Todos
        </button>
        {TIPOS_AYUDA.map((t) => (
          <button
            key={t.value}
            onClick={() => actualizarFiltros({ tipo: t.value, pagina: null })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filtroTipo === t.value
                ? "bg-marca-azul text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="mt-4 pb-8">
        {cargando ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-marca-azul animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Cargando colaboradores...</p>
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="bg-marca-verde/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <HandHeart className="w-7 h-7 text-marca-verde" />
            </div>
            <p className="text-slate-700 font-medium">Aún no hay colaboradores</p>
            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Tu ayuda puede marcar la diferencia. Ofrece tu tiempo y habilidades para apoyar a quienes más lo necesitan.</p>
            <button onClick={() => setMostrarFormulario(true)} className="mt-4 bg-marca-dorado hover:opacity-90 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all inline-flex items-center gap-2">
              <HandHeart className="w-4 h-4" />
              Quiero ayudar
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colaboradoresOrdenados.map((c) => (
                <TarjetaColaborador key={c.id} col={c} onSelect={setSeleccionado} />
              ))}
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
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto pb-20 sm:pb-0">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <h2 className="font-medium text-lg">
                {tokenGenerado ? "Registro exitoso" : "Quiero ayudar"}
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
                <h3 className="text-lg font-medium text-slate-800">¡Gracias por ofrecer tu ayuda!</h3>
                <p className="text-sm text-slate-600">Te estamos redirigiendo a tu página de edición. <strong>Guárdala en favoritos</strong> — es el único lugar donde podrás modificar tu información o desactivarte.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <div className="flex items-start gap-2">
                    <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Guarda este enlace como favorito ⭐</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Este es tu enlace personal. Sin él no podrás editar tu perfil.
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
                <a
                  href={`/editar/${tokenGenerado}`}
                  className="w-full bg-marca-azul text-white py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2"
                >
                  Ir a mi página de edición
                </a>
                <button onClick={cerrarFormulario} className="w-full text-slate-400 text-sm py-2 hover:text-slate-600 transition">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de ayuda <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS_AYUDA.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => toggleTipoAyuda(t.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          tipoAyuda.includes(t.value)
                            ? "bg-marca-azul text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ubicación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    placeholder="Ej: Caracas, Miami USA"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Disponibilidad
                  </label>
                  <input
                    type="text"
                    value={disponibilidad}
                    onChange={(e) => setDisponibilidad(e.target.value)}
                    placeholder="Ej: fines de semana, 24/7, solo remoto"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Celular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formTelefono}
                    onChange={(e) => {
                      setFormTelefono(e.target.value);
                      if (e.target.value.trim() || formEmail.trim()) setContactoError("");
                    }}
                    placeholder="Ej: 04141234567"
                    aria-invalid={contactoError ? "true" : "false"}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      contactoError ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-marca-azul/40"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => {
                      setFormEmail(e.target.value);
                      if (e.target.value.trim() || formTelefono.trim()) setContactoError("");
                    }}
                    placeholder="Ej: tu@correo.com"
                    aria-invalid={contactoError ? "true" : "false"}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      contactoError ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-marca-azul/40"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Instagram / Facebook
                  </label>
                  <input
                    type="text"
                    value={formRedes}
                    onChange={(e) => setFormRedes(e.target.value)}
                    placeholder="Ej: @usuario o link de perfil"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                  />
                </div>
                <p className={`text-xs ${contactoError ? "text-red-600" : "text-slate-400"}`}>
                  {contactoError || "Llena al menos celular o email. Redes son opcionales."}
                </p>

                {esAlbergue && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-800">Datos del albergue</p>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Capacidad (personas)</label>
                      <input
                        type="number"
                        value={capacidad}
                        onChange={(e) => setCapacidad(e.target.value)}
                        placeholder="Ej: 4"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Duración máxima de estadía</label>
                      <input
                        type="text"
                        value={duracionEstadia}
                        onChange={(e) => setDuracionEstadia(e.target.value)}
                        placeholder="Ej: 1 semana, 3 días, indefinido"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Servicios disponibles</label>
                      <div className="flex flex-wrap gap-2">
                        {["Agua", "Luz", "Internet", "Cocina", "Baño privado"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleServicio(s)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                              servicios.includes(s)
                                ? "bg-marca-azul text-white"
                                : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="mascotas"
                        checked={aceptaMascotas}
                        onChange={(e) => setAceptaMascotas(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-marca-azul focus:ring-marca-azul/40"
                      />
                      <label htmlFor="mascotas" className="text-xs text-slate-700">Acepta mascotas</label>
                    </div>
                  </div>
                )}

                {tipoAyuda.includes("alimentos") && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-green-800">Sobre los alimentos</p>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">¿Qué ofreces?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Comida preparada", "Despensa", "Agua potable", "Fórmula infantil"].map((s) => (
                          <button key={s} type="button" onClick={() => toggleServicio(s)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${servicios.includes(s) ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Cantidad aproximada (raciones/personas)</label>
                      <input type="text" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} placeholder="Ej: 20 raciones, para 10 personas" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
                    </div>
                  </div>
                )}

                {tipoAyuda.includes("transporte") && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-purple-800">Sobre el transporte</p>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de vehículo</label>
                      <div className="flex flex-wrap gap-2">
                        {["Carro particular", "Camioneta", "Camión", "Moto"].map((s) => (
                          <button key={s} type="button" onClick={() => toggleServicio(s)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${servicios.includes(s) ? "bg-purple-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Zona de cobertura</label>
                      <input type="text" value={duracionEstadia} onChange={(e) => setDuracionEstadia(e.target.value)} placeholder="Ej: Vargas - Caracas, solo dentro de Vargas..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
                    </div>
                  </div>
                )}

                {tipoAyuda.includes("ropa_abrigo") && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-orange-800">Sobre la ropa / abrigo</p>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">¿Qué tienes disponible?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Ropa adultos", "Ropa niños", "Cobijas", "Zapatos", "Ropa de bebé"].map((s) => (
                          <button key={s} type="button" onClick={() => toggleServicio(s)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${servicios.includes(s) ? "bg-orange-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tipoAyuda.includes("insumos_medicos") && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-red-800">Sobre los insumos médicos</p>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">¿Qué insumos ofreces?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Medicamentos", "Primeros auxilios", "Equipos médicos", "Material de curación"].map((s) => (
                          <button key={s} type="button" onClick={() => toggleServicio(s)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${servicios.includes(s) ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tipoAyuda.includes("mano_obra") && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-amber-800">Sobre la mano de obra</p>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">¿Qué tipo de trabajo puedes hacer?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Limpieza de escombros", "Construcción", "Electricidad", "Plomería", "Carga y descarga"].map((s) => (
                          <button key={s} type="button" onClick={() => toggleServicio(s)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${servicios.includes(s) ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">¿Cuántas personas puedes llevar?</label>
                      <input type="text" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} placeholder="Ej: solo yo, equipo de 5 personas" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder={esAlbergue ? "Detalles adicionales del espacio..." : "Detalles adicionales, experiencia, horarios..."}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-marca-dorado hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</> : "Registrarme como colaborador"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {seleccionado && (
        <ModalDetalleColaborador col={seleccionado} onClose={() => setSeleccionado(null)} />
      )}
    </div>
  );
}
