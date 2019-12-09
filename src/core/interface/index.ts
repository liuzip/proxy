export interface PROXIED_INTERFACE {
  instance: any
  currentComputedKey: string
  currentComputedFunc?: Function
  currentWatchKeys: string[]
  currentWatchFunc?: Function
}

export interface VUE_INTERFACE {
  watch: any
  methods: any
  computed: any
  data: Function
  template: string
  $mount: Function
  $forceUpdate: Function
}
