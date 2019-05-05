import React from 'react';
import './App.css';
import Network from './common/network.js';
import Vertex from './common/vertex';
import Edge from './common/edge';
import Exception from './common/exception';

// function Game() {
//   return (
//     <Network />
//   );
// }

// class Location extends React.Component {
//   // constructor(props) {
//   //   super(props);

//   // }
// }

const gameInit = {
  width: 1000,
  height: 1000,
  // enhancement: each good should have its on quotient; quotient should cut costs or something for NRs
  demandQuotient: (low = 0.5, high = 2) => { return Math.random() * (high - low) + low; },
  stationCost: (duration) => { return duration; },
  // an enumeration of location sizes that corresponds with the number of goods they demand, station size, etc
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
  createNaturalResource: (name, size, good) => {
    const duration = gameInit.locationSize[size][gameInit.stationDuration];
    let value = { // todo: I think what's in value should be a separate class
      name: name,
      type: "NR",
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
      const randomKey = resourceKeys[Math.random() * resourceKeys.length];
      value.goods.push(randomKey);
    }

    return new Vertex(value, Math.random() * gameInit.width, Math.random() * gameInit.height);
  },
  createPopulationCenter: (name, size) => {
    const duration = gameInit.locationSize[size][gameInit.stationDuration];
    let value = {
      name: name,
      type: "PC",
      size: size,
      goods: [],
      stationDuration: duration,
      stationCost: gameInit.stationCost(duration),
      demandQuotient: gameInit.demandQuotient(),
    }
    let availableResources = gameInit.resources;
    
    for (let i; i < gameInit.locationSize[size]["numGoodsDemanded"]; i++) {
      const resourceKeys = Object.keys(availableResources);
      const randomKey = resourceKeys[Math.random() * resourceKeys.length];
      value.goods.push({randomKey: availableResources[randomKey]});
      delete availableResources[randomKey];
    }

    return new Vertex(value, Math.random() * gameInit.width, Math.random() * gameInit.height);
  }



}

class Location extends React.Component {
  constructor(props) {
    super(props);
  }

  // todo: improve keys
  render() {
    const value = this.props.vertex.value;
    return (
    <div key={value.name}>
      <div>Name: {value.name}</div>
      <div>Size: {value.size}</div>
      {/* <div>Edges: {this.props.edges}</div> */}
    </div>)
  }
}

// todo: I think that PC/NR and vertices need to be the same thing. 
// figure out how to structure the data that way
// IMPORTANT: only Game should keep track of state, which I guess means each Location gets a vertex prop
class Game extends React.Component {
  /**
   * The network initializes mutably, but after that point we keep immutable copies in a history
   * 
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.state = {
      network: this.populateNetwork(), // todo: implement history
    }
  }

  populateNetwork() {
    try {
      const a = gameInit.createPopulationCenter("a", "small"),
            b = gameInit.createPopulationCenter("b", "medium"),
            c = gameInit.createPopulationCenter("c", "large"),
            d = gameInit.createNaturalResource("d", "small", "steel");

      const aToB = new Edge(a, b, 1),
            aToC = new Edge(a, c, 2),
            bToC = new Edge(b, c, 2),
            cToD = new Edge(c, d, 3);

      return new Network().addVertex(a).addVertex(b).addVertex(c).addVertex(d).addEdge(aToB).addEdge(aToC).addEdge(bToC).addEdge(cToD);
    } catch(e) {
      console.log(e);
    }

  }
  
  renderNetwork(network) {
    return [...this.state.network].map((entry, index) => {
      const [vertex, edge] = entry;
      return <Location vertex={vertex} edges={edge} />
      // return (<div></div>);
    });
    // for (let [k, v] of network) {
    //   return <Location vertex={k} edges={v} />
    // }
    // return <div></div>
  }

  render() {
    return (
      <div>
        {this.renderNetwork(this.state.network)}
      </div>
      // <table>
      //   <thead>
      //   <tr>
      //     <th>Name</th>
      //     <th>Value</th>
      //   </tr>
      //   </thead>
      //   <tbody>
      //     {/* {this.renderTableData()} */}
      //   </tbody>
      // </table>
    )
  }
}

// ReactDOM.render(<Game />, document.getElementById("root"));

export default Game;
