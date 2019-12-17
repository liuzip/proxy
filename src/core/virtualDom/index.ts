import throttle from '../../utils/throttle'
import { VIRTUAL_DOM_INTERFACE } from '../interface/index'
import { parseTemplate, updateDocument } from './document/index'

let virturalDom: VIRTUAL_DOM_INTERFACE = null
let rootDom: any = null
let updateThrottle: Function = throttle(16)

function mount(target: any, template: string) {
  return function(id: string) {
    rootDom = document.getElementById(id)
    update(target, template)()
    return rootDom
  }
}

function update(target: any, template: string): Function {
  return function() {
    let newVirturalDom: VIRTUAL_DOM_INTERFACE = parseTemplate(target)(template)
    updateThrottle(function() {
      if(rootDom) {
        updateDocument(newVirturalDom, virturalDom, rootDom)
        virturalDom = newVirturalDom
      }
    })
  }
}

export {
  mount,
  update
}
