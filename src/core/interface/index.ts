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

interface POSITION_INTERFACE { start: number, end: number }

export interface VIRTUAL_DOM_INTERFACE {
  name: string
  text: string
  closed: boolean, // 是否执行完了闭合标签
  attribute: any, // 对应得attribute属性
  textValue: string // text对应得具体内容
  position: POSITION_INTERFACE, // 在template中得位置
  children: Array<VIRTUAL_DOM_INTERFACE>, // 子节点
  documentNode: any, // node节点
}