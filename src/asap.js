let len = 0
let vertxNext
let customSchedulerFn
const queue = new Array(1000)


// as soon as possible
function asap (callback, arg) {
    // queue队列第一个存回调,第二个存参数
    queue[len] = callback
    queue[len + 1] = arg
    len += 2
    if (len === 2) {
        // 如果长度是2,这意味着我们需要安排一个异步刷新
        
        if (customSchedulerFn) {
            customSchedulerFn(flush)
        } else {
            scheduleFlush()
        }
    }// 如果额外的回调在队列刷新之前排队,猜测这里可能是在多次.then的时候会遇到len>2的情况
}

function setScheduler (scheduleFn) {
    customSchedulerFn = scheduleFn
}

function setAsap (asapFn) {
    asap = asapFn
}

const browserWindow = (typeof window !== 'undefined') ? window : undefined
const browserGlobal = browserWindow || {}
const BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver
const isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]'

const isWorker = false

// node

function useNextTick () {
    return () => process.nextTick(flush)
}

// vertx一个可以写js的jvm运行时

function useMutationObserver () {
    let iterations = 0
    const observer = new BrowserMutationObserver(flush)
    const node = document.createTextNode('')
    observer.observe(node, {
        characterData: true
    })

    return () => {
        node.data = (iterations = ++iterations % 2)
    }
}

function useSetTimeout () {
    const globalSetTimeout = setTimeout
    return () => globalSetTimeout(flush, 1)
}

function flush () {
    for (let i = 0; i < len; i += 2) {
        let callback = queue[i]
        let arg = queue[i + 1]

        callback(arg)

        queue[i] = undefined
        queue[i + 1] = undefined
    }
    len = 0
}

let scheduleFlush  // 一个小号队列的方式,尽可能的采用微任务

if (isNode) {
    scheduleFlush = useNextTick() 
} else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver()
} else {
    scheduleFlush = useSetTimeout()
}


module.exports = {
    asap,
    setScheduler,
    setAsap
}