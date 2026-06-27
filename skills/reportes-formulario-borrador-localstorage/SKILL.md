---
name: reportes-formulario-borrador-localstorage
description: Mantiene el patron local del formulario de reportes que guarda un borrador serializable en localStorage, permite restaurarlo o editarlo en `/editar/borrador`, y lo limpia solo tras publicar con exito o descartarlo explicitamente.
metadata:
  tipo: decision
---

En este proyecto, el formulario "Reportar a alguien que buscamos" persiste su borrador serializable en `localStorage` bajo `REPORTE_BORRADOR_KEY = "reporte_borrador"` mientras el formulario esta abierto y aun no existe `tokenGenerado`. Ese mismo contrato lo reutiliza la ruta `src/app/editar/borrador/page.tsx` para retomar, editar o eliminar borradores fuera del modal principal.

Reglas:
- Persistir solo campos serializables del formulario (`nombre`, `apellido`, `zona`, `codigoPais`, `telefono`, `ultimaUbicacion`, `descripcion`, `estado`). No intentar guardar `File`, previews ni otro estado efimero.
- Al reabrir el formulario con borrador presente, ofrecer una decision explicita entre continuar o descartar. La restauracion debe repoblar los estados del formulario y el descarte debe borrar la clave de `localStorage`.
- La ruta `/editar/borrador` debe leer y validar exactamente la misma forma de borrador que el modal. Si el JSON es invalido o tiene una `zona` fuera de `ZONAS_DB`, se limpia la clave y se cae a un estado vacio seguro.
- Guardar cambios desde `/editar/borrador` debe sobrescribir la misma clave de `localStorage` y volver a `/desaparecidos?reportar=1`, para que el modal cargue el borrador editado sin duplicar otro almacenamiento.
- Eliminar el borrador desde `/editar/borrador` o desde el modal debe borrar la misma clave compartida; no mantener caminos de borrado distintos.
- Si el JSON guardado no cumple la forma esperada, limpiar la clave y no intentar reutilizarlo.
- No borrar el borrador al cerrar el modal o al perder la conexion; solo eliminarlo en el camino de exito de `handleSubmit`.
- Mantener este flujo compatible con el gate de consentimiento existente (`consentimiento_aceptado`) y con la apertura del formulario desde `intentarReportar` / `aceptarConsentimiento`.

Anclajes:
- `src/components/DesaparecidosSection.tsx:95`
- `src/components/DesaparecidosSection.tsx:399`
- `src/components/DesaparecidosSection.tsx:451`
- `src/app/editar/borrador/page.tsx:9`
- `src/app/editar/borrador/page.tsx:31`
- `src/app/editar/borrador/page.tsx:85`
- `src/app/editar/borrador/page.tsx:93`
- `plan/task/01.md`
