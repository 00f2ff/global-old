
class Edge {
	/**
	 * Since the graph is bidirectional, "from" and "to" don't mean much.
	 * 
	 * @param {*} value In the future this will track things like type of route
	 * @param {Vertex} v1  Vertex
	 * @param {Vertex} v2    Vertex
	 */
	constructor(v1, v2, value) {
		this.v1 = v1;
		this.v2 = v2;
		this.value = value;
		this.distance = Math.hypot(v1.x - v2.x, v1.y - v2.y); // this can become a function if we stop capturing "from"
	}
}

export default Edge;