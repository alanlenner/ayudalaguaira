"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import {
  construirWhatsappHrefConMensaje,
  extraerMensajeWhatsapp,
} from "@/lib/constants";

type WhatsAppWidgetProps = {
  href: string;
  label?: string;
};

export default function WhatsAppWidget({
  href,
  label = "Abrir WhatsApp",
}: WhatsAppWidgetProps) {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setMensaje(extraerMensajeWhatsapp(href));
  }, [href]);

  const hrefConMensaje = construirWhatsappHrefConMensaje(href, mensaje);

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {abierto && (
        <div className="mb-3 w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
          <div className="flex items-center justify-between bg-marca-verde px-5 py-4 text-white">
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-white/80">Escríbenos y abrimos WhatsApp al enviar.</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-full p-2 text-white/85 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 bg-[#f6efe6] p-4">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
              Hola. Cuéntanos brevemente qué necesitas y te llevamos al chat de WhatsApp.
            </div>

            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <label htmlFor="whatsapp-widget-mensaje" className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Tu mensaje
              </label>
              <textarea
                id="whatsapp-widget-mensaje"
                value={mensaje}
                onChange={(event) => setMensaje(event.target.value)}
                placeholder="Hola, necesito apoyo psicológico..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-marca-verde focus:bg-white focus:ring-4 focus:ring-marca-verde/10"
              />
              <p className="mt-2 text-xs text-slate-500">
                Al pulsar enviar, se abrirá WhatsApp con este texto.
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Abrir directo
              </a>
              <a
                href={hrefConMensaje}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-marca-verde px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
              >
                <Send className="h-4 w-4" />
                Enviar
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((valorActual) => !valorActual)}
        aria-label={label}
        aria-expanded={abierto}
        aria-controls="whatsapp-widget-mensaje"
        className="flex items-center gap-3 rounded-full bg-marca-verde px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-marca-verde/30 transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-marca-verde/20"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <MessageCircle className="h-5 w-5" />
        </span>
        <span className="pr-1">{abierto ? "Cerrar chat" : label}</span>
      </button>
    </div>
  );
}
