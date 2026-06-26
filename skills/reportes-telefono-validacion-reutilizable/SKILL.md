---
name: reportes-telefono-validacion-reutilizable
description: La validacion del telefono en reportes se centraliza en el helper compartido y sus consumidores muestran errores especificos y bloquean el envio.
metadata:
  tipo: decision
---

En este proyecto, la validacion del `telefono` del formulario de reportes vive en `src/lib/constants.ts`, no inline en el componente.

El validador compartido debe devolver un resultado tipado que distinga al menos `codigo_pais` y `longitud_minima`, ademas de `telefonoNormalizado`, para que la UI pueda reaccionar sin ambiguedad.

`src/components/DesaparecidosSection.tsx` debe consumir ese validador, mostrar el error especifico junto al campo "Celular de contacto" y bloquear el envio mientras el telefono siga invalido; no basta con un error generico global.

Si cambia la regla, se actualiza primero el helper compartido en `src/lib/constants.ts` y despues sus consumidores, incluido `src/components/DesaparecidosSection.tsx`.

Evidencia breve: la decision reusable se captura a partir de `plan/task/06.md` y queda implementada entre `src/lib/constants.ts` y `src/components/DesaparecidosSection.tsx`.
