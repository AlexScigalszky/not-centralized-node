// Importar dependencias
import express from 'express';
import { myInfo, networkInfo, registerNewNode, syncNodes, initialize } from './services/not-centralized.service.js';

// Inicializar la aplicación Express
const app = express();
app.use(express.json());

// Iniciar el servidor en el puerto 3000
const port = process.env.PORT || 3000;

/************ BEGIN endpoints ************/

// Endpoint para ejecutar la syncronización entre nodos
app.get('/sync', async (req, res) => {
    res.json(await syncNodes());
});

// Endpoint POST /nodes - Registra un nuevo nodo
app.post('/nodes', (req, res) => {
    const { nodeUrl } = req.body;
    res.status(201).json(registerNewNode(nodeUrl));
});

// Endpoint que devuelve la información del nodo
app.get('/info', (req, res) => {
    res.json(myInfo());
});

// Endpoint que devuelve toda la información de la red
app.get('/network', async (req, res) => {
    res.json(networkInfo());
});

/************ END endpoints ************/

app.listen(port, async () => {
    await initialize();
});

