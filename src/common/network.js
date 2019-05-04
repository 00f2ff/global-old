import Try from "./try";
// import Vertex from "./vertex";
// import Edge from "./edge";

// todo: should I create some internal type for what each of these maps is?
/**
 * The Network class is a bidirectional multigraph, modeled as an adjacency map.
 * 
 * The form is:
 * {vertex1: [
 * 	{vertex2: [edge, edge, edge]},
 *  {vertex3}: [edge]
 * ]}
 * 
 * This internal map is a normal Map, and symbolizes the multiple edges with different values that can 
 * connect two vertices.
 * 
 * It extends the ES6 Map class, which means instantiation is the typical `new Network([[key, value]])`
 */
class Network extends Map {

	has(key, value){
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
			return new Try(this.set(vertex, []), true);
		}
	}

	// todo: consider collecting errors a la ValidatedNel
	/**
	 * Adds an edge connecting two vertices. 
	 * Will fail if either the from or to vertices are not present in the graph.
	 * 
	 * @param {Vertex} from 
	 * @param {Vertex} to 
	 * @param {Edge} edge 
	 */
	addEdge(from, to, edge) {
		if (!this.has(from)) {
			return new Try(`Vertex: ${from} is not in the graph`, false);
		} else if (!this.has(to)) {
			return new Try(`Vertex: ${to} is not in the graph`, false);
		} else {
			const fromVertex = this.get(from);
			if (fromVertex.has(to)) {
				return new Try(this.set(from, fromVertex.set(to, fromVertex.get(to).push(edge))), true);
			} else {
				return new Try(this.set(from, fromVertex.set(to, [edge])), true);
			}
		}
	}




}

export default Network;