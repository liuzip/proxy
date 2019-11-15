export {
  proxify,
  getComputedMap, // 返回computed和data的映射，返回加入了path的data
}

function getComputedMap(assembled, computed) {
  let key = ''
  let computedMap = new Map() // 用以存储，每个data属性会影响哪些computed值

  let computedProxy = proxify(assembled, {
    get(target, attr) {
      let result = Reflect.get(target, attr)
      if(typeof(result) !== 'object' && typeof(result) !== 'undefined') { // 说明取到真正的值了
        addComputedMap(computedMap, target, { key: attr, list: [ key ] })
      }
      return result
    }
  })

  Object.keys(computed).forEach(func => {
    key = func
    computed[func].call(computedProxy)
  })

  return computedMap
}

// helpers
function addComputedMap(map, dataKey, computed) {
  // 每个data里的参数变动，会影响哪些computed参数的值
  let arr = map.get(dataKey) || []
  let already = arr.find(item => item.key === computed.key)
  if(already) {
    already.list = already.list.concat(computed.list)
    map.set(dataKey, arr)
  } else {
    map.set(dataKey, [...arr, computed])
  }
}

function proxify(data, handler) {
  if(typeof(data) !== 'object') { // string number boolean
    return data
  } else if(data instanceof Array){ // array
    return new Proxy(data.map(d => proxify(d, handler)), handler)
  } else { // object
    return new Proxy(
              Object.keys(data).reduce((res, key) => {
                res[key] = proxify(data[key], handler)
                return res
              }, {}),
              handler
            )
  }
}