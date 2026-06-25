"use client";

import { useState } from "react";
import { AlertTriangle, Search as SearchIcon, HandHeart, Package } from "lucide-react";
import DesaparecidosSection from "@/components/DesaparecidosSection";
import ColaboradoresSection from "@/components/ColaboradoresSection";
import RecursosSection from "@/components/RecursosSection";

type Seccion = "desaparecidos" | "colaboradores" | "recursos";

const TABS: { key: Seccion; label: string; icon: React.ReactNode }[] = [
  { key: "desaparecidos", label: "Desaparecidos", icon: <SearchIcon className="w-4 h-4" /> },
  { key: "colaboradores", label: "Colaboradores", icon: <HandHeart className="w-4 h-4" /> },
  { key: "recursos", label: "Recursos", icon: <Package className="w-4 h-4" /> },
];

export default function Home() {
  const [seccion, setSeccion] = useState<Seccion>("desaparecidos");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Ayuda La Guaira</h1>
              <p className="text-red-200 text-xs">Terremoto Junio 2025</p>
            </div>
          </div>
        </div>

        {/* Navegación de secciones */}
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex border-t border-red-500/30">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSeccion(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all relative ${
                  seccion === tab.key
                    ? "text-white"
                    : "text-red-200 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
                {seccion === tab.key && (
                  <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-white rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {seccion === "desaparecidos" && <DesaparecidosSection />}
        {seccion === "colaboradores" && <ColaboradoresSection />}
        {seccion === "recursos" && <RecursosSection />}
      </div>
    </div>
  );
}
