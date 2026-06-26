import { LINEAS_DIRECTAS } from "@/lib/telefonos-oficiales";

export type CategoriaOrg = "reconexion" | "donacion" | "voluntariado" | "oficial";

export interface Organizacion {
  nombre: string;
  descripcion: string;
  categoria: CategoriaOrg;
  url: string;
  telefono?: string;
}

const URLS_LINEAS_DIRECTAS: Record<string, string> = {
  "Bomberos La Guaira": "https://www.instagram.com/bomberoslaguaira/",
  "Protección Civil La Guaira": "https://x.com/Pc_laGuaira",
  "Protección Civil nacional": "https://www.facebook.com/pcivilvnzla/",
};

export const ORGANIZACIONES: Organizacion[] = [
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
