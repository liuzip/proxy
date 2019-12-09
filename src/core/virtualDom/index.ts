import { parseTemplate, updateDocument, VIRTUAL_DOM } from './helpers'
import throttle from '../../utils/throttle'

let virturalDom: VIRTUAL_DOM = null
let rootDom: any = null
let updateThrottle: Function = throttle(16)
let Vue$1: any = null

function mount(template: string, id: string) {
  rootDom = document.getElementById(id)
  if(this)
    Vue$1 = this
  update(template)(true)
  return rootDom
}

function update(template: string) {
  return function(initiate: boolean = false) {
    let newVirturalDom: VIRTUAL_DOM = parseTemplate.call(Vue$1, template, 0)
    updateThrottle(function() {
      if(rootDom) {
        updateDocument(newVirturalDom, virturalDom, rootDom, initiate)
        virturalDom = newVirturalDom
      }
    })
  }
}

export {
  mount,
  update
}
