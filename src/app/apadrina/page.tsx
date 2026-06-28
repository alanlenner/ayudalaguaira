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
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-[#185FA5] to-[#134b84] text-white rounded-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="relative p-6 sm:p-8 text-center space-y-5">
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logo-banner/logoguaira.png`}
            alt="Apadrina Venezuela"
            className="h-14 sm:h-16 w-auto mx-auto drop-shadow-lg"
          />

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              Apadrina Venezuela
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Conectamos a quienes necesitan apoyo con padrinos dispuestos a ayudar. Tú eliges cómo.
            </p>
          </div>

          {/* Orbita */}
          <div className="py-2">
            <ApadrinaOrbita
              centro={{ nombre: "Tú", emoji: "🙋" }}
              nodos={NODOS_DEMO}
            />
          </div>

          <p className="text-blue-200/60 text-[11px]">
            Salud mental · alimentos · albergue · asesoría legal · y más
          </p>

          {/* CTAs dentro del hero */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto pt-1">
            <Link
              href="/apadrina/registro-solicitante"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-[#185FA5] rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow-lg shadow-black/10"
            >
              <Heart className="w-4 h-4" />
              Necesito apoyo
            </Link>
            <Link
              href="/apadrina/registro-patrocinador"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#BA7517] text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-black/10"
            >
              <HandHeart className="w-4 h-4" />
              Quiero ser padrino
            </Link>
          </div>
        </div>
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

      {/* Ya tienes cuenta */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 text-center space-y-3">
        <p className="text-sm font-medium text-slate-700">¿Ya tienes tu código de acceso?</p>
        <p className="text-xs text-slate-500">Ingresa a tu panel con el enlace que guardaste al registrarte.</p>
      </div>
    </div>
  );
}
