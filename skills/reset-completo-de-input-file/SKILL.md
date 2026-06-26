---
name: reset-completo-de-input-file
description: En formularios con foto adjunta, eliminar el archivo exige resetear estado, preview e input file para permitir re-subida o envio limpio.
metadata:
  tipo: decision
---

# Reset completo de input file

## Decision

Si un formulario permite adjuntar una foto y luego eliminarla, no basta con ocultar la previsualizacion. La eliminacion debe resetear las tres capas del dato: archivo en estado, preview derivada y valor del `input type="file"` o su `ref`.

## Aplicacion

- Crear una accion explicita de eliminar que haga `setFotoFile(null)`, `setFotoPreview(null)` y `fileInputRef.current.value = ""` si existe el nodo.
- Reutilizar el mismo reseteo cuando el formulario se cierre o vuelva a su estado inicial, para no dejar un `input file` desincronizado respecto al estado visual.
- Tratar este reset como una unica operacion de consistencia: permite volver a subir el mismo archivo y tambien enviar el formulario sin foto residual.

## Evidencia

- `plan/task/07.md`: la restriccion de la tarea exige que eliminar la foto resetee `fotoFile`, `fotoPreview` y el valor del `input file` (`fileInputRef`), y el happy path pide poder re-adjuntar otra foto o publicar sin foto.
- `src/components/DesaparecidosSection.tsx`: `handleFoto` carga `fotoFile` y `fotoPreview`; `eliminarFoto` resetea ambos estados y vacia `fileInputRef.current.value`; el bloque del formulario usa ese handler en el boton `Eliminar foto`.
- `src/components/DesaparecidosSection.tsx`: `cerrarFormulario` ya limpia `fotoFile` y `fotoPreview`; esta decision extiende esa misma consistencia al valor real del `input file/ref` cuando se elimina o reinicia la adjunta.
