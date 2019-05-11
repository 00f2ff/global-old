
class Edge {
	/**
	 * Since the graph is bidirectional, "from" and "to" don't mean much.
	 * 
	 * @param {*} value In the future this will track things like type of route
	 * @param {Vertex} from  Vertex
	 * @param {Vertex} to    Vertex
	 */
	constructor(from, to, value) {
		this.from = from;
		this.to = to;
		this.value = value;
		this.distance = Math.hypot(from.x - to.x, from.y - to.y); // this can become a function if we stop capturing "from"
	}
}

export default Edge;