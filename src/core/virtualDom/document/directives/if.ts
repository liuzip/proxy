import { calculation } from '../../utils/calculation'
import { VIRTUAL_DOM_INTERFACE } from '../../../interface/index'

export default function vIf(target: any): Function {
  return function(node: VIRTUAL_DOM_INTERFACE): VIRTUAL_DOM_INTERFACE {
    if(node.attribute['v-if']) {
      let res = calculation(node.attribute['v-if'])(target)
      node.attribute['style'] = `${ node.attribute['style'] || '' }${ res ? '' : 'display: none;' }`

      let next = findNextNode(node)
      if(next) {
        if(next.attribute['v-else-if'])
          vElseIf(target, next, res)
        else if(next.attribute['v-else'] !== void 0)
          vElse(next, res)
      }
    }

    return node
  }
}

function vElseIf(target: any, node: VIRTUAL_DOM_INTERFACE, former: Boolean): void {
  if(node.attribute['v-else-if']) {
    let res = calculation(node.attribute['v-else-if'])(target)
    node.attribute['style'] = `${ node.attribute['style'] || '' }${ !former && res ? '' : 'display: none;' }`
    let next = findNextNode(node)
    if(next) 
      vElse(next, former || res)
  }
}

function vElse(node: VIRTUAL_DOM_INTERFACE, former: Boolean): void {
  if(node.attribute['v-else'] !== void 0) {
    node.attribute['style'] = `${ node.attribute['style'] || '' }${ !former ? '' : 'display: none;' }`
  }
}

function findNextNode(node: VIRTUAL_DOM_INTERFACE): VIRTUAL_DOM_INTERFACE {
  let { parent: { children = [] } = {} } = node
  for(let i = 0; i < children.length; i ++) {
    if(children[i] === node && i < (children.length - 1))
      return children[i + 1]
  }
  return null
}

