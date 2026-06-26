"use client";

import { useState } from "react";
import { Heart, Search as SearchIcon, HandHeart, Package, Brain } from "lucide-react";
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

  const irAColaboradoresSaludMental = () => {
    setSeccion("colaboradores");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

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

      {/* Hero principal */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white">
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-8">
          {/* Apoyo emocional */}
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Brain className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold leading-[1.2] mb-2">
                Estás a salvo. Respira.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                Lo que sientes es real y es válido. El miedo, la angustia, la incertidumbre — no tienes que cargar con eso solo. 
                Hay profesionales de salud mental dispuestos a escucharte, sin costo, sin trámites. 
                Para víctimas, familiares, voluntarios, expatriados — para todos.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-8">
            <button
              onClick={irAColaboradoresSaludMental}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Necesito apoyo emocional
            </button>
            <button
              onClick={irAColaboradoresSaludMental}
              className="flex-1 bg-white/15 hover:bg-white/25 text-white py-3 px-5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <HandHeart className="w-4 h-4" />
              Soy psicólogo y quiero ayudar
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="font-serif text-lg sm:text-xl font-bold leading-[1.2] mb-2">
              Ninguna familia debería buscar sola
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Publica el nombre de quien buscas, la zona y un teléfono de contacto.
              No hay trámites — el reporte queda visible de inmediato.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {seccion === "desaparecidos" && <DesaparecidosSection />}
        {seccion === "colaboradores" && <ColaboradoresSection />}
        {seccion === "recursos" && <RecursosSection />}
      </div>

      <Footer />
    </div>
  );
}

