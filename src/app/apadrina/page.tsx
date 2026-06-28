import Link from "next/link";
import { Heart, HandHeart, Users, Shield } from "lucide-react";
import ApadrinaOrbita from "@/components/ApadrinaOrbita";

const NODOS_DEMO = [
  { id: "1", emoji: "🧠", label: "Salud mental", sublabel: "Psicología", activo: true },
  { id: "2", emoji: "💰", label: "Financiero", sublabel: "Donaciones", activo: true },
  { id: "3", emoji: "🚗", label: "Transporte", sublabel: "Logística", activo: false },
  { id: "4", emoji: "🍞", label: "Alimentos", sublabel: "Despensa", activo: true },
  { id: "5", emoji: "👕", label: "Ropa", sublabel: "Abrigo", activo: false },
  { id: "6", emoji: "🏠", label: "Albergue", sublabel: "Temporal", activo: true },
  { id: "7", emoji: "📊", label: "Consejero", sublabel: "Finanzas", activo: false },
  { id: "8", emoji: "⚖️", label: "Legal", sublabel: "Trámites", activo: true },
];

export default function ApadrinaLanding() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#185FA5] to-[#134b84] text-white rounded-2xl p-6 sm:p-8 text-center space-y-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
          Apadrina Venezuela
        </h1>
        <p className="text-blue-100 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Conectamos a personas que necesitan apoyo con padrinos dispuestos a ayudar.
        </p>

        <div className="py-4">
          <ApadrinaOrbita
            centro={{ nombre: "Tú", emoji: "🙋" }}
            nodos={NODOS_DEMO}
          />
        </div>

        <p className="text-blue-200 text-xs">
          Salud mental, alimentos, albergue, asesoría legal y más.
        </p>
      </div>

      {/* Cómo funciona */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 text-center">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center space-y-2">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-[#185FA5]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">1. Regístrate</h3>
            <p className="text-xs text-slate-500">Como solicitante o como padrino. Solo necesitas tu nombre y contacto.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center space-y-2">
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <HandHeart className="w-6 h-6 text-[#1D9E75]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">2. Conéctate</h3>
            <p className="text-xs text-slate-500">Los solicitantes exploran padrinos disponibles y se postulan a las categorías que necesiten.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center space-y-2">
            <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-[#BA7517]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">3. Recibe apoyo</h3>
            <p className="text-xs text-slate-500">El padrino aprueba la postulación y coordinan directamente entre ambos.</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/apadrina/registro-solicitante"
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          <Heart className="w-4 h-4" />
          Necesito apoyo
        </Link>
        <Link
          href="/apadrina/registro-patrocinador"
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#BA7517] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          <HandHeart className="w-4 h-4" />
          Quiero ser padrino
        </Link>
      </div>

      {/* Ya tienes cuenta */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 text-center space-y-3">
        <p className="text-sm font-medium text-slate-700">¿Ya tienes tu código de acceso?</p>
        <p className="text-xs text-slate-500">Ingresa a tu panel con el enlace que guardaste al registrarte.</p>
      </div>
    </div>
  );
}
