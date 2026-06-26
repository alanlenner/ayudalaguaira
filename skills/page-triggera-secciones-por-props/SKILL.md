---
name: page-triggera-secciones-por-props
description: Mantiene en `page.tsx` los CTAs globales y abre flujos internos de una seccion mediante props/disparadores, sin estado global ni scroll como acoplamiento.
metadata:
  tipo: decision
---

En este proyecto, `src/app/page.tsx` es el orquestador de la navegacion principal y de los CTAs del hero. Si un boton global debe abrir un flujo que vive dentro de una seccion hija, la decision local es:

- `page.tsx` cambia primero la pestana activa (`seccion`) a la seccion correcta.
- `page.tsx` pasa una prop booleana de disparo a la seccion (`abrirFormulario` o equivalente) y una callback de cierre (`onFormularioCerrado`).
- La seccion hija conserva la logica real del flujo, incluidos gates locales como consentimiento, validaciones o modales.
- No se introduce estado global nuevo ni se usa el scroll como mecanismo para "abrir" el flujo.

Anclajes de esta decision:
- `src/app/page.tsx` abre el reporte de `DesaparecidosSection` con `abrirReporteDesaparecido` y mantiene el patron ya usado por `ColaboradoresSection`.
- `src/components/DesaparecidosSection.tsx` expone `abrirFormulario` y `onFormularioCerrado`, pero sigue resolviendo internamente `intentarReportar()` y el gate de `localStorage.consentimiento_aceptado`.
- `plan/task/00.md` fija explicitamente que la comunicacion entre `page.tsx` y secciones debe mantenerse por props, sin librerias nuevas de estado global.

Si futuras tareas necesitan abrir otro modal o formulario desde el hero o desde una CTA global, reutiliza este patron antes de inventar un canal nuevo.
