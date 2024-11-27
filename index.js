// Importar dependencias
import express from 'express';
import fetch from 'node-fetch';

// Inicializar la aplicación Express
const app = express();
app.use(express.json());

// Url del Nodo (la forma de identificarlo)
const nodeUrl = process.env.NODE_URL;
// Nombre del Nodo (la forma de identificarlo)
const nodeName = process.env.NODE_NAME ?? 'unknown name';
// Iniciar el servidor en el puerto 3000
const port = process.env.PORT || 3000;
// Nodo semilla
const seedNodeUrl = process.env.SEED_NODE_URLS || '';

// Tiempo entre cada actualización
var refreshTime = 60 * 60 * 1000 // 1 hora

// Lista en memoria de nodos conocidos
let knownNodes = seedNodeUrl ? [seedNodeUrl.split(',')] : [];

/************ BEGIN internal functions ************/

// Función para registrar el nodo en el semilla
async function registerNode() {
    try {
        const response = await fetch(`${seedNodeUrl}/nodes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nodeUrl: nodeUrl }),
        });
        if (response.ok) {
            console.log(`Nodo registrado: ${nodeUrl}`);
        } else {
            console.error('Error al registrar el nodo:', response.statusText);
        }
    } catch (error) {
        console.error('Error al registrar el nodo:', error);
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
/************ END internal functions ************/

/************ BEGIN endpoints ************/

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

app.get('/name', (req, res) => {
    res.json({ name: nodeName });
});

/************ END endpoints ************/

setInterval(syncNodes, refreshTime);

app.listen(port, async () => {
    console.log(`Servidor ${nodeName} iniciado en el puerto ${nodeUrl}`);
    // Registrar el nodo en el seed después de que el servidor se inicie
    await registerNode();
    syncNodes(); // Conectar al nodo semilla al iniciar
});
