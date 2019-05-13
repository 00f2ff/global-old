import * as util from '../../util.js';
import React from 'react';

class Location extends React.Component {

  renderGoods() {
    return this.props.vertex.value.goods.reduce((acc, g) => {
      let goodString = `(${g}: ${(util.resources[g]["basePrice"] * this.props.vertex.value.demandQuotient).toFixed(2)})`
      if (acc.length === 0) {
        return goodString;
      } else {
        return `${acc}, ${goodString}`;
      }
    }, "");
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
      <div className="name">Name: {value.name}</div>
      <div className="size">Size: {value.size}</div>
      <div className="station-time">Station Time: {value.stationDuration}</div>
      <div className="station-cost">Station Cost: {value.stationCost}</div>
      <div className="connections">Connections: {this.printConnections()}</div>
      <div className="goods">
        Goods {value.type === "population-center" ? "Demanded" : "Supplied"}: {this.renderGoods()}
      </div>
    </div>)
  }
}

class LocationSet extends React.Component {
  renderLocations() {
    return this.props.verticesAndEdges.map((kv) => {
      const [vertex, edges] = kv;
      return <Location key={vertex.value.name} vertex={vertex} edges={edges} />
    })
  }

  render() {
    return(
      <div className={this.props.cn}>
        {this.renderLocations()}
      </div>
    )
  }
}

export default LocationSet;