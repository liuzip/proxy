import { calculation } from '../../utils/calculation'
import { VIRTUAL_DOM_INTERFACE } from '../../../interface/index'

export default function vParams(target: any): Function {
  return function(node: VIRTUAL_DOM_INTERFACE): VIRTUAL_DOM_INTERFACE {
    Object.keys(node.attribute).forEach(attr => {
      if(attr[0] === ':') { // 自定义配置的参数
        node.attribute[attr.slice(1, attr.length)] = calculation(node.attribute[attr])(target)
        delete node.attribute[attr]
      }
    })

    return node
  }
}