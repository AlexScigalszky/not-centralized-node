import fetch from 'node-fetch';
import { listOtherNodes, listKnownNodes, localInfo, listSeedNodes, saveKnownNodes, saveLocalInfo, saveSeeds } from '../repository/in-memory.js';

// Sincronizar nodos
export async function syncNodes() {
    console.log("Sincronizando...")
    console.log("Nodos conocidos:", listKnownNodes());
    var otherNodes = listOtherNodes();
    for (let i = 0; i < otherNodes.length; i++) {
        const nodeUrl = otherNodes[i];
        try {
            console.log("Sincronizando con el nodo", nodeUrl);
            const response = await postNodes(nodeUrl);
            const status = await response.json();
            saveKnownNodes(status.knownNodes);
        } catch (error) {
            console.error(`Error sincronizando con el nodo ${nodeUrl}: ${error.message}`, { error });
            if (listKnownNodes().lengh > 2) {
                saveKnownNodes([...listKnownNodes().filter(x => x !== nodeUrl)]);
            }
        }
    }
    return { status: "ok", knownNodes: listKnownNodes() };
}

// Registrar nodo en nodos semilla
export async function registerNode() {
    listOtherNodes().forEach(async (seedUrl) => {
        try {
            const response = await postNodes(seedUrl);
            if (response.ok) {
                console.log(`Nodo registrado en seed: ${seedUrl}`);
            } else {
                console.error('Error al registrar el nodo:', response.statusText);
            }
        } catch (error) {
            console.error('Error al registrar el nodo:', error);
        }
    });
}

// Registrar nodo en nodos semilla
export function myInfo() {
    return localInfo();
}

// Registrar nodo en los nodos semilla
export async function networkInfo() {
    var rst = [myInfo()];
    var otherNodes = listOtherNodes();
    for (let i = 0; i < otherNodes.length; i++) {
        const response = await fetch(`${otherNodes[i]}/info`);
        rst = [...rst, await response.json()];
    }
    return rst;
}

// Registra un nuevo nodo
export function registerNewNode(nodeUrl) {
    console.log('Agregando el nodo', nodeUrl);
    saveKnownNodes([nodeUrl]);
    console.log("Nodos conocidos:", listKnownNodes());
    return { message: 'Nodo agregado', knownNodes: listKnownNodes() };
}

export async function initialize(nodeUrl, nodeName, seedsStr) {
    saveLocalInfo(nodeUrl, {
        name: nodeName,
        version: '0.0.4'
    });
    saveSeeds(
        seedsStr ?
            [...seedsStr.split(','), nodeUrl]
            : [nodeUrl]
    );

    console.log(`Servidor`, localInfo());
    console.log(`Seeds registrados`, listSeedNodes());
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
        body: JSON.stringify({ nodeUrl: localInfo().url }),
    });
}