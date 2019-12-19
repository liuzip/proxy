interface AST_NODE {
  type: string
  value: string
  children?: AST_NODE[]
}

interface TOKEN_NODE { type: string, value: string }

export function calculation(expression: string): Function {
  let tokens = tokenizer(expression)
  let ast = walker(tokens)()
  return function calculateExpression(target: any, node: AST_NODE = ast): any {
    if(node.type === 'Parameter')
      return get(target, node.value, '')
    else if(node.type === 'Function') {
      let func = get(target, node.value, function(){})
      let arg = node.children[0].type !== 'Empty' ? calculateExpression(target, node.children[0]) : ''
      if(window && get(window, node.value) === void 0) {
        func = get(target, node.value, function(){})
        return func.call(target, arg)
      }
      else {
        func = get(window, node.value)
        return func(arg)
      }
    } else {
      let left = calculateExpression(target, node.children[0])
      let right = calculateExpression(target, node.children[1])
      return eval(`${ left } ${ node.value } ${ right }`)
    }
  }
}

// helpers
// 拆分操作符
function tokenizer(expression: string) :TOKEN_NODE[] {
  return expression.split(/(\+|-|\*|\/|\(|\)|\>|<|===|==|\<=|\>=)/g)
      .map(w => w.trim()).filter(Boolean)
      .map(w => {
        if(w === '(' || w === ')')
          return { type: 'parenthesis', value: w }
        else if(w === '+' || w === '-' || w === '*' || w === '/' || w === '>' || w === '<' ||
            w === '===' || w === '==' || w === '<=' || w === '>=')
          return { type: 'operator', value: w }
        else
          return { type: 'parameter', value: w }
      })
}

// 建立AST tree
// 四则运算的AST树：
// 1+2*3+(4-5*6)*7
//   +
//  / \
// 1    +
//    /   \
//   *     *
//  / \   / \
// 2   3 -   7
//      / \
//     4   *
//        / \
//       5   6

// 生成的数据结构应该能够表明四则运算的操作顺序
// {
//   type: '', // Operator - 操作符 Parameter - 操作对象 Function - 函数
//   value: '', // 数值
//   children: [Object, Object] // 如果是操作符，则具有俩子节点
// }
function walker(tokens: TOKEN_NODE[]) {
  const EMPTY_NODE: AST_NODE = { type: 'Empty', value: '' }

  function isThereParenthesis(list: TOKEN_NODE[]) {
    let sp = list.findIndex((t: TOKEN_NODE) => t.type === 'parenthesis' && t.value === '(')
    return [ sp, findNextParenthesis(list, sp) ]
  }

  function findNextParenthesis(list: TOKEN_NODE[], sp: number): number { // 找到对应匹配的反括号
    let parenthesisLevel = 1 // 括号层级数
    for(let index = sp + 1; index < list.length; index ++) {
      if(list[index].type === 'parenthesis') {
        if(list[index].value === ')' && parenthesisLevel === 1)
          return index
        else if(list[index].value === '(')
          parenthesisLevel ++
        else if(list[index].value === ')')
          parenthesisLevel --
      } 
    }
    return -1
  }

  function isInvalidExpression(exp: TOKEN_NODE[]) {
    let line = exp.map(e => e.value).join('')
    throw Error(`invalid expression => ${ line }`)
    return EMPTY_NODE
  } // 异常表达式
  function findOperator(operator: string[]) { return this.findIndex((t: TOKEN_NODE) => t.type === 'operator' && operator.some(o => o === t.value))}

  return function parser(start = 0, end = tokens.length): AST_NODE {
    if(tokens[start] && tokens[start].value === '(' && tokens[end - 1] && tokens[end - 1].value === ')') {
      start ++
      end --
    }

    if(start >= end) // 取完了，或者传入得是类似()这般得表达式
      return EMPTY_NODE
  
    let list = tokens.slice(start, end) // 待处理得字段
    let [ sp, ep ] = isThereParenthesis(list)

    if(list.length === 1) // 只有一个点，只能是数值
        return list[0].type === 'parameter' ? { type: 'Parameter', value: list[0].value } : isInvalidExpression(list)
    else if(sp === -1 && ep === -1) {
      let operator = findOperator.call(list, ['===', '==', '<', '>', '<=', '>=']) // 首个低级操作符
      operator = operator === -1 ? findOperator.call(list, ['+', '-']) : operator // 次级
      operator = operator === -1 ? findOperator.call(list, ['*', '/']) : operator // 最高级
      operator += start // 待分类的操作符

      if(operator < start)
        return isInvalidExpression(list) // 没找到操作符
      else
        return {
          type: 'Operator',
          value: tokens[operator].value,
          children: [
            parser(start, operator),
            parser(operator + 1, end)
          ]
        }
    }
    else if(sp !== -1 && ep !== -1) {
      let operator = -1 // 括号左半部分低级操作符
      let offset = 0

      if(operator === -1) { // 括号左半部分三级操作符
        operator = findOperator.call(list.slice(0, sp), ['===', '==', '<', '>', '<=', '>='])
        offset = 0
      }

      if(operator === -1) { // 括号右半部分三级操作符
        operator = findOperator.call(list.slice(ep, list.length), ['===', '==', '<', '>', '<=', '>='])
        offset = ep
      }

      if(operator === -1) { // 括号左半部分二级操作符
        operator = findOperator.call(list.slice(0, sp), ['+', '-'] )
        offset = 0
      }

      if(operator === -1) { // 括号右半部分二级操作符
        operator = findOperator.call(list.slice(ep, list.length), ['+', '-'] )
        offset = ep
      }
        
      if(operator === -1) { // 括号左半部分一级操作符
        operator = findOperator.call(list.slice(0, sp), ['*', '/'] )
        offset = 0
      }

      if(operator === -1) { // 括号右半部分一级操作符
        operator = findOperator.call(list.slice(ep, list.length), ['*', '/'] )
        offset = ep
      }
        
      if(operator !== -1) {
        operator += (start + offset)
        return {
          type: 'Operator',
          value: tokens[operator].value,
          children: [
            parser(start, operator),
            parser(operator + 1, end)
          ]
        }
      } else if(list[sp - 1] && list[sp - 1].type === 'parameter') { // 左侧是函数
        operator = (start + sp - 1)
        return {
          type: 'Function',
          value: tokens[operator].value,
          children: [
            parser(start + sp, end),
            EMPTY_NODE
          ]
        }
      } else
        return isInvalidExpression(list) // 括号两侧没有操作符，直接接了数字
    }
    else
      return isInvalidExpression(list)
  }
}

// 获取指定路径上的结果
function get(target: any, path: string, notFoundValue: any = void 0) {
  if(/^\d+(\.\d+)?$/.test(path)) // 纯数字
    return path
  else {
    let keyPath = path.split('.')

    for(let i = 0; i < keyPath.length; i++) {
      if (target && target.hasOwnProperty(keyPath[i]))
        target = target[keyPath[i]]
      else
        return notFoundValue
    }
  
    return target
  }
}
