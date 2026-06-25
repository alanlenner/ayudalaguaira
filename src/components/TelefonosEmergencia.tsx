"use client";

import { Phone, MessageCircle } from "lucide-react";

interface Linea {
  numero: string;
  entidad: string;
  tipo?: "tel" | "wa";
}

const LINEAS_DIRECTAS: Linea[] = [
  { numero: "0212-332-2165", entidad: "Bomberos La Guaira" },
  { numero: "0424-207-5335", entidad: "Protección Civil La Guaira" },
  { numero: "0412-999-4426", entidad: "Seguridad y denuncias", tipo: "wa" },
  { numero: "0800-724-8451", entidad: "Protección Civil nacional" },
];

const LINEAS_CORTAS: Linea[] = [
  { numero: "911", entidad: "Atención inmediata" },
  { numero: "171", entidad: "CANTV" },
  { numero: "112", entidad: "Digitel" },
  { numero: "*1", entidad: "Movilnet" },
];

interface Props {
  variante?: "claro" | "oscuro";
}

function limpiarNumero(n: string) {
  return n.replace(/[^0-9*#]/g, "");
}

export default function TelefonosEmergencia({ variante = "claro" }: Props) {
  const esOscuro = variante === "oscuro";

  const cardClass = esOscuro
    ? "bg-white/10 hover:bg-white/15"
    : "bg-white border border-slate-200 hover:bg-slate-50";
  const numClassBig = esOscuro ? "text-white" : "text-slate-700";
  const numClassSmall = esOscuro ? "text-white" : "text-marca-azul";
  const subClass = esOscuro ? "text-marca-azul-claro" : "text-slate-400";

  return (
    <div className={esOscuro ? "" : "mb-5"}>
      <div className="flex items-center gap-2 mb-3">
        <Phone className={`w-4 h-4 ${esOscuro ? "text-marca-azul-claro" : "text-marca-azul"}`} />
        <h3 className={`text-sm font-medium ${esOscuro ? "text-white" : "text-slate-700"}`}>
          Si necesitas ayuda inmediata
        </h3>
      </div>

      {/* Líneas directas de La Guaira */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {LINEAS_DIRECTAS.map((t, i) => {
          const href = t.tipo === "wa"
            ? `https://wa.me/58${limpiarNumero(t.numero).slice(1)}`
            : `tel:${limpiarNumero(t.numero)}`;
          return (
            <a
              key={i}
              href={href}
              target={t.tipo === "wa" ? "_blank" : undefined}
              rel={t.tipo === "wa" ? "noopener noreferrer" : undefined}
              className={`rounded-xl p-3 text-center transition ${cardClass}`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {t.tipo === "wa" && <MessageCircle className={`w-3.5 h-3.5 ${subClass}`} />}
                <p className={`text-sm font-medium tabular-nums ${numClassBig}`}>
                  {t.numero}
                </p>
              </div>
              <p className={`text-[10px] leading-tight mt-1 ${subClass}`}>
                {t.entidad}
              </p>
            </a>
          );
        })}
      </div>

      {/* Líneas cortas nacionales */}
      <div className="grid grid-cols-4 gap-2">
        {LINEAS_CORTAS.map((t) => (
          <a
            key={t.numero}
            href={`tel:${limpiarNumero(t.numero)}`}
            className={`rounded-xl p-2 text-center transition ${cardClass}`}
          >
            <p className={`text-base font-medium tabular-nums ${numClassSmall}`}>
              {t.numero}
            </p>
            <p className={`text-[10px] leading-tight mt-0.5 ${subClass}`}>
              {t.entidad}
            </p>
          </a>
        ))}
      </div>

      {/* Disclaimer */}
      <p className={`text-[10px] mt-2 ${esOscuro ? "text-white/30" : "text-slate-300"}`}>
        Estos números deben confirmarse antes de cada uso. Pueden cambiar durante una emergencia prolongada.
      </p>
    </div>
  );
}
