/**
 * @see https://juejin.cn/post/7157570429928865828
 */

class Sandbox {
  constructor (state: string[]) {
    const iframe = document.createElement('iframe')
    iframe.src = 'about:blank'
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const global = iframe.contentWindow as Window

    return new Proxy(global, {
      has: (target, prop) => {
        if (typeof prop === 'symbol') {
          return false
        }
        if (state.includes(prop)) {
          return false
        }
        if (!target.hasOwnProperty(prop)) {
          throw new Error(`Not find: ${prop}!`)
        }
        return true
      },
    })
  }
}

function makeSandbox (code: string, ctx: Sandbox) {
  new Function('sandbox', `with(sandbox){${code}}`).call(ctx)
}

function test () {
  const code = `console.log(document)`

  const global = ['document', 'XMLHttpRequest', 'fetch', 'WebSocket', 'Image', 'window']

  const proxy = new Sandbox(global)

  makeSandbox(code, proxy)
}
