
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
		this.distance = Math.hypot(from.x - to.x, from.y - to.y);
	}
}

export default Edge;