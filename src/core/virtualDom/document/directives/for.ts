import { calculation } from '../../utils/calculation'
import { VIRTUAL_DOM_INTERFACE } from '../../../interface/index'

export default function vFor(target: any): Function {
  return function(node: VIRTUAL_DOM_INTERFACE): VIRTUAL_DOM_INTERFACE {
    if(node.attribute['v-for'] !== void 0) {
      let expression = (node.attribute['v-for']).split('in')
      let parent = node.parent
      node.attribute['v-for'] = void 0
      if(!parent)
        return node

      if(expression.length === 2) { // A in B 或者 (A, i) in B的形式
        let src = calculation(expression[1].trim())(target) // 右侧B
        let dst = expression[0].replace(/\(|\)/g, '') // 左侧A 和 i
        let itemName = dst.split(',')[0].trim()
        let indexName = (dst.split(',')[1] || '').trim()
        let nodeIndex = parent.children.findIndex(child => child === node) + 1

        if(src.length === 0)
          return node

        updatePrivateParams(node, Object.assign(indexName ? { [indexName]: 0 } : {}, { [itemName]: src[0] }))
        let newNodes = []
        for(let i = 1; i < src.length; i ++) {
          let newNode = cloneNode(node)
          updatePrivateParams(newNode, Object.assign(indexName ? { [indexName]: i } : {}, { [itemName]: src[i] }))
          newNodes.push(newNode)
        }

        parent.children.splice(nodeIndex, 0, ...newNodes)
      }
    }
    return node
  }
}

function updatePrivateParams(node: VIRTUAL_DOM_INTERFACE, privateParams: any): VIRTUAL_DOM_INTERFACE {
  if(!node.privateParams)
    node.privateParams = privateParams
  else
    Object.assign(node.privateParams, privateParams)

  return node
}

function cloneNode(node: VIRTUAL_DOM_INTERFACE): VIRTUAL_DOM_INTERFACE {
  let newNode: VIRTUAL_DOM_INTERFACE = {
    parent: node.parent,
    name: node.name,
    text: node.text,
    children: node.children.map(child => cloneNode(child)),
    closed: true,
    textValue: '',
    attribute: {},
    privateParams: {},
    documentNode: null,
    position: { start: node.position.start, end: node.position.end },
  }

  Object.keys(node.attribute).forEach(attr => {
    if(attr !== 'v-for')
      newNode.attribute[attr] = node.attribute[attr]
  })
  Object.keys(node.privateParams).forEach(attr => newNode.privateParams[attr] = node.privateParams[attr])

  return newNode
}
