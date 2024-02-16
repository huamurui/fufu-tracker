# fufu-tracker [![npm](https://img.shields.io/npm/v/fufu-tracker.svg)](https://www.npmjs.com/package/fufu-tracker) [![build status](https://github.com/huamurui/fufu-tracker/actions/workflows/npm-publish.yml/badge.svg?branch=main)](https://github.com/huamurui/fufu-tracker/actions/workflows/npm-publish.yml)

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
  app_id: "ko no fufu da", 
  // required, your report url
  report_url: "http://localhost:3000/report", 
  // optional, default is all events
  events_tobe_record: ["action_click", "action_scroll"],
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

interface Data  {
  // base info
  baseInfo: BaseInfo
  // events
  events: Event[]
}

interface BaseInfo {
  // app unique key
  app_id: string 
  // sdk version (auto filled)
  sdk_version: string 
}

interface Event {
  // event type
  type: string
  // event action
  action: string
  // event time
  time_stamp: number
  // event page url
  page_url?: string
  // event extra data, depends on event type
  data?: any
}
```
