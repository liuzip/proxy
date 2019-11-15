import { getComputedMap, proxify } from './organize'

export default function({ data, computed = {}, methods = {} }) {
  let assembled = Object.assign({}, JSON.parse(JSON.stringify(data)), computed, methods)
  let computedMap = getComputedMap(assembled, computed)

  // 返回真正提供给用户的Proxy
  // 可读写的，data Proxy

  let proxied = proxify(assembled, {
    get(target, attr) {
      if(methods[attr]) {
        return methods[attr].bind(proxied)
      } else {
        return Reflect.get(target, attr)
      }
    },
    set(target, attr, value, receiver) {
      Reflect.set(target, attr, value)
      let effectArr = computedMap.get(target)
      if(effectArr) {
        let effectedTarget = effectArr.find(item => item.key === attr)
        if(effectedTarget) {
          effectedTarget.list.forEach(key => {
            receiver[key] = computed[key].call(receiver)
          })
        }
      }
      return true
    }
  })

  // 更新所有默认数据，从而更新对应的computed值
  dataSet(data, proxied)

  return proxied
}

// helpers
function dataSet(data, p) {
  Object.keys(data).forEach(d => {
    typeof(data[d]) === 'object' ? dataSet(data[d], p[d]) : (p[d] = data[d])
  })
}

