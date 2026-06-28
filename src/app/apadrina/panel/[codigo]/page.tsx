"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apadrinaCategoriaLabel, apadrinaCategoriaEmoji } from "@/lib/apadrina-constants";
import { Loader2, Check, X, UserCheck, UserX, RotateCcw } from "lucide-react";
import Link from "next/link";

type PatrocinadorData = {
  id: string;
  nombre: string;
  categoria: string;
  capacidad_total: number;
  capacidad_disponible: number;
  ubicacion: string | null;
  duracion_estimada: string | null;
  contacto: string;
  descripcion: string | null;
  activo: boolean;
};

type PostulacionRecibida = {
  id: string;
  solicitante_id: string;
  categoria: string;
  estado: string;
  created_at: string;
  updated_at: string;
  apadrina_solicitantes: {
    nombre: string;
    apellido: string;
    ubicacion: string;
    celular_contacto: string;
    descripcion_situacion: string | null;
  };
};

export default function PanelPatrocinador() {
  const params = useParams();
  const codigo = params.codigo as string;

  const [patrocinador, setPatrocinador] = useState<PatrocinadorData | null>(null);
  const [postulaciones, setPostulaciones] = useState<PostulacionRecibida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data: pat } = await supabase
      .from("apadrina_patrocinadores")
      .select("id, nombre, categoria, capacidad_total, capacidad_disponible, ubicacion, duracion_estimada, contacto, descripcion, activo")
      .eq("codigo_acceso", codigo)
      .single();

    if (!pat) {
      setError("Código de acceso inválido.");
      setCargando(false);
      return;
    }
    setPatrocinador(pat);

    const { data: posts } = await supabase
      .from("apadrina_postulaciones")
      .select("id, solicitante_id, categoria, estado, created_at, updated_at, apadrina_solicitantes(nombre, apellido, ubicacion, celular_contacto, descripcion_situacion)")
      .eq("patrocinador_id", pat.id)
      .order("created_at", { ascending: false });

    setPostulaciones((posts as unknown as PostulacionRecibida[]) ?? []);
    setCargando(false);
  }, [codigo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarEstado = async (postId: string, nuevoEstado: "aprobada" | "rechazada" | "finalizada") => {
    if (!patrocinador) return;
    setProcesando(postId);

    const { error: err } = await supabase
      .from("apadrina_postulaciones")
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq("id", postId);

    if (err) {
      alert("Error: " + err.message);
      setProcesando(null);
      return;
    }

    // Recalcular capacidad
    let delta = 0;
    if (nuevoEstado === "aprobada") delta = -1;
    if (nuevoEstado === "finalizada") delta = 1;

    if (delta !== 0) {
      const nuevaCapacidad = Math.max(0, patrocinador.capacidad_disponible + delta);
      await supabase
        .from("apadrina_patrocinadores")
        .update({ capacidad_disponible: nuevaCapacidad })
        .eq("id", patrocinador.id);
    }

    await cargar();
    setProcesando(null);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#BA7517]" />
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

  const pendientes = postulaciones.filter((p) => p.estado === "pendiente");
  const aprobadas = postulaciones.filter((p) => p.estado === "aprobada");
  const otras = postulaciones.filter((p) => p.estado === "rechazada" || p.estado === "finalizada");

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Info del padrino */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{apadrinaCategoriaEmoji(patrocinador!.categoria)}</span>
          <h1 className="text-lg font-semibold text-slate-800">{patrocinador!.nombre}</h1>
        </div>
        <p className="text-sm text-slate-500">{apadrinaCategoriaLabel(patrocinador!.categoria)}</p>
        <div className="flex gap-4 mt-3">
          <div className="text-center">
            <p className="text-xl font-bold text-[#185FA5]">{patrocinador!.capacidad_disponible}</p>
            <p className="text-[10px] text-slate-400">Disponibles</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-300">{patrocinador!.capacidad_total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#1D9E75]">{aprobadas.length}</p>
            <p className="text-[10px] text-slate-400">Activos</p>
          </div>
        </div>
      </div>

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            Postulaciones pendientes ({pendientes.length})
          </h2>
          <div className="space-y-3">
            {pendientes.map((post) => {
              const sol = post.apadrina_solicitantes;
              return (
                <div key={post.id} className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{sol.nombre} {sol.apellido}</p>
                    <p className="text-xs text-slate-500">{sol.ubicacion}</p>
                    {sol.descripcion_situacion && (
                      <p className="text-xs text-slate-500 mt-1 italic">"{sol.descripcion_situacion}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => actualizarEstado(post.id, "aprobada")}
                      disabled={procesando === post.id || patrocinador!.capacidad_disponible <= 0}
                      className="flex-1 py-2 bg-[#1D9E75] text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-1"
                    >
                      {procesando === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><UserCheck className="w-3.5 h-3.5" /> Aprobar</>}
                    </button>
                    <button
                      onClick={() => actualizarEstado(post.id, "rechazada")}
                      disabled={procesando === post.id}
                      className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-50 transition flex items-center justify-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                  {patrocinador!.capacidad_disponible <= 0 && (
                    <p className="text-xs text-red-500">Sin cupos disponibles. Finaliza un apoyo activo para liberar un cupo.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aprobadas (activas) */}
      {aprobadas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Apoyos activos ({aprobadas.length})
          </h2>
          <div className="space-y-3">
            {aprobadas.map((post) => {
              const sol = post.apadrina_solicitantes;
              return (
                <div key={post.id} className="bg-white border border-green-200 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{sol.nombre} {sol.apellido}</p>
                    <p className="text-xs text-slate-500">{sol.ubicacion}</p>
                    <p className="text-xs text-slate-500 mt-1">Contacto: {sol.celular_contacto}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("¿Finalizar este apoyo? Se liberará un cupo.")) {
                        actualizarEstado(post.id, "finalizada");
                      }
                    }}
                    disabled={procesando === post.id}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-50 transition flex items-center justify-center gap-1"
                  >
                    {procesando === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><RotateCcw className="w-3.5 h-3.5" /> Finalizar apoyo / liberar cupo</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      {otras.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">Historial ({otras.length})</h2>
          <div className="space-y-2">
            {otras.map((post) => {
              const sol = post.apadrina_solicitantes;
              return (
                <div key={post.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600">{sol.nombre} {sol.apellido}</p>
                    <p className="text-[10px] text-slate-400">{sol.ubicacion}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    post.estado === "finalizada" ? "bg-slate-100 text-slate-500" : "bg-red-100 text-red-700"
                  }`}>
                    {post.estado === "finalizada" ? "Finalizada" : "Rechazada"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {postulaciones.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">Aún no has recibido postulaciones.</p>
          <p className="text-xs text-slate-400 mt-1">Cuando alguien se postule, aparecerá aquí.</p>
        </div>
      )}
    </div>
  );
}
