export {
  getComputedMap, // 返回computed和data的映射，返回加入了path的data
  getOrganizeData, // 返回结构化得data数据，带了每个节点带了自己得路径
  getRecoverData, // 剥离自定义的__val以及__path数据
}

function getComputedMap({ data, computed }) {
  let store = { path: '', key: '' }
  let computedMap = new Map() // 用以存储，每个data属性会影响哪些computed值

  let computedProxy = proxify(Object.assign({}, data, computed), {
    get(target, attr) {
      store.path = store.path ? `${ store.path }.${ attr }` : attr
      let result = Reflect.get(target, attr)
      if(typeof(result) !== 'object') { // 说明取到真正的值了
        if(store.path) addComputedMap(computedMap, store.path, store.key)
        store.path = ''
      }
      return result
    }
  })

  Object.keys(computed).forEach(func => {
    store.key = func
    store.path = ''
    computed[func].call(computedProxy)
  })

  return computedMap
}

function getOrganizeData(data, oData = {}, path = '') {
  (data instanceof Array ? data : Object.keys(data))
    .forEach((arg1, arg2) => {
      let key = data instanceof Array ? arg2 : arg1
      let current = path ? `${ path }.${ key }` :key

      if(typeof(data[key]) !== 'object') {
        oData[key] = { __val: data[key], __path: current }
        current = ''
      } else {
        oData[key] = { __val: getOrganizeData(data[key], data[key] instanceof Array ? [] : {}, current), __path: current }
      }
    })

  return oData
}

function getRecoverData(data, oData = {}) {
  (data instanceof Array ? data : Object.keys(data))
    .forEach((arg1, arg2) => {
      let key = data instanceof Array ? arg2 : arg1
      let val = data[key]

      if(typeof(val) !== 'object') {
        oData[key] = val
      } else {
        oData[key] = getRecoverData(val, val instanceof Array ? [] : {})
      }
    })
  return oData
}

// helpers
function addComputedMap(map, dataKey, computedKey) {
  // 每个data里的参数变动，会影响哪些computed参数的值
  let arr = map.get(dataKey)
  if(!arr) {
    map.set(dataKey, [ computedKey ])
  } else {
    map.set(dataKey, [...arr, computedKey])
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