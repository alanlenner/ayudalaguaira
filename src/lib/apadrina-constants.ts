export const APADRINA_CATEGORIAS = [
  { value: "salud_mental", label: "Apoyo salud mental", emoji: "🧠", descripcion: "Acompañamiento psicológico o emocional de un profesional o persona capacitada.", cardinalidad: "1:1" },
  { value: "financiero", label: "Apoyo financiero", emoji: "💰", descripcion: "Donaciones directas para cubrir necesidades básicas o emergencias.", cardinalidad: "N:N" },
  { value: "logistica", label: "Apoyo logístico y transporte", emoji: "🚗", descripcion: "Traslados, envío de insumos o apoyo con mudanzas y logística.", cardinalidad: "N:N" },
  { value: "alimentos", label: "Apoyo alimentos", emoji: "🍞", descripcion: "Provisión de comida, despensas, agua potable o insumos alimentarios.", cardinalidad: "N:N" },
  { value: "ropa", label: "Apoyo ropa", emoji: "👕", descripcion: "Donación de ropa, calzado, cobijas o artículos de vestir.", cardinalidad: "N:N" },
  { value: "albergue_temporal", label: "Apoyo albergue temporal", emoji: "🏠", descripcion: "Hospedaje temporal en casa, habitación o espacio seguro.", cardinalidad: "1:1" },
  { value: "consejero_financiero", label: "Consejero financiero", emoji: "📊", descripcion: "Orientación para manejar finanzas personales, acceder a ayudas o reorganizar gastos.", cardinalidad: "1:N" },
  { value: "padrino_legal", label: "Padrino legal", emoji: "⚖️", descripcion: "Asesoría legal, apoyo con trámites, documentos o representación.", cardinalidad: "1:N" },
] as const;

export type ApadrinaCategoria = (typeof APADRINA_CATEGORIAS)[number]["value"];

export function apadrinaCategoriaLabel(value: string): string {
  return APADRINA_CATEGORIAS.find((c) => c.value === value)?.label ?? value;
}

export function apadrinaCategoriaEmoji(value: string): string {
  return APADRINA_CATEGORIAS.find((c) => c.value === value)?.emoji ?? "📋";
}

export function apadrinaCategoriaDesc(value: string): string {
  return APADRINA_CATEGORIAS.find((c) => c.value === value)?.descripcion ?? "";
}

export function generarCodigoAcceso(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
