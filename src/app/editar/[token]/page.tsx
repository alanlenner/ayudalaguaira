"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Camera,
  Check,
  Loader2,
  ArrowLeft,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { comprimirImagen } from "@/lib/image-utils";

const ZONAS = ["Naiguatá", "Caraballeda", "Catia La Mar", "Maiquetía"] as const;

interface Reporte {
  id: number;
  nombre: string;
  apellido: string;
  zona: string;
  telefono: string;
  foto_url: string | null;
  ultima_ubicacion: string | null;
  descripcion: string | null;
  estado: "buscando" | "encontrado_vivo" | "encontrado_fallecido";
  edit_token: string;
}

export default function EditarReporte() {
  const params = useParams();
  const token = params.token as string;

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Form
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [zona, setZona] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ultimaUbicacion, setUltimaUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<string>("buscando");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function cargar() {
      const { data, error: err } = await supabase
        .from("desaparecidos")
        .select("*")
        .eq("edit_token", token)
        .single();

      if (err || !data) {
        setError("No se encontró el reporte. Verifica que el enlace sea correcto.");
        setCargando(false);
        return;
      }

      const r = data as Reporte;
      setReporte(r);
      setNombre(r.nombre);
      setApellido(r.apellido);
      setZona(r.zona);
      setTelefono(r.telefono);
      setUltimaUbicacion(r.ultima_ubicacion || "");
      setDescripcion(r.descripcion || "");
      setEstado(r.estado);
      setFotoUrl(r.foto_url);
      setCargando(false);
    }
    cargar();
  }, [token]);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen no puede superar 10MB");
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporte) return;
    if (!nombre.trim() || !apellido.trim() || !telefono.trim()) {
      alert("Completa nombre, apellido y teléfono");
      return;
    }

    setGuardando(true);
    let nueva_foto_url = fotoUrl;

    if (fotoFile) {
      try {
        const comprimida = await comprimirImagen(fotoFile, 800, 0.7);
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("fotos-desaparecidos")
          .upload(fileName, comprimida, { contentType: "image/jpeg" });

        if (uploadError) {
          alert("Error al subir foto: " + uploadError.message);
          setGuardando(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("fotos-desaparecidos")
          .getPublicUrl(uploadData.path);
        nueva_foto_url = urlData.publicUrl;
      } catch {
        alert("Error al procesar la imagen");
        setGuardando(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("desaparecidos")
      .update({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        zona,
        telefono: telefono.trim(),
        foto_url: nueva_foto_url,
        ultima_ubicacion: ultimaUbicacion.trim() || null,
        descripcion: descripcion.trim() || null,
        estado,
      })
      .eq("edit_token", token);

    if (updateError) {
      alert("Error al guardar: " + updateError.message);
      setGuardando(false);
      return;
    }

    setGuardando(false);
    setExito(true);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Reporte no encontrado
          </h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-red-600 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Reporte actualizado
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Los cambios ya son visibles en el feed.
          </p>
          <a
            href="/"
            className="inline-block w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const fotoMostrar = fotoPreview || fotoUrl;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="hover:bg-white/10 p-1 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-lg font-bold">Editar reporte</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition"
          >
            {fotoMostrar ? (
              <div className="flex items-center gap-3">
                <img
                  src={fotoMostrar}
                  alt="Foto"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <p className="text-sm text-slate-500">Toca para cambiar</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-500">Subir foto</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFoto}
              className="hidden"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Zona <span className="text-red-500">*</span>
            </label>
            <select
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              required
            >
              {ZONAS.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Celular de contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Última ubicación */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Última ubicación conocida
            </label>
            <input
              type="text"
              value={ultimaUbicacion}
              onChange={(e) => setUltimaUbicacion(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción adicional
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="buscando">Buscando</option>
              <option value="encontrado_vivo">Encontrado vivo</option>
              <option value="encontrado_fallecido">Encontrado fallecido</option>
            </select>
            {estado !== "buscando" && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                {estado === "encontrado_vivo"
                  ? "Se marcará como encontrado vivo en el feed"
                  : "Se marcará como encontrado fallecido en el feed"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
