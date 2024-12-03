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
    res.json(await networkInfo());
});
app.get('/ui', async (req, res) => {
    const nodes = await networkInfo();
    let html = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Network Info</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="container mt-5">
          <h1 class="text-center">Network Information</h1>
          <div class="row mt-3">
    `;
    
    nodes.forEach(node => {
      html += `
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${node.name}</h5>
              <p class="card-text">Version: ${node.version}</p>
              <a href="${node.url}/ui" class="btn btn-primary">Open Node</a>
              <button class="btn btn-secondary" onclick="syncNode('${node.url}/sync')">Syncronize</button>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          async function syncNode(nodeUrl) {
            try {
              const response = await fetch(\`\${nodeUrl}/sync\`);
              if (response.ok) {
                alert('Sync initiated for ' + nodeUrl);
              } else {
                alert('Error syncing ' + nodeUrl);
              }
            } catch (error) {
              alert('Error: ' + error.message);
            }
          }
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  });
  

/************ END endpoints ************/

app.listen(port, async () => {

    const nodeUrl = process.env.NODE_URL;
    const nodeName = process.env.NODE_NAME ?? 'unknown name';
    const seedsStr = process.env.SEED_NODE_URLS || '';

    await initialize(nodeUrl, nodeName, seedsStr);
});

