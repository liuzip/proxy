import reactivity from './reactivity'
import { mount } from './virtualDom'

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
  let Vue = reactivity(opts)
  Vue.$mount = mount.bind(Vue, opts.template)
  return Vue
})
