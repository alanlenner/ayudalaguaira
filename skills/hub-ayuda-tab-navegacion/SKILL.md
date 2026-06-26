---
name: hub-ayuda-tab-navegacion
description: Fija que el Hub de ayuda convive en la navegacion principal como una tab propia y no sustituye la seccion de colaborar.
metadata:
  tipo: decision
---

# Hub de ayuda: integracion en navegacion

La integracion vigente del hub usa la Opcion A del plan: `src/app/page.tsx` debe tratar el hub como una tercera tab de la navegacion principal, conviviendo con `desaparecidos` y `colaboradores`. No sustituye `ColaboradoresSection` ni reabre la bifurcacion A/B salvo que un plan nuevo lo cambie de forma explicita.

Implicaciones practicas:
- El tipo de seccion debe incluir `"hub"`.
- `TABS` debe contener una entrada propia para el hub.
- El render condicional debe mantener las tabs previas y anadir `HubAyudaSection` solo para `seccion === "hub"`.

Accesos secundarios al hub:
- Los accesos desde footer y hero no abren una ruta nueva ni montan otro contenedor: deben activar la misma tab existente cambiando `seccion` a `"hub"` desde `src/app/page.tsx`.
- La logica debe reutilizar callbacks o handlers ya centralizados en `src/app/page.tsx`, siguiendo el mismo patron de cambio de seccion y scroll.
- `src/components/Footer.tsx` debe recibir y usar ese callback para "Organizaciones de ayuda", sin convertir el acceso al hub en un enlace de navegacion independiente.
- Si existe CTA en el hero para el hub, debe reutilizar el mismo handler, no duplicar logica.

Evidencia ancla: `plan/task/03.md` fija en el objetivo que `src/app/page.tsx` incluye una tab nueva `"hub"` que renderiza `<HubAyudaSection />`; el contexto del mismo fichero resuelve la decision como Opcion A y explicita que el hub convive como tab nueva, sin reemplazar `ColaboradoresSection`; `plan/task/03.evidencia.txt` valida `npx tsc --noEmit` y `npm run build` en verde para esa integracion. `plan/task/04.md` extiende esa decision a footer y hero sin romper la navegacion por tabs; `src/app/page.tsx` centraliza el handler reutilizable para abrir el hub y `src/components/Footer.tsx` lo consume mediante `onOpenHub`.
