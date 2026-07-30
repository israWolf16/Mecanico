-- Script de configuración para Supabase PostgreSQL (Versión Segura)

-- Eliminar tablas si ya existen (para evitar errores si se ejecuta más de una vez)
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS blocked_dates;
DROP TABLE IF EXISTS motorcycle_services;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS motorcycles;
DROP TABLE IF EXISTS brands;

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
    image_url TEXT,
    accent_color TEXT
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

WITH 
  inserted_brands AS (
    INSERT INTO brands (name) VALUES 
    ('Bajaj'), ('Yamaha'), ('Honda'), ('Suzuki'), ('Vento')
    RETURNING id, name
  ),
  inserted_motos AS (
    INSERT INTO motorcycles (brand_id, model_name, engine_size, image_url)
    SELECT id, 'Pulsar NS 200', 200, 'https://i.pinimg.com/736x/5b/18/1a/5b181a25efdaf80f54ce4f7fe7afe360.jpg' FROM inserted_brands WHERE name = 'Bajaj'
    UNION ALL
    SELECT id, 'FZ-S 3.0', 149, 'https://i.pinimg.com/736x/3a/ae/72/3aae72a46bf043cad52e85030e2e96a4.jpg' FROM inserted_brands WHERE name = 'Yamaha'
    UNION ALL
    SELECT id, 'CBR 250R', 250, 'https://i.pinimg.com/736x/db/5b/9e/db5b9ea4956d501492f0f0e237461dfb.jpg' FROM inserted_brands WHERE name = 'Honda'
    UNION ALL
    SELECT id, 'Gixxer SF', 155, 'https://i.pinimg.com/1200x/08/1f/7a/081f7a10432a24d7d4916096a4398b64.jpg' FROM inserted_brands WHERE name = 'Suzuki'
    UNION ALL
    SELECT id, 'Rocketman 250', 250, 'https://i.pinimg.com/736x/e7/d4/13/e7d4131046a2749101f0696389bc2cbc.jpg' FROM inserted_brands WHERE name = 'Vento'
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
        WHEN s.name = 'Chequeo General' THEN 100.00
        WHEN s.name = 'Afinación Básica' AND m.model_name = 'Pulsar NS 200' THEN 450.00
        WHEN s.name = 'Afinación Completa' AND m.model_name = 'Pulsar NS 200' THEN 850.00
        WHEN s.name = 'Afinación Básica' AND m.model_name = 'FZ-S 3.0' THEN 400.00
        WHEN s.name = 'Afinación Completa' AND m.model_name = 'FZ-S 3.0' THEN 750.00
        WHEN s.name = 'Afinación Básica' AND m.model_name = 'CBR 250R' THEN 600.00
        WHEN s.name = 'Afinación Completa' AND m.model_name = 'CBR 250R' THEN 1100.00
        WHEN s.name = 'Afinación Básica' AND m.model_name = 'Gixxer SF' THEN 420.00
        WHEN s.name = 'Afinación Completa' AND m.model_name = 'Gixxer SF' THEN 800.00
        WHEN s.name = 'Afinación Básica' AND m.model_name = 'Rocketman 250' THEN 380.00
        WHEN s.name = 'Afinación Completa' AND m.model_name = 'Rocketman 250' THEN 700.00
        ELSE 500.00
    END
FROM inserted_motos m CROSS JOIN inserted_services s;

CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    motorcycle_id UUID REFERENCES motorcycles(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    service_price NUMERIC(10,2),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    observations TEXT,
    moto_color TEXT,
    fuel_type TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente','terminada','inconveniente')),
    evidence_images TEXT[],
    mechanic_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE blocked_dates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT
);
