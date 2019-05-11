import Exception from "./exception";
import Edge from "./edge";

// todo: should I create some internal type for what each of these maps is?
/**
 * The Network class is a bidirectional (undirected) multigraph, modeled as an adjacency map.
 * 
 * The form is:
 * {vertex1: [
 * 	{vertex2: [edge]},
 *  {vertex3: [edge]}
 * ]}
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
	// todo: when an edge is added, it's added as a from-to _and_ to-from
	addEdge(v1, v2, weight) {
		if (!this.has(v1)) {
			throw new Exception(`Vertex: ${v1.value.name} is not in the graph`);
		} else if (!this.has(v2)) {
			throw new Exception(`Vertex: ${v2.value.name} is not in the graph`);
		} else {
			let v1Map = this.get(v1); 
			let v2Map = this.get(v2);

			if (v1Map.has(v2)) { // todo: refactor as a helper
				v1Map = v1Map.set(v2, v1Map.get(v2).push(new Edge(v1, v2, weight)));
			} else {
				v1Map = v1Map.set(v2, [new Edge(v1, v2, weight)]);
			}
			if (v2Map.has(v1)) {
				v2Map = v2Map.set(v1, v2Map.get(v1).push(new Edge(v2, v1, weight)));
			} else {
				v2Map = v2Map.set(v1, [new Edge(v2, v1, weight)]);
			}
			return this.set(v1, v1Map).set(v2, v2Map);
		}
	}




}

export default Network;