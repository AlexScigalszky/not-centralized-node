import { loadSeeds } from './repository/in-memory.js';

export const localNodeUrl = process.env.NODE_URL;
export const nodeName = process.env.NODE_NAME ?? 'unknown name';
const seedNodeUrls = process.env.SEED_NODE_URLS || '';

setLocalInfo({
    name: nodeName,
    url: localNodeUrl
});
loadSeeds(
    seedNodeUrls ?
        [...seedNodeUrls.split(','), localNodeUrl]
        : [localNodeUrl]
);