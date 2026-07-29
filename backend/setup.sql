-- Script de configuración para Supabase PostgreSQL

-- 1. Crear tabla de marcas
CREATE TABLE brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT
);

-- 2. Crear tabla de modelos de motocicletas
CREATE TABLE motorcycles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    engine_size INTEGER,
    image_url TEXT
);

-- 3. Crear tabla de servicios
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- 4. Crear tabla relacional con precios (Servicios por Motocicleta)
CREATE TABLE motorcycle_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    motorcycle_id UUID REFERENCES motorcycles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    UNIQUE(motorcycle_id, service_id)
);

-- -------------------------------------------------------------
-- Datos de Prueba Iniciales (Mock Data) para probar rápidamente
-- -------------------------------------------------------------

-- Insertar Marcas y guardar los UUIDs (Para este ejemplo usaremos UUIDs generados)
-- Nota: En un caso real insertarías uno por uno o usarías funciones, pero aquí 
-- un ejemplo simple de cómo poblarías.

-- Para facilitar el copiado y pegado inicial, podemos usar gen_random_uuid():
WITH 
  inserted_brands AS (
    INSERT INTO brands (name) VALUES 
    ('Yamaha'), ('Honda'), ('Suzuki'), ('Vento')
    RETURNING id, name
  ),
  inserted_motos AS (
    INSERT INTO motorcycles (brand_id, model_name, engine_size, image_url)
    SELECT id, 'FZ-S 3.0', 149, '/images/moto1.png' FROM inserted_brands WHERE name = 'Yamaha'
    UNION ALL
    SELECT id, 'CBR 250R', 250, '/images/moto2.png' FROM inserted_brands WHERE name = 'Honda'
    UNION ALL
    SELECT id, 'Gixxer SF', 155, '/images/moto3.png' FROM inserted_brands WHERE name = 'Suzuki'
    UNION ALL
    SELECT id, 'Rocketman 250', 250, '/images/moto4.png' FROM inserted_brands WHERE name = 'Vento'
    RETURNING id, model_name
  ),
  inserted_services AS (
    INSERT INTO services (name, description) VALUES 
    ('Afinación Básica', 'Cambio de aceite, bujía y revisión de frenos.'),
    ('Afinación Completa', 'Aceite sintético, bujía iridio, filtro de aire y carburación.'),
    ('Chequeo General', 'Revisión de 15 puntos de seguridad.')
    RETURNING id, name
  )
INSERT INTO motorcycle_services (motorcycle_id, service_id, price)
SELECT 
    m.id, 
    s.id, 
    CASE 
        WHEN s.name = 'Afinación Básica' THEN 450.00
        WHEN s.name = 'Afinación Completa' THEN 850.00
        ELSE 200.00
    END
FROM inserted_motos m CROSS JOIN inserted_services s;
