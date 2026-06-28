"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { generarCodigoAcceso } from "@/lib/apadrina-constants";
import { Loader2, Check, Copy, Link2 } from "lucide-react";
import Link from "next/link";

export default function RegistroSolicitante() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [celular, setCelular] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !ubicacion.trim() || !celular.trim()) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    if (!consentimiento) {
      alert("Debes aceptar el aviso legal para continuar.");
      return;
    }
    setEnviando(true);
    const codigo = generarCodigoAcceso();

    const { error } = await supabase.from("apadrina_solicitantes").insert({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      ubicacion: ubicacion.trim(),
      celular_contacto: celular.trim(),
      descripcion_situacion: descripcion.trim() || null,
      codigo_acceso: codigo,
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
    ? `${window.location.origin}/apadrina/mi-apoyo/${codigoGenerado}`
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
          <h2 className="text-lg font-semibold text-slate-800">¡Registro exitoso!</h2>
          <p className="text-sm text-slate-600">
            Guarda este enlace — es tu acceso permanente al panel donde podrás explorar
            padrinos y postularte a las categorías de apoyo que necesites.
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
              <input
                type="text"
                readOnly
                value={linkPanel}
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

          <Link
            href={`/apadrina/mi-apoyo/${codigoGenerado}`}
            className="w-full bg-[#185FA5] text-white py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2"
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
        <h1 className="text-lg font-semibold text-slate-800 mb-1">Registro — Necesito apoyo</h1>
        <p className="text-sm text-slate-500 mb-6">Completa tus datos para crear tu perfil. Después podrás explorar las categorías de apoyo disponibles y postularte.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Tu apellido"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (ciudad / estado) <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Caracas, Distrito Capital"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Celular de contacto <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Ej: 04141234567"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Describe tu situación (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cuéntanos brevemente qué pasó y qué tipo de apoyo necesitas..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40 resize-none"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#185FA5] focus:ring-[#185FA5]/40"
            />
            <span className="text-xs text-slate-500">
              Acepto el{" "}
              <Link href="/apadrina/aviso-legal" target="_blank" className="text-[#185FA5] underline font-medium">
                aviso legal y política de privacidad
              </Link>
              . Entiendo que mi información será compartida con los padrinos que aprueben mi postulación.
            </span>
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-[#185FA5] hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</> : "Registrarme"}
          </button>
        </form>
      </div>
    </div>
  );
}
