import React from 'react';
import './App.css';
import Network from './common/network.js';
import gameInit from './gameInit.js'
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import Konva from 'konva';

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

  printConnections() {
    return [...this.props.edges.entries()].map((kv, index) => {
      const [vertex, edges] = kv;
      return vertex.value.name;
    }).join(", ");
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
            <th>Connections</th>
            <td>{this.printConnections()}</td>
          </tr>
          <tr>
            <th>Goods {value.type === "population-center" ? "Demanded" : "Supplied"}</th>
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

class LocationNode extends React.Component {

  dimensions() {
    let scalar = gameInit.locationSize[this.props.vertex.value.size]["numGoodsDemanded"];
    return 10 * scalar;
  }

  render() {
    let dim = this.dimensions();
    return (
      <Circle
        x={this.props.vertex.x}
        y={this.props.vertex.y}
        width={dim}
        height={dim}
        fill={this.props.color}
      />
    );
  }
}

class Route extends React.Component {

  render() {
    const v1 = this.props.v1, 
          v2 = this.props.v2;
    return(
      <Line 
      points={[v1.x, v1.y, v2.x, v2.y]}
      stroke="red"
      strokeWidth={2}
      />
    )
  }
}

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
    let NRSettings = { // todo: when this is sparse, the initialization (non-Dijkstra) sometimes fails
      small: 3,
      medium: 3,
      large: 3
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

      function distance(v1, v2) {
        return Math.hypot(v1.x - v2.x, v1.y - v2.y)
      }

      function findClosestNR(network, pc, good) {
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
      function prune(network) {
        let networkCopy = network;
        console.log(Array.from(network.entries()))
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

  renderEdges() {
    return [...this.state.network].map((entry, index) => {
      const [vertex, edges] = entry;
      // first render edges (note: this will result in twice-drawn edges because of undirected nature)
      // todo: when I clean up how edges are created, this should draw every edge, just just the vertex-vertex
      for (let edge of edges) {
        const to = edge[0];
        return <Route key={`${vertex.value.name} to ${to.value.name}`} v1={vertex} v2={to} />
      }
    });
  }
  
  renderNetwork() {
    return [...this.state.network].map((entry, index) => {
      const [vertex, edges] = entry;
      // first render edges (note: this will result in twice-drawn edges because of undirected nature)
      // todo: when I clean up how edges are created, this should draw every edge, just just the vertex-vertex
      // for (let edge of edges) {
      //   const to = edge[0];
      //   return <Route key={`${vertex.value.name} to ${to.value.name}`} v1={vertex} v2={to} />
      // }


      // Then render vertices
      let color;
      if (vertex.value.type === "population-center") {
        color = "green";
      } else {
        color = "blue";
      }
      // if (vertex.value.type === type) {
        // return <Location key={vertex.value.name} vertex={vertex} edges={edge} />
      return <LocationNode key={vertex.value.name} vertex={vertex} color={color} />
      // }
    });
  }

  // todo: my rendering needs some cleanup
  render() {
    // Stage is a div container
    // Layer is actual canvas element (so you may have several canvases in the stage)
    // And then we have canvas shapes inside the Layer
    return (
      <Stage width={gameInit.width} height={gameInit.height}>
        <Layer>
          {this.renderEdges()}
          {this.renderNetwork()}
          
        </Layer>
      </Stage>
    );
    // return (
    //   <div id="container"> 
    //     <div className="population-center">
    //       <h2>Population Centers</h2>
    //       {this.renderNetwork(this.state.network, "population-center")}
    //     </div>
    //     <div className="natural-resource">
    //       <h2>Natural Resources</h2>
    //       {this.renderNetwork(this.state.network, "natural-resource")}
    //     </div>
        
    //   </div>
    // )
  }
}

export default Game;
