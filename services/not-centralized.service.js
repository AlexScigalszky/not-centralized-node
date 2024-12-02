import fetch from 'node-fetch';
import { localNodeUrl, knownNodes, nodeName, updateKnownNodes } from '../config.js';

// Sincronizar nodos
export async function syncNodes() {
    console.log("Sincronizando...")
    console.log("Nodos conocidos:", knownNodes);
    var otherNodes = knownNodes.filter(n => n !== localNodeUrl);
    for (let i = 0; i < otherNodes.length; i++) {
        const nodeUrl = otherNodes[i];
        try {
            console.log("Sincronizando con el nodo", nodeUrl);
            const response = await postNodes(nodeUrl);
            const status = await response.json();
            knownNodes = [...new Set([...knownNodes, ...status.knownNodes])];
        } catch (error) {
            console.error(`Error sincronizando con el nodo ${nodeUrl}: ${error.message}`, { error });
            if (knownNodes.lengh > 2) {
                knownNodes = [...knownNodes.filter(x => x !== nodeUrl)];
            }
        }
    }
    return { status: "ok", knownNodes };
}

// Registrar nodo en nodos semilla
export async function registerNode() {
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

// Registrar nodo en nodos semilla
export async function myInfo() {
    return {
        name: nodeName,
        url: localNodeUrl,
        version: '0.0.2'
    };
}

// Registrar nodo en los nodos semilla
export async function networkInfo() {
    var rst = [myInfo()];
    var otherNodes = knownNodes.filter(n => n !== localNodeUrl);
    for (let i = 0; i < otherNodes.length; i++) {
        const response = await fetch(`${otherNodes[i]}/info`);
        rst = [...rst, await response.json()];
    }
    return rst;
}

// Registra un nuevo nodo
export function registerNewNode(nodeUrl) {
    console.log('Agregando el nodo', nodeUrl);
    knownNodes = [...new Set([...knownNodes, nodeUrl])];
    console.log("Nodos conocidos:", knownNodes);
    return { message: 'Nodo agregado', knownNodes };
}

export async function initialize() {
    console.log(`Servidor ${nodeName} iniciado en ${localNodeUrl}`);
    console.log(`Seeds registrados ${seedNodeUrls}`);
    // Registrar el nodo en el seed después de que el servidor se inicie
    await registerNode();
    // Conectar al nodo semilla al iniciar
    await syncNodes();
}

// Función que envía la URL del nodo local y recibe los nodos conocidos
async function postNodes(url) {
    return await fetch(`${url}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ nodeUrl: localNodeUrl }),
    });
}