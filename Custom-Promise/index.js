class Promise {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  status
  value
  reason

  constructor (executor) {
    this.status = Promise.PENDING
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
      if (this.status === Promise.PENDING) {
        this.status = Promise.FULFILLED
        this.value = value
        this.onFulfilled.forEach(fn => fn(value))
      }
    }
    const reject = (error) => {
      if (this.status === Promise.PENDING) {
        this.status = Promise.REJECTED
        this.reason = error
        this.onRejected.forEach(fn => fn(this.reason))
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  resolvePromise (promise, value, resolve, reject) {
    if (promise === value) {
      reject(new TypeError('Chaining cycle detected for promise'))
    }
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let used = false
      try {
        const then = x.then
        if (typeof then === 'function') {
          then.call(x, (y) => {
            if (used) return
            used = true
            resolve(y)
            resolvePromise(promise, y, resolve, reject)
          }, (y) => {
            if (used) return
            used = true
            reject(y)
          })
        } else {
          resolve(x)
        }
      } catch (error) {
        if (used) return
        used = true
        reject(error)
      }
    } else {
      resolve(x)
    }
  }

  onFulfilled = []
  onRejected = []

  then (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    const promise = new Promise((resolve, reject) => {
      if (this.status === Promise.FULFILLED) {
        setTimeout(() => {
          try {
            this.resolvePromise(promise, onFulfilled(this.value), resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
      if (this.status === Promise.REJECTED) {
        setTimeout(() => {
          try {
            this.resolvePromise(promise, onRejected(this.reason), resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
      if (this.status === Promise.PENDING)  {
        this.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              this.resolvePromise(promise, onFulfilled(this.value), resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
        this.onRejected.push(() => {
          setTimeout(() => {
            try {
              this.resolvePromise(promise, onRejected(this.reason), resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    })
  }

  catch () {}

  finally () {}
}

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
  });
  return dfd;
}

module.exports = Promise
