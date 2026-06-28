"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { APADRINA_CATEGORIAS, apadrinaCategoriaLabel, apadrinaCategoriaEmoji } from "@/lib/apadrina-constants";
import { Loader2, Check, X, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Solicitante = {
  id: string;
  nombre: string;
  apellido: string;
  ubicacion: string;
};

type Patrocinador = {
  id: string;
  nombre: string;
  categoria: string;
  capacidad_disponible: number;
  ubicacion: string | null;
  duracion_estimada: string | null;
  descripcion: string | null;
  contacto: string;
};

type Postulacion = {
  id: string;
  patrocinador_id: string;
  categoria: string;
  estado: string;
  created_at: string;
  apadrina_patrocinadores: {
    nombre: string;
    contacto: string;
    ubicacion: string | null;
  };
};

const ESTADO_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: "bg-amber-100", text: "text-amber-800", label: "Pendiente" },
  aprobada: { bg: "bg-green-100", text: "text-green-800", label: "Aprobada" },
  rechazada: { bg: "bg-red-100", text: "text-red-800", label: "Rechazada" },
  finalizada: { bg: "bg-slate-100", text: "text-slate-600", label: "Finalizada" },
};

export default function PanelSolicitante() {
  const params = useParams();
  const codigo = params.codigo as string;

  const [solicitante, setSolicitante] = useState<Solicitante | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Vista: "categorias" | "patrocinadores" | null
  const [vistaCategoria, setVistaCategoria] = useState<string | null>(null);
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [cargandoPats, setCargandoPats] = useState(false);
  const [postulando, setPostulando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data: sol } = await supabase
      .from("apadrina_solicitantes")
      .select("id, nombre, apellido, ubicacion")
      .eq("codigo_acceso", codigo)
      .single();

    if (!sol) {
      setError("Código de acceso inválido.");
      setCargando(false);
      return;
    }
    setSolicitante(sol);

    const { data: posts } = await supabase
      .from("apadrina_postulaciones")
      .select("id, patrocinador_id, categoria, estado, created_at, apadrina_patrocinadores(nombre, contacto, ubicacion)")
      .eq("solicitante_id", sol.id)
      .order("created_at", { ascending: false });

    setPostulaciones((posts as unknown as Postulacion[]) ?? []);
    setCargando(false);
  }, [codigo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const verPatrocinadores = async (cat: string) => {
    setVistaCategoria(cat);
    setCargandoPats(true);
    const { data } = await supabase
      .from("apadrina_patrocinadores")
      .select("id, nombre, categoria, capacidad_disponible, ubicacion, duracion_estimada, descripcion, contacto")
      .eq("categoria", cat)
      .eq("activo", true)
      .gt("capacidad_disponible", 0)
      .order("created_at", { ascending: true });

    setPatrocinadores((data as Patrocinador[]) ?? []);
    setCargandoPats(false);
  };

  const postularse = async (patrocinador: Patrocinador) => {
    if (!solicitante) return;
    // Check if already postulated
    const yaPostulado = postulaciones.some(
      (p) => p.patrocinador_id === patrocinador.id && (p.estado === "pendiente" || p.estado === "aprobada")
    );
    if (yaPostulado) {
      alert("Ya tienes una postulación activa con este padrino.");
      return;
    }

    setPostulando(patrocinador.id);
    const { error: err } = await supabase.from("apadrina_postulaciones").insert({
      solicitante_id: solicitante.id,
      patrocinador_id: patrocinador.id,
      categoria: patrocinador.categoria,
      estado: "pendiente",
    });

    if (err) {
      alert("Error: " + err.message);
      setPostulando(null);
      return;
    }
    await cargar();
    setPostulando(null);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#185FA5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-red-200 p-6 text-center space-y-3">
          <X className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-slate-700">{error}</p>
          <Link href="/apadrina" className="text-sm text-[#185FA5] underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  // Vista de patrocinadores de una categoría
  if (vistaCategoria) {
    const catObj = APADRINA_CATEGORIAS.find((c) => c.value === vistaCategoria);
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <button onClick={() => setVistaCategoria(null)} className="flex items-center gap-1 text-sm text-[#185FA5] font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver a categorías
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{catObj?.emoji}</span>
            <h2 className="text-lg font-semibold text-slate-800">{catObj?.label}</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">{catObj?.descripcion}</p>

          {cargandoPats ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : patrocinadores.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500">No hay padrinos disponibles en esta categoría por ahora.</p>
              <p className="text-xs text-slate-400 mt-1">Revisa más tarde.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patrocinadores.map((pat) => {
                const yaPostulado = postulaciones.some(
                  (p) => p.patrocinador_id === pat.id && (p.estado === "pendiente" || p.estado === "aprobada")
                );
                return (
                  <div key={pat.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{pat.nombre}</p>
                        {pat.ubicacion && <p className="text-xs text-slate-400">{pat.ubicacion}</p>}
                      </div>
                      <span className="text-xs bg-blue-50 text-[#185FA5] px-2 py-0.5 rounded-full font-medium">
                        {pat.capacidad_disponible} cupo{pat.capacidad_disponible !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {pat.descripcion && <p className="text-xs text-slate-500">{pat.descripcion}</p>}
                    {pat.duracion_estimada && (
                      <p className="text-xs text-slate-500"><span className="font-medium">Duración:</span> {pat.duracion_estimada}</p>
                    )}
                    {yaPostulado ? (
                      <p className="text-xs text-amber-600 font-medium">Ya tienes una postulación activa</p>
                    ) : (
                      <button
                        onClick={() => postularse(pat)}
                        disabled={postulando === pat.id}
                        className="w-full py-2 bg-[#185FA5] text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-1"
                      >
                        {postulando === pat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Postularme"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista principal: categorías + postulaciones
  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h1 className="text-lg font-semibold text-slate-800">
          Hola, {solicitante!.nombre} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explora las categorías de apoyo disponibles y postúlate solo a las que necesites.
        </p>
      </div>

      {/* Catálogo de categorías */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Categorías de apoyo</h2>
        <div className="space-y-2">
          {APADRINA_CATEGORIAS.map((cat) => {
            const misPostulaciones = postulaciones.filter((p) => p.categoria === cat.value);
            const activas = misPostulaciones.filter((p) => p.estado === "pendiente" || p.estado === "aprobada").length;
            return (
              <button
                key={cat.value}
                onClick={() => verPatrocinadores(cat.value)}
                className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-left"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{cat.label}</p>
                  <p className="text-xs text-slate-400 truncate">{cat.descripcion}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activas > 0 && (
                    <span className="text-xs bg-blue-50 text-[#185FA5] px-2 py-0.5 rounded-full font-medium">
                      {activas} activa{activas !== 1 ? "s" : ""}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mis postulaciones */}
      {postulaciones.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Mis postulaciones</h2>
          <div className="space-y-2">
            {postulaciones.map((post) => {
              const badge = ESTADO_BADGE[post.estado] ?? ESTADO_BADGE.pendiente;
              const pat = post.apadrina_patrocinadores;
              return (
                <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{apadrinaCategoriaEmoji(post.categoria)}</span>
                        <p className="text-sm font-medium text-slate-800">{apadrinaCategoriaLabel(post.categoria)}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Padrino: {pat.nombre}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  {post.estado === "aprobada" && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-800 mb-1">Contacto del padrino:</p>
                      <p className="text-xs text-green-700">{pat.contacto}</p>
                      {pat.ubicacion && <p className="text-xs text-green-600 mt-0.5">{pat.ubicacion}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
