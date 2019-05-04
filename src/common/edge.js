
class Edge {
	/**
	 * Since Network is bidirectional, edges don't need to keep track of which vertices they connect.
	 * 
	 * 
	 * @param {*} value In the future this will track things like type of route
	 * @param {Vertex} from  Vertex
	 * @param {Vertex} to    Vertex
	 */
	constructor(value, from, to) {
		this.value = value;
		this.distance = Math.hypot(from.x - to.x, from.y - to.y);
	}
}

export default Edge;