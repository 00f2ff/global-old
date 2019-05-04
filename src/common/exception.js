
// todo: make more exceptions and turn this into a factory or something
class Exception {
	constructor(message) {
		this.name = "Exception";
		this.message = message;
	}

	toString() {
		return `Encountered exception: ${this.name}: ${this.message}`;
	}
}

export default Exception;