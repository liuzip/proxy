const isSymbol = (val) => typeof val === 'symbol'
const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol)
      .map(key => Symbol[key])
      .filter(isSymbol))

let proxied = {
  instance: null,
  computedFuncStack: null,
  currentComputedKey: ''
}

let computedMapStack = new Map() // 用于存储data数据和computed数据的映射关系
let watchMapStack = new Map() // 用于存储watch参数和对应函数的映射关系

export default function({ data, computed = {}, methods = {}, watch = {} }) {
  let assembled = Object.assign({},
              JSON.parse(JSON.stringify(data)), computed, methods)

  proxied.computedFuncStack = computed

  proxied.instance = proxify(assembled, proxied) // 创建proxy对象

  // 设定computed和data数据之间得依赖关系
  Object.keys(computed).forEach(func => {
    proxied.currentComputedKey = func
    proxied.instance[func] = computed[func].call(proxied.instance) // 先用默认的数据计算一次
  })
  delete proxied.currentComputedKey
  // 上述位置之所以需要使用默认数据计算一遍，是为了保证如果某一个computed只返回固定的值（例如返回常数，默认的对象，数组的长度等）
  // 即使dataSet数据的时候，不会重新计算这些computed内容，也能够拥有正确的默认值

  // 设定data数据，以更新comupted数据
  dataSet(data, proxied.instance)

  Object.keys(watch).forEach(key => watchMapStack.set(key, watch[key].bind(proxied.instance)))

  return proxied.instance
}

// helpers
function dataSet(data, p) {
  Object.keys(data).forEach(d => {
    typeof(data[d]) === 'object' ? dataSet(data[d], p[d]) : (p[d] = data[d])
  })
}

function proxify(data, proxied) {
  return new Proxy(data, {
    get(target, property, receiver) {
      let res = Reflect.get(target, property, receiver)
      // 如果是proxy中得symbol，直接返回结果
      if(isSymbol(property) && builtInSymbols.has(property))
        return res

      if(typeof(res) === 'object')
        return proxify(res, proxied) // 子层object也需要监控
      else {
        if(proxied.currentComputedKey) {
          // 如果是更新依赖环节，还需要更新依赖关系
          updateStack(target, property, proxied.currentComputedKey)
        }
        return res
      }
    },
    set(target, property, value) {
      let oldValue = Reflect.get(target, property)
      let watchAvailable = watchMapStack.get(property)
      if(watchAvailable) {
        watchAvailable(oldValue, value)
      }

      Reflect.set(target, property, value)
      let updateArr = getItemFromStack(target, property) // 如果有依赖需要被更新
      if(updateArr !== void 0) {
        updateArr.forEach(key => { // 更新相应得computed数据
          Reflect.set(proxied.instance, key, proxied.computedFuncStack[key].call(proxied.instance))
        })
      }

      return true
    }
  })
}

/*
* computedMapStack Map( 
*   porpertyStack Map( target 为 key
*     property Set( computed ), 设定的target的property为key，受到影响的computed为Set Value
*     property Set( computed )
*   )
* )
*/
function updateStack(target, property, key) {
  let porpertyStack = computedMapStack.get(target)
  if(porpertyStack === void 0)
    computedMapStack.set(target, (porpertyStack = new Map()))
  let dep = porpertyStack.get(property)
  if(dep === void 0)
    porpertyStack.set(property, (dep = new Set()))
  if(key)
    dep.add(key)
}

function getItemFromStack(target, property) {
  let porpertyStack = computedMapStack.get(target)
  if(porpertyStack === void 0) 
    return 
  return porpertyStack.get(property)
}
