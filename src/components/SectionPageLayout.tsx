"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Search as SearchIcon, HandHeart, Brain, LifeBuoy, Network, Plus, AlertTriangle } from "lucide-react";
import Footer from "./Footer";

type Seccion = "desaparecidos" | "colaboradores" | "ayuda" | "red";

const TABS: Array<{ key: Seccion; label: string; href: string; icon: ReactNode }> = [
  { key: "desaparecidos", label: "Buscamos", href: "/desaparecidos", icon: <SearchIcon className="w-4 h-4" /> },
  { key: "colaboradores", label: "Colaborar", href: "/colaboradores", icon: <HandHeart className="w-4 h-4" /> },
  { key: "ayuda", label: "Ayuda", href: "/ayuda", icon: <LifeBuoy className="w-4 h-4" /> },
  { key: "red", label: "Red", href: "/red", icon: <Network className="w-4 h-4" /> },
];

const CTA_CONFIG: Record<Seccion, { label: string; href: string; icon: ReactNode; event?: string }> = {
  desaparecidos: { label: "Reportar", href: "/desaparecidos?reportar=1", icon: <AlertTriangle className="w-5 h-5" />, event: "desaparecidos:abrir-formulario" },
  colaboradores: { label: "Colaborar", href: "/colaboradores", icon: <Plus className="w-5 h-5" />, event: "colaboradores:abrir-formulario" },
  ayuda: { label: "Colaborar", href: "/colaboradores?registro=1", icon: <Plus className="w-5 h-5" /> },
  red: { label: "Reportar", href: "/desaparecidos?reportar=1", icon: <AlertTriangle className="w-5 h-5" /> },
};

type SectionPageLayoutProps = {
  currentSection: Seccion;
  children: ReactNode;
};

export default function SectionPageLayout({ currentSection, children }: SectionPageLayoutProps) {
  const activeTabClass =
    currentSection === "desaparecidos" ? "text-marca-desaparecidos" : "text-marca-azul";
  const activeTabIndicatorClass =
    currentSection === "desaparecidos" ? "bg-marca-desaparecidos" : "bg-marca-azul";

  const cta = CTA_CONFIG[currentSection];
  const leftTabs = TABS.filter(t => t.key === "desaparecidos" || t.key === "colaboradores");
  const rightTabs = TABS.filter(t => t.key === "ayuda" || t.key === "red");

  return (
    <div className="min-h-screen bg-marca-fondo pb-20 sm:pb-0">
      {/* Top bar — always visible */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link href="/desaparecidos" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logo-banner/logoguaira.png`}
              alt="Venezuela unida — La Guaira"
              className="h-7 w-auto flex-shrink-0"
            />
            <span className="text-sm font-semibold text-slate-800 hidden sm:inline">Venezuela unida — La Guaira</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Sismo 24 jun
          </div>
        </div>
      </div>

      {/* Desktop tabs — hidden on mobile */}
      <div className="hidden sm:block bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex" aria-label="Secciones principales">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all relative ${
                  currentSection === tab.key
                    ? activeTabClass
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.icon}
                {tab.label}
                {currentSection === tab.key && (
                  <div className={`absolute bottom-0 left-4 right-4 h-[2.5px] rounded-t-full ${activeTabIndicatorClass}`} />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {currentSection === "desaparecidos" && (
        <div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white">
          <div className="max-w-3xl mx-auto px-4 pt-8 pb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logo-banner/bannerguaira.png`}
              alt="Venezuela unida — La Guaira"
              className="w-full max-w-md mx-auto mb-6 rounded-xl"
            />

            <div className="flex flex-col gap-2 mb-8">
              <Link
                href="/desaparecidos?reportar=1"
                className="hero-action-button w-full rounded-xl bg-[#16A34A] font-semibold text-white transition-all flex items-center justify-center hover:bg-[#15803D]"
              >
                + Reportar a alguien
              </Link>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/colaboradores?registro=1"
                  className="hero-action-button flex-1 rounded-xl border border-white/30 bg-white font-medium text-slate-900 transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  <HandHeart className="w-4 h-4" />
                  Quiero ayudar
                </Link>
                <Link
                  href="/colaboradores"
                  className="hero-action-button flex-1 rounded-xl bg-marca-azul font-medium text-white transition-all flex items-center justify-center gap-2 hover:bg-marca-azul-oscuro"
                >
                  <Heart className="w-4 h-4" />
                  Necesito ayuda
                </Link>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="font-serif text-lg sm:text-xl font-bold leading-[1.2] mb-2">
                Juntos encontramos más. Publica un reporte y ayuda a difundir su búsqueda.
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
                Publica el nombre de quien buscas, la zona y un teléfono de contacto.
                No hay trámites — el reporte queda visible de inmediato.
              </p>
            </div>
          </div>
        </div>
      )}

      {children}

      <Footer ayudaHref="/ayuda" reportarHref="/desaparecidos?reportar=1" />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-slate-200 safe-bottom" aria-label="Navegación móvil">
        <div className="grid grid-cols-5 items-end pt-1.5 pb-2">
          {leftTabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-all ${
                currentSection === tab.key ? activeTabClass : "text-slate-400"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">{tab.icon}</span>
              {tab.label}
            </Link>
          ))}

          <button
            onClick={() => {
              if (cta.event) {
                window.dispatchEvent(new CustomEvent(cta.event));
              } else {
                window.location.href = cta.href;
              }
            }}
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <span className="w-14 h-14 rounded-full bg-white text-marca-azul border-2 border-marca-azul flex items-center justify-center shadow-lg shadow-marca-azul/20 ring-4 ring-white">
              {cta.icon}
            </span>
            <span className="text-[10px] font-semibold text-marca-azul">{cta.label}</span>
          </button>

          {rightTabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-all ${
                currentSection === tab.key ? activeTabClass : "text-slate-400"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
