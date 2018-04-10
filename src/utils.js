module.exports = {
    objectOrFunction (x) {
        let type = typeof x
        return x !== null && (type === 'object' || type === 'function')
    },
    isFunction (x) {
        return typeof x === 'function'
    },
    isMaybeThenable (x) {
        return x !== null && typeof x === 'object'
    },
    isArray (x) {
        return Array.isArray(x)
    }
}