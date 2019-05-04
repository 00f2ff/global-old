import Exception from "./exception";

// todo: should I create some internal type for what each of these maps is?
/**
 * The Network class is a bidirectional multigraph, modeled as an adjacency map.
 * 
 * The form is:
 * {vertex1: [
 * 	{vertex2: edge},
 *  {vertex3: edge}
 * ]}
 * and in the future multiple edges will be provided
 * 
 * This internal map is a normal Map, and symbolizes the multiple edges with different values that can 
 * connect two vertices.
 * 
 * It extends the ES6 Map class, which means instantiation is the typical `new Network([[key, value]])`
 */
class Network extends Map {

	/**
	 * Add a vertex to the graph. Does not need to connect to other vertices by an edge.
	 * 
	 * @param {Vertex} vertex A vertex to add to the graph
	 */
	addVertex(vertex) {
		if (this.has(vertex)) {
			throw new Exception(`Vertex ${vertex} is already in graph`);
		} else {
			console.log(this)
			return this.set(vertex, null);
		}
	}

	// todo: consider collecting errors a la ValidatedNel
	/**
	 * Adds an edge connecting two vertices. 
	 * Will fail if either the from or to vertices are not present in the graph.
	 * 
	 * @param {Edge} edge
	 */
	addEdge(edge) {
		console.log(edge);
		if (!this.has(edge.from)) {
			throw new Exception(`Vertex: ${edge.from} is not in the graph`);
		} else if (!this.has(edge.to)) {
			throw new Exception(`Vertex: ${edge.to} is not in the graph`);
		} else {
			return this.set(edge.from, edge);
			// const fromVertex = this.get(edge.from);
			// if (fromVertex.has(edge.to)) {
			// 	// todo: this will need to be changed to allow multiple edges
			// 	throw new Exception(`Edge: ${edge} already exists in the graph`);
			// } else {
			// 	return this.set(edge.from, fromVertex.set(edge.to, edge));
			// }
		}
	}




}

export default Network;