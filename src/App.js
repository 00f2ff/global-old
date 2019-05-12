import React from 'react';
import './App.css';
import * as util from './util.js';
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
          <td>{(util.resources[good]["basePrice"] * this.props.vertex.value.demandQuotient).toFixed(2)}</td>
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
    let scalar = util.locationSize[this.props.vertex.value.size]["numGoodsDemanded"];
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
      network: util.populateNetwork(), // enhancement: implement history
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
      // for some reason, if I render the routes, it doesn't render all nodes...


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
      <Stage width={util.dimensions.width} height={util.dimensions.height}>
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
