"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { APADRINA_CATEGORIAS, generarCodigoAcceso } from "@/lib/apadrina-constants";
import { Loader2, Check, Copy, Link2 } from "lucide-react";
import Link from "next/link";

export default function RegistroPatrocinador() {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [capacidad, setCapacidad] = useState("1");
  const [ubicacion, setUbicacion] = useState("");
  const [duracionEstimada, setDuracionEstimada] = useState("");
  const [contacto, setContacto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const categoriaObj = APADRINA_CATEGORIAS.find((c) => c.value === categoria);
  const es1a1 = categoriaObj?.cardinalidad === "1:1";
  const esAlbergue = categoria === "albergue_temporal";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !categoria || !contacto.trim()) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    if (esAlbergue && !duracionEstimada.trim()) {
      alert("Indica la duración estimada del albergue.");
      return;
    }
    if (!consentimiento) {
      alert("Debes aceptar el aviso legal para continuar.");
      return;
    }
    setEnviando(true);
    const codigo = generarCodigoAcceso();
    const cap = es1a1 ? 1 : Math.max(1, parseInt(capacidad) || 1);

    const { error } = await supabase.from("apadrina_patrocinadores").insert({
      nombre: nombre.trim(),
      categoria,
      capacidad_total: cap,
      capacidad_disponible: cap,
      ubicacion: ubicacion.trim() || null,
      duracion_estimada: duracionEstimada.trim() || null,
      contacto: contacto.trim(),
      descripcion: descripcion.trim() || null,
      codigo_acceso: codigo,
      activo: true,
      consentimiento_aceptado: true,
      consentimiento_fecha: new Date().toISOString(),
    });

    if (error) {
      alert("Error al registrar: " + error.message);
      setEnviando(false);
      return;
    }
    setCodigoGenerado(codigo);
    setEnviando(false);
  };

  const linkPanel = typeof window !== "undefined"
    ? `${window.location.origin}/apadrina/panel/${codigoGenerado}`
    : "";

  const copiarLink = () => {
    navigator.clipboard.writeText(linkPanel);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (codigoGenerado) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-[#1D9E75]" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">¡Gracias por ser padrino!</h2>
          <p className="text-sm text-slate-600">
            Guarda este enlace — es tu acceso permanente al panel donde verás las postulaciones y podrás aprobar o rechazar cada una.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
            <div className="flex items-start gap-2">
              <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Guarda este enlace como favorito ⭐</p>
                <p className="text-xs text-amber-700 mt-1">Sin él no podrás acceder a tu panel.</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input type="text" readOnly value={linkPanel} className="flex-1 text-xs bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-700" />
              <button onClick={copiarLink} className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition">
                {copiado ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
              </button>
            </div>
          </div>
          <Link
            href={`/apadrina/panel/${codigoGenerado}`}
            className="w-full bg-[#BA7517] text-white py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2"
          >
            Ir a mi panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">Registro — Quiero ser padrino</h1>
        <p className="text-sm text-slate-500 mb-6">Elige en qué categoría quieres ayudar y cuántas personas puedes apoyar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tu nombre <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre o alias"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BA7517]/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría de apoyo <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {APADRINA_CATEGORIAS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setCategoria(cat.value);
                    if (cat.cardinalidad === "1:1") setCapacidad("1");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    categoria === cat.value
                      ? "border-[#BA7517] bg-amber-50 ring-2 ring-[#BA7517]/30"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <p className="text-xs font-medium text-slate-700 mt-1 leading-tight">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>

          {categoria && !es1a1 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ¿A cuántas personas puedes apoyar? <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                placeholder="Ej: 5"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BA7517]/40"
              />
              <p className="mt-1 text-xs text-slate-400">Podrás ajustarlo después desde tu panel.</p>
            </div>
          )}

          {es1a1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800">Esta categoría es 1 a 1 — apoyarás a una persona a la vez. Cuando finalices el apoyo, se liberará el cupo.</p>
            </div>
          )}

          {esAlbergue && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duración estimada del albergue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={duracionEstimada}
                onChange={(e) => setDuracionEstimada(e.target.value)}
                placeholder="Ej: 2 semanas, 1 mes, indefinido"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BA7517]/40"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (opcional)</label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Caracas, Miranda"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BA7517]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contacto <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Celular, email o usuario de redes"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BA7517]/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre cómo puedes ayudar, experiencia, horarios..."
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BA7517]/40 resize-none"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#BA7517] focus:ring-[#BA7517]/40"
            />
            <span className="text-xs text-slate-500">
              Acepto el{" "}
              <Link href="/apadrina/aviso-legal" target="_blank" className="text-[#185FA5] underline font-medium">
                aviso legal y política de privacidad
              </Link>
              . Entiendo que mi información de contacto será compartida con los solicitantes cuya postulación apruebe.
            </span>
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-[#BA7517] hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</> : "Registrarme como padrino"}
          </button>
        </form>
      </div>
    </div>
  );
}
