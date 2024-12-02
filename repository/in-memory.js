export let knownNodes = [];
export let seedNodes = [];
export let locaInfo = [];

export function saveKnownNodes(nodes) {
    knownNodes = [...new Set([...knownNodes, ...nodes])];
}

export function listKnownNodes() {
    return knownNodes;
}

export function listSeedNodes() {
    return seedNodes;
}

export function saveSeeds(seeds) {
    saveKnownNodes(seeds);
}

export function saveLocalInfo(info) {
    locaInfo = info;
}

export function listOtherNodes() {
    return knownNodes.filter(n => n !== localNodeUrl);
}