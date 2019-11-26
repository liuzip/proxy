export default function(timeOffset = 500) {
  let lastHandlerTS = Date.now()
  let timeoutIndex = null

  return function handler(callback) {
    let now = Date.now()

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
