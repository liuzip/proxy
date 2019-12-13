import reactivity from './reactivity/index'
import { VUE_INTERFACE } from './interface/index'
import { mount, update } from './virtualDom/index'

(function(root: any, factory: Function) {
  root.Vue = factory
})(window, function(opts: VUE_INTERFACE): object {
  let Vue = null
  Vue = reactivity(opts, update)
  Vue.$mount = mount(Vue, opts.template)
  return Vue
})
