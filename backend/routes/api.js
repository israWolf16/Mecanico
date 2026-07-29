const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// 1. Obtener todas las motos para la pantalla principal
router.get('/motorcycles', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('motorcycles')
            .select(`
                id,
                model_name,
                engine_size,
                image_url,
                brands ( id, name, logo_url )
            `);
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching motorcycles:', error);
        res.status(500).json({ error: 'Error al obtener las motos.' });
    }
});

// 2. Obtener los detalles de una moto y sus servicios con precios
router.get('/motorcycles/:id/services', async (req, res) => {
    const { id } = req.params;
    try {
        // Primero obtener la información de la moto
        const { data: motoData, error: motoError } = await supabase
            .from('motorcycles')
            .select(`
                id,
                model_name,
                engine_size,
                image_url,
                brands ( id, name )
            `)
            .eq('id', id)
            .single();

        if (motoError) throw motoError;

        // Luego obtener sus servicios específicos y precios
        const { data: servicesData, error: servicesError } = await supabase
            .from('motorcycle_services')
            .select(`
                price,
                services ( id, name, description )
            `)
            .eq('motorcycle_id', id);

        if (servicesError) throw servicesError;

        res.json({
            motorcycle: motoData,
            services: servicesData
        });
    } catch (error) {
        console.error('Error fetching motorcycle services:', error);
        res.status(500).json({ error: 'Error al obtener los servicios de la moto.' });
    }
});

// 3. Login de administrador
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
        // En una app real, usaríamos JWT. Aquí usamos un simple token estático.
        res.json({ token: 'admin-token-123' });
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

// Middleware simple para verificar token
const checkAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token === 'admin-token-123') {
        next();
    } else {
        res.status(403).json({ error: 'No autorizado' });
    }
};

// 4. Agregar nueva moto
router.post('/motorcycles', checkAuth, async (req, res) => {
    try {
        const { brand_id, model_name, engine_size, image_url } = req.body;
        const { data, error } = await supabase
            .from('motorcycles')
            .insert([{ brand_id, model_name, engine_size, image_url }])
            .select();
            
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error('Error al agregar moto:', error);
        res.status(500).json({ error: 'Error al agregar la moto' });
    }
});

// 5. Eliminar moto
router.delete('/motorcycles/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('motorcycles')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar moto:', error);
        res.status(500).json({ error: 'Error al eliminar la moto' });
    }
});

// 6. Asignar precio de servicio a moto
router.post('/motorcycle-services', checkAuth, async (req, res) => {
    try {
        const { motorcycle_id, service_id, price } = req.body;
        const { data, error } = await supabase
            .from('motorcycle_services')
            .upsert([{ motorcycle_id, service_id, price }], { onConflict: 'motorcycle_id,service_id' })
            .select();
            
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error('Error al asignar servicio:', error);
        res.status(500).json({ error: 'Error al asignar servicio' });
    }
});

// 7. Obtener todas las marcas
router.get('/brands', async (req, res) => {
    try {
        const { data, error } = await supabase.from('brands').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error al obtener marcas:', error);
        res.status(500).json({ error: 'Error al obtener las marcas' });
    }
});

// 8. Obtener todos los servicios disponibles
router.get('/services', async (req, res) => {
    try {
        const { data, error } = await supabase.from('services').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
});

module.exports = router;
