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

module.exports = router;
