export interface PROXIED_INTERFACE {
  instance: any
  updateFunc: Function
  currentComputedKey: String
  currentWatchKeys: string[]
  currentWatchFunc?: Function
  currentComputedFunc?: Function
}

export interface VUE_INTERFACE {
  watch: any
  methods: any
  computed: any
  data: Function
  template: string
  $mount: Function
  // $forceUpdate: Function
}
