import { calculation } from '../utils/calculation'
import { VIRTUAL_DOM_INTERFACE } from '../../interface/index'

export default function parseTemplate(target: any): Function {
  let getValue = getDataValue(target)

  return function parseWithThis(template: string, start: number = 0): VIRTUAL_DOM_INTERFACE {
    let tag: VIRTUAL_DOM_INTERFACE = {
      name: '',
      text: '',
      parent: null,
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

// helpers
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

  // 计算指定的参数值
  let __res$1: any = calculation(equation)(target)
  return <string>__res$1
}
