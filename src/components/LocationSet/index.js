import React from 'react';
import { connect } from 'react-redux';

class Location extends React.Component {

  renderGoods() {
    return this.props.vertex.value.goods.reduce((acc, g) => {
      let goodString = `(${g}: ${(this.props.resources[g]["basePrice"] * this.props.vertex.value.demandQuotient).toFixed(2)})`
      if (acc.length === 0) {
        return goodString;
      } else {
        return `${acc}, ${goodString}`;
      }
    }, "");
  }

  printConnections() {
    return [...this.props.edges.entries()].map((kv, index) => {
      const [vertex, ] = kv;
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
      return <Location key={vertex.value.name} vertex={vertex} edges={edges} resources={this.props.utils.resources} />
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

function mapStateToProps(state) {
  return {
    utils: state.utils,
  }
}

export default connect(mapStateToProps)(LocationSet); // does Location need to be connected too?