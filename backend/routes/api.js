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
                accent_color,
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
                accent_color,
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
        const { motorcycle_ids, motorcycle_id, service_id, service_name, price } = req.body;
        const ids = motorcycle_ids || (motorcycle_id ? [motorcycle_id] : []);
        
        if (ids.length === 0) {
            return res.status(400).json({ error: 'Debes seleccionar al menos una moto' });
        }
        
        let finalServiceId = service_id;
        
        if (service_name && !finalServiceId) {
            // Buscamos si existe
            const { data: existingService, error: searchError } = await supabase
                .from('services')
                .select('id')
                .ilike('name', service_name.trim());
                
            if (searchError) throw searchError;
            
            if (existingService && existingService.length > 0) {
                finalServiceId = existingService[0].id;
            } else {
                // Creamos el servicio
                const { data: newService, error: insertError } = await supabase
                    .from('services')
                    .insert([{ name: service_name.trim(), description: 'Servicio agregado' }])
                    .select();
                if (insertError) throw insertError;
                finalServiceId = newService[0].id;
            }
        }
        
        if (!finalServiceId) {
            return res.status(400).json({ error: 'Debes especificar un servicio' });
        }

        const inserts = ids.map(id => ({ motorcycle_id: id, service_id: finalServiceId, price }));

        const { data, error } = await supabase
            .from('motorcycle_services')
            .upsert(inserts, { onConflict: 'motorcycle_id,service_id' })
            .select();
            
        if (error) throw error;
        res.json(data);
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

// 9. Crear cita (público)
router.post('/appointments', async (req, res) => {
    try {
        const { motorcycle_id, service_name, service_price, client_name, client_phone, observations, moto_color, fuel_type, appointment_date, appointment_time } = req.body;
        const { data, error } = await supabase
            .from('appointments')
            .insert([{ motorcycle_id, service_name, service_price, client_name, client_phone, observations, moto_color, fuel_type, appointment_date, appointment_time }])
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ error: 'Error al crear la cita' });
    }
});

// 10. Obtener días bloqueados (público)
router.get('/blocked-dates', async (req, res) => {
    try {
        const { data, error } = await supabase.from('blocked_dates').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error al obtener días bloqueados:', error);
        res.status(500).json({ error: 'Error al obtener días bloqueados' });
    }
});

// 11. Obtener citas (admin) - por fecha o rango
router.get('/appointments', checkAuth, async (req, res) => {
    try {
        const { date, start_date, end_date } = req.query;
        let query = supabase.from('appointments').select('*, motorcycles(model_name, engine_size, image_url, brands(name))');
        if (date) {
            query = query.eq('appointment_date', date);
        } else if (start_date && end_date) {
            query = query.gte('appointment_date', start_date).lte('appointment_date', end_date);
        }
        query = query.order('appointment_date', { ascending: true }).order('appointment_time', { ascending: true });
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ error: 'Error al obtener citas' });
    }
});

// 12. Actualizar cita (admin) - estado, evidencia, notas
router.patch('/appointments/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data, error } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({ error: 'Error al actualizar la cita' });
    }
});

// 13. Bloquear un día (admin)
router.post('/blocked-dates', checkAuth, async (req, res) => {
    try {
        const { blocked_date, reason } = req.body;
        const { data, error } = await supabase
            .from('blocked_dates')
            .insert([{ blocked_date, reason }])
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error('Error al bloquear día:', error);
        res.status(500).json({ error: 'Error al bloquear día' });
    }
});

// 14. Desbloquear un día (admin)
router.delete('/blocked-dates/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('blocked_dates')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error al desbloquear día:', error);
        res.status(500).json({ error: 'Error al desbloquear día' });
    }
});

// 15. Editar moto (admin)
router.patch('/motorcycles/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data, error } = await supabase
            .from('motorcycles')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error('Error al editar moto:', error);
        res.status(500).json({ error: 'Error al editar la moto' });
    }
});

// 16. Eliminar cita (admin)
router.delete('/appointments/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({ error: 'Error al eliminar la cita' });
    }
});

module.exports = router;
