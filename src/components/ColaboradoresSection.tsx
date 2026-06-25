"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
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
  Filter,
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
  contacto: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

function tipoLabel(value: string) {
  return TIPOS_AYUDA.find((t) => t.value === value)?.label || value;
}

function BotonContacto({ contacto }: { contacto: string }) {
  const esEmail = contacto.includes("@");
  const esTelefono = /^[0-9+\-\s()]+$/.test(contacto);

  if (esEmail) {
    return (
      <a
        href={`mailto:${contacto}`}
        className="flex items-center gap-1.5 px-3 py-2 bg-marca-azul text-white rounded-full text-xs font-medium hover:opacity-90 transition"
      >
        <Mail className="w-3.5 h-3.5" />
        Email
      </a>
    );
  }

  const limpio = limpiarTelefono(contacto);
  return (
    <div className="flex gap-2">
      <a
        href={`tel:${limpio}`}
        className="flex items-center gap-1.5 px-3 py-2 bg-marca-azul text-white rounded-full text-xs font-medium hover:opacity-90 transition"
      >
        <Phone className="w-3.5 h-3.5" />
        Llamar
      </a>
      {esTelefono && (
        <a
          href={waLink(contacto)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-marca-verde text-white rounded-full text-xs font-medium hover:opacity-90 transition"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      )}
    </div>
  );
}

function BotonContactoCompacto({ contacto }: { contacto: string }) {
  const esEmail = contacto.includes("@");
  const esTelefono = /^[0-9+\-\s()]+$/.test(contacto);
  const limpio = limpiarTelefono(contacto);

  if (esEmail) {
    return (
      <a href={`mailto:${contacto}`} className="w-full flex items-center justify-center gap-1 py-1.5 bg-marca-azul text-white rounded-lg text-[11px] font-medium hover:opacity-90 transition">
        <Mail className="w-3 h-3" />
        Email
      </a>
    );
  }

  return (
    <div className="flex gap-1.5">
      <a href={`tel:${limpio}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-marca-azul text-white rounded-lg text-[11px] font-medium hover:opacity-90 transition">
        <Phone className="w-3 h-3" />
        Llamar
      </a>
      {esTelefono && (
        <a href={waLink(contacto)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-marca-verde text-white rounded-lg text-[11px] font-medium hover:opacity-90 transition">
          <MessageCircle className="w-3 h-3" />
          WhatsApp
        </a>
      )}
    </div>
  );
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
  const limpio = limpiarTelefono(col.contacto);
  const esEmail = col.contacto.includes("@");
  const esTelefono = /^[0-9+\-\s()]+$/.test(col.contacto);
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
          <div className="flex gap-2 pt-2">
            {esEmail ? (
              <a href={`mailto:${col.contacto}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-azul text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
                <Mail className="w-4 h-4" />
                Email
              </a>
            ) : (
              <>
                <a href={`tel:${limpio}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-azul text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
                {esTelefono && (
                  <a href={waLink(col.contacto)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-marca-verde text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ColaboradoresSection() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [seleccionado, setSeleccionado] = useState<Colaborador | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Form
  const [nombre, setNombre] = useState("");
  const [tipoAyuda, setTipoAyuda] = useState<string[]>([]);
  const [ubicacion, setUbicacion] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");
  const [contacto, setContacto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const cargar = useCallback(
    async (reset = true) => {
      if (reset) setCargando(true);
      else setCargandoMas(true);

      const offset = reset ? 0 : colaboradores.length;

      let query = supabase
        .from("colaboradores")
        .select("id, nombre, tipo_ayuda, ubicacion, disponibilidad, contacto, descripcion, activo, created_at")
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
  }, [cargar]);

  const toggleTipoAyuda = (val: string) => {
    setTipoAyuda((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !contacto.trim() || !ubicacion.trim() || tipoAyuda.length === 0) {
      alert("Completa nombre, tipo de ayuda, ubicación y contacto");
      return;
    }

    setEnviando(true);
    const edit_token = generarToken();

    const { error } = await supabase.from("colaboradores").insert({
      nombre: nombre.trim(),
      tipo_ayuda: tipoAyuda,
      ubicacion: ubicacion.trim(),
      disponibilidad: disponibilidad.trim() || null,
      contacto: contacto.trim(),
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
    setContacto("");
    setDescripcion("");
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
      {/* Botón principal */}
      <button
        onClick={() => setMostrarFormulario(true)}
        className="w-full mt-3 bg-marca-dorado hover:opacity-90 text-white py-3.5 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2"
      >
        <HandHeart className="w-4 h-4" />
        Quiero ayudar
      </button>

      {/* Filtro por tipo */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
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
              {colaboradores.map((c) => (
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <div className="flex items-start gap-2">
                    <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Guarda este enlace</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Úsalo para editar tu perfil o desactivarte cuando ya no puedas ayudar.
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
                    Contacto <span className="text-marca-dorado">*</span>
                  </label>
                  <input
                    type="text"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    placeholder="Celular o email"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40"
                    required
                  />
                </div>

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
