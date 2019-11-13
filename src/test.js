import Vue from './proxy'

let instance = Vue({
  data: {
    att1: 1,
    att2: 2
  },
  computed: {
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

console.log(instance) // { att1: 1, att2: 2, add: 3, minus: -1, sum: 2, multiple: [Function: multiple] }
console.log(instance.multiple()) // 2
instance.att1 = 3
instance.att2 = 5
console.log(instance) // { att1: 3, att2: 5, add: 8, minus: -2, sum: 6, multiple: [Function: multiple] }
console.log(instance.multiple()) // 15
