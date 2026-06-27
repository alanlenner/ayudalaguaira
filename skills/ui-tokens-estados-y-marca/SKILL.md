---
name: ui-tokens-estados-y-marca
description: Mantiene centralizados los tokens de color de estados y la referencia unica de azul de marca para badges, contadores y CTAs relacionados.
metadata:
  tipo: decision
---

En este proyecto, los colores semanticos de estados y el azul de marca no se definen inline en los componentes. La fuente de verdad vive en `tailwind.config.js` mediante aliases hacia variables CSS de `src/app/globals.css`.

Reglas:
- Mantener los colores de estado bajo `colors.status.*` en `tailwind.config.js` y respaldarlos con variables `--color-status-*` en `src/app/globals.css`.
- Reutilizar `bg-status-buscando-*`, `bg-status-encontrado-*`, `bg-status-hospitalizado-*` y `bg-status-fallecido-*` en `StatusBadge` y en cualquier contador o resumen de estado; no volver a introducir hex sueltos ni clases `amber` para el estado `buscando`.
- Mantener separado el color de seccion de desaparecidos (`--color-section-desaparecidos`) del color de colaboracion (`--color-section-colaboracion`), y no reutilizar colores de badge de estado para botones de accion.
- Reutilizar una sola referencia de azul de marca (`--color-brand-blue`, expuesta como `marca.azul`) para CTA de apoyo emocional, pestaña activa y contadores/elementos de colaboracion; si cambia ese azul, se actualiza en los tokens y no en cada componente.
- Preservar la jerarquia tipografica fijada en las tarjetas de reportes: nombre como elemento mas prominente, badge de 12-13px con padding consistente y metadatos secundarios en gris.

Evidencia ancla:
- `plan/task/04.md` fija como objetivo centralizar la guia de color y tipografia, incluyendo los hex `#A32D2D`, `#FCEBEB`, `#27500A` y `#EAF3DE`, el cambio de Hospitalizado a ambar/mostaza y la unificacion del azul de marca.
- `tailwind.config.js` expone `colors.status.*` y `colors.marca.azul|desaparecidos|colaboracion` como aliases de variables CSS.
- `src/app/globals.css` define `--color-brand-blue`, `--color-section-desaparecidos`, `--color-section-colaboracion` y `--color-status-*`.
- `src/components/DesaparecidosSection.tsx` consume esos tokens en `StatusBadge` y en los contadores del feed.
- `src/components/SectionPageLayout.tsx` reutiliza `bg-marca-azul` para el CTA de apoyo emocional, separado de los colores de estado.
