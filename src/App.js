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
      const randomKey = resourceKeys[Math.random() * resourceKeys.length];
      value.goods.push(randomKey);
    }

    return new Vertex(value, Math.random() * gameInit.width, Math.random() * gameInit.height);
  },
  createPopulationCenter: (name, size) => {
    const duration = gameInit.locationSize[size]["stationDuration"];
    let value = {
      name: name,
      type: "Population Center",
      size: size,
      goods: [],
      stationDuration: duration,
      stationCost: gameInit.stationCost(duration),
      demandQuotient: gameInit.demandQuotient(),
    }
    let availableResources = gameInit.resources;
    console.log(value)

    let quantityGoodsDemanded = gameInit.locationSize[size]["numGoodsDemanded"];
    console.log(quantityGoodsDemanded)
    for (let i; i < quantityGoodsDemanded; i++) {
    // while (quantityGoodsDemanded > 0) {
      let resourceKeys = Object.keys(availableResources);
      let randomKey = resourceKeys[Math.random() * resourceKeys.length];
      value.goods.push({randomKey: availableResources[randomKey]});
      delete availableResources[randomKey];
      quantityGoodsDemanded -= 1;
    }
    console.log(value.goods)

    return new Vertex(value, Math.random() * gameInit.width, Math.random() * gameInit.height);
  }



}

class Location extends React.Component {
  constructor(props) {
    super(props);
  }

  renderGoods() {
    return this.props.vertex.value.goods.map((good, index) => {
      // leverage unary plus just in case of accidental string: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Unary_plus
      return (
        <tr>
          <td>{good}</td>
          <td>{+(gameInit.resources[good]["basePrice"] * this.props.vertex.value.demandQuotient).toFixed(2)}</td>
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

  // todo: full-scale port of location/edge generation (see Scala notes)
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
