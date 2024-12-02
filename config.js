export const localNodeUrl = process.env.NODE_URL;
export const nodeName = process.env.NODE_NAME ?? 'unknown name';
export const seedNodeUrls = process.env.SEED_NODE_URLS || '';
export let knownNodes = seedNodeUrls ? [...seedNodeUrls.split(','), localNodeUrl] : [localNodeUrl];

export function updateKnownNodes(newNodes) {
    knownNodes = [...new Set([...knownNodes, ...newNodes])];
}
