const internal = require('../internal')
const noop = internal.noop
const _reject = internal.reject

module.exports = function reject (reason) {
    let Constructor = this
    let promise = new Constructor(noop)
    _reject(promise, reason)
    return promise
}