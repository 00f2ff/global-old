import React from 'react';
import './App.css';
import * as util from '../../util.js';
import Map from '../Map'
import LocationSet from '../LocationSet'

class Player extends React.Component {
  render() {
    return (
      <div className="player">hi</div>
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
// todo: I'm not certain I'm using immutability correctly. Perhaps I just need to make sure my components don't 
// modify state?
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
  
  vertices() {
    return this.state.network.getVerticesWithValues().map(kv => kv[0]);
  }

  filteredNetwork(str) { // todo: figure out why keys() isn't the same as entries() .map(x => x[0])
    //    return this.state.network.getVertices().filter(v => v.value.type === str);
    return this.state.network.getVerticesWithValues().filter(kv => kv[0].value.type === str);
  }

  // todo: my rendering needs some cleanup
  render() {    
    return (
      <React.Fragment>
        <div className="left">
          <Player></Player>
          <LocationSet cn="populationCenters" verticesAndEdges={this.filteredNetwork("population-center")}></LocationSet>
        </div>
        <div className="right">
          <Map dimensions={util.dimensions} edges={this.state.network.getEdges()} vertices={this.vertices()}></Map>
          <LocationSet cn="naturalResources" verticesAndEdges={this.filteredNetwork("natural-resource")}></LocationSet>
        </div>
      </React.Fragment>
    );
  }
}

export default Game;
