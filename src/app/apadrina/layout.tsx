import type { ReactNode } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Apadrina Venezuela",
  description: "Conectamos a personas que necesitan apoyo con padrinos dispuestos a ayudar.",
};

export default function ApadrinaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      {/* Header propio */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/apadrina" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#185FA5]" />
            <span className="text-sm font-bold text-slate-800">Apadrina Venezuela</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer propio */}
      <footer className="bg-slate-800 text-white mt-8">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-200">Apadrina Venezuela</p>
            <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed mt-2">
              Plataforma voluntaria para conectar a personas que necesitan apoyo con
              padrinos dispuestos a ayudar. No procesamos pagos ni verificamos identidades.
              Toda conexión ocurre bajo responsabilidad de las partes.
            </p>
          </div>
          <div className="flex items-center justify-center text-xs text-white/35">
            <Link href="/apadrina/aviso-legal" className="hover:text-white/60 transition underline">
              Aviso legal y privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
