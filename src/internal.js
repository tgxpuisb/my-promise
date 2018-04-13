const {
    objectOrFunction,
    isFunction
} = require('./utils')

const {
    asap
} = require('./asap')

const originalThen = require('./then')
const originalResolve = require('./promise/resolve')

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
// 处理带有.then方法的对象使用
function handleForeignThenable (promise, thenable, then) {
    asap((promise) => {
        let sealed = false
        const error = tryThen(then, thenable, (value) => {
            if (sealed) {
                return
            }
            sealed = true
            if (thenable !== value) {
                resolve(promise, value)
            } else {
                fulfill(promise, value)
            }
        }, (reason) => {
            if (sealed) {
                return
            }
            sealed = true
            reject(promise, reason)
        }, 'Settle: ' + (promise._label || ' unknow promise'))

        if (!sealed && error) {
            sealed = true
            reject(promise, error)
        }
    }, promise)
}

function handleOwnThenable (promise, thenable) {
    // 对promise进行处理,根据具体状态判断
    if (thenable._state === FULFILLED) {
        fulfill(promise, thenable._result)
    } else if (thenable._state === REJECTED) {
        reject(promise, thenable._result)
    } else {
        subscribe(thenable, undefined, (value) => resolve(promise, value), (reason) => reject(promise, reason))
    }
}

function handleMaybeThenable (promise, maybeThenable, then) {
    if (maybeThenable.constructor === promise.constructor
        && then === originalThen
        && maybeThenable.constructor.resolve === originalResolve
    ) {
        // 判断如果真返resolve了一个promise的值
        handleOwnThenable(promise, maybeThenable)
    } else {
        if (then === TRY_CATCH_ERROR) {
            reject(promise, TRY_CATCH_ERROR.error)
            TRY_CATCH_ERROR.error = null
        } else if (then === undefined) {
            // 如果发现不是promise则走正常的状态变更
            fulfill(promise, maybeThenable)
        } else if (isFunction(then)) {
            // resolve的值如果是一个实现了then方法的对象
            handleForeignThenable(promise, maybeThenable, then)
        } else {
            fulfill(promise, maybeThenable)
        }
    }
}

function resolve (promise, value) {
    if (promise === value) {
        // Promise.resolve()
        reject(promise, selfFulFillment())
    } else if (objectOrFunction(value)) {
        // 可能存在要resolve一个新的promise
        handleMaybeThenable(promise, value, getThen(value))
    } else {
        fulfill(promise, value)
    }
}

function publishRejection (promise) {
    if (promise._onerror) {
        promise._onerror(promise._result)
    }
    publish(promise)
}
// 把状态设置为fulfill
function fulfill (promise, value) {
    if (promise._state !== PENDING) {
        return
    }

    promise._result = value
    promise._state = FULFILLED

    if (promise._subscribers.length !== 0) {
        asap(publish, promise)
    }
}

function reject (promise, reason) {
    if (promise._state !== PENDING) {
        return
    }
    promise._state = REJECTED
    promise._result = reason
    
    asap(publishRejection, promise)
}

// 把promise任务丢到队列中去
function subscribe (parent, child, onFulfillment, onRejection) {
    let { _subscribers } = parent
    let { length } = _subscribers

    parent._onerror = null

    _subscribers[length] = child
    _subscribers[length + FULFILLED] = onFulfillment
    _subscribers[length + REJECTED] = onRejection

    if (length === 0 && parent._state) {
        asap(publish, parent)
    }

}

function publish (promise) {
    let subscribers = promise._subscribers
    let settled = promise._state

    if (subscribers.length === 0) {
        return
    }

    for (let i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i]
        callback = subscribers[i + settled]

        if (child) {
            invokeCallback(settled, child, callback, detail)
        } else {
            callback(detail)
        }
    }

    promise._subscribers.length = 0

}

function tryCatch (callback, detail) {
    try {
        return callback(detail)
    } catch (e) {
        TRY_CATCH_ERROR.error = e
        return TRY_CATCH_ERROR
    }
}
// 触发回调函数用
function invokeCallback (settled, promise, callback, detail) {
    let hasCallback = isFunction(callback)
    let value, error, succeeded, failed

    if (hasCallback) {
        value = tryCatch(callback, detail) // 这里的value就是.then回调函数执行之后的返回值

        if (value === TRY_CATCH_ERROR) {
            // 如果报错
            failed = true
            error = value.error
            value.error = null
        } else {
            succeeded = true
        }

        if (promise === value) {
            // 不可以在.then的回调函数中返回自己
            reject(promise, cannotReturnOwn())
            return
        }
    } else {
        value = detail
        succeeded = true
    }
    // 根据不同的情况判断是resolve还是reject
    if (promise_state !== PENDING) {
        // NOOP
    } else if (hasCallback && succeeded) {
        resolve(promise, value)
    } else if (failed) {
        reject(promise, error)
    } else if (settled === FULFILLED) {
        fulfill(promise, value)
    } else if (settled === REJECTED) {
        reject(promise, value)
    }
}

function initializePromise (promise, resolver) {
    try {
        resolver(function resolvePromise (value) {
            resolve(promise, value)
        }, function rejectPromise (reason) {
            reject(promise, value)
        })
    } catch (e) {
        reject(promise, e)
    }
}

let id = 0

function nextId () {
    return id++
}
// 制造一个空的promise
function makePromise (promise) {
    promise[PROMISE_ID] = id++
    promise._state = undefined
    promise._result = undefined
    promise._subscribers = []
}

module.exports = {
    nextId,
    makePromise,
    getThen,
    noop,
    resolve,
    reject,
    fulfill,
    subscribe,
    publish,
    publishRejection,
    initializePromise,
    invokeCallback,
    FULFILLED,
    REJECTED,
    PENDING,
    handleMaybeThenable,
    PROMISE_ID: Math.random().toString(36).substring(2)
}

