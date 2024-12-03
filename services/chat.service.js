import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { listOtherNodes } from '../repository/in-memory.js';
import { alreadyReceived, saveMessage, listMessages } from '../repository/chat.js';

// Sincronizar nodos
export async function sendMessage(id, sender, message) {
    console.log(`Message: [${id} - ${sender}]: ${message}`);
    if (!id){
        id = uuidv4();
        console.log("se creó el id", id);
    }
    // Chequear que no sea un duplicado
    if (alreadyReceived(id)) {
        console.log(`Duplicado: [${id} - ${sender}]: ${message}`);
        return;
    }
    

    // Guardar el mensaje localmente
    saveMessage(id, sender, message);

    // Reenviar el mensaje a otros nodos conocidos
    listOtherNodes().forEach(async (nodeUrl) => {
        try {
            await fetch(`${nodeUrl}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, sender, message }),
            });
        } catch (error) {
            console.error(`Error enviando mensaje a ${nodeUrl}: ${error.message}`);
        }
    });

    return {
        status: 'Mensaje recibido y distribuido'
    };
}

export function getMessages() {
    return listMessages();
}