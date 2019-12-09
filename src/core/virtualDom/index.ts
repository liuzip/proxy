import { parseTemplate, updateDocument, clearDocument, diff, VIRTUAL_DOM } from './helpers'
import throttle from '../../utils/throttle'

let virturalDom: VIRTUAL_DOM = null
let rootDom: any = null
let updateThrottle: Function = throttle(16)
let Vue$1: any = null

function mount(template: string, id: string) {
  rootDom = document.getElementById(id)
  if(this)
    Vue$1 = this
  update(template)
  return rootDom
}

function update(template: string) {
  let newVirturalDom: VIRTUAL_DOM = parseTemplate(template, 0)
  updateThrottle(function() {
    let res = diff(newVirturalDom, virturalDom)
    if(res && rootDom) {
      clearDocument(rootDom)
      updateDocument.call(Vue$1, newVirturalDom, rootDom)
      virturalDom = newVirturalDom
    }
  })
}

export {
  mount,
  update
}
