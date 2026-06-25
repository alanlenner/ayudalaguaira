"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Metricas {
  total: number;
  buscando: number;
  encontrados: number;
}

export default function MetricasVivas() {
  const [metricas, setMetricas] = useState<Metricas>({ total: 0, buscando: 0, encontrados: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const [{ count: total }, { count: buscando }, { count: encontrados }] = await Promise.all([
        supabase.from("desaparecidos").select("*", { count: "exact", head: true }),
        supabase.from("desaparecidos").select("*", { count: "exact", head: true }).eq("estado", "buscando"),
        supabase.from("desaparecidos").select("*", { count: "exact", head: true }).eq("estado", "encontrado_vivo"),
      ]);
      setMetricas({
        total: total ?? 0,
        buscando: buscando ?? 0,
        encontrados: encontrados ?? 0,
      });
      setCargando(false);
    }
    cargar();

    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  if (cargando) return null;

  const hayDatos = metricas.total > 0;
  if (!hayDatos) return null;

  return (
    <div className="flex items-baseline gap-1 flex-wrap text-sm text-slate-500 mb-5 leading-relaxed">
      <span className="text-marca-azul font-semibold tabular-nums">{metricas.total}</span>
      <span>{metricas.total === 1 ? "persona reportada" : "personas reportadas"}</span>
      <span className="text-slate-300 mx-0.5">·</span>
      <span className="text-amber-600 font-semibold tabular-nums">{metricas.buscando}</span>
      <span>sin contacto</span>
      <span className="text-slate-300 mx-0.5">·</span>
      <span className="text-marca-verde font-semibold tabular-nums">{metricas.encontrados}</span>
      <span>{metricas.encontrados === 1 ? "localizada" : "localizadas"} a salvo</span>
    </div>
  );
}
