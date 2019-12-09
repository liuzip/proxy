const SOURCE_MAP = ['a', 'b', 'c']

let app = Vue({
  data() {
    return {
      att1: 1,
      att2: 2,
      attribute: {
        val: 2,
        arr: [ 1, 2, 3 ]
      }
    }
  },
  template: '<ul><li>att1 {{ att1 }}</li><li>2</li><li>attribute.val {{ attribute.val + add * arrayLength }}</li></ul>',
  computed: {
    constVal() { return SOURCE_MAP },
    special() { return this.attribute.val + this.attribute.arr[0] },
    add() { return this.att1 + this.att2 },
    minus() { return this.att1 - this.att2 },
    sum() { return this.add + this.minus },
    arrayLength() { return this.attribute.arr.length }
  },
  methods: {
    multiple() {
      return this.att1 * this.att2
    }
  },
  watch: {
    'arrayLength'(oldValue, newValue) {
      console.log('arrayLength change oldValue: ', oldValue, ', newValue: ', newValue)
    },
    'attribute.val'(oldValue, newValue) {
      console.log('attribute.val change oldValue: ', oldValue, ', newValue: ', newValue)
    }
  }
})

// console.log('************************************')
// console.log(app)
app.$mount('app')
// { att1: 1,
//   att2: 2,
//   attribute: { val: 2, arr: [ 1, 2, 3 ] },
//   constVal: [ 'a', 'b', 'c' ],
//   special: 3,
//   add: 3,
//   minus: -1,
//   sum: 2,
//   arrayLength: 3,
//   multiple: [Function: multiple] }

// console.log(app.multiple()) // 2

// app.att1 = 3
// app.att2 = 5
// app.attribute.val = 5 // attribute.val change oldValue:  2 , newValue:  5
// app.attribute.arr.push(4) // arrayLength change oldValue:  3 , newValue:  4
// console.log('************************************')

// console.log(app.multiple()) // 15
// console.log(app)
// { att1: 3,
//   att2: 5,
//   attribute: { val: 5, arr: [ 1, 2, 3, 4 ] },
//   constVal: [ 'a', 'b', 'c' ],
//   special: 6,
//   add: 8,
//   minus: -2,
//   sum: 6,
//   arrayLength: 4,
//   multiple: [Function: multiple] }

setInterval(() => app.att1 = app.att1 > 100 ? 0 : app.att1 + 1, 1000)
