export {
  VIRTUAL_DOM_INTERFACE,
  parseTemplate,
  updateDocument,
}

interface POSITION_INTERFACE { start: number, end: number }

interface VIRTUAL_DOM_INTERFACE {
  name: string
  text: string
  closed: boolean, // 是否执行完了闭合标签
  attribute: any, // 对应得attribute属性
  textValue: string // text对应得具体内容
  position: POSITION_INTERFACE, // 在template中得位置
  children: Array<VIRTUAL_DOM_INTERFACE>, // 子节点
  documentNode: any, // node节点
}

function parseTemplate(template: string, start: number): VIRTUAL_DOM_INTERFACE {
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
          tag.textValue = getDataValue.call(this, tag.text)
          return tag
        } else
          tag.name += template[j]
      }
      continue
    } else if(currentPositon === 'tag') {
      if(template[i] === '/' && template[i + 1] === '>') {
        tag.closed = true // 形如“<div asd="123" />”当前tag已经封闭
        tag.position.end = i + 1
        tag.textValue = getDataValue.call(this, tag.text)
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
        tag.textValue = getDataValue.call(this, tag.text)
        return tag
      } else if(template[i] === '<' && template[i + 1] !== '/') {
        let subNode: VIRTUAL_DOM_INTERFACE = parseTemplate.call(this, template, i)
        tag.children.push(subNode)
        i = subNode.position.end
      } else {
        tag.text += template[i]
      }
    }
  }

  tag.position.end = template.length - 1
  tag.textValue = getDataValue.call(this, tag.text)
  return tag
}

function updateDocument(newVd: VIRTUAL_DOM_INTERFACE, oldVd: VIRTUAL_DOM_INTERFACE, root: any, initiate: boolean): void {
  if(initiate) {
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
    createNewDocument.call(this, vd.children[i], vd.documentNode)
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

function getDataValue(text: string): string {
  let ret: string = ''
  let equation: string = ''
  let shouldGetVueData: boolean = false
  for(let i: number = 0; i < text.length; i ++) {
    if(!shouldGetVueData) {
      if(text[i] === '{' && text[i + 1] === '{') { // 开始查找Vue里得数据
        shouldGetVueData = true
        i += 1
      } else {
        ret += text[i] // 纯粹得text数据
      }
    }
    else {
      if(text[i] === '}' && text[i + 1] === '}') { // 读取完毕path，从Vue里查值
        shouldGetVueData = false
        i += 1
        ret += getEquatEionValue(this, equation)
        equation = ''
      } else 
      equation += text[i] === ' ' ? '' : text[i] // 读取path
    }
  }

  return ret
}

function getEquatEionValue(obj: any, equation: string): string {
  if(!obj) 
    return ''

  // 计算text值
  // TODO，每次将所有内容全部写入eval，实在浪费
  let __res$1: any = ''
  eval(`${ Object.keys(obj)
            .reduce((str, key) => {
              str += typeof(obj[key]) !== 'function' ?
                      `let ${ key }=${ typeof(obj[key]) === 'object' ? JSON.stringify(obj[key]) : obj[key] };` : ''
              return str
            }, '') }; __res$1 = ${ equation };`)
  return <string>__res$1
}
