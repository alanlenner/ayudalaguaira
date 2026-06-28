export const ZONAS_DB = ["Naiguatá", "Caraballeda", "Catia La Mar", "Maiquetía", "Tanaguarena", "Macuto", "Hospital Pérez Carreño", "Domingo Luciani", "Hospital G. de Lidice", "Otro"] as const;
export type ZonaDB = (typeof ZONAS_DB)[number];

export const TIPOS_AYUDA = [
  { value: "salud_mental", label: "Salud mental / Psicología" },
  { value: "albergue", label: "Albergue / Habitación temporal" },
  { value: "alimentos", label: "Alimentos / Agua" },
  { value: "transporte", label: "Transporte / Logística" },
  { value: "ropa_abrigo", label: "Ropa / Abrigo" },
  { value: "insumos_medicos", label: "Insumos médicos" },
  { value: "mano_obra", label: "Mano de obra / Limpieza" },
  { value: "donaciones", label: "Donaciones" },
  { value: "mascotas", label: "Apoyo mascotas" },
  { value: "otro", label: "Otro" },
] as const;

export const CATEGORIAS_RECURSO = [
  { value: "alimentos", label: "Alimentos", icon: "🍞" },
  { value: "agua", label: "Agua", icon: "💧" },
  { value: "insumos_medicos", label: "Insumos médicos", icon: "🏥" },
  { value: "medicamentos", label: "Medicamentos", icon: "💊" },
  { value: "ropa_abrigo", label: "Ropa / Abrigo", icon: "🧥" },
  { value: "refugio_temporal", label: "Refugio temporal", icon: "🏠" },
  { value: "otro", label: "Otro", icon: "📦" },
] as const;

export function generarToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function limpiarTelefono(tel: string) {
  return tel.replace(/[^0-9+]/g, "");
}

export type ValidacionTelefono =
  | { valido: true; telefonoNormalizado: string }
  | { valido: false; motivo: "codigo_pais" | "longitud_minima"; mensaje: string; telefonoNormalizado: string };

export function validarTelefono(tel: string): ValidacionTelefono {
  const telefonoNormalizado = limpiarTelefono(tel);
  const soloDigitos = telefonoNormalizado.replace(/\D/g, "");
  const tieneCodigoPaisExplicito = telefonoNormalizado.startsWith("+") || soloDigitos.startsWith("58");

  if (!tieneCodigoPaisExplicito) {
    return {
      valido: false,
      motivo: "codigo_pais",
      mensaje: "Indica el código de país, por ejemplo +58.",
      telefonoNormalizado,
    };
  }

  if (soloDigitos.length < 11) {
    return {
      valido: false,
      motivo: "longitud_minima",
      mensaje: "Faltan dígitos en el celular de contacto.",
      telefonoNormalizado,
    };
  }

  return {
    valido: true,
    telefonoNormalizado,
  };
}

export function tiempoRelativo(fecha: string) {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `Hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias}d`;
}

export function contactoLink(contacto: string): { href: string; label: string } {
  const limpio = limpiarTelefono(contacto);
  if (contacto.includes("@")) {
    return { href: `mailto:${contacto}`, label: "Email" };
  }
  return { href: `tel:${limpio}`, label: "Llamar" };
}

export function waLink(tel: string): string {
  const limpio = limpiarTelefono(tel);
  return `https://wa.me/${limpio.startsWith("0") ? "58" + limpio.slice(1) : limpio}`;
}

const WHATSAPP_HOSTS = new Set([
  "wa.me",
  "api.whatsapp.com",
  "chat.whatsapp.com",
  "whatsapp.com",
  "www.whatsapp.com",
]);

export function normalizarWhatsappWidgetUrl(valor?: string | null): string | null {
  const limpio = valor?.trim();
  if (!limpio) return null;

  if (/^\+?[0-9\s()-]+$/.test(limpio)) {
    return waLink(limpio);
  }

  const conProtocolo = limpio.startsWith("http://") || limpio.startsWith("https://")
    ? limpio
    : `https://${limpio}`;

  try {
    const url = new URL(conProtocolo);
    if (WHATSAPP_HOSTS.has(url.hostname)) {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function extraerMensajeWhatsapp(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.searchParams.get("text") ?? "";
  } catch {
    return "";
  }
}

export function construirWhatsappHrefConMensaje(urlString: string, mensaje: string): string {
  try {
    const url = new URL(urlString);

    if (url.hostname === "chat.whatsapp.com") {
      return url.toString();
    }

    const texto = mensaje.trim();
    if (texto) {
      url.searchParams.set("text", texto);
    } else {
      url.searchParams.delete("text");
    }

    return url.toString();
  } catch {
    return urlString;
  }
}
