---
name: hub-ayuda-evidencia-dinamica
description: Evita rechazos de juez en verificaciones del hub cuando el conteo de tarjetas queda desincronizado respecto a `ORGANIZACIONES`.
metadata:
  tipo: pitfall
---

Sintoma observable: una subtarea de evidencia del hub se rechaza con mensajes como `el conteo guardado no coincide con las organizaciones actuales`, aunque el componente siga renderizando correctamente.

En este proyecto, `src/lib/organizaciones.ts` no es una lista fija: parte de `ORGANIZACIONES` se construye desde `LINEAS_DIRECTAS`. Por eso, cualquier evidencia que escriba a mano el numero esperado de tarjetas se queda obsoleta en cuanto cambian esas fuentes.

Metodo a seguir en verificaciones reproducibles del hub:
- Deriva siempre el conteo esperado leyendo `ORGANIZACIONES` desde el codigo actual en el mismo script de evidencia.
- Haz que la comprobacion compare el renderizado o el mapeo del componente contra `ORGANIZACIONES.length`, no contra un numero literal.
- Si la evidencia tambien resume tarjetas por categoria, calcula esos subtotales desde `ORGANIZACIONES` en tiempo de ejecucion.
- Cuando una tarea del hub mezcle build y conteos, regenera el fichero de evidencia completo tras cualquier cambio en `src/lib/organizaciones.ts`, `src/lib/telefonos-oficiales.ts` o `src/components/HubAyudaSection.tsx`.

Evidencia ancla: `plan/task/05.md` registra el rechazo `el conteo guardado no coincide con las organizaciones actuales`; `.ralph/logs/iteration-000091-20260626-203150.log` documenta que la correccion salio de recalcular `ORGANIZACIONES.length=6` y `cards_rendered_default=6` desde un script Node reproducible; `src/lib/organizaciones.ts` muestra que `ORGANIZACIONES` incorpora entradas derivadas de `LINEAS_DIRECTAS`.
