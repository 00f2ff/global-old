import Try from "./try";

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

	has(key){
		super.has(key);
	}

	get(key){
		super.get(key);
	}

	set(key, value){
			super.set(key, value);
	}

	/**
	 * Add a vertex to the graph. Does not need to connect to other vertices by an edge.
	 * 
	 * @param {Vertex} vertex A vertex to add to the graph
	 */
	addVertex(vertex) {
		if (this.has(vertex)) {
			return new Try(`Vertex ${vertex} is already in graph`, false);
		} else {
			return new Try(this.set(vertex, undefined), true);
		}
	}

	// todo: consider collecting errors a la ValidatedNel
	/**
	 * Adds an edge connecting two vertices. 
	 * Will fail if either the from or to vertices are not present in the graph, or if edge already exists (temp).
	 * 
	 * @param {Edge} edge
	 */
	addEdge(edge) {
		if (!this.has(edge.from)) {
			return new Try(`Vertex: ${edge.from} is not in the graph`, false);
		} else if (!this.has(edge.to)) {
			return new Try(`Vertex: ${edge.to} is not in the graph`, false);
		} else {
			const fromVertex = this.get(edge.from);
			if (fromVertex.has(edge.to)) {
				// todo: this will need to be changed to allow multiple edges
				return new Try(`Edge: ${edge} already exists in the graph`, false); 
			} else {
				return new Try(this.set(edge.from, fromVertex.set(edge.to, edge)), true);
			}
		}
	}




}

export default Network;