import { parseTemplate, updateDocument, diff } from './helpers'
import throttle from '../../utils/throttle'

let virturalDom = null
let rootDom = null
let updateThrottle = throttle()

function mount(template, id) {
  rootDom = document.getElementById(id) 
  update(template)
  return rootDom
}

function update(template) {
  let newVirturalDom = parseTemplate(template, 0)
  updateThrottle(function() {
    let res = diff(newVirturalDom, virturalDom)
    if(!res) {
      updateDocument(newVirturalDom, rootDom)
      virturalDom = newVirturalDom
    }
  })
}

export {
  mount,
  update
}
