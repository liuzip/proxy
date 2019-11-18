import Vue from './core/proxy'

let instance = Vue({
  data: {
    att1: 1,
    att2: 2,
    attribute: {
      val: 2,
      arr: [ 1, 2, 3 ]
    }
  },
  computed: {
    special() { return this.attribute.val + this.attribute.arr[0] },
    add() { return this.att1 + this.att2 },
    minus() { return this.att1 - this.att2 },
    sum() { return this.add + this.minus }
  },
  methods: {
    multiple() {
      return this.att1 * this.att2
    }
  }
})


console.log('************************************')
console.log(instance) // { att1: 1, att2: 2, attribute: { val: 2, arr: [ 1, 2, 3 ] }, special: 3, add: 3, minus: -1, sum: 2, multiple: [Function: multiple] }
console.log(instance.multiple()) // 2

instance.att1 = 3
instance.att2 = 5
instance.attribute.val = 5
console.log('************************************')

console.log(instance.multiple()) // 15

console.log(instance) // { att1: 3, att2: 5, attribute: { val: 5, arr: [ 1, 2, 3 ] }, special: 6, add: 8, minus: -2, sum: 6, multiple: [Function: multiple] }