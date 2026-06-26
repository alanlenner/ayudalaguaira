import ColaboradoresSection from "@/components/ColaboradoresSection";
import SectionPageLayout from "@/components/SectionPageLayout";
import { TIPOS_AYUDA } from "@/lib/constants";
import {
  parseEnumParam,
  parsePositiveIntParam,
  type SearchParamsInput,
  tieneFlag,
} from "@/lib/url-filters";

const TIPOS_FILTRO = ["todos", ...TIPOS_AYUDA.map((tipo) => tipo.value)] as const;
const ORDENES = ["menos_contactados", "mas_contactados"] as const;

export default function ColaboradoresPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const abrirFormulario = tieneFlag(searchParams?.registro);
  const filtros = {
    tipo: parseEnumParam(searchParams?.tipo, TIPOS_FILTRO, "todos"),
    orden: parseEnumParam(searchParams?.orden, ORDENES, "menos_contactados"),
    pagina: parsePositiveIntParam(searchParams?.pagina),
  };

  return (
    <SectionPageLayout currentSection="colaboradores">
      <div className="max-w-3xl mx-auto px-4">
        <ColaboradoresSection abrirFormulario={abrirFormulario} filtros={filtros} />
      </div>
    </SectionPageLayout>
  );
}
