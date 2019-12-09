export default function(timeOffset: number = 500): Function {
  let lastHandlerTS: number = Date.now()
  let timeoutIndex: any = 0

  return function handler(callback: Function) {
    let now: number = Date.now()

    if(timeoutIndex)
      clearTimeout(timeoutIndex)

    if(now >= lastHandlerTS + timeOffset) {
      callback()
      lastHandlerTS = now
    } else {
      timeoutIndex = setTimeout(() => handler(callback), timeOffset)
    }
  }
}
