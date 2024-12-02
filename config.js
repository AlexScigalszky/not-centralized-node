import { saveSeeds, saveLocalInfo } from './repository/in-memory.js';

export const localNodeUrl = process.env.NODE_URL;
export const nodeName = process.env.NODE_NAME ?? 'unknown name';
const seedNodeUrls = process.env.SEED_NODE_URLS || '';

saveLocalInfo({
    name: nodeName,
    url: localNodeUrl
});
saveSeeds(
    seedNodeUrls ?
        [...seedNodeUrls.split(','), localNodeUrl]
        : [localNodeUrl]
);