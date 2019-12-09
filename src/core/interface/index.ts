export interface PROXIED {
  instance: any
  currentComputedKey: string
  currentComputedFunc?: Function
  currentWatchKeys: string[]
  currentWatchFunc?: Function
}

export interface VUE {
  watch: any
  methods: any
  computed: any
  data: Function
  template: string
  $mount: Function
  $forceUpdate: Function
}
