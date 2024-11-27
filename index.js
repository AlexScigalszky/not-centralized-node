// Importar dependencias
import express from 'express';
import fetch from 'node-fetch';

// Inicializar la aplicación Express
const app = express();
app.use(express.json());

const nodeName = process.env.NODE_NAME;
console.log(`Este nodo se llama: ${nodeName}`);

// Iniciar el servidor en el puerto 3000
const port = process.env.PORT || 3000;
// Nodo semilla
const seedNodeUrl = process.env.SEED_NODE_URL || 'missing seed';

// Tiempo entre cada actualización
var refreshTime = 60 * 60 * 1000 // 1 hora

// Lista en memoria de nodos conocidos
let knownNodes = [seedNodeUrl]; 

// Función para registrar el nodo en el semilla
async function registerNode() {
    try {
        const response = await fetch(`${seedNodeUrl}/nodes`, {
            method: 'POST', // Método POST para registrar el nodo
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nodeUrl: nodeName, nodeName }),
        });
        if (response.ok) {
            console.log(`Nodo registrado: ${nodeName}`);
        } else {
            console.error('Error al registrar el nodo:', response.statusText);
        }
    } catch (error) {
        console.error('Error al registrar el nodo:', error);
    }
}

// Función para conectarse al nodo semilla
async function connectToSeedNode() {
    try {
        const response = await fetch(`${seedNodeUrl}/nodes`);
        const nodesFromSeed = await response.json();
        knownNodes = [...new Set([...knownNodes, ...nodesFromSeed])];
        console.log("Conectado al nodo semilla y sincronizado.");
        console.log("Nodos conocidos:", knownNodes);
    } catch (error) {
        console.error("No se pudo conectar al nodo semilla:", error.message);
    }
}

// Sincronizar nodos conocidos periódicamente
function syncNodes() {
    console.log("Sincronizando...")
    console.log("Nodos conocidos:", knownNodes);
    knownNodes.forEach(async (nodeUrl) => {
        try {
            console.log("Sincronizando con el nodo", nodeUrl);
            const response = await fetch(`${nodeUrl}/nodes`);
            const newNodes = await response.json();
            knownNodes = [...new Set([...knownNodes, ...newNodes])];
        } catch (error) {
            console.error(`Error sincronizando con el nodo ${nodeUrl}: ${error.message}`);
            if (knownNodes.lengh !== 0) {
                knownNodes = [...knownNodes.filter(x => x !== nodeUrl)];
            }
        }
    });
}

setInterval(syncNodes,refreshTime); 

// Endpoint GET /nodes - Retorna la lista de nodos
app.get('/nodes', (req, res) => {
    res.json(knownNodes);
});

// Endpoint POST /nodes - Registra un nuevo nodo
app.post('/nodes', (req, res) => {
    const { nodeUrl } = req.body;
    console.log('Agregando el nodo', nodeUrl);
    if (!knownNodes.includes(nodeUrl)) {
        knownNodes.push(nodeUrl);
    }
    console.log("Nodos conocidos:", knownNodes);
    res.status(201).json({ message: 'Nodo agregado', knownNodes });
});

// Endpoint GET /ping - Verifica si el nodo está activo
app.get('/ping', (req, res) => {
    res.json({ message: 'Nodo activo' });
});

app.listen(port, async () => {
    console.log(`Servidor iniciado en el puerto ${port} (${nodeName})`);
    // Registrar el nodo en el seed después de que el servidor se inicie
    await registerNode();
    await connectToSeedNode(); // Conectar al nodo semilla al iniciar
});
