---
name: zonas-db-sincronizadas
description: Mantiene sincronizados los valores de zona entre constantes tipadas, mapas de UI y constraints SQL cuando cambia el dominio de `zona`.
metadata:
  tipo: decision
---

En este proyecto, `zona` es un dominio compartido entre frontend tipado y esquema SQL. Si se agrega, renombra o elimina una zona, el cambio no termina en `src/lib/constants.ts`.

Reglas:
- Tratar `src/lib/constants.ts` (`ZONAS_DB` y `ZonaDB`) como la fuente tipada del frontend, y propagar desde ahi cualquier cambio de opciones.
- Revisar todos los `Record<ZonaDB, ...>` y usos derivados del tipo, como `HASHTAGS` y listas de filtro en `src/components/DesaparecidosSection.tsx`, para evitar roturas de tipos o estados imposibles.
- Derivar las listas de filtro de UI desde `ZONAS_DB` en lugar de mantener enumeraciones manuales separadas; en `DesaparecidosSection.tsx`, `ZONAS_FILTRO` debe construirse como `["Todas", ...ZONAS_DB]` para que nuevas zonas como `"Otro"` aparezcan automaticamente tambien en el home.
- Mantener sincronizado `supabase-setup.sql` con el mismo conjunto de valores en los `CHECK (...)` de las tablas que usen `zona`, incluyendo el bloque de migracion `DROP CONSTRAINT` / `ADD CONSTRAINT` cuando aplique.
- Si una zona especial altera el flujo del formulario, documentar y reutilizar el campo persistido existente antes de crear columnas nuevas; para `zona = 'Otro'`, la ubicacion libre se guarda en `ultima_ubicacion`.

Evidencia ancla:
- `plan/task/03.md` fija que la tarea "Zona 'Otro' con ubicacion personalizada" exige cambios coordinados en constantes, formulario y SQL.
- `plan/task/04.md` amplia esa decision al filtro del home y fija que `ZONAS_FILTRO` debe derivarse de `ZONAS_DB` para que `query.eq("zona", zonaActiva)` siga funcionando tambien con `"Otro"`.
- `src/lib/constants.ts` incluye `"Otro"` en `ZONAS_DB` y amplia `ZonaDB`.
- `src/components/DesaparecidosSection.tsx` amplia `HASHTAGS`, define `const ZONAS_FILTRO = ["Todas", ...ZONAS_DB] as const`, detecta `zonaEsOtro` y persiste la ubicacion libre en `ultima_ubicacion`.
- `supabase-setup.sql` incluye `'Otro'` en el `CHECK` de `desaparecidos_zona_check` y documenta la migracion `DROP CONSTRAINT IF EXISTS desaparecidos_zona_check` / `ADD CONSTRAINT`.
