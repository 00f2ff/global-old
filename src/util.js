import Vertex from './common/vertex';
import Network from './common/network.js';


export const dimensions = {
  width: 500,
  height: 500,
  padding: 50
}

/**
 * Compute a random demand quotient within range bounds.
 * 
 * @param {Number} low  The lowest allowable quotient to multiply pricing by
 * @param {Number} high The highest allowable quotient to multiply pricing by
 */
export const demandQuotient = (low = 0.5, high = 2) => { 
  return Math.random() * (high - low) + low; 
}

/**
 * todo: duration will need to be more specific, i.e. in terms of tonnage or containers or something
 * Computes the load/unload cost at a station as a function of the station duration
 * 
 * @param {Number} duration The load/unload time of a station
 */
const stationCost = (duration) => { 
  return duration; 
}

// todo: increase the flexibility of demand
// Keeps track of resource type and base price
export const resources = {
  steel: {
    basePrice: 10,
  }, 
  oil: {
    basePrice: 20,
  }, 
  aluminum: {
    basePrice: 30,
  }
}

// an enumeration of location sizes that corresponds with the number of goods they demand, station size, etc
export const locationSize = Object.freeze({
  small: {
    numGoodsDemanded: 1,
    stationDuration: 20,
  }, 
  medium: {
    numGoodsDemanded: 2,
    stationDuration: 10,
  }, 
  large: {
    numGoodsDemanded: 3,
    stationDuration: 5,
  }
});

// Implements the modern Fisher-Yates shuffle
const shuffle = (array, quantity) => {
  let shuffled = array.slice(); // make a copy
  let currentIndex = shuffled.length;
  let tempValue, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex); // Guarantees a value within [0, currentIndex)
    // Avoid out of bounds
    currentIndex--;
    // Swap elements
    tempValue = shuffled[currentIndex];
    shuffled[currentIndex] = shuffled[randomIndex];
    shuffled[randomIndex] = tempValue;
  }
  return shuffled.slice(0, quantity);           
}

const randomBoundedPoint = (num) => {
  return Math.floor(Math.random() * (num - dimensions.padding * 2 + 1) + dimensions.padding);
}

const createVertex = (value) => { 
  return new Vertex(value, randomBoundedPoint(dimensions.width), randomBoundedPoint(dimensions.height));
}

// locations capture just the resource key name, not the value itself. This should enable updating from a central
// source of truth
export const createNaturalResource = (name, size, good) => {
  const duration = locationSize[size]["stationDuration"];
  let value = { // todo: I think what's in value should be a separate class
    name: name,
    type: "natural-resource",
    size: size,
    goods: [],
    stationDuration: duration,
    stationCost: stationCost(duration),
    demandQuotient: demandQuotient(),
  }
  if (good) {
    value.goods.push(good);
  } else {
    const resourceKeys = Object.keys(resources); 
    // todo: it may even make sense to have resources be its own class, maybe a stateless component
    const randomKey = resourceKeys[Math.random() * resourceKeys.length];
    value.goods.push(randomKey);
  }

  return createVertex(value);
}

export const createPopulationCenter = (name, size) => {
  const duration = locationSize[size]["stationDuration"];
  const quantityGoodsDemanded = locationSize[size]["numGoodsDemanded"];
  let value = {
    name: name,
    type: "population-center",
    size: size,
    goods: shuffle(Object.keys(resources), quantityGoodsDemanded),
    stationDuration: duration,
    stationCost: stationCost(duration),
    demandQuotient: demandQuotient(),
  }
  return createVertex(value);
}

// Dijkstra stuff
// Todo: update this to use Map so vertices themselves can be identified
const closestVertex = (distances, visited) => {
  return Array.from(distances.entries()).reduce((lowest, kv) => {
    const [vertex, distance] = kv;
    if ((lowest === null || distance < distances.get(lowest)) && !visited.includes(vertex)) {
      lowest = vertex;
    }
    return lowest;
  }, null);
};

const flattenEdges = (network, vertex) => {
  return Array.from(network.get(vertex).entries()).reduce((newMap, [key, value]) => {
    return newMap.set(key, value[0].weight);
  }, new Map());
}

// Will this algorithm work given that NRs don't have other connections?

// call this for each PC toward each NR that matches a demanded good of the PC

// Adapted from https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04
// with adjustment for adjacency Map implementation
// todo: there's a bug in here in which the closest vertex sometimes starts as the target (i.e. no hops)
// in which case the function will just return with the path and a distance of Infinity. 
// For the time being, I think I can just ignore that since I'm forcing routing through other PCs
const dijkstra = (network, source, target) => {
  const distances = flattenEdges(network, source).set(target, Infinity);

  const parents = Array.from(network.get(source).entries()).reduce((m, [key, value]) => { // used to track path history
    if (key !== target) {
      return m.set(key, source);
    } else {
      return m;
    }
  }, new Map([[target, null]])); 

  const visited = [];

  let vertex = closestVertex(distances, visited);
  while (vertex) {
    let distance = distances.get(vertex);
    let children = flattenEdges(network, vertex);
    for (let kv of children) {
      const [v, e] = kv;
      if (v !== source) { // avoid cycles
        let newDistance = distance + e;
        if (!distances.has(v) || distances.get(v) > newDistance) {
          distances.set(v, newDistance);
          parents.set(v, vertex);
        }
      }
    }
    visited.push(vertex);
    vertex = closestVertex(distances, visited);
  }

  let optimalPath = [target];
  let parent = parents.get(target);
  while (parent) {
    optimalPath.push(parent);
    parent = parents.get(parent);
  }
  
  optimalPath.reverse();  // reverse array to get correct order
  const results = {
    distance: distances.get(target),
    path: optimalPath
  };
  return results;
};

export const populateNetwork = () => {
  // todo: these should be variables elsewhere
  // Dictate how many of each size PC will be initialized
  let PCSettings = {
    small: 3,
    medium: 3,
    large: 3
  };
  // Dictate how many of each NR will be initialized and at what size
  // todo: later, consider changing how many of each resource _type_ is initialized
  let NRSettings = { // todo: when this is sparse, the initialization (non-Dijkstra) sometimes fails
    small: 1,
    medium: 2,
    large: 3
  };
  try {
    let network = new Network();
    // Initialize PCs
    let PCs = [];
    for (let size in PCSettings) {
      let count = PCSettings[size]
      while (count > 0) {
        PCs.push(createPopulationCenter(`${size}-PC-${count}`, size));
        count--;
      }
    }
    // Initialize NRs
    let NRs = [];
    for (let size in NRSettings) {
      let count = NRSettings[size];
      for (let resource of Object.keys(resources)) {
        let thisResourceCount = count;
        while (thisResourceCount > 0) {
          NRs.push(createNaturalResource(`${size}-${resource}-${thisResourceCount}`, size, resource));
          thisResourceCount--;
        }
      }
    }
    // Add vertices
    for (let v of PCs.concat(NRs)) {
      network.addVertex(v);
    }

    // Checks whether a vertex cannot support any more edges
    const atEdgeCapacity = (network, vertex) => {
      const edgeCountReducer = (accumulator, edges) => accumulator + edges.length
      const vertexEdgeArrays = Array.from(network.get(vertex).values());
      const edgeCount = vertexEdgeArrays.reduce(edgeCountReducer, 0);

      // todo: for the time being we're going to say you can't have more edges than initialized goods
      return edgeCount === locationSize[vertex.value.size]["numGoodsDemanded"]
    }

    const findClosestNR = (network, pc, good) => {
      // Match only on NRs that have the correct good and are not already at edge capacity
      let matchesGood = NRs.filter(x => x.value.goods[0] === good && !atEdgeCapacity(network, x));
      let closest = [];
      matchesGood.forEach((nr) => {
        const dist = pc.distanceTo(nr);
        if (closest.length === 0 || dist < closest[1]) {
          closest = [nr, dist];
        }
      });
      return closest[0];
    }
    
    // Create edges
    shuffle(PCs, PCs.length).forEach((pc) => {
      // no PC directly connects to _every_ one of its demanded goods
      shuffle(pc.value.goods, pc.value.goods.length - 1).forEach((good) => { 
        const closestNR = findClosestNR(network, pc, good);
        network.addEdge(pc, closestNR, pc.distanceTo(closestNR));
      });
    });

    // Prune vertices that have no edges
    // this is one of the only functions of mine that does in fact not perform mutation... fix that
    const prune = (network) => {
      let networkCopy = network;
      for (let kv of network.entries()) {
        const [key, value] = kv;
        if (value.size === 0) {
          networkCopy.delete(key);
        }
      }
      return networkCopy;
    }

    /////////////// Shortest-path starts here
    // Add edges (exceeding size limits) that connect every PC to every other PC
    PCs.forEach((pc1) => {
      PCs.forEach((pc2) => {
        if (pc1 !== pc2) {
          network.addEdge(pc1, pc2, pc1.distanceTo(pc2));
        }
      });
    });

    const remainingNRs = Array.from(network.entries()).filter(kv => kv[0].value.type === "natural-resource")

    // Find all optimal paths from Dijkstra's (except direct connections)
    let optimalResults = new Map();
    PCs.forEach((pc) => {
      pc.value.goods.forEach((good) => {
        const viableNRs = remainingNRs.filter(x => x[0].value.goods[0] === good)
        const viablePaths = viableNRs.map(x => dijkstra(network, pc, x[0])); // need vertex itself
        let optimalResult;
        viablePaths.forEach((result) => {
          if (!optimalResult || result.distance < optimalResult.distance) {
            optimalResult = result;
          }
        });

        if (optimalResults.has(pc)) {
          let arr = optimalResults.get(pc)
          arr.push(optimalResult);
          optimalResults.set(pc, arr)
        } else {
          optimalResults.set(pc, [optimalResult])
        }
      });
    });

    // Remove edges connecting to other PCs
    // for (let pc1 of PCs) {
    PCs.forEach((pc1) => {
      PCs.forEach((pc2) => {
        if (pc1 !== pc2) {
          network.removeEdge(pc1, pc2);
        }
      });
    });

    const locationSuppliesGood = (nr, good) => {
      return nr.value.goods[0] === good;
    }

    // Finds the optimalResult (distance and path) for a particular PC's good
    const findGoodOptimalResult = (pc, good) => {
      const ors = optimalResults.get(pc);
      return ors.filter(or => locationSuppliesGood(or.path[or.path.length - 1], good))[0]
    }

    const findExistingNRForGood = (network, pc, good) => {
      return Array.from(network.get(pc).entries()).filter(x => locationSuppliesGood(x[0], good))[0];
    }

    // Replace edges to NRs if it's shorter to travel along an optimalResult (use original network)
    PCs.forEach((pc) => {
      pc.value.goods.forEach((good) => {
        const existingNR = findExistingNRForGood(network, pc, good);
        const optimalResult = findGoodOptimalResult(pc, good);
        if (!existingNR || optimalResult.distance < existingNR[1].weight) {
          const path = optimalResult.path;
          // Add all the requisite edges in the path with corresponding distances
          for (let i = 0; i < path.length - 1; i++) {
            network.addEdge(path[i], path[i+1], path[i].distanceTo(path[i+1]));
          }
        }
      });
    });
    // todo: decide if it's worth keeping optimalResults around since it keeps track of paths 
    // it could be useful to capture for an individual vertex's data maybe

    return prune(network);
  } catch(e) {
    console.log(e);
  }

}