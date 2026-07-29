require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configura las variables de entorno SUPABASE_URL y SUPABASE_KEY en tu archivo .env
const supabaseUrl = process.env.SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'tu-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
