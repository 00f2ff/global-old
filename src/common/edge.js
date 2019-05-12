
class Edge {
	/**
	 * Captures a weight for an edge between two vertices.
	 * Doesn't store which vertices it refers to since that can be deduced by walking the Network
	 * 
	 * @param {*} weight Currently just stores distance, but in the future this will track things like type of route
	 */
	constructor(weight) {
		this.weight = weight;
	}
}

export default Edge;