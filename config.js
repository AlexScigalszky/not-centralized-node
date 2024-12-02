import { saveSeeds, saveLocalInfo } from './repository/in-memory.js';

export const localNodeUrl = process.env.NODE_URL;
export const nodeName = process.env.NODE_NAME ?? 'unknown name';
const seedNodeUrls = process.env.SEED_NODE_URLS || '';

saveLocalInfo(localNodeUrl, {
    name: nodeName,
    version: '0.0.3'
});
saveSeeds(
    seedNodeUrls ?
        [...seedNodeUrls.split(','), localNodeUrl]
        : [localNodeUrl]
);