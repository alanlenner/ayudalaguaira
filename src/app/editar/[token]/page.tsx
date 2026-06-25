"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  Camera,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { comprimirImagen } from "@/lib/image-utils";
import { ZONAS_DB, TIPOS_AYUDA, CATEGORIAS_RECURSO } from "@/lib/constants";

type TipoRegistro = "desaparecidos" | "colaboradores" | "recursos";

export default function EditarRegistro() {
  const params = useParams();
  const token = params.token as string;

  const [tipo, setTipo] = useState<TipoRegistro | null>(null);
  const [datos, setDatos] = useState<Record<string, unknown> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Shared form fields
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colaboradores: tipo_ayuda multi-select
  const [tipoAyudaSeleccion, setTipoAyudaSeleccion] = useState<string[]>([]);

  useEffect(() => {
    async function buscar() {
      // Try desaparecidos first
      const { data: d1 } = await supabase.from("desaparecidos").select("*").eq("edit_token", token).single();
      if (d1) { setTipo("desaparecidos"); setDatos(d1); poblarForm("desaparecidos", d1); setCargando(false); return; }

      // Try colaboradores
      const { data: d2 } = await supabase.from("colaboradores").select("*").eq("edit_token", token).single();
      if (d2) { setTipo("colaboradores"); setDatos(d2); poblarForm("colaboradores", d2); setCargando(false); return; }

      // Try recursos
      const { data: d3 } = await supabase.from("recursos").select("*").eq("edit_token", token).single();
      if (d3) { setTipo("recursos"); setDatos(d3); poblarForm("recursos", d3); setCargando(false); return; }

      setError("No se encontró el registro. Verifica que el enlace sea correcto.");
      setCargando(false);
    }
    buscar();
  }, [token]);

  function poblarForm(t: TipoRegistro, d: Record<string, unknown>) {
    setFormData({ ...d });
    if (t === "colaboradores" && Array.isArray(d.tipo_ayuda)) {
      setTipoAyudaSeleccion(d.tipo_ayuda as string[]);
    }
  }

  const set = (key: string, value: unknown) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Máximo 10MB"); return; }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleTipoAyuda = (val: string) => {
    setTipoAyudaSeleccion((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo || !datos) return;
    setGuardando(true);

    let updatePayload: Record<string, unknown> = {};

    if (tipo === "desaparecidos") {
      let foto_url = formData.foto_url as string | null;
      if (fotoFile) {
        try {
          const comprimida = await comprimirImagen(fotoFile, 800, 0.7);
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.jpg`;
          const { data: up, error: ue } = await supabase.storage.from("fotos-desaparecidos").upload(fileName, comprimida, { contentType: "image/jpeg" });
          if (ue) { alert("Error foto: " + ue.message); setGuardando(false); return; }
          foto_url = supabase.storage.from("fotos-desaparecidos").getPublicUrl(up.path).data.publicUrl;
        } catch { alert("Error al procesar imagen"); setGuardando(false); return; }
      }
      updatePayload = {
        nombre: (formData.nombre as string || "").trim(),
        apellido: (formData.apellido as string || "").trim(),
        zona: formData.zona,
        telefono: (formData.telefono as string || "").trim(),
        foto_url,
        ultima_ubicacion: (formData.ultima_ubicacion as string || "").trim() || null,
        descripcion: (formData.descripcion as string || "").trim() || null,
        estado: formData.estado,
      };
    } else if (tipo === "colaboradores") {
      updatePayload = {
        nombre: (formData.nombre as string || "").trim(),
        tipo_ayuda: tipoAyudaSeleccion,
        ubicacion: (formData.ubicacion as string || "").trim(),
        disponibilidad: (formData.disponibilidad as string || "").trim() || null,
        contacto: (formData.contacto as string || "").trim(),
        descripcion: (formData.descripcion as string || "").trim() || null,
        activo: formData.activo,
      };
    } else if (tipo === "recursos") {
      updatePayload = {
        categoria: formData.categoria,
        descripcion: (formData.descripcion as string || "").trim(),
        direccion: (formData.direccion as string || "").trim(),
        zona: formData.zona,
        celular_contacto: (formData.celular_contacto as string || "").trim(),
        estado: formData.estado,
      };
    }

    const { error: updateError } = await supabase.from(tipo).update(updatePayload).eq("edit_token", token);
    if (updateError) { alert("Error: " + updateError.message); setGuardando(false); return; }
    setGuardando(false);
    setExito(true);
  };

  // --- Loading / Error / Success states ---
  if (cargando) {
    return (
      <div className="min-h-screen bg-marca-fondo flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-marca-azul animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Buscando registro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-marca-fondo flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-medium text-slate-800 mb-2">Registro no encontrado</h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <a href="/" className="inline-flex items-center gap-2 text-sm text-marca-azul font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  if (exito) {
    const msg = tipo === "colaboradores" ? "Perfil actualizado" : tipo === "recursos" ? "Publicación actualizada" : "Reporte actualizado";
    return (
      <div className="min-h-screen bg-marca-fondo flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center">
          <div className="bg-marca-verde/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-marca-verde" />
          </div>
          <h2 className="text-lg font-medium text-slate-800 mb-2">{msg}</h2>
          <p className="text-sm text-slate-500 mb-4">Los cambios ya son visibles.</p>
          <a href="/" className="inline-block w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm">Volver al inicio</a>
        </div>
      </div>
    );
  }

  const titulo = tipo === "colaboradores" ? "Editar perfil de colaborador" : tipo === "recursos" ? "Editar publicación de recurso" : "Editar reporte";
  const fotoMostrar = fotoPreview || (formData.foto_url as string | null);

  return (
    <div className="min-h-screen bg-marca-fondo">
      <header className="bg-marca-azul text-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="hover:bg-white/10 p-1 rounded-lg transition"><ArrowLeft className="w-5 h-5" /></a>
          <h1 className="text-lg font-medium">{titulo}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ========== DESAPARECIDOS ========== */}
          {tipo === "desaparecidos" && (
            <>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-marca-azul/40 hover:bg-marca-azul/5 transition">
                {fotoMostrar ? (
                  <div className="flex items-center gap-3">
                    <img src={fotoMostrar} alt="Foto" className="w-16 h-16 object-cover rounded-lg" />
                    <p className="text-sm text-slate-500">Toca para cambiar</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-500">Subir foto</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input type="text" value={(formData.nombre as string) || ""} onChange={(e) => set("nombre", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
                <input type="text" value={(formData.apellido as string) || ""} onChange={(e) => set("apellido", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zona *</label>
                <select value={(formData.zona as string) || ""} onChange={(e) => set("zona", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white" required>
                  {ZONAS_DB.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Celular de contacto *</label>
                <input type="tel" value={(formData.telefono as string) || ""} onChange={(e) => set("telefono", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Última ubicación conocida</label>
                <input type="text" value={(formData.ultima_ubicacion as string) || ""} onChange={(e) => set("ultima_ubicacion", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea value={(formData.descripcion as string) || ""} onChange={(e) => set("descripcion", e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select value={(formData.estado as string) || "buscando"} onChange={(e) => set("estado", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white">
                  <option value="buscando">Buscando</option>
                  <option value="encontrado_vivo">Encontrado vivo</option>
                  <option value="encontrado_fallecido">Encontrado fallecido</option>
                </select>
                {(formData.estado as string) !== "buscando" && (
                  <p className="text-xs text-marca-verde mt-1 font-medium">
                    {(formData.estado as string) === "encontrado_vivo" ? "Se marcará como encontrado vivo" : "Se marcará como encontrado fallecido"}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ========== COLABORADORES ========== */}
          {tipo === "colaboradores" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input type="text" value={(formData.nombre as string) || ""} onChange={(e) => set("nombre", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de ayuda *</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_AYUDA.map((t) => (
                    <button key={t.value} type="button" onClick={() => toggleTipoAyuda(t.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tipoAyudaSeleccion.includes(t.value) ? "bg-marca-azul text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación *</label>
                <input type="text" value={(formData.ubicacion as string) || ""} onChange={(e) => set("ubicacion", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidad</label>
                <input type="text" value={(formData.disponibilidad as string) || ""} onChange={(e) => set("disponibilidad", e.target.value)} placeholder="Ej: fines de semana, 24/7" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contacto *</label>
                <input type="text" value={(formData.contacto as string) || ""} onChange={(e) => set("contacto", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea value={(formData.descripcion as string) || ""} onChange={(e) => set("descripcion", e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.activo as boolean} onChange={(e) => set("activo", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-marca-azul/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-marca-verde"></div>
                </label>
                <div>
                  <p className="text-sm font-medium text-slate-700">Activo como colaborador</p>
                  <p className="text-xs text-slate-500">Desactiva si ya no puedes ayudar</p>
                </div>
              </div>
            </>
          )}

          {/* ========== RECURSOS ========== */}
          {tipo === "recursos" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                <select value={(formData.categoria as string) || ""} onChange={(e) => set("categoria", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white">
                  {CATEGORIAS_RECURSO.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
                <textarea value={(formData.descripcion as string) || ""} onChange={(e) => set("descripcion", e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zona *</label>
                <select value={(formData.zona as string) || ""} onChange={(e) => set("zona", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white">
                  {ZONAS_DB.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
                <input type="text" value={(formData.direccion as string) || ""} onChange={(e) => set("direccion", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Celular de contacto *</label>
                <input type="tel" value={(formData.celular_contacto as string) || ""} onChange={(e) => set("celular_contacto", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select value={(formData.estado as string) || "activo"} onChange={(e) => set("estado", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marca-azul/40 bg-white">
                  <option value="activo">Activo</option>
                  <option value="resuelto">Resuelto</option>
                </select>
                {(formData.estado as string) === "resuelto" && (
                  <p className="text-xs text-marca-verde mt-1 font-medium">Se marcará como resuelto en el feed</p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 bg-marca-dorado hover:opacity-90 disabled:opacity-50"
          >
            {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
