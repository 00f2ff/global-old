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

// todo: I think that PC/NR and vertices need to be the same thing. 
// figure out how to structure the data that way
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
      width: 1000,
      height: 1000,
    }
  }

  createLocation(value, width = 1000, height = 1000) {
    return new Vertex(value, Math.random() * width, Math.random() * height);
  }

  // todo: when I do this for real, it'll need a bit more error handling that exits well
  populateNetwork() {
    const a = this.createLocation("a"),
          b = this.createLocation("b"),
          c = this.createLocation("c");

    const aToB = new Edge(a, b, 1),
          aToC = new Edge(a, c, 2),
          bToC = new Edge(b, c, 2);

    try {
      // console.log((new Network()).addVertex(a))
      return new Network().addVertex(a).addVertex(b).addVertex(c).addEdge(aToB).addEdge(aToC).addEdge(bToC);
    } catch(e) {
      console.log(e);
    }

  }

  // todo: this isn't a great key to use, I think
  // The ... is a spread operator, which does different things in React and ES6:
  // React: https://stackoverflow.com/questions/31048953/what-do-these-three-dots-in-react-do
  // Can be used on props to make them all top-level 
  // ES6: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  // Is var-args
  // renderTableData() {
    // return (for (const [k, v] of this.state.network) {
    //     return (<tr key={k}> 
    //       <td>{k}</td>
    //       <td>{v}</td>
    //     </tr>);
    //   });
      
    // return [...this.state.network].map((entry, index) => { 
    //   let value = this.state.network.get(entry)
    //   return (<tr key={index}> 
    //     <td>{entry}</td>
    //     <td>{this.state.network.get(entry)}</td>
    //   </tr>);
    // });
  // }

  render() {
    return (
      <table>
        <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
        </thead>
        <tbody>
          {/* {this.renderTableData()} */}
        </tbody>
      </table>
    )
  }
}

// ReactDOM.render(<Game />, document.getElementById("root"));

export default Game;
