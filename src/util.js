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

// Implements the modern Fisher-Yates shuffle, selecting `quantity` resources from a randomization of `resources`
const shuffleResources = (quantity) => {
  let shuffled = Object.keys(resources).slice(); // make a copy
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
    goods: shuffleResources(quantityGoodsDemanded),
    stationDuration: duration,
    stationCost: stationCost(duration),
    demandQuotient: demandQuotient(),
  }
  return createVertex(value);
}

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

    const weight = undefined; // This is a placeholder for adding arbitrary weights to edges

    // Checks whether a vertex cannot support any more edges
    const atEdgeCapacity = (network, vertex) => {
      const edgeCountReducer = (accumulator, edges) => accumulator + edges.length
      const vertexEdgeArrays = Array.from(network.get(vertex).values());
      const edgeCount = vertexEdgeArrays.reduce(edgeCountReducer, 0);

      // todo: for the time being we're going to say you can't have more edges than initialized goods
      return edgeCount === locationSize[vertex.value.size]["numGoodsDemanded"]
    }

    const distance = (v1, v2) => {
      return Math.hypot(v1.x - v2.x, v1.y - v2.y)
    }

    const findClosestNR = (network, pc, good) => {
      // Match only on NRs that have the correct good and are not already at edge capacity
      let matchesGood = NRs.filter(x => x.value.goods[0] === good && !atEdgeCapacity(network, x));
      let closest = [];
      for (let nr of matchesGood) {
        const dist = distance(pc, nr);
        if (closest.length === 0 || dist < closest[1]) {
          closest = [nr, dist];
        }
      }
      return closest[0];
    }

    // Create edges
    for (let pc of PCs) {
      for (let good of pc.value.goods) {
        const closestNR = findClosestNR(network, pc, good);
        network.addEdge(pc, closestNR, weight);
      }
    }

    // Prune vertices that have no edges
    const prune = (network) => {
      let networkCopy = network;
      for (let kv of Array.from(network.entries())) {
        const [key, value] = kv;
        if (value.size === 0) {
          networkCopy.delete(key);
        }
      }
      return networkCopy;
    }

    return prune(network);
  } catch(e) {
    console.log(e);
  }

}