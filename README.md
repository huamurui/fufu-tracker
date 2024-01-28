# fufu-tracker

## Description

This is a simple sdk for tracking events in your application.

## Installation & Usage

### npm and etc

```bash
npm install fufu-tracker
```

```typescript
import FufuTracker from "fufu-tracker"

const tr = new FufuTracker({
  // required, your application unique key
  appId: "ko no fufu da", 
  // required, your report url
  reportUrl: "http://localhost:3000/report", 
  // optional, default is all events
  eventsTobeRecord: ["action_click", "action_scroll"],
})

// pushEvent for custom record
tr.pushEvent({
  type: "ko no fufu da",
  target: "btn",
  action: "click",
  time: Date.now(),
})
// send for custom decide when to send
tr.send()
```

### cdn

```html
<!-- with esm -->
<script type="module">
  import FufuTracker from "https://cdn.jsdelivr.net/npm/fufu-tracker/lib/index.esm.js"
  const tr = new FufuTracker({...})
</script>
<!-- or -->
<script src="https://cdn.jsdelivr.net/npm/fufu-tracker/lib/index.umd.js"></script>
<script>
  const tr = new FufuTracker({...})
</script>
```

## Features

it will send data to your report url when:
- visibilitychange
- beforeunload
- send() called

the data contains:

```typescript

interface BaseInfo {
  // app unique key
  appId: string 
  // sdk version (auto filled)
  sdkVersion: string 
  // track start time (auto filled)
  startTime: number
  // track end time (auto filled)
  endTime: number
  // track duration (auto filled)
  duration?: number
}

interface Event {
  // event type
  type: string
  // event target
  target: string
  // event action
  action: string
  // event time
  time: number
  // event page url
  pageUrl?: string
  // event extra data, depends on event type
  data?: any
}

interface Data  {
  // base info
  baseInfo: BaseInfo
  // events
  events: Event[]
}
```
