import DesaparecidosSection from "@/components/DesaparecidosSection";
import SectionPageLayout from "@/components/SectionPageLayout";
import { ZONAS_DB } from "@/lib/constants";
import {
  parseEnumParam,
  parseOptionalEnumParam,
  parsePositiveIntParam,
  parseTextParam,
  type SearchParamsInput,
  tieneFlag,
} from "@/lib/url-filters";

const ZONAS_FILTRO = ["Todas", ...ZONAS_DB] as const;
const ESTADOS_FILTRO = ["buscando", "encontrados", "hospitalizado", "encontrado_vivo"] as const;

export default function DesaparecidosPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const abrirFormulario = tieneFlag(searchParams?.reportar);
  const estadoParam = parseOptionalEnumParam(searchParams?.estado, ESTADOS_FILTRO);
  const filtros = {
    zona: parseEnumParam(searchParams?.zona, ZONAS_FILTRO, "Todas"),
    estado: estadoParam === "encontrado_vivo" ? "encontrados" : estadoParam,
    busqueda: parseTextParam(searchParams?.q),
    pagina: parsePositiveIntParam(searchParams?.pagina),
  };

  return (
    <SectionPageLayout currentSection="desaparecidos">
      <div className="max-w-3xl mx-auto px-4">
        <DesaparecidosSection abrirFormulario={abrirFormulario} filtros={filtros} />
      </div>
    </SectionPageLayout>
  );
}
