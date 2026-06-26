---
name: desaparecidos-feed-paginacion-real
description: Preservar en `src/components/DesaparecidosSection.tsx` que el feed de reportes use paginacion real por paginas, no carga acumulativa. Usar cuando se toque el listado, los filtros o la navegacion del feed de desaparecidos para evitar reintroducir scroll infinito o "Cargar mas reportes".
metadata:
  tipo: decision
---

Mantener el feed de `DesaparecidosSection` como paginacion real por paginas.

Evidencia ancla:
- `plan/task/01.md` fija como objetivo sustituir la carga acumulativa infinita por paginacion real con `PAGE_SIZE`, conteo exacto, controles `Anterior`/`Siguiente` y reset a pagina 1 al cambiar `zonaActiva`, `filtroEstado` o `busqueda`.
- `src/components/DesaparecidosSection.tsx` implementa esa decision con `const PAGE_SIZE = 20`, estados `paginaActual` y `totalPaginas`, consulta `select(..., { count: "exact" })`, rango `const from = (paginaActual - 1) * PAGE_SIZE` / `const to = from + PAGE_SIZE - 1`, `setTotalPaginas(Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)))`, `useEffect(() => { setPaginaActual(1); }, [zonaActiva, filtroEstado, busqueda])` y controles visibles `Anterior` / `Siguiente`.

Aplicar siempre estas reglas:
- Consultar solo la pagina actual con `range(from, to)`; no acumular resultados previos ni deduplicar para crecer la lista.
- Calcular `totalPaginas` desde un `count: "exact"` y `PAGE_SIZE`; no inferir "hay mas" por longitud parcial.
- Resetear a pagina 1 cuando cambien `zonaActiva`, `filtroEstado` o `busqueda`.
- Mantener controles de navegacion por pagina; no reintroducir el boton `Cargar más reportes` ni estados de carga incremental.
