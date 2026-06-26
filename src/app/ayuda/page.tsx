import HubAyudaSection from "@/components/HubAyudaSection";
import SectionPageLayout from "@/components/SectionPageLayout";
import {
  parseEnumParam,
  type SearchParamsInput,
} from "@/lib/url-filters";

const CATEGORIAS = ["todas", "reconexion", "donacion", "voluntariado", "oficial"] as const;

export default function AyudaPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const categoria = parseEnumParam(searchParams?.categoria, CATEGORIAS, "todas");

  return (
    <SectionPageLayout currentSection="ayuda">
      <HubAyudaSection categoriaActiva={categoria} />
    </SectionPageLayout>
  );
}
