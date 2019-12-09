import { VUE } from './interface/index'
import reactivity from './reactivity/index'
import { mount, update } from './virtualDom/index'

(function(root: any, factory: Function) {
  root.Vue = factory
})(window, function(opts: VUE): object {
  let Vue = null
  Vue = reactivity(opts, update.bind(Vue, opts.template))
  Vue.$mount = mount.bind(Vue, opts.template)
  Vue.$forceUpdate = update.bind(Vue, opts.template)
  return Vue
})
