
// This will get filled out more in the future
class Vertex {
	/**
	 * 
	 * @param {*} value An object containing the data used to render a Location
	 * @param {Number} x     
	 * @param {Number} y 
	 */
	constructor(value, x, y) {
		this.value = value;
		this.x = x;
		this.y = y;
	}

	/**
	 * Find the distance to another vertex
	 * 
	 * @param {Vertex} v 
	 */
	distanceTo(v) {
		return Math.hypot(this.x - v.x, this.y - v.y)
	}
}

export default Vertex;