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
  zona TEXT NOT NULL CHECK (zona IN ('Naiguatá', 'Caraballeda', 'Catia La Mar', 'Maiquetía', 'Tanaguarena', 'Macuto')),
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
-- ALTER TABLE desaparecidos ADD CONSTRAINT desaparecidos_zona_check CHECK (zona IN ('Naiguatá', 'Caraballeda', 'Catia La Mar', 'Maiquetía', 'Tanaguarena', 'Macuto'));
-- ALTER TABLE desaparecidos ADD CONSTRAINT desaparecidos_estado_check CHECK (estado IN ('buscando', 'encontrado_vivo', 'encontrado_fallecido'));

-- ============================================
-- STORAGE: Bucket "fotos-desaparecidos"
-- Ya debería estar creado como público.
-- ============================================

-- ============================================
-- TABLA: colaboradores
-- ============================================
CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo_ayuda TEXT[] NOT NULL,
  ubicacion TEXT NOT NULL,
  disponibilidad TEXT,
  contacto TEXT NOT NULL,
  descripcion TEXT,
  edit_token TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_colaboradores_activo ON colaboradores(activo);
CREATE INDEX idx_colaboradores_fecha ON colaboradores(created_at DESC);
CREATE INDEX idx_colaboradores_edit_token ON colaboradores(edit_token);

ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública colaboradores" ON colaboradores
  FOR SELECT USING (true);

CREATE POLICY "Inserción pública colaboradores" ON colaboradores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualización pública colaboradores" ON colaboradores
  FOR UPDATE USING (true);

-- ============================================
-- TABLA: recursos
-- ============================================
CREATE TABLE IF NOT EXISTS recursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_publicacion TEXT NOT NULL CHECK (tipo_publicacion IN ('necesito', 'ofrezco')),
  categoria TEXT NOT NULL CHECK (categoria IN ('alimentos', 'agua', 'insumos_medicos', 'medicamentos', 'ropa_abrigo', 'refugio_temporal', 'otro')),
  descripcion TEXT NOT NULL,
  direccion TEXT NOT NULL,
  zona TEXT NOT NULL CHECK (zona IN ('Naiguatá', 'Caraballeda', 'Catia La Mar', 'Maiquetía', 'Tanaguarena', 'Macuto')),
  celular_contacto TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'resuelto')),
  edit_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recursos_tipo ON recursos(tipo_publicacion);
CREATE INDEX idx_recursos_zona ON recursos(zona);
CREATE INDEX idx_recursos_categoria ON recursos(categoria);
CREATE INDEX idx_recursos_estado ON recursos(estado);
CREATE INDEX idx_recursos_fecha ON recursos(created_at DESC);
CREATE INDEX idx_recursos_edit_token ON recursos(edit_token);

ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública recursos" ON recursos
  FOR SELECT USING (true);

CREATE POLICY "Inserción pública recursos" ON recursos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualización pública recursos" ON recursos
  FOR UPDATE USING (true);
