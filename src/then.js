const {
    invokeCallback,
    subscribe,
    FULFILLED,
    REJECTED,
    noop,
    makePromise,
    PROMISE_ID
} = require('./internal')

const {
    asap
} = require('./asap')

module.exports = function then (onFulfillment, onRejection) {
    const parent = this
    const child = new this.constructor(noop) // 返回一个新的promise

    if (child[PROMISE_ID] === undefined) {
        makePromise(child)
    }

    const { _state } = parent

    // 一开始new出来的promise都是undefined,只有Promise.xxx之后才会有state
    if (_state) {
        // 如果有_state
        const callback = arguments[_state - 1] // 拿到与state状态对应的回调,可能是onFulfillment也可能是onRejection,取决于状态
        asap(() => invokeCallback(_state, child, callback, parent._result))
        // 把一个回调函数丢到里面排队,并且len != 2 的那种
        // 加入之后的回调函数调用后通过invokeCallback此时会调用reject和resolve
    } else {
        // 订阅等待状态改变
        subscribe(parent, child, onFulfillment, onRejection)
    }

    return child
}