# Módulo Apadrina Venezuela — Progreso

## Estado actual
- [x] Documentar plan
- [ ] **PENDIENTE: Crear tablas SQL en Supabase** (ver sección SQL abajo)
- [x] Layout aislado `/apadrina` con identidad propia
- [x] Landing `/apadrina`
- [x] Registro solicitante + código acceso
- [x] Panel solicitante `/apadrina/mi-apoyo/[codigo]`
- [x] Registro patrocinador + campos condicionales (duración obligatoria para albergue, capacidad fija 1:1)
- [x] Panel patrocinador `/apadrina/panel/[codigo]` (aprobar/rechazar/finalizar con recálculo cupos)
- [x] Aviso legal `/apadrina/aviso-legal`
- [x] Lógica de cupos (recalcular capacidad_disponible al aprobar/finalizar)

## ⚠️ PASO BLOQUEANTE
Ejecutar el SQL de abajo en Supabase SQL Editor para crear las 3 tablas. Sin esto, nada funciona.

## Arquitectura

### Aislamiento
- Tablas: prefijo `apadrina_` — sin FK hacia tablas del sitio principal
- Rutas: `/apadrina/...` — no aparece en nav, header, footer del sitio principal
- Layout propio: `src/app/apadrina/layout.tsx` — header "Apadrina Venezuela", footer y aviso legal propios
- Paleta: misma base (azul #185FA5, dorado #BA7517, verde #1D9E75) pero branding propio

### Archivos a crear
```
src/app/apadrina/
├── layout.tsx                          ← Layout propio (header, footer, aviso legal)
├── page.tsx                            ← Landing
├── registro-solicitante/page.tsx       ← Formulario registro damnificado
├── mi-apoyo/[codigo]/page.tsx          ← Panel solicitante
├── registro-patrocinador/page.tsx      ← Formulario registro patrocinador
├── panel/[codigo]/page.tsx             ← Panel patrocinador
├── aviso-legal/page.tsx                ← Aviso legal propio
src/lib/
├── apadrina-constants.ts               ← Categorías, helpers específicos
```

### Categorías (enum fijo)
| Value | Label | Cardinalidad | Cupos típicos |
|---|---|---|---|
| salud_mental | Apoyo salud mental | 1:1 | 1 |
| financiero | Apoyo financiero (donaciones) | N:N | N |
| logistica | Apoyo logístico y transporte | N:N | N |
| alimentos | Apoyo alimentos | N:N | N |
| ropa | Apoyo ropa | N:N | N |
| albergue_temporal | Apoyo albergue temporal | 1:1 | 1 |
| consejero_financiero | Apoyo consejero financiero | 1:N | N |
| padrino_legal | Padrino legal | 1:N | N |

### Tablas SQL (ejecutar en Supabase SQL Editor)

```sql
-- ============================================
-- MÓDULO APADRINA — TABLAS
-- ============================================

-- 1. Solicitantes (damnificados)
CREATE TABLE apadrina_solicitantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  celular_contacto TEXT NOT NULL,
  descripcion_situacion TEXT,
  codigo_acceso TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  consentimiento_aceptado BOOLEAN NOT NULL DEFAULT false,
  consentimiento_fecha TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE apadrina_solicitantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inserción pública apadrina_solicitantes" ON apadrina_solicitantes FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura por código apadrina_solicitantes" ON apadrina_solicitantes FOR SELECT USING (true);
CREATE POLICY "Update por código apadrina_solicitantes" ON apadrina_solicitantes FOR UPDATE USING (true);

-- 2. Patrocinadores
CREATE TABLE apadrina_patrocinadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN (
    'salud_mental', 'financiero', 'logistica', 'alimentos',
    'ropa', 'albergue_temporal', 'consejero_financiero', 'padrino_legal'
  )),
  capacidad_total INTEGER NOT NULL DEFAULT 1,
  capacidad_disponible INTEGER NOT NULL DEFAULT 1,
  ubicacion TEXT,
  duracion_estimada TEXT,
  contacto TEXT NOT NULL,
  descripcion TEXT,
  codigo_acceso TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  activo BOOLEAN NOT NULL DEFAULT true,
  consentimiento_aceptado BOOLEAN NOT NULL DEFAULT false,
  consentimiento_fecha TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE apadrina_patrocinadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inserción pública apadrina_patrocinadores" ON apadrina_patrocinadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura pública apadrina_patrocinadores" ON apadrina_patrocinadores FOR SELECT USING (true);
CREATE POLICY "Update apadrina_patrocinadores" ON apadrina_patrocinadores FOR UPDATE USING (true);

-- 3. Postulaciones (matching)
CREATE TABLE apadrina_postulaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitante_id UUID NOT NULL REFERENCES apadrina_solicitantes(id),
  patrocinador_id UUID NOT NULL REFERENCES apadrina_patrocinadores(id),
  categoria TEXT NOT NULL CHECK (categoria IN (
    'salud_mental', 'financiero', 'logistica', 'alimentos',
    'ropa', 'albergue_temporal', 'consejero_financiero', 'padrino_legal'
  )),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'finalizada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE apadrina_postulaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inserción pública apadrina_postulaciones" ON apadrina_postulaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura pública apadrina_postulaciones" ON apadrina_postulaciones FOR SELECT USING (true);
CREATE POLICY "Update apadrina_postulaciones" ON apadrina_postulaciones FOR UPDATE USING (true);

-- Índices útiles
CREATE INDEX idx_apadrina_postulaciones_solicitante ON apadrina_postulaciones(solicitante_id);
CREATE INDEX idx_apadrina_postulaciones_patrocinador ON apadrina_postulaciones(patrocinador_id);
CREATE INDEX idx_apadrina_patrocinadores_categoria ON apadrina_patrocinadores(categoria);
CREATE INDEX idx_apadrina_patrocinadores_activo ON apadrina_patrocinadores(activo) WHERE activo = true;
```

### Flujo funcional
1. Solicitante se registra → recibe código_acceso → guarda link `/apadrina/mi-apoyo/{codigo}`
2. Desde su panel, ve catálogo de 8 categorías → explora patrocinadores con cupos disponibles → se postula
3. Patrocinador se registra → recibe código_acceso → guarda link `/apadrina/panel/{codigo}`
4. Desde su panel, ve postulaciones pendientes → aprueba/rechaza
5. Al aprobar: capacidad_disponible -= 1. Si llega a 0, no aparece en listado público
6. "Finalizar apoyo" en postulación aprobada: capacidad_disponible += 1, estado = finalizada

### Consentimiento
- Checkbox obligatorio en ambos formularios
- Texto: datos compartidos con contraparte, sin verificación de identidad, datos sensibles voluntarios
- Link a `/apadrina/aviso-legal`

### Notas de implementación
- `capacidad_disponible` se actualiza client-side con Supabase update al aprobar/finalizar
- No hay notificaciones por email por ahora (futuro)
- No hay pagos ni procesamiento de donaciones
- Contacto del patrocinador solo visible para solicitante con postulación aprobada
