import axios from 'axios';

async function test() {
    try {
        console.log('Testing assign service...');
        // First get a moto
        const motosRes = await axios.get('http://localhost:3001/api/motorcycles');
        if (motosRes.data.length === 0) {
            console.log('No motos found');
            return;
        }
        const motoId = motosRes.data[0].id;
        console.log('Using moto:', motoId);

        // Assign a new service
        const assignRes = await axios.post('http://localhost:3001/api/motorcycle-services', {
            motorcycle_ids: [motoId],
            service_name: 'TEST_SERVICE_123',
            price: 555
        }, {
            headers: { Authorization: 'Bearer admin-token-123' }
        });
        console.log('Assign result:', assignRes.data);

        // Fetch services for this moto
        const servicesRes = await axios.get(`http://localhost:3001/api/motorcycles/${motoId}/services`);
        console.log('Fetched services:', JSON.stringify(servicesRes.data, null, 2));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
