const internal = require('../internal')
const noop = internal.noop
const _resolve = internal._resolve

module.exports = function resolve (object) {
    let Constructor = this

    if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object
    }

    let promise = new Constructor(noop)
    return promise
}