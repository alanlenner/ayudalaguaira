---
name: reportes-formulario-borrador-localstorage
description: Mantiene el patron local del formulario de reportes que guarda un borrador serializable en localStorage, permite restaurarlo o descartarlo al reabrir y lo limpia solo tras publicar con exito.
metadata:
  tipo: decision
---

En `src/components/DesaparecidosSection.tsx`, el formulario "Reportar a alguien que buscamos" persiste su borrador en `localStorage` bajo `REPORTE_BORRADOR_KEY = "reporte_borrador"` mientras el formulario esta abierto y aun no existe `tokenGenerado`.

Reglas:
- Persistir solo campos serializables del formulario (`nombre`, `apellido`, `zona`, `telefono`, `ultimaUbicacion`, `descripcion`, `estado`). No intentar guardar `File`, previews ni otro estado efimero.
- Al reabrir el formulario con borrador presente, ofrecer una decision explicita entre continuar o descartar. La restauracion debe repoblar los estados del formulario y el descarte debe borrar la clave de `localStorage`.
- Si el JSON guardado no cumple la forma esperada, limpiar la clave y no intentar reutilizarlo.
- No borrar el borrador al cerrar el modal o al perder la conexion; solo eliminarlo en el camino de exito de `handleSubmit`.
- Mantener este flujo compatible con el gate de consentimiento existente (`consentimiento_aceptado`) y con la apertura del formulario desde `intentarReportar` / `aceptarConsentimiento`.

Anclajes:
- `src/components/DesaparecidosSection.tsx:71`
- `src/components/DesaparecidosSection.tsx:380`
- `src/components/DesaparecidosSection.tsx:402`
- `src/components/DesaparecidosSection.tsx:455`
- `plan/task/02.md`
