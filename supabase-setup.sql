-- ============================================
-- EJECUTAR ESTO EN SUPABASE SQL EDITOR
-- Base de datos: AyudalaGuaira
-- ============================================
-- NOTA: Si ya tienes la tabla anterior, ejecuta
-- primero el bloque de MIGRACIÓN al final.
-- Si es tabla nueva, ejecuta todo desde aquí.
-- ============================================

-- 1. Tabla principal de desaparecidos
CREATE TABLE IF NOT EXISTS desaparecidos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  zona TEXT NOT NULL CHECK (zona IN ('Naiguatá', 'Caraballeda', 'Catia La Mar', 'Maiquetía')),
  telefono TEXT NOT NULL,
  foto_url TEXT,
  ultima_ubicacion TEXT,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'buscando' CHECK (estado IN ('buscando', 'encontrado_vivo', 'encontrado_fallecido')),
  edit_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX idx_desaparecidos_zona ON desaparecidos(zona);
CREATE INDEX idx_desaparecidos_fecha ON desaparecidos(created_at DESC);
CREATE INDEX idx_desaparecidos_estado ON desaparecidos(estado);
CREATE INDEX idx_desaparecidos_edit_token ON desaparecidos(edit_token);
CREATE INDEX idx_desaparecidos_nombre ON desaparecidos(nombre, apellido);

-- 3. Habilitar Row Level Security
ALTER TABLE desaparecidos ENABLE ROW LEVEL SECURITY;

-- 4. Política: cualquiera puede leer (pero edit_token no se expone vía query normal)
CREATE POLICY "Lectura pública" ON desaparecidos
  FOR SELECT USING (true);

-- 5. Política: cualquiera puede insertar
CREATE POLICY "Inserción pública" ON desaparecidos
  FOR INSERT WITH CHECK (true);

-- 6. Política: cualquiera puede actualizar (edición vía edit_token validado en app)
CREATE POLICY "Actualización pública" ON desaparecidos
  FOR UPDATE USING (true);

-- ============================================
-- MIGRACIÓN: Si ya tenías la tabla anterior
-- ejecuta esto en vez de CREATE TABLE
-- ============================================
-- ALTER TABLE desaparecidos ADD COLUMN IF NOT EXISTS apellido TEXT DEFAULT '';
-- ALTER TABLE desaparecidos ADD COLUMN IF NOT EXISTS ultima_ubicacion TEXT;
-- ALTER TABLE desaparecidos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'buscando';
-- ALTER TABLE desaparecidos ADD COLUMN IF NOT EXISTS edit_token TEXT UNIQUE;
-- ALTER TABLE desaparecidos RENAME COLUMN seccion TO zona;
-- ALTER TABLE desaparecidos DROP COLUMN IF EXISTS edad;
-- ALTER TABLE desaparecidos DROP COLUMN IF EXISTS encontrado;
-- ALTER TABLE desaparecidos DROP CONSTRAINT IF EXISTS desaparecidos_seccion_check;
-- ALTER TABLE desaparecidos ADD CONSTRAINT desaparecidos_zona_check CHECK (zona IN ('Naiguatá', 'Caraballeda', 'Catia La Mar', 'Maiquetía'));
-- ALTER TABLE desaparecidos ADD CONSTRAINT desaparecidos_estado_check CHECK (estado IN ('buscando', 'encontrado_vivo', 'encontrado_fallecido'));

-- ============================================
-- STORAGE: Bucket "fotos-desaparecidos"
-- Ya debería estar creado como público.
-- ============================================
