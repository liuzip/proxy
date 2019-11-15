import { getComputedMap, getOrganizeData, getRecoverData } from './organize'

export default function(opts) {
  let { data, computed, methods } = opts
  let computedMap = getComputedMap({ data, computed })
  let organizeData = getOrganizeData(data)

  // 返回真正提供给用户的Proxy
  // 可读写的，data Proxy

  let readWriteDateProxy = proxify({ __val: organizeData, __path: '' }, {
    get(target, attr) {
      let ret = Reflect.get(target, attr)

      if(!ret || !(ret.__val)) return ret
      else return typeof(ret.__val) === 'object' ? getRecoverData(ret.__val) : ret.__val
    },
    set(target, attr, value) {
      let item = Reflect.get(target, attr)
      console.log(item)

      if(item && (!item.__val)) {
        item = value
      }
      if(item && item.__path) {
        console.log(item.__path)
        let effectArr = computedMap.get(item.__path)
        if(effectArr) {
          effectArr.forEach(key => {
            readOnlyProxy[key] = computed[key].call(proxied)
          })
        }
      }

      return true
    }
  }).__val

  // 只读的，computed、methods Proxy
  let readOnlyProxy = new Proxy(Object.assign({}, computed, methods), {
    get(target, attr) {
      if(methods[attr]) {
        return methods[attr].bind(proxied)
      } else {
        return Reflect.get(target, attr)
      }
    },
    set(target, attr, value) {
      if(methods[attr]) {
        // 方法不容设定
        return false
      } else {
        Reflect.set(target, attr, value)
        let effectArr = computedMap.get(attr)
        if(effectArr) {
          effectArr.forEach(key => {
            target[key] = computed[key].call(proxied)
          })
        }
        return true
      }
    }
  })
  
  let proxied = new Proxy(Object.assign({}, computed, methods, data), {
    get(_, attr) {
      return (computed[attr] || methods[attr]) ? Reflect.get(readOnlyProxy, attr) : Reflect.get(readWriteDateProxy, attr)
    },
    set(_, attr, value) {
      let readOnly = Reflect.get(readOnlyProxy, attr)
      readOnly ? Reflect.set(readOnlyProxy, attr, value) : Reflect.set(readWriteDateProxy, attr, value)
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

function proxify(data, handler) {
  if(typeof(data.__val) !== 'object') { // string number boolean
    return data
  } else if(data.__val instanceof Array){ // array
    return { __val: new Proxy(data.__val.map(d => proxify(d, handler)), handler), __path: data.__path }
  } else { // object
    return {
            __val: new Proxy(
                      Object.keys(data.__val).reduce((res, key) => {
                        res[key] = proxify(data.__val[key], handler)
                        return res
                      }, {}),
                      handler
                    ),
            __path: data.__path
          }
  }
}
