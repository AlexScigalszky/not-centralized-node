export let knownNodes = [];
export let seedNodes = [];
export let locaInfo = [];

function updateKnownNodes(newNodes) {
    knownNodes = [...new Set([...knownNodes, ...newNodes])];
}

export function listKnownNodes() {
    return knownNodes;
}

export function listSeedNodes() {
    return seedNodes;
}

export function loadSeeds(seeds) {
    updateKnownNodes(seeds);
}

export function setLocalInfo(info) {
    locaInfo = info;
}

export function listOtherNodes() {
    return knownNodes.filter(n => n !== localNodeUrl);
}