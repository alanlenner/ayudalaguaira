---
name: query-param-modal-same-route
description: Evita que un CTA a la misma ruta con query solo haga scroll al top cuando debe reabrir un modal interno.
metadata:
  tipo: pitfall
---

Sintoma observable: un `Link` o `router.push` hacia la misma ruta con una query tipo `?reportar=1` no reabre el modal interno y puede resetear el scroll al header, aunque el usuario ya este en esa pagina.

En este proyecto, cuando el flujo vive dentro de la misma seccion renderizada por la ruta actual, no basta con navegar otra vez a la misma URL con query. El patron estable es:

- actualizar la URL con `scroll: false` para no perder contexto visual;
- disparar un re-trigger explicito del flujo interno con evento o estado compartido;
- mantener la logica de apertura en la seccion duena del modal, no en un wrapper global.

Aplicacion minima:
- Si el CTA vive fuera de `DesaparecidosSection` pero debe abrir su formulario desde `/desaparecidos`, usa `router.replace(..., { scroll: false })` y un evento explicito como `window.dispatchEvent(new CustomEvent("desaparecidos:abrir-formulario"))`.
- En la seccion destino, escucha ese re-trigger ademas del flag inicial de `searchParams`, para que el modal pueda reabrirse incluso si el usuario ya navego antes a la misma ruta.
- No uses anclas ni un `Link` simple a la misma pagina como mecanismo de apertura de modal.

Evidencia ancla:
- `.ralph/logs/iteration-000001-20260627-234844.log`
- `.ralph/logs/iteration-000035-20260628-000935.log`
- `src/components/Footer.tsx`
- `src/app/desaparecidos/page.tsx`
- `src/components/DesaparecidosSection.tsx`
