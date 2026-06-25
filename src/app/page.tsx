"use client";

import { useState } from "react";
import { Heart, Search as SearchIcon, HandHeart, Package } from "lucide-react";
import DesaparecidosSection from "@/components/DesaparecidosSection";
import ColaboradoresSection from "@/components/ColaboradoresSection";
import RecursosSection from "@/components/RecursosSection";

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
      {/* Header */}
      <header className="bg-marca-azul text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 flex-shrink-0" />
            <div>
              <h1 className="text-lg font-medium leading-tight">
                Venezuela unida — La Guaira
              </h1>
              <p className="text-marca-azul-claro text-xs">
                Buscando a los nuestros, juntos
              </p>
            </div>
          </div>
        </div>

        {/* Navegación de secciones */}
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex border-t border-white/15">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSeccion(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all relative ${
                  seccion === tab.key
                    ? "text-white"
                    : "text-marca-azul-claro hover:text-white"
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
