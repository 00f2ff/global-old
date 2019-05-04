
// There's a lot of interesting material on Promises, but I'm going to use a separate container here that's more
	// similar to Scala's Try when dealing with synchronous errors

/**
 * Try is loosely based on Scala's Try trait, which is extended by Success and Failure.
 * I don't like the idea of side effects in code because they tend to have unexpected consequences,
 * so Try is a way to help mitigate certain errors.
 * 
 * Some error handling via try-catch is going to be unavoidable due to null pointers and whatnot
 * 
 * value is the value
 * success is a boolean (i.e. whether that value is an error message)
 * 
 * @deprecated use errors instead
 */

class Try {
	constructor(value, success) {
		this.value = value;
		this.success = success;
	}
}

export default Try;