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
        <h3 className="font-medium text-sm text-slate-800 line-clamp-1 mb-1">{col.nombre}</h3>
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

function ModalDetalleColaborador({ col, onClose }: { col: Colaborador; onClose: () => void }) {
  const limpio = col.telefono ? limpiarTelefono(col.telefono) : "";
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
          {col.descripcion && (
            <p className="text-sm text-slate-600">{col.descripcion}</p>
          )}
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
          {col.redes && (
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
}

export default function ColaboradoresSection({ abrirFormulario, onFormularioCerrado }: ColaboradoresProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [orden, setOrden] = useState<Orden>("menos_contactados");
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
    async (reset = true) => {
      if (reset) setCargando(true);
      else setCargandoMas(true);

      const offset = reset ? 0 : colaboradores.length;

      let query = supabase
        .from("colaboradores")
        .select("id, nombre, tipo_ayuda, ubicacion, disponibilidad, telefono, email, redes, descripcion, activo, created_at")
        .eq("activo", true);

      if (filtroTipo !== "todos") {
        query = query.contains("tipo_ayuda", [filtroTipo]);
      }

      const { data } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (data) {
        const typed = data as Colaborador[];
        if (reset) setColaboradores(typed);
        else setColaboradores((prev) => [...prev, ...typed]);
        setHayMas(typed.length === PAGE_SIZE);
      }
      setCargando(false);
      setCargandoMas(false);
    },
    [filtroTipo]
  );

  useEffect(() => {
    cargar(true);
    cargarConteos();
  }, [cargar, cargarConteos]);

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
      alert("Completa nombre, tipo de ayuda, ubicación y al menos un contacto (celular o email)");
      return;
    }

    setEnviando(true);
    const edit_token = generarToken();

    const { error } = await supabase.from("colaboradores").insert({
      nombre: nombre.trim(),
      tipo_ayuda: tipoAyuda,
      ubicacion: ubicacion.trim(),
      disponibilidad: disponibilidad.trim() || null,
      telefono: formTelefono.trim() || null,
      email: formEmail.trim() || null,
      redes: formRedes.trim() || null,
      descripcion: descripcion.trim() || null,
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
    cargar(true);
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
      <div className="flex items-baseline gap-1 flex-wrap text-sm text-slate-500 mb-3 leading-relaxed">
        <span className="text-purple-600 font-semibold tabular-nums">{colaboradores.length > 0 ? colaboradoresOrdenados.length : 0}</span>
        <span>{colaboradoresOrdenados.length === 1 ? "colaborador activo" : "colaboradores activos"}</span>
        <span className="text-slate-300 mx-0.5">·</span>
        <span className="text-marca-verde font-semibold tabular-nums">{totalContactos}</span>
        <span>{totalContactos === 1 ? "contacto realizado" : "contactos realizados"}</span>
      </div>

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
          onClick={() => setOrden(orden === "menos_contactados" ? "mas_contactados" : "menos_contactados")}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all"
        >
          {orden === "menos_contactados" ? "Ver más contactados" : "Ver menos contactados"}
        </button>
      </div>

      {/* Filtro por tipo */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFiltroTipo("todos")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
            onClick={() => setFiltroTipo(t.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
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
                    Nombre <span className="text-marca-dorado">*</span>
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
                    Tipo de ayuda <span className="text-marca-dorado">*</span>
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
                    Ubicación <span className="text-marca-dorado">*</span>
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
                    Celular
                  </label>
                  <input
                    type="tel"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    placeholder="Ej: 04141234567"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Ej: tu@correo.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
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
                <p className="text-xs text-slate-400">Llena al menos celular o email. Redes son opcionales.</p>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Cómo puedes ayudar, experiencia relevante..."
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
