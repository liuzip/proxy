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
import vFor from './for'
import vParams from './default'
import { VIRTUAL_DOM_INTERFACE } from '../../../interface/index'

export default function directiveHandlers(target: any) {
  let ifHandler = vIf(target)
  let forHandler = vFor(target)
  let defaultHandler = vParams(target)
  return function(tag: VIRTUAL_DOM_INTERFACE) {
    return [ forHandler, ifHandler, defaultHandler ]
            .reduce((tag, handler) => handler(tag), tag)
  }
}