import { resolve } from 'dns';

const {
    objectOrFunction,
    isFunction
} = require('./utils')

const {
    asap
} = require('./asap')

function noop () {}

const PENDING = void 0
const FULFILLED = 1
const REJECTED = 2

const TRY_CATCH_ERROR = {
    error: null
}

function selfFulFillment () {
    return new TypeError('You cannot resolve a promise with itself')
}

function cannotReturnOwn () {
    return new TypeError('A promises callback cannot return that smae promise')
}

function getThen (promise) {
    try {
        return promise.then
    } catch (error) {
        TRY_CATCH_ERROR.error = error
        return TRY_CATCH_ERROR
    }
}

function tryThen (then, value, fulfillmentHandler, rejectionHandler) {
    try {
        then.call(value, fulfillmentHandler, rejectionHandler)
    } catch (e) {
        return e
    }
}

function handleForeignThenable (promise, thenable, then) {
    asap((promise) => {
        let sealed = false
        const error = tryThen(then, thenable, (value) => {
            if (sealed) {
                return
            }
            sealed = true
            if (thenable !== value) {
                // resolve
            }
        })
    }, promise)
}





