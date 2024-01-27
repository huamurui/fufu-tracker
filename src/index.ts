const sdkVersion: string = '0.0.0'

interface BaseConfig {
  appId: string
  baseUrl: string
  eventTobeRecord: string[] // 确认需要记录哪些事件
}

// 要记录的信息的类型和数据...
interface EventData {
  type?: string
  device?: string
  userId?: string
  pageUrl?: string
  requestUrl?: string
  extra?: Record<string, unknown>
  data?: Record<string, unknown>
}

const example = {
  baseInfo: {
    appId: '123123',
    baseUrl: '123123',
    sdkVersion: '1.0.0',

    userId: '123123',
    // 这个本身就是一个事件...代表着某种pageStay什么的...
    startTime: 123123123,
    endTime: 123123123,
  },
  events: [
    {
      time: 123123123,
      type: 'action_click',
      pageUrl: 'pageUrl',
      data: {
        targetKey: 'targetKey',
        x: 123,
        y: 123,
        width: 123,
        height: 123,
      }
    },
    {
      time: 123123123,
      type: 'action_scroll',
      pageUrl: 'pageUrl',
      data: {
        scrollTop: 123,
      }
    },
    {
      type: 'action_route',
      time: 123123123,
      pageUrl: 'pageUrl',
      data: {
        from: 'from',
        to: 'to',
      }
    },
    {
      type: 'error',
      time: 123123123,
      pageUrl: 'pageUrl',
      data: {
        message: 'message',
      }
    },
    {
      type: 'performance',
      time: 123123123,
      pageUrl: 'pageUrl',
      data: {
        loadPage: 123,
        domReady: 123,
        redirect: 123,
      }
    },
    {
      type: 'request',
      time: 123123123,
      pageUrl: 'pageUrl',
      data: {
        requestUrl: 'requestUrl',
      }
    }
  ],
}


export default class FufuTracker {
  private baseInfo: BaseConfig
  private events: EventData[] = []
  private pageUrl: string = ''
  private userId: string = ''
  private startTime: number = 0
  private endTime: number = 0
  private extra: Record<string, unknown> = {}
  private eventTobeRecord: string[] = []

  constructor(config: BaseConfig) {
    this.baseInfo = config
    this.pageUrl = window.location.href
    this.eventTobeRecord = config.eventTobeRecord
    this.startTime = new Date().getTime()
    this.installConfig()
    this.listenPage()
  }

  installConfig() {
    this.userId = this.baseInfo.appId
    this.extra = {
      sdkVersion: sdkVersion,
      device: ''
    }
    this.captureEvents(this.eventTobeRecord, 'action')
  }

  captureEvents<T>(MouseEventList: string[], targetKey: string, data?: T) {
    MouseEventList.forEach(event => {
      window.addEventListener(event, () => {
        this.events.push({
          type: event,
          pageUrl: this.pageUrl,
          data: {
            targetKey,
            ...data
          }
        })
      })
    })
  }
  // https://developer.chrome.com/docs/web-platform/page-lifecycle-api#developer-recommendations-for-each-state
  // https://github.com/GoogleChromeLabs/page-lifecycle
  listenPage() {
    window?.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.endTime = new Date().getTime()
        this.send()
      } else {
        this.startTime = new Date().getTime()
      }
    })

    // 页面关闭，页面刷新，页面跳转，切换，'beforeunload' ,'hashchange' , 或者时间到了，都会触发这个事件。时间的话...大概是每一次send之后会重置一个东西，到达阈值就会自动发一下。
    window?.addEventListener('beforeunload', () => {
      this.endTime = new Date().getTime()
      this.send()
    })
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
    navigator.sendBeacon(this.baseInfo.baseUrl, blob)
  }
}