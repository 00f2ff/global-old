import Exception from "./exception";
import Edge from "./edge";

// todo: should I create some internal type for what each of these maps is?
/**
 * The Network class is a bidirectional (undirected) multigraph, modeled as an adjacency map.
 * 
 * The form is:
 * Network(
 * 	vertex1: Map(
 * 		vertex2: [edge],
 *  	vertex3: [edge]
 * 	),
 * 	vertex2: Map(
 * 		vertex1: [edge]
 * 	),
 * 	vertex3: Map(
 * 		vertex1: [edge]
 * 	)
 * )
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
					let arr = map.get(to)
					arr.push(new Edge(weight)) // setting this in one step returns the array size, not value
					map.set(to, arr); 
				} else {
					map.set(to, [new Edge(weight)]);
				}
				return map;
			}

			return this.set(v1, addSingleEdge(v1, v2)).set(v2, addSingleEdge(v2, v1));
		}
	}

	// todo: add error handling
	// A very simple removal function that deletes the map entry on each vertex, rather than removing the edge itself
	removeEdge(v1, v2) {
		this.get(v1).delete(v2);
		this.get(v2).delete(v1);
	}

	/**
	 * Returns an array of all vertex-Map pairs 
	 */
	getVerticesWithValues() {
		return Array.from(this.entries());
	}

	/**
	 * Returns an array of all vertices
	 */
	getVertices() {
		return Array.from(this.keys());
	}

	/**
	 * Returns a list of all edges and their constituent vertices in form of:
	 * [[v1, v2, edge]]
	 */
	getEdges() { 
		return this.getVerticesWithValues().flatMap(kv => {
			const [v1, value] = kv; 
			return Array.from(value.entries()).flatMap(e => {
				const [v2, edges] = e;
				return edges.map(x => [v1, v2, x]);
			});
		})
	}
}

export default Network;