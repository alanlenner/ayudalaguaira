"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Camera,
  Heart,
  Share2,
  Phone,
  Loader2,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const SECCIONES = ["Naiguatá", "Caraballeda", "Catia La Mar"] as const;
type Seccion = (typeof SECCIONES)[number];

interface Publicacion {
  id: number;
  nombre: string;
  edad: string | null;
  descripcion: string | null;
  seccion: Seccion;
  foto_url: string | null;
  telefono: string;
  created_at: string;
  encontrado: boolean;
}

function tiempoRelativo(fecha: string) {
  const ahora = new Date();
  const pub = new Date(fecha);
  const diff = ahora.getTime() - pub.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `Hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias}d`;
}

export default function Home() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [seccionActiva, setSeccionActiva] = useState<Seccion>("Naiguatá");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [yaPublico, setYaPublico] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargarPublicaciones = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("desaparecidos")
      .select("*")
      .eq("seccion", seccionActiva)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPublicaciones(data as Publicacion[]);
    }
    setCargando(false);
  }, [seccionActiva]);

  useEffect(() => {
    cargarPublicaciones();
  }, [cargarPublicaciones]);

  useEffect(() => {
    const publicado = localStorage.getItem("ayuda_laguaira_publicado");
    if (publicado === "true") {
      setYaPublico(true);
    }
  }, []);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar 5MB");
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      alert("Por favor completa Nombre y Teléfono");
      return;
    }

    setEnviando(true);
    let foto_url: string | null = null;

    // Subir foto a Supabase Storage
    if (fotoFile) {
      const ext = fotoFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("fotos-desaparecidos")
        .upload(fileName, fotoFile, { contentType: fotoFile.type });

      if (uploadError) {
        alert("Error al subir la foto: " + uploadError.message);
        setEnviando(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos-desaparecidos")
        .getPublicUrl(uploadData.path);
      foto_url = urlData.publicUrl;
    }

    // Insertar en la tabla
    const { error } = await supabase.from("desaparecidos").insert({
      nombre: nombre.trim(),
      edad: edad.trim() || null,
      descripcion: descripcion.trim() || null,
      seccion: seccionActiva,
      foto_url,
      telefono: telefono.trim(),
      encontrado: false,
    });

    if (error) {
      alert("Error al publicar: " + error.message);
      setEnviando(false);
      return;
    }

    localStorage.setItem("ayuda_laguaira_publicado", "true");
    setYaPublico(true);
    setMostrarFormulario(false);
    setNombre("");
    setEdad("");
    setDescripcion("");
    setTelefono("");
    setFotoFile(null);
    setFotoPreview(null);
    setEnviando(false);
    cargarPublicaciones();
  };

  const toggleEncontrado = async (id: number, actual: boolean) => {
    await supabase
      .from("desaparecidos")
      .update({ encontrado: !actual })
      .eq("id", id);
    cargarPublicaciones();
  };

  const compartir = (pub: Publicacion) => {
    const texto = `🔍 PERSONA DESAPARECIDA - Terremoto La Guaira\n\nNombre: ${pub.nombre}\nEdad: ${pub.edad || "No especificada"}\nZona: ${pub.seccion}\nContacto: ${pub.telefono}\n${pub.descripcion ? `\nDescripción: ${pub.descripcion}` : ""}\n\n¡Ayúdanos a encontrarle!`;
    if (navigator.share) {
      navigator.share({ title: "Persona Desaparecida", text: texto });
    } else {
      navigator.clipboard.writeText(texto);
      alert("Información copiada al portapapeles");
    }
  };

  const publicacionesFiltradas = publicaciones.filter((p) => {
    if (!busqueda) return true;
    return (
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const totalEncontrados = publicaciones.filter((p) => p.encontrado).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                Ayuda La Guaira
              </h1>
              <p className="text-red-100 text-sm">
                Personas desaparecidas · Terremoto 2025
              </p>
            </div>
          </div>
        </div>

        {/* Tabs de secciones */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex border-t border-red-500/30">
            {SECCIONES.map((sec) => (
              <button
                key={sec}
                onClick={() => setSeccionActiva(sec)}
                className={`flex-1 py-3 text-sm font-medium text-center transition-all relative ${
                  seccionActiva === sec
                    ? "text-white"
                    : "text-red-200 hover:text-white"
                }`}
              >
                {sec}
                {seccionActiva === sec && (
                  <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-white rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Barra de estadísticas */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4" />
              <strong className="text-slate-900">{publicaciones.length}</strong>{" "}
              reportados en {seccionActiva}
            </span>
            <span className="text-slate-600">
              <strong className="text-green-600">{totalEncontrados}</strong>{" "}
              encontrados
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Feed */}
        {cargando ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Cargando reportes...</p>
          </div>
        ) : publicacionesFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">
              No hay reportes en {seccionActiva}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Sé el primero en reportar una persona desaparecida
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {publicacionesFiltradas.map((pub) => (
              <article
                key={pub.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition hover:shadow-md ${
                  pub.encontrado
                    ? "border-green-200 bg-green-50/30"
                    : "border-slate-200"
                }`}
              >
                {pub.encontrado && (
                  <div className="bg-green-500 text-white text-center py-1.5 text-sm font-medium">
                    PERSONA ENCONTRADA
                  </div>
                )}
                {pub.foto_url && (
                  <img
                    src={pub.foto_url}
                    alt={pub.nombre}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {pub.nombre}
                      </h3>
                      {pub.edad && (
                        <span className="text-sm text-slate-500">
                          {pub.edad} años
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                      <MapPin className="w-3 h-3" />
                      {pub.seccion}
                    </span>
                  </div>

                  {pub.descripcion && (
                    <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                      {pub.descripcion}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Phone className="w-3.5 h-3.5" />
                    <a
                      href={`tel:${pub.telefono}`}
                      className="text-red-600 font-medium hover:underline"
                    >
                      {pub.telefono}
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {tiempoRelativo(pub.created_at)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEncontrado(pub.id, pub.encontrado)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          pub.encontrado
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        {pub.encontrado ? "Encontrado" : "Marcar encontrado"}
                      </button>
                      <button
                        onClick={() => compartir(pub)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-blue-100 hover:text-blue-700 transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Botón flotante */}
      <button
        onClick={() => {
          if (yaPublico) {
            alert(
              "Ya realizaste una publicación. Solo se permite una por persona."
            );
            return;
          }
          setMostrarFormulario(true);
        }}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-lg">Reportar Desaparecido</h2>
                <p className="text-xs text-slate-500">
                  Sección: {seccionActiva}
                </p>
              </div>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Foto */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition"
              >
                {fotoPreview ? (
                  <div className="relative">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl mx-auto"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Toca para cambiar
                    </p>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      Subir foto de la persona
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Máximo 5MB · JPG, PNG
                    </p>
                  </>
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
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre y apellido"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Edad */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Edad aproximada
                </label>
                <input
                  type="text"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  placeholder="Ej: 35"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono de contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="0412-1234567"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
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
                  placeholder="Contextura, ropa que vestía, lugar exacto donde fue visto por última vez..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  "Publicar Reporte"
                )}
              </button>

              <p className="text-xs text-slate-400 text-center">
                Solo se permite una publicación por dispositivo
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
