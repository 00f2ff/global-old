import React from 'react';
import './App.css';
import Network from './common/network.js';
import Vertex from './common/vertex';
import Edge from './common/edge';
import Exception from './common/exception';

const gameInit = {
  width: 1000,
  height: 1000,
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
  // locations capture just the resource key name, not the value itself. This should enable updating from a central
  // source of truth
  createNaturalResource: (name, size, good) => {
    const duration = gameInit.locationSize[size]["stationDuration"];
    let value = { // todo: I think what's in value should be a separate class
      name: name,
      type: "Natural Resource",
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

    return new Vertex(value, Math.random() * gameInit.width, Math.random() * gameInit.height);
  },
  createPopulationCenter: (name, size) => {
    const duration = gameInit.locationSize[size]["stationDuration"];
    const quantityGoodsDemanded = gameInit.locationSize[size]["numGoodsDemanded"];
    let value = {
      name: name,
      type: "Population Center",
      size: size,
      goods: gameInit.shuffleResources(quantityGoodsDemanded),
      stationDuration: duration,
      stationCost: gameInit.stationCost(duration),
      demandQuotient: gameInit.demandQuotient(),
    }
    return new Vertex(value, Math.random() * gameInit.width, Math.random() * gameInit.height);
  }



}

class Location extends React.Component {
  constructor(props) {
    super(props);
  }

  renderGoods() {
    return this.props.vertex.value.goods.map((good, index) => {
      return (
        <tr>
          <td>{good}</td>
          <td>{(gameInit.resources[good]["basePrice"] * this.props.vertex.value.demandQuotient).toFixed(2)}</td>
        </tr>
      );
    });
  }

  render() {
    const value = this.props.vertex.value;
    return (
    <div className="location">
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <td>{value.name}</td>
          </tr>
          <tr>
            <th>Location Type</th>
            <td>{value.type}</td>
          </tr>
          <tr>
            <th>Size</th>
            <td>{value.size}</td>
          </tr>
          <tr>
            <th>Station Time</th>
            <td>{value.stationDuration}</td>
          </tr>
          <tr>
            <th>Station Cost</th>
            <td>{value.stationCost}</td>
          </tr>
          <tr>
            <th>Goods {value.type === "Population Center" ? "Demanded" : "Supplied"}</th>
            <td>{<table>
                <thead>
                  <tr>
                    <th>Good</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>{this.renderGoods()}</tbody>
                </table>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>)
  }
}

// todo: I think that PC/NR and vertices need to be the same thing. 
// figure out how to structure the data that way
// IMPORTANT: only Game should keep track of state, which I guess means each Location gets a vertex prop
/**
 * State research:
 * "Because this.props and this.state may be updated asynchronously, you should not rely on their values for 
 * calculating the next state.
 * To fix it, use a second form of setState() that accepts a function rather than an object. That function 
 * will receive the previous state as the first argument, and the props at the time the update is applied as 
 * the second argument:"
 * this.setState((state, props) => ({
  counter: state.counter + props.increment
}));
 */
class Game extends React.Component {
  /**
   * The network initializes mutably, but after that point we keep immutable copies in a history
   * 
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.state = {
      network: this.populateNetwork(), // enhancement: implement history
    }
  }

  // todo: componentDidMount is a good place to set the interval, e.g.
  /**
   * componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  and then (see https://reactjs.org/docs/state-and-lifecycle.html)

   componentWillUnmount() {
    clearInterval(this.timerID);
    }

    tick() {
    this.setState({
      date: new Date()
    });
  }
   */


  // todo: print edges out in the cards, and make separate columns for PC/NR
  populateNetwork() {
    // todo: these should be variables elsewhere
    // Dictate how many of each size PC will be initialized
    let PCSettings = {
      small: 3,
      medium: 3,
      large: 3
    };
    // Dictate how many of each NR will be initialized and at what size
    // todo: later, consider changing how many of each resource _type_ is initialized
    let NRSettings = {
      small: 1,
      medium: 1,
      large: 1
    };
    try {
      let network = new Network();
      // Initialize PCs
      let PCs = [];
      for (let size in PCSettings) {
        let count = PCSettings[size]
        while (count > 0) {
          PCs.push(gameInit.createPopulationCenter(`${size}-PC-${count}`, size));
          count--;
        }
      }
      // Initialize NRs
      let NRs = [];
      for (let size in NRSettings) {
        let count = NRSettings[size];
        for (let resource of Object.keys(gameInit.resources)) {
          let thisResourceCount = count;
          while (thisResourceCount > 0) {
            NRs.push(gameInit.createNaturalResource(`${size}-${resource}-${thisResourceCount}`, size, resource));
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
      function atEdgeCapacity(network, vertex) {
        const edgeCountReducer = (accumulator, edges) => accumulator + edges.length
        const vertexEdgeArrays = Array.from(network.get(vertex).values());
        const edgeCount = vertexEdgeArrays.reduce(edgeCountReducer, 0);

        // todo: for the time being we're going to say you can't have more edges than initialized goods
        return edgeCount === gameInit.locationSize[vertex.value.size]["numGoodsDemanded"]
      }
      // Create edges
      for (let pc of PCs) {
        for (let good of pc.value.goods) {
          for (let nr of NRs) {
            if (nr.value.goods[0] === good && !atEdgeCapacity(network, nr)) {
              network.addEdge(pc, nr, weight);
              break;
            }
          }
        }
      }

      return network;
    } catch(e) {
      console.log(e);
    }

  }
  
  renderNetwork(network) {
    return [...this.state.network].map((entry, index) => {
      const [vertex, edge] = entry;
      return <Location key={vertex.value.name} vertex={vertex} edges={edge} />
    });
  }

  render() {
    return (
      <div id="container">
        {this.renderNetwork(this.state.network)}
      </div>
    )
  }
}

export default Game;
