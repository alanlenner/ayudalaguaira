"use client";

import { Heart } from "lucide-react";

interface HeroSectionProps {
  onReportar: () => void;
}

export default function HeroSection({ onReportar }: HeroSectionProps) {
  return (
    <section className="pt-8 pb-6">
      {/* Context line */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="text-xs font-medium text-slate-400 tracking-wide">
          Sismo del 24 de junio · La Guaira
        </span>
      </div>

      {/* Title */}
      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 leading-[1.2] mb-4">
        Ninguna familia debería buscar sola
      </h2>

      {/* Description */}
      <p className="text-slate-500 text-[15px] leading-relaxed mb-6 max-w-lg">
        Publica el nombre de quien buscas, la zona donde se le vio y un teléfono
        de contacto. No hay formularios largos ni aprobación — el reporte queda
        visible de inmediato. Si ya lograste ubicar a esa persona, actualízalo
        para que otros sepan que está a salvo.
      </p>

      {/* CTA */}
      <button
        onClick={onReportar}
        className="bg-marca-dorado hover:opacity-90 text-white py-3.5 px-8 rounded-2xl font-medium text-sm transition-all inline-flex items-center gap-2"
      >
        <Heart className="w-4 h-4" />
        Reportar a alguien que buscamos
      </button>

      {/* Support text */}
      <p className="text-xs text-slate-400 mt-3">
        Toma menos de un minuto. Solo necesitas nombre, zona y un número de contacto.
      </p>
    </section>
  );
}
