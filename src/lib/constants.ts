export const ZONAS_DB = ["Naiguatá", "Caraballeda", "Catia La Mar", "Maiquetía", "Tanaguarena", "Macuto", "Hospital Pérez Carreño", "Domingo Luciani"] as const;
export type ZonaDB = (typeof ZONAS_DB)[number];

export const TIPOS_AYUDA = [
  { value: "call_center", label: "Call center" },
  { value: "canalizar_reportes", label: "Canalizar reportes" },
  { value: "traduccion", label: "Traducción" },
  { value: "logistica_local", label: "Logística local" },
  { value: "transporte", label: "Transporte" },
  { value: "salud_mental", label: "Salud mental / Psicología" },
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
