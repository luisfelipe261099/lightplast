import app from './index.js';
import http from 'http';

const server = http.createServer(app);

server.listen(3000, async () => {
    try {
        const fetch = (await import('node-fetch')).default;
        const res = await fetch('http://localhost:3000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Luis",
                phone: "11999",
                email: "",
                company: "luis",
                status: "new",
                value: 1,
                description: "f"
            })
        });
        const data = await res.json();
        console.log('RESULTADO DA API:', data);
    } catch (e) {
        console.error('ERRO NO FETCH:', e);
    } finally {
        server.close();
        process.exit(0);
    }
});
