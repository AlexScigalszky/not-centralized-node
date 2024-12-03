let knownNodes = [];
let seedNodes = [];
let locaInfo = [];
let localNodeUrl = '';

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
    seedNodes = seeds;
    saveKnownNodes(seeds);
}

export function saveLocalInfo(url, extra) {
    localNodeUrl = url;
    locaInfo = {
        url,
        ...extra
    };
}

export function localInfo() {
    return locaInfo;
}

export function listOtherNodes() {
    return knownNodes.filter(n => n !== localNodeUrl);
}