import app from './index.js';
import http from 'http';

const server = http.createServer(app);

server.listen(3002, async () => {
    try {
        const response = await globalThis.fetch('http://localhost:3002/api/leads', {
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
        const data = await response.json();
        console.log('RESULTADO DA API:', data);
    } catch (e) {
        console.error('ERRO NO FETCH:', e);
    } finally {
        server.close();
        process.exit(0);
    }
});
