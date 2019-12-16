export {
  VIRTUAL_DOM_INTERFACE,
  parseTemplate,
  updateDocument,
}

import { VIRTUAL_DOM_INTERFACE } from '../interface/index'

function parseTemplate(target: any): Function {
  let getValue = getDataValue(target)

  return function parseWithThis(template: string, start: number = 0): VIRTUAL_DOM_INTERFACE {
    let tag: VIRTUAL_DOM_INTERFACE = {
      name: '',
      text: '',
      children: [],
      closed: false,
      textValue: '',
      attribute: {},
      documentNode: null,
      position: { start, end: 0 },
    }
    let currentPositon: string = 'empty' // empty tag content
  
    for(let i: number = start; i < template.length; i ++) {
      if(template[i] === '<' && currentPositon === 'empty') {
        // 最外层碰到了箭头
        currentPositon = 'tag'
        // 取得tagName
        for(let j: number = (i + 1); j < template.length; j ++) {
          if(template[j] === ' ') {
            i = j // 形如"<div "
            break
          } else if(template[j] === '>') {
            i = j // 形如<div>"
            currentPositon = 'content'
            break
          } else if(template[j] === '/' && template[j + 1] === '>') {
            tag.closed = true // 形如“<div/>”当前tag已经封闭
            tag.position.end = j + 1
            tag = getValue(tag)
            return tag
          } else
            tag.name += template[j]
        }
        continue
      } else if(currentPositon === 'tag') {
        if(template[i] === '/' && template[i + 1] === '>') {
          tag.closed = true // 形如“<div asd="123" />”当前tag已经封闭
          tag.position.end = i + 1
          tag = getValue(tag)
          return tag
        } else if(template[i] === ' ') {
          // 跳过attribute之间的空格
          continue
        } else if(template[i] === '>') {
          currentPositon = 'content' // tag前半部分已完结
          continue
        } else {
          // 处理attribute
          let attributeName: string = ''
          let attributeValue: string = ''
          let startQuote: string = ''
          let isHandleValue: boolean = false
          let j: number = i
    
          for(; j < template.length; j ++) {
            if(!isHandleValue) {
              if(template[j] === '=')
                isHandleValue = true // 开始处理属性值
              else if(template[j] !== ' ')
                attributeName += template[j]
            } else {
              if(!startQuote && (template[j] === "'" || template[j] === '"'))
                startQuote = template[j] // 找到属性值的开始
              else if(startQuote && startQuote === template[j])
                break // 属性值结束
              else
                attributeValue += template[j]
            }
          }
    
          i = j
          tag.attribute[attributeName] = attributeValue // 添加一个属性
          continue
        }
      } else if(currentPositon === 'content') {
        if(template[i] === '<' && template[i + 1] === '/' && template[i + 2 + tag.name.length] === '>' &&
            template.substr((i + 2), tag.name.length) === tag.name ) {
          tag.closed = true // 形如“</div>”，当前tag已经封闭
          tag.position.end = i + tag.name.length + 2
          tag = getValue(tag)
          return tag
        } else if(template[i] === '<' && template[i + 1] !== '/') {
          let subNode: VIRTUAL_DOM_INTERFACE = parseWithThis(template, i)
          tag.children.push(subNode)
          i = subNode.position.end
        } else {
          tag.text += template[i]
        }
      }
    }
  
    tag.position.end = template.length - 1
    tag = getValue(tag)
    return tag
  }
}

function updateDocument(newVd: VIRTUAL_DOM_INTERFACE, oldVd: VIRTUAL_DOM_INTERFACE, root: any): void {
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
  } else { // 一旦当前节点有不同，更新当前节点得所有剩余节点
    newVd.documentNode = createDocumentNode(newVd)
    oldVd.documentNode.replaceWith(newVd.documentNode) // 替换当前节点
    for(let i: number = 0; i < newVd.children.length; i ++) {
      createNewDocument(newVd.children[i], newVd.documentNode) // 更新子节点
    }
  }
}

interface ATTRIBUTE_MAP_INTERFACE {
  'class': Function
}

const ATTRIBUTE_MAP: ATTRIBUTE_MAP_INTERFACE = {
  'class': (classStr: string, dom: any) => {
    classStr.split(' ').forEach(val => dom.classList.add(val.trim()))
  }
}

function createDocumentNode(vd: VIRTUAL_DOM_INTERFACE): any {
  let dom: any = document.createElement(vd.name)
  dom.innerText = vd.textValue

  Object.keys(vd.attribute).forEach((key: string) => {
    if(typeof((ATTRIBUTE_MAP as any)[key]) === 'function') {
      (ATTRIBUTE_MAP as any)[key](vd.attribute[key], dom)
    }
  })

  return dom
}

function isSame(n1: VIRTUAL_DOM_INTERFACE, n2: VIRTUAL_DOM_INTERFACE): boolean {
  return (n1.name === n2.name) && // same tag
          (n1.textValue === n2.textValue) // same text
}

// 将指定得root节点全部给清理干净
function clearRootDocument(root: any): void {
  if(root && root.children && root.children.length > 0)
    root.removeChild(root.children[0])
}

function getDataValue(target: any): Function {
  return function(tag: VIRTUAL_DOM_INTERFACE): VIRTUAL_DOM_INTERFACE {
    let text: string = '' // 记录一段读取到得值
    let textArray: string[] = [] // 数字记录计算得结果
    let innerText: string = tag.text // text数据

    innerText.split(/\{\{(.+?)\}\}/g).map((val: string, index: number) => {
      if(index % 2 === 0) { // 偶数就是字符，奇数就是表达式
        textArray.push(val)
      } else
        textArray.push(getEquatEionValue(target, val))
    })

    if(text)
      textArray.push(text)

    tag.textValue = textArray.join('')

    return tag
  }
}

function getEquatEionValue(target: any, equation: string): string {
  if(!target) 
    return ''

  // 计算text值
  // TODO，每次将所有内容全部写入eval，实在浪费
  let __res$1: any = ''
  eval(`${ Object.keys(target)
            .reduce((str, key) => {
              str += typeof(target[key]) !== 'function' ?
                      `let ${ key }=${ typeof(target[key]) === 'object' ? JSON.stringify(target[key]) : target[key] };` : ''
              return str
            }, '') }; __res$1 = ${ equation };`)
  return <string>__res$1
}
