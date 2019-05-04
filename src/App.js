import React from 'react';
import logo from './logo.svg';
import './App.css';
import Network from './common/network.js';
import Vertex from './common/vertex';
import Edge from './common/edge';

// function Game() {
//   return (
//     <Network />
//   );
// }

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      network: new Network([])
    }
  }

  // todo: when I do this for real, it'll need a bit more error handling that exits well
  populateNetwork() {
    const a = new Vertex("a");
    const b = new Vertex("b");
    const c = new Vertex("c");
    const aToB = new Edge(1);
    const aToC = new Edge(2);
    const bToC = new Edge(2);
    const addedA = this.state.network.addVertex(a);
    if (addedA.success) this.setState({network: addedA});
    const addedB = this.state.network.addVertex(b);
    if (addedB.success) this.setState({network: addedB});
    const addedC = this.state.network.addVertex(c);
    if (addedC.success) this.setState({network: addedC})

    const addedAtoB = this.state.network.addEdge(a, b, aToB);
    if (addedAtoB.success) this.setState({network: addedAtoB});
    const addedAtoC = this.state.network.addEdge(a, c, aToC);
    if (addedAtoC.success) this.setState({network: addedAtoC});
    const addedBtoC = this.state.network.addEdge(b, c, bToC);
    if (addedBtoC.success) this.setState({network: addedBtoC});


  }

  // todo: this isn't a great key to use, I think
  // The ... is a spread operator, which does different things in React and ES6:
  // React: https://stackoverflow.com/questions/31048953/what-do-these-three-dots-in-react-do
  // Can be used on props to make them all top-level 
  // ES6: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  // Is var-args
  renderTableData() {
    // return (for (const [k, v] of this.state.network) {
    //     return (<tr key={k}> 
    //       <td>{k}</td>
    //       <td>{v}</td>
    //     </tr>);
    //   });
      
    return [...this.state.network].map((entry, index) => { // note: this exercise may not be worthwhile. think more about what I want UI to include
      let value = this.state.network.get(entry)
      return (<tr key={index}> 
        <td>{entry}</td>
        <td>{this.state.network.get(entry)}</td>
      </tr>);
    });
  }

  render() {
    this.populateNetwork();
    return (
      <table>
        <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
        </thead>
        <tbody>
          {this.renderTableData()}
        </tbody>
      </table>
    )
  }
}

// ReactDOM.render(<Game />, document.getElementById("root"));

export default Game;
