"use client";

import { useState } from "react";
import { Heart, Search as SearchIcon, HandHeart, Package } from "lucide-react";
import DesaparecidosSection from "@/components/DesaparecidosSection";
import ColaboradoresSection from "@/components/ColaboradoresSection";
import RecursosSection from "@/components/RecursosSection";
import Footer from "@/components/Footer";

type Seccion = "desaparecidos" | "colaboradores" | "recursos";

const TABS: { key: Seccion; label: string; icon: React.ReactNode }[] = [
  { key: "desaparecidos", label: "Buscamos", icon: <SearchIcon className="w-4 h-4" /> },
  { key: "colaboradores", label: "Colaborar", icon: <HandHeart className="w-4 h-4" /> },
  { key: "recursos", label: "Recursos", icon: <Package className="w-4 h-4" /> },
];

export default function Home() {
  const [seccion, setSeccion] = useState<Seccion>("desaparecidos");

  return (
    <div className="min-h-screen bg-marca-fondo">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-marca-azul flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Venezuela unida — La Guaira</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Sismo 24 jun
          </div>
        </div>
      </div>

      {/* Section tabs — visually distinct nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSeccion(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all relative ${
                  seccion === tab.key
                    ? "text-marca-azul"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.icon}
                {tab.label}
                {seccion === tab.key && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2.5px] bg-marca-azul rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero — only on desaparecidos */}
      {seccion === "desaparecidos" && (
        <div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white">
          <div className="max-w-3xl mx-auto px-4 pt-8 pb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-[1.2] mb-3">
              Ninguna familia debería buscar sola
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-lg mb-4">
              Publica el nombre de quien buscas, la zona y un teléfono de contacto.
              No hay trámites — el reporte queda visible de inmediato. Si ya lograste
              ubicar a esa persona, actualízalo para que otros sepan que está a salvo.
            </p>
            <p className="text-slate-500 text-xs">
              Toma menos de un minuto. Solo necesitas nombre, zona y un número de contacto.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4">
        {seccion === "desaparecidos" && <DesaparecidosSection />}
        {seccion === "colaboradores" && <ColaboradoresSection />}
        {seccion === "recursos" && <RecursosSection />}
      </div>

      <Footer />
    </div>
  );
}
