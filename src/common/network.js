import Exception from "./exception";
import Edge from "./edge";

// todo: should I create some internal type for what each of these maps is?
/**
 * The Network class is a bidirectional (undirected) multigraph, modeled as an adjacency map.
 * 
 * The form is:
 * {
 * 	vertex1: {
 * 		vertex2: [edge],
 *  	vertex3: [edge]
 * 	},
 * 	vertex2: {
 * 		vertex1: [edge]
 * 	},
 * 	vertex3: {
 * 		vertex1: [edge]
 * 	}
 * }
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
			return this.set(vertex, new Map());
		}
	}

	// todo: consider collecting errors a la ValidatedNel
	/**
	 * Adds an edge connecting two vertices. Since Network is modeled as an undirected adjacency map, 
	 * an edge is added for each of the two vertices.
	 *  
	 * Will fail if either the from or to vertices are not present in the graph.
	 * 
	 * @param {Vertex} v1
	 * @param {Vertex} v2
	 * @param {*} weight
	 */
	addEdge(v1, v2, weight) {
		if (!this.has(v1)) {
			throw new Exception(`Vertex: ${v1.value.name} is not in the graph`);
		} else if (!this.has(v2)) {
			throw new Exception(`Vertex: ${v2.value.name} is not in the graph`);
		} else {
			const addSingleEdge = (from, to) => {
				let map = this.get(from);
				if (map.has(to)) {
					map = map.set(to, map.get(to).push(new Edge(weight)));
				} else {
					map = map.set(to, [new Edge(weight)]);
				}
				return map;
			}

			return this.set(v1, addSingleEdge(v1, v2)).set(v2, addSingleEdge(v2, v1));
		}
	}

}

export default Network;