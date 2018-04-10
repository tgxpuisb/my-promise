const promisesAplusTests = require("promises-aplus-tests")
const MyPromise = require('../src/promise.js')

const adapter = {
	resolved (value) {
		return Promise.resolve(value)
	},
	rejected (reason) {
		return Promise.reject(reason)
	},
	deferred () {
		let res, rej
		let promise = new Promise((resolve, reject) => {
			res = resolve
			rej = reject
		})
		return {
			promise,
			resolve: res,
			reject: rej
		}
	}
}

promisesAplusTests(adapter, function (err) {
	// All done; output is in the console. Or check `err` for number of failures.
})