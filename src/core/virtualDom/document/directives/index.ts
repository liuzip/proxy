/*
v-text
v-html
v-show
v-if
v-else
v-else-if
v-for
v-on
v-bind
v-model
v-slot
v-pre
v-cloak
v-once
*/

import vIf from './if'
import { VIRTUAL_DOM_INTERFACE } from '../../../interface/index'

export default function directiveHandlers(target: any) {
  let ifHandler = vIf(target)
  return function(tag: VIRTUAL_DOM_INTERFACE) {
    ifHandler(tag)
    return tag
  }
}