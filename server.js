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

// Endpoint POST /nodes - Registra un nuevo nodo
app.post('/message', (req, res) => {
    const { id, sender, message } = req.body;
    res.status(200).json(sendMessage(id, sender, message));
});

// Interfaz del nodo
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
              <button class="btn btn-secondary" onclick="syncNode('${node.url}')">Syncronize</button>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `
          </div>

          <!-- Formulario de envío de mensajes -->
          <div class="mt-5">
            <h2>Enviar Mensaje</h2>
            <form id="messageForm">
              <div class="mb-3">
                <label for="messageInput" class="form-label">Mensaje</label>
                <input type="text" class="form-control" id="messageInput" required>
              </div>
              <button type="submit" class="btn btn-success">Enviar</button>
            </form>
          </div>

          <!-- Mostrar mensajes recibidos -->
          <div class="mt-5">
            <h2>Mensajes Recibidos</h2>
            <ul class="list-group" id="messagesList">
    `;

    messages.forEach(msg => {
        html += `<li class="list-group-item"><strong>${msg.sender}:</strong> ${msg.message}</li>`;
    });

    html += `
            </ul>
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

          // Manejar el envío de mensajes
          document.getElementById('messageForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const message = document.getElementById('messageInput').value;
            if (!message) return;

            try {
              const response = await fetch('/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: '${nodeName}', message })
              });
              if (response.ok) {
                const newMessage = await response.json();
                document.getElementById('messagesList').innerHTML += 
                  \`<li class="list-group-item"><strong>${nodeName}:</strong> \${message}</li>\`;
                document.getElementById('messageInput').value = '';
              } else {
                alert('Error enviando mensaje');
              }
            } catch (error) {
              alert('Error: ' + error.message);
            }
          });
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

