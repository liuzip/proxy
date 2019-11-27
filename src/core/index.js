import reactivity from './reactivity'
import { mount, update } from './virtualDom'

(function(root, factory) {
  if (typeof define === 'function' && (define.amd || define.cmd)) {
    // AMD or CMD
    define(function () {
      return factory
    })
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory
  } else {
    // Browser globals (root is window)
    root.Vue = factory
  }
})(window, function(opts) {
  let Vue = null
  Vue = reactivity(opts, update.bind(Vue, opts.template))
  Vue.$mount = mount.bind(Vue, opts.template)
  Vue.$forceUpdate = update.bind(Vue, opts.template)
  return Vue
})
