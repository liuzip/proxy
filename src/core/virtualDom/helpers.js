export {
  diff,
  parseTemplate,
  updateDocument
}

function parseTemplate(template, start) {
  let tag = {
    name: '',
    text: '',
    position: { start, end: 0 },
    children: [],
    closed: false, // 是否执行完了闭合标签
    attribute: {},
  }
  let currentPositon = 'empty' // empty tag content

  for(let i = start; i < template.length; i ++) {
    if(template[i] === '<' && currentPositon === 'empty') {
      // 最外层碰到了箭头
      currentPositon = 'tag'
      // 取得tagName
      for(let j = (i + 1); j < template.length; j ++) {
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
          return tag
        } else
          tag.name += template[j]
      }
      continue
    } else if(currentPositon === 'tag') {
      if(template[i] === '/' && template[i + 1] === '>') {
        tag.closed = true // 形如“<div asd="123" />”当前tag已经封闭
        tag.position.end = j + 1
        return tag
      } else if(template[i] === ' ') {
        // 跳过attribute之间的空格
        continue
      } else if(template[i] === '>') {
        currentPositon = 'content' // tag前半部分已完结
        continue
      } else {
        // 处理attribute
        let attributeName = ''
        let attributeValue = ''
        let startQuote = ''
        let isHandleValue = false
        let j = i
  
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
        return tag
      } else if(template[i] === '<' && template[i + 1] !== '/') {
        let subNode = parseTemplate(template, i)
        tag.children.push(subNode)
        i = subNode.position.end
      } else {
        tag.text += template[i]
      }
    }
  }

  tag.position.end = template.length - 1
  return tag
}

function updateDocument(vd, root) {
  let node = document.createElement(vd.name)
  node.text = vd.text
  root.appendChild(node)
  for(let i = 0; i < vd.children.length; i ++) {
    updateDocument(vd.children[i], node)
  }
}

function diff() {
  return false
}
