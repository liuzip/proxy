import { calculation } from '../../utils/calculation'
import { VIRTUAL_DOM_INTERFACE } from '../../../interface/index'

export default function vIf(target: any): Function {
  return function(node: VIRTUAL_DOM_INTERFACE) {
    if(node.attribute['v-if']) {
      let res = calculation(node.attribute['v-if'])(target)
      let style = node.attribute['style'] || ''
  
      if(!res) style += 'display: none;'
  
      node.attribute['style'] = style
    }
  }
}

