"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import TelefonosEmergencia from "./TelefonosEmergencia";

type FooterProps = {
  ayudaHref: string;
  reportarHref: string;
};

export default function Footer({ ayudaHref, reportarHref }: FooterProps) {
  return (
    <Suspense fallback={<FooterShell ayudaHref={ayudaHref} reportarHref={reportarHref} />}>
      <FooterContent ayudaHref={ayudaHref} reportarHref={reportarHref} />
    </Suspense>
  );
}

function FooterContent({ ayudaHref, reportarHref }: FooterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleReportarClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/desaparecidos") {
      return;
    }

    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.set("reportar", "1");
    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;

    router.replace(nextUrl, { scroll: false });
    window.dispatchEvent(new CustomEvent("desaparecidos:abrir-formulario"));
  };

  return (
    <FooterShell
      ayudaHref={ayudaHref}
      reportarHref={reportarHref}
      onReportarClick={handleReportarClick}
    />
  );
}

function FooterShell({
  ayudaHref,
  reportarHref,
  onReportarClick,
}: FooterProps & { onReportarClick?: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <footer className="bg-marca-azul-oscuro text-white mt-8">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Teléfonos de emergencia */}
        <TelefonosEmergencia variante="oscuro" />

        {/* CTA */}
        <div className="text-center">
          <Link
            href={reportarHref}
            scroll={false}
            onClick={onReportarClick}
            className="bg-marca-dorado hover:opacity-90 text-white py-3 px-8 rounded-2xl font-medium text-sm transition-all inline-flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Reportar a alguien
          </Link>
        </div>

        {/* Site info & disclaimer */}
        <div className="border-t border-white/15 pt-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logo-banner/logoguaira.png`}
              alt="Logo"
              className="h-8 w-auto opacity-80"
            />
            <p className="text-marca-azul-claro text-sm font-medium">
              Venezuela unida — La Guaira
            </p>
          </div>
          <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
            Este sitio es un esfuerzo voluntario y ciudadano. No sustituye
            a los organismos de rescate ni a las autoridades competentes.
            Si hay una emergencia médica, llama directamente a los números
            de arriba. Toda la información publicada aquí debe verificarse
            antes de compartirse.
          </p>

          <div className="flex items-center justify-center gap-3 text-xs text-white/35">
            <Link href={ayudaHref} className="hover:text-white/60 transition underline">
              Organizaciones de ayuda
            </Link>
            <span aria-hidden="true" className="text-white/20">
              /
            </span>
            <Link href="/aviso-legal" className="hover:text-white/60 transition underline">
              Aviso legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
