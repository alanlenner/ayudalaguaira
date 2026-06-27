import { LINEAS_DIRECTAS } from "@/lib/telefonos-oficiales";

export type CategoriaOrg = "reconexion" | "donacion" | "voluntariado" | "oficial";

export interface Organizacion {
  nombre: string;
  descripcion: string;
  categoria: CategoriaOrg;
  url?: string;
  telefono?: string;
  telefonos?: string[];
}

const URLS_LINEAS_DIRECTAS: Record<string, string> = {
  "Bomberos La Guaira": "https://www.instagram.com/bomberoslaguaira/",
  "Protección Civil La Guaira": "https://x.com/Pc_laGuaira",
  "Protección Civil nacional": "https://www.facebook.com/pcivilvnzla/",
};

export const ORGANIZACIONES: Organizacion[] = [
  {
    nombre: "Federación de Psicólogos de Venezuela",
    descripcion:
      "Federación profesional con servicios de orientación y apoyo psicológico para atención emocional.",
    categoria: "oficial",
    url: "https://fpv.org.ve",
    telefonos: ["0212-4163116", "0212-4163118", "0424-2907338"],
  },
  {
    nombre: "Psicólogos sin Fronteras",
    descripcion:
      "Red de apoyo psicológico y orientación emocional para personas que necesitan contención y escucha.",
    categoria: "voluntariado",
    url: "https://www.instagram.com/psfvenezuela/",
    telefonos: ["0412-9270304"],
  },
  {
    nombre: "SNC",
    descripcion:
      "Canal de apoyo psicoemocional compartido para contacto directo y orientación inicial.",
    categoria: "voluntariado",
    telefonos: ["0414-42665181"],
  },
  {
    nombre: "Psicólogos por Venezuela",
    descripcion:
      "Red de más de 600 psicólogos, psiquiatras y profesionales de salud mental que brindan apoyo psicoemocional gratuito e inmediato con lineamientos de Primeros Auxilios Psicológicos.",
    categoria: "voluntariado",
    url: "https://wa.me/5215533200457?text=Hola,%20necesito%20apoyo%20psicol%C3%B3gico",
    telefonos: ["+52 55 3320 0457"],
  },
  {
    nombre: "Rehabilitarte",
    descripcion:
      "Contacto de acompañamiento terapéutico y atención emocional para personas afectadas.",
    categoria: "voluntariado",
    telefonos: ["0424-6115506"],
  },
  {
    nombre: "CICR - Restoring Family Links",
    descripcion:
      "Servicio del CICR para ayudar a personas separadas de sus familias a restablecer el contacto y reencontrarse.",
    categoria: "reconexion",
    url: "https://www.icrc.org/en/where-we-work/venezuela",
  },
  {
    nombre: "Cruz Roja Venezolana",
    descripcion:
      "Sociedad Nacional de la Cruz Roja en Venezuela con acciones humanitarias de apoyo comunitario, salud y voluntariado.",
    categoria: "voluntariado",
    url: "https://www.ifrc.org/national-societies-directory/venezuelan-red-cross",
  },
  {
    nombre: "Protección Civil y Administración de Desastres",
    descripcion:
      "Organismo oficial venezolano de gestión del riesgo, prevención y atención de emergencias.",
    categoria: "oficial",
    url: "https://www.mpprijp.gob.ve/viceministerios/viceministro/vgrpc",
  },
  ...LINEAS_DIRECTAS.filter((linea) => linea.entidad in URLS_LINEAS_DIRECTAS).map((linea) => ({
    nombre: linea.entidad,
    descripcion:
      "Línea oficial de atención y orientación para emergencias y coordinación de apoyo inmediato.",
    categoria: "oficial" as const,
    url: URLS_LINEAS_DIRECTAS[linea.entidad],
    telefono: linea.numero,
  })),
];
