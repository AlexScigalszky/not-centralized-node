let knownNodes = [];
let seedNodes = [];
let locaInfo = [];
let localNodeUrl = '';

export function saveKnownNodes(nodes) {
    console.log("saveKnownNodes: nodes recibidos:", nodes);
    knownNodes = [...new Set([...knownNodes, ...nodes])];
    console.log("saveKnownNodes: knownNodes actualizados:", knownNodes);
}

export function listKnownNodes() {
    console.log("listKnownNodes: knownNodes actuales:", knownNodes);
    return knownNodes;
}

export function listSeedNodes() {
    console.log("listSeedNodes: seedNodes actuales:", seedNodes);
    return seedNodes;
}

export function saveSeeds(seeds) {
    console.log("saveSeeds: seeds recibidos:", seeds);
    seedNodes = seeds;
    console.log("saveSeeds: seedNodes actualizados:", seedNodes);
    saveKnownNodes(seeds);
}

export function saveLocalInfo(url, extra) {
    console.log("saveLocalInfo: url recibida:", url);
    console.log("saveLocalInfo: información extra recibida:", extra);
    localNodeUrl = url;
    locaInfo = {
        url,
        ...extra
    };
    console.log("saveLocalInfo: locaInfo actualizada:", locaInfo);
}

export function localInfo() {
    console.log("localInfo: locaInfo actual:", locaInfo);
    return locaInfo;
}

export function listOtherNodes() {
    const otherNodes = knownNodes.filter(n => n !== localNodeUrl);
    console.log("listOtherNodes: knownNodes:", knownNodes);
    console.log("listOtherNodes: localNodeUrl:", localNodeUrl);
    console.log("listOtherNodes: otherNodes:", otherNodes);
    return otherNodes;
}
