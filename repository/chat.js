let messages = [];

export function saveMessage(id, sender, message) {
    messages = [...messages, { id, sender, message }];
    
    if (messages.size > 1000) {
        messages = new Set([...messages].slice(-500));
    }
}

export function listMessages() {
    return messages;
}

export function alreadyReceived(id) {
    return !messages.find(x => x.id == id);
}