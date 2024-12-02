// Importar dependencias
import express from 'express';
import fetch from 'node-fetch';

// Inicializar la aplicación Express
const app = express();
app.use(express.json());

// Url del Nodo (la forma de identificarlo)
const localNodeUrl = process.env.NODE_URL;
// Nombre del Nodo (la forma de identificarlo)
const nodeName = process.env.NODE_NAME ?? 'unknown name';
// Iniciar el servidor en el puerto 3000
const port = process.env.PORT || 3000;
// Nodo semilla
const seedNodeUrls = process.env.SEED_NODE_URLS || '';

// Lista en memoria de nodos conocidos
let knownNodes = seedNodeUrls ? [...seedNodeUrls.split(','), localNodeUrl] : [localNodeUrl];

/************ BEGIN internal functions ************/

// Función que devuelve toda la info de este nodo
function myInfo() {
    return {
        name: nodeName,
        url: localNodeUrl,
        version: '0.0.2'
    };
}

// Función que envía la url de nodo local y recive los nodos conocidos
async function postNodes(url) {
    return await fetch(`${url}/nodes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeUrl: localNodeUrl }),
    });
}

// Función para registrar el nodo en el semilla
async function registerNode() {
    knownNodes.filter(n => n !== localNodeUrl).forEach(async (seedUrl) => {
        try {
            const response = await postNodes(seedUrl);
            if (response.ok) {
                console.log(`Nodo registrado: ${localNodeUrl} en seed: ${seedUrl}`);
            } else {
                console.error('Error al registrar el nodo:', response.statusText);
            }
        } catch (error) {
            console.error('Error al registrar el nodo:', error);
        }
    });
}

function syncNodes() {
    console.log("Sincronizando...")
    console.log("Nodos conocidos:", knownNodes);
    knownNodes.filter(n => n !== localNodeUrl).forEach(async (nodeUrl) => {
        try {
            console.log("Sincronizando con el nodo", nodeUrl);
            const response = await postNodes(nodeUrl);
            const status = await response.json();
            knownNodes = [...new Set([...knownNodes, ...status.knownNodes])];
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

// Endpoint GET /sync para realizar la actualización de nodos conocidos
app.get('/sync', async (req, res) => {
    syncNodes();
    res.json({ status: "ok", knownNodes });
});

// Endpoint POST /nodes - Registra un nuevo nodo
app.post('/nodes', (req, res) => {
    const { nodeUrl } = req.body;
    console.log('Agregando el nodo', nodeUrl);
    knownNodes = [...new Set([...knownNodes, nodeUrl])];
    console.log("Nodos conocidos:", knownNodes);
    res.status(201).json({ message: 'Nodo agregado', knownNodes });
});

app.get('/info', (req, res) => {
    res.json(myInfo());
});

app.get('/network', async (req, res) => {
    var rst = [myInfo()];
    var otherNodes = knownNodes.filter(n => n !== localNodeUrl);
    for (let i = 0; i < otherNodes.length; i++) {
        const response = await fetch(`${otherNodes[i]}/info`);
        rst = [...rst, await response.json()];
    }
    res.json(rst);
});

/************ END endpoints ************/

app.listen(port, async () => {
    console.log(`Servidor ${nodeName} iniciado en ${localNodeUrl}`);
    console.log(`Seeds registrados ${seedNodeUrls}`);
    // Registrar el nodo en el seed después de que el servidor se inicie
    await registerNode();
    syncNodes(); // Conectar al nodo semilla al iniciar
});
