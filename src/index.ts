const sdk_version: string = '0.0.5'

type EventType = 'user_action' | 'request' | 'error' | 'performance'

interface BaseConfig {
  app_id: string
  report_url: string
  events_tobe_record: EventType[]

  patch_id?: string
  user_id?: string | (() => string)
  
  device?: string

  // ip?: string
  // location?: string

  // stayTime?: number
}

interface EventData {
  type?: EventType
  action?: 'click' | 'scroll'
  time_stamp?: Date | number
  page_url?: string
  extra?: Record<string, unknown>
  data?: Record<string, unknown>
}

export default class FufuTracker {
  private baseInfo: BaseConfig & {
    sdk_version?: string
  }
  private events_tobe_record: EventType[] = []
  private events: EventData[] = []

  constructor(config: BaseConfig) {
    this.events_tobe_record = config.events_tobe_record
    this.baseInfo = {
      ...config,
      user_id: config.user_id || 'anonymous',
      device: window.navigator.userAgent,    
      patch_id: uuid(),
    }

    this.installConfig()
    this.listenPage()
  }

  installConfig() {
    this.baseInfo.sdk_version = sdk_version
    this.baseInfo.user_id = typeof this.baseInfo.user_id === 'function' ? this.baseInfo.user_id() : this.baseInfo.user_id

    this.events_tobe_record.forEach(event => {
      switch (event) {
        case 'user_action':
          window.addEventListener('click', (e) => { this.captureClick(e) })
          window.addEventListener('scroll', debounce(this.captureScroll(), 200))
          break
        case 'error':
          // TODO
          break
        case 'performance':
          // TODO
          break
        case 'request':
          // TODO
          break
        default:
          break
      }
    })
  }
  // https://developer.chrome.com/docs/web-platform/page-lifecycle-api#developer-recommendations-for-each-state
  // https://github.com/GoogleChromeLabs/page-lifecycle
  listenPage() {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.send()
      }
    })

    // 页面关闭，页面刷新，页面跳转，切换，'beforeunload' ,'hashchange' , 或者时间到了，都会触发这个事件。时间的话...大概是每一次send之后会重置一个东西，到达阈值就会自动发一下。
    // 问题是你现在把停留时间和其他事件的上报绑定了... 这部分直接放进 baseInfo 里确实看起来挺方便... 但另一些就不好做了...
    // 想一下用户一直在上面点点点但就是不离开... 还是要有一个限制，阈值，比如 event 数量到达一定程度就要发一次，或者时间到了就要发一次。
    // 不过这个问题...现在可能也没那么重要，先放着吧。或者，普通事件随便发，但对通过 visibilitychange 触发的发送，搞些特殊。嗯，已经有特殊了，
    window.addEventListener('beforeunload', () => {
      this.send()
    })
  }

  // 自定义事件 push 进入 events 数组
  pushEvent(event: EventData) {
    this.events.push(event)
  }

  json2Blob(data: { [key: string]: unknown }) {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    })
    return blob
  }

  send() {
    const data = {
      baseInfo: this.baseInfo,
      events: this.events,
    }
    const blob = this.json2Blob(data)
    navigator.sendBeacon(this.baseInfo.report_url, blob)
    this.events = []
  }

  /**
   * below are the tracker functions
   */

  captureClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    this.events.push({
      type: 'user_action',
      action: 'click',
      time_stamp: new Date().getTime(),
      page_url: window.location.href,
      data: {
        // dom 以及 react dom 的结构存在循环引用...，只存一下 id 什么的吧
        target: target?.id || target?.className || target?.tagName || 'null',
        x: e.clientX,
        y: e.clientY,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    })
  }

  captureScroll() {
    const scroll = {
      lastScrollTop: 0,
      lastScrollTime: new Date().getTime(),
      scrollTop: document.documentElement.scrollTop,
      scrollTime: new Date().getTime(),
    }
    let that = this
    return function () {
      scroll.scrollTop = document.documentElement.scrollTop
      scroll.scrollTime = new Date().getTime()
      if (scroll.scrollTime - scroll.lastScrollTime > 1000) {
        scroll.lastScrollTime = scroll.scrollTime
      }
      that.events.push({
        type: 'user_action',
        action: 'scroll',
        time_stamp: new Date().getTime(),
        page_url: window.location.href,
        data: {
          scroll_top: scroll.scrollTop,
          distance: scroll.scrollTop - scroll.lastScrollTop,
          time: scroll.scrollTime - scroll.lastScrollTime,
        }
      })
      scroll.lastScrollTop = scroll.scrollTop
      scroll.lastScrollTime = scroll.scrollTime
    }
  }

}

/**
 * helpers
 * 
 */
function debounce(fn: Function, delay: number) {
  let timer: number
  return function (this: any, ...args: any[]) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}