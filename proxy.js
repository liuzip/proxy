let Vue = function(opts) {
  let { data, computed, methods } = opts
  let computedMap = new Map() // 用以存储，每个data属性会影响哪些computed值

  let addComputedMap = function(dataKey, computedKey) {
    // 每个data里的参数变动，会影响哪些computed参数的值
    let arr = computedMap.get(dataKey)
    if(!arr) {
      computedMap.set(dataKey, [ computedKey ])
    } else {
      computedMap.set(dataKey, [...arr, computedKey])
    }
  }

  // 专门用于设定computedMap参数的proxy
  let computedProxy = new Proxy(Object.assign({}, data, computed), {
    get(target, attr) {
      if(setComputedKey) {
        // 设定特定computedKey，需要读取哪个attr
        addComputedMap(attr, setComputedKey)
      }
      return Reflect.get(target, attr)
    },
    set(_1, attr, _2, receiver) {
      // 找到指定的computed，调用对应的函数，从而确定计算指定的computed需要哪些data数据
      computed[attr].call(receiver)
    }
  })

  // 更新computedMap
  let setComputedKey = ''

  Object.keys(computed).forEach(func => {
    setComputedKey = func
    computedProxy[func] = ''
    setComputedKey = ''
  })

  // 返回真正提供给用户的Proxy
  let proxied = new Proxy(Object.assign({}, data, computed, methods), {
      get(target, attr) {
        if(methods[attr]) {
          return methods[attr].bind(target)
        } else {
          return Reflect.get(target, attr)
        }
      },
      set(target, attr, value, receiver) {
        // 设定值
        Reflect.set(target, attr, value)

        // 找到收到影响的computed
        let arr = computedMap.get(attr)
        if(arr) {
          arr.forEach(computedAttr => {
            // 将所有待更新的computed数据重新计算一遍
            computed[computedAttr] && (receiver[computedAttr] = computed[computedAttr].call(receiver))
          })
        }
      }
    })
  
  // 更新所有默认数据，从而更新对应的computed值
  Object.keys(data).forEach(d => proxied[d] = data[d])

  return proxied
}

let instance = Vue({
  data: {
    att1: 1,
    att2: 2
  },
  computed: {
    add() { return this.att1 + this.att2 },
    minus() { return this.att1 - this.att2 },
    sum() { return this.add + this.minus }
  },
  methods: {
    multiple() {
      return this.att1 * this.att2
    }
  }
})

console.log(instance) // { att1: 1, att2: 2, sum: 3, minus: -1 }
console.log(instance.multiple())
instance.att1 = 3
instance.att2 = 5
console.log(instance) // { att1: 3, att2: 1, sum: 4, minus: 2 }
console.log(instance.multiple())
