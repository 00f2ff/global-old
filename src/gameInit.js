import Vertex from './common/vertex';

const gameInit = {
  width: 500,
  height: 500,
  padding: 50,
  // enhancement: each good should have its on quotient; quotient should cut costs or something for NRs
  demandQuotient: (low = 0.5, high = 2) => { return Math.random() * (high - low) + low; },
  stationCost: (duration) => { return duration; },
  // an enumeration of location sizes that corresponds with the number of goods they demand, station size, etc
  // todo: supported edges should be decoupled from this, however
  locationSize: Object.freeze({
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
  }),
  // todo: increase the flexibility of demand
  // Keeps track of resource type and base price
  resources: {
    steel: {
      basePrice: 10,
    }, 
    oil: {
      basePrice: 20,
    }, 
    aluminum: {
      basePrice: 30,
    }
  },
  // Implements the modern Fisher-Yates shuffle, selecting `quantity` resources from a randomization of `resources`
  shuffleResources: (quantity) => {
    let shuffled = Object.keys(gameInit.resources).slice(); // make a copy
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
  },
  randomBoundedPoint: (num) => {
    return Math.floor(Math.random() * (num - gameInit.padding * 2 + 1) + gameInit.padding);
  },
  createVertex: (value) => { 
    return new Vertex(value, gameInit.randomBoundedPoint(gameInit.width), gameInit.randomBoundedPoint(gameInit.height));
  },
  // locations capture just the resource key name, not the value itself. This should enable updating from a central
  // source of truth
  createNaturalResource: (name, size, good) => {
    const duration = gameInit.locationSize[size]["stationDuration"];
    let value = { // todo: I think what's in value should be a separate class
      name: name,
      type: "natural-resource",
      size: size,
      goods: [],
      stationDuration: duration,
      stationCost: gameInit.stationCost(duration),
      demandQuotient: gameInit.demandQuotient(),
    }
    if (good) {
      value.goods.push(good);
    } else {
      const resourceKeys = Object.keys(gameInit.resources); 
      // todo: it may even make sense to have resources be its own class, maybe a stateless component
      const randomKey = resourceKeys[Math.random() * resourceKeys.length];
      value.goods.push(randomKey);
    }

    return gameInit.createVertex(value);
  },
  createPopulationCenter: (name, size) => {
    const duration = gameInit.locationSize[size]["stationDuration"];
    const quantityGoodsDemanded = gameInit.locationSize[size]["numGoodsDemanded"];
    let value = {
      name: name,
      type: "population-center",
      size: size,
      goods: gameInit.shuffleResources(quantityGoodsDemanded),
      stationDuration: duration,
      stationCost: gameInit.stationCost(duration),
      demandQuotient: gameInit.demandQuotient(),
    }
    return gameInit.createVertex(value);
  }
}

export default gameInit;