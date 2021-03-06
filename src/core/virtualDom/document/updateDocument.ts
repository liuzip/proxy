import { VIRTUAL_DOM_INTERFACE } from '../../interface/index'

export default function updateDocument(newVd: VIRTUAL_DOM_INTERFACE, oldVd: VIRTUAL_DOM_INTERFACE, root: any): void {
  if(!oldVd) {
    clearRootDocument(root)
    createNewDocument(newVd, root)
  } else
    updateExistedDocument(newVd, oldVd)
}

// helpers
function createNewDocument(vd: VIRTUAL_DOM_INTERFACE, root: any): void {
  vd.documentNode = createDocumentNode(vd) // 找到对应得node节点
  root.appendChild(vd.documentNode)
  for(let i: number = 0; i < vd.children.length; i ++) {
    createNewDocument(vd.children[i], vd.documentNode)
  }
}

function updateExistedDocument(newVd: VIRTUAL_DOM_INTERFACE, oldVd: VIRTUAL_DOM_INTERFACE): void {
  if(isSame(newVd, oldVd)) { // 节点是否相同
    for(let i: number = 0; i < newVd.children.length; i ++) {
      newVd.children[i].documentNode = oldVd.children[i].documentNode // 相同得化，旧节点不再处理，去找子节点
      updateExistedDocument(newVd.children[i], oldVd.children[i])
    }
  } else if(newVd.name === oldVd.name) { // 尽量不要替换节点
    oldVd.documentNode.innerText = newVd.textValue

    Object.keys(newVd.attribute).forEach((key: string) => {
      if(newVd.attribute[key] === oldVd.attribute[key]) // 相同就不用更新了
        return true

      if(typeof(ATTRIBUTE_MAP[key]) === 'function') {
        ATTRIBUTE_MAP[key](newVd.attribute[key], oldVd.documentNode)
      } else {
        oldVd.documentNode.setAttribute(key, newVd.attribute[key])
      }
    })
  } else { // 一旦当前节点有不同，更新当前节点得所有剩余节点
    newVd.documentNode = createDocumentNode(newVd)
    oldVd.documentNode.replaceWith(newVd.documentNode) // 替换当前节点
    for(let i: number = 0; i < newVd.children.length; i ++) {
      createNewDocument(newVd.children[i], newVd.documentNode) // 更新子节点
    }
  }
}

const ATTRIBUTE_MAP: any = {
  class(classStr: string, dom: any) {
    classStr.split(' ').forEach(val => dom.classList.add(val.trim()))
  },
  style(styleStr: string, dom: any) {
    styleStr.split(';').forEach(s => {
      let [ name, value ] = s.split(':').map(v => v.trim())
      dom.style[name] = value
    })
  },
  value(value: any, dom: any) { dom.value = value }
}

function createDocumentNode(vd: VIRTUAL_DOM_INTERFACE): any {
  let dom: any = document.createElement(vd.name)
  dom.innerText = vd.textValue

  Object.keys(vd.attribute).forEach((key: string) => {
    if(typeof(ATTRIBUTE_MAP[key]) === 'function') {
      ATTRIBUTE_MAP[key](vd.attribute[key], dom)
    } else {
      dom.setAttribute(key, vd.attribute[key])
    }
  })

  return dom
}

function isSame(n1: VIRTUAL_DOM_INTERFACE, n2: VIRTUAL_DOM_INTERFACE): boolean {
  return (n1.name === n2.name) && // same tag
          (n1.textValue === n2.textValue) && // same text
          (!Object.keys(n1.attribute).some(attr => n1.attribute[attr] !== n2.attribute[attr])) && // same attribute
          (!Object.keys(n2.attribute).some(attr => n1.attribute[attr] !== n2.attribute[attr])) // same attribute
}

// 将指定得root节点全部给清理干净
function clearRootDocument(root: any): void {
  if(root && root.children && root.children.length > 0)
    root.removeChild(root.children[0])
}
