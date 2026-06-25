-- ============================================
-- EJECUTAR ESTO EN SUPABASE SQL EDITOR
-- Base de datos: AyudalaGuaira
-- ============================================

-- 1. Tabla principal de desaparecidos
CREATE TABLE desaparecidos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  edad TEXT,
  descripcion TEXT,
  seccion TEXT NOT NULL CHECK (seccion IN ('Naiguatá', 'Caraballeda', 'Catia La Mar')),
  foto_url TEXT,
  telefono TEXT NOT NULL,
  encontrado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índice para filtrar por sección rápidamente
CREATE INDEX idx_desaparecidos_seccion ON desaparecidos(seccion);

-- 3. Índice para ordenar por fecha
CREATE INDEX idx_desaparecidos_fecha ON desaparecidos(created_at DESC);

-- 4. Habilitar Row Level Security
ALTER TABLE desaparecidos ENABLE ROW LEVEL SECURITY;

-- 5. Política: cualquiera puede leer
CREATE POLICY "Lectura pública" ON desaparecidos
  FOR SELECT USING (true);

-- 6. Política: cualquiera puede insertar
CREATE POLICY "Inserción pública" ON desaparecidos
  FOR INSERT WITH CHECK (true);

-- 7. Política: cualquiera puede actualizar (para marcar encontrado)
CREATE POLICY "Actualización pública" ON desaparecidos
  FOR UPDATE USING (true);

-- ============================================
-- STORAGE: Crear bucket para fotos
-- Ir a Storage > New Bucket:
--   Nombre: fotos-desaparecidos
--   Public: SÍ (marcar como público)
-- 
-- Luego en Policies del bucket, agregar:
--   - SELECT: allow all (para ver fotos)
--   - INSERT: allow all (para subir fotos)
-- ============================================
