const { 
    isFunction
} = require('./utils')

const {
    noop,
    nextId,
    PROMISE_ID,
    initializePromise
} = require('./internal')

const {
    asap,
    setAsap,
    setScheduler
} = require('./asap')

const Resolve = require('./promise/resolve')
const Reject = require('./promise/reject')

const then = require('./then')

function needsResolver () {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor')
}

function needsNew () {
    throw new TypeError('Failed to construct \'Promise\'')
}

class Promise {
    constructor (resolver) {
        this[PROMISE_ID] = nextId()
        this._result = this._state = undefined
        this._subscribers = []

        if (noop !== resolver) {
            typeof resolver !== 'function' && needsResolver()
            if (this instanceof Promise) {
                initializePromise(this, resolver)
            } else {
                needsNew()
            }
        }
    }
    catch (onRejection) {
        return this.then(null, onRejection)
    }
    finally (callback) {}
}

Promise.prototype.then = then
Promise.resolve = Resolve
Promise.reject = Reject


module.exports = Promise