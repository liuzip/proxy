const isSymbol = (val) => typeof val === 'symbol'
const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol)
      .map(key => Symbol[key])
      .filter(isSymbol))

let proxied = {
  instance: null,
  computedStack: null,
  currentComputedKey: ''
}

export default function({ data, computed = {}, methods = {} }) {
  let assembled = Object.assign({},
              JSON.parse(JSON.stringify(data)), computed, methods)
  let mapStack = new Map()

  proxied.computedStack = computed

  proxied.instance = proxify(assembled, mapStack, proxied)

  Object.keys(computed).forEach(func => {
    proxied.currentComputedKey = func
    computed[func].call(proxied.instance)
  })
  delete proxied.currentComputedKey

  dataSet(data, proxied.instance)

  return proxied.instance
}

// helpers
function dataSet(data, p) {
  Object.keys(data).forEach(d => {
    typeof(data[d]) === 'object' ? dataSet(data[d], p[d]) : (p[d] = data[d])
  })
}

function proxify(data, mapStack, proxied) {
  return new Proxy(data, {
    get(target, property, receiver) {
      let res = Reflect.get(target, property, receiver)
      if(isSymbol(property) && builtInSymbols.has(property))
        return res

      if(typeof(res) === 'object')
        return proxify(res, mapStack, proxied)
      else {
        if(proxied.currentComputedKey) {
          updateStack(target, property, mapStack, proxied.currentComputedKey)
        }
        return res
      }
    },
    set(target, property, value) {
      Reflect.set(target, property, value)
      let updateArr = getItemFromStack(target, property, mapStack)
      if(updateArr !== void 0) {
        updateArr.forEach(key => {
          Reflect.set(proxied.instance, key, proxied.computedStack[key].call(proxied.instance))
        })
      }

      return true
    }
  })
}

/*
* mapStack Map( 
*   porpertyStack Map( target 为 key
*     property Set( computed ), 设定的target的property为key，受到影响的computed为Set Value
*     property Set( computed )
*   )
* )
*/
function updateStack(target, property, mapStack, key) {
  let porpertyStack = mapStack.get(target)
  if(porpertyStack === void 0)
    mapStack.set(target, (porpertyStack = new Map()))
  let dep = porpertyStack.get(property)
  if(dep === void 0)
    porpertyStack.set(property, (dep = new Set()))
  if(key)
    dep.add(key)
}

function getItemFromStack(target, property, mapStack) {
  let porpertyStack = mapStack.get(target)
  if(porpertyStack === void 0) 
    return 
  return porpertyStack.get(property)
}
