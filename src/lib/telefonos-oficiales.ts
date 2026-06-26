export interface LineaOficial {
  numero: string;
  entidad: string;
  tipo?: "tel" | "wa";
}

export const LINEAS_DIRECTAS: LineaOficial[] = [
  { numero: "0212-332-2165", entidad: "Bomberos La Guaira" },
  { numero: "0424-207-5335", entidad: "Protección Civil La Guaira" },
  { numero: "0412-999-4426", entidad: "Seguridad y denuncias", tipo: "wa" },
  { numero: "0800-724-8451", entidad: "Protección Civil nacional" },
];
