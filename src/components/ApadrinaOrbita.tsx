"use client";

import { Heart } from "lucide-react";

type NodoOrbita = {
  id: string;
  emoji: string;
  label: string;
  sublabel?: string;
  activo?: boolean;
};

type Props = {
  centro: { nombre: string; emoji?: string };
  nodos: NodoOrbita[];
  tamaño?: "sm" | "md";
};

export default function ApadrinaOrbita({ centro, nodos, tamaño = "md" }: Props) {
  const esMd = tamaño === "md";
  const radio = esMd ? 130 : 100;
  const centroSize = esMd ? "w-20 h-20" : "w-16 h-16";
  const centroText = esMd ? "text-xs" : "text-[10px]";
  const nodoSize = esMd ? "w-14 h-14" : "w-11 h-11";
  const nodoText = esMd ? "text-[10px]" : "text-[8px]";
  const containerSize = esMd ? 320 : 250;

  const angleStep = (2 * Math.PI) / Math.max(nodos.length, 1);

  return (
    <div
      className="relative mx-auto"
      style={{ width: containerSize, height: containerSize }}
    >
      {/* Líneas de conexión */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${containerSize} ${containerSize}`}
      >
        {nodos.map((nodo, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const x = containerSize / 2 + radio * Math.cos(angle);
          const y = containerSize / 2 + radio * Math.sin(angle);
          return (
            <line
              key={nodo.id}
              x1={containerSize / 2}
              y1={containerSize / 2}
              x2={x}
              y2={y}
              stroke={nodo.activo ? "#185FA5" : "#e2e8f0"}
              strokeWidth={nodo.activo ? 2 : 1}
              strokeDasharray={nodo.activo ? "none" : "4 4"}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {/* Centro — Solicitante */}
      <div
        className={`absolute ${centroSize} rounded-full bg-gradient-to-br from-[#185FA5] to-[#134b84] text-white flex flex-col items-center justify-center shadow-lg shadow-[#185FA5]/20 z-10 ring-4 ring-white`}
        style={{
          left: containerSize / 2,
          top: containerSize / 2,
          transform: "translate(-50%, -50%)",
        }}
      >
        {centro.emoji ? (
          <span className="text-lg">{centro.emoji}</span>
        ) : (
          <Heart className="w-5 h-5 text-blue-200" />
        )}
        <span className={`${centroText} font-semibold leading-tight text-center px-1 mt-0.5 max-w-full truncate`}>
          {centro.nombre}
        </span>
      </div>

      {/* Nodos — Padrinos */}
      {nodos.map((nodo, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = containerSize / 2 + radio * Math.cos(angle);
        const y = containerSize / 2 + radio * Math.sin(angle);

        return (
          <div
            key={nodo.id}
            className={`absolute ${nodoSize} rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
              nodo.activo
                ? "bg-white border-2 border-[#185FA5] shadow-md shadow-[#185FA5]/10 scale-105"
                : "bg-white border border-slate-200 shadow-sm opacity-70"
            }`}
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
            title={nodo.label}
          >
            <span className={esMd ? "text-base" : "text-sm"}>{nodo.emoji}</span>
            {nodo.sublabel && (
              <span className={`${nodoText} text-slate-500 leading-tight text-center px-0.5 max-w-full truncate`}>
                {nodo.sublabel}
              </span>
            )}
          </div>
        );
      })}

      {/* Pulso animado en el centro */}
      <div
        className="absolute rounded-full bg-[#185FA5]/10 animate-ping z-0"
        style={{
          width: esMd ? 80 : 64,
          height: esMd ? 80 : 64,
          left: containerSize / 2,
          top: containerSize / 2,
          transform: "translate(-50%, -50%)",
          animationDuration: "3s",
        }}
      />
    </div>
  );
}
