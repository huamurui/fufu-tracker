const sdkVersion = '0.0.2';
class FufuTracker {
    constructor(config) {
        this.eventsTobeRecord = [];
        this.events = [];
        this.timer = null;
        this.baseInfo = config;
        this.eventsTobeRecord = config.eventsTobeRecord;
        this.baseInfo.startTime = new Date().getTime();
        this.installConfig();
        this.listenPage();
    }
    installConfig() {
        this.baseInfo.sdkVersion = sdkVersion;
        this.baseInfo.userId = typeof this.baseInfo.userId === 'function' ? this.baseInfo.userId() : this.baseInfo.userId;
        this.eventsTobeRecord.forEach(event => {
            switch (event) {
                case 'action_click':
                    window.addEventListener('click', (e) => { this.captureClick(e); });
                    break;
                case 'action_scroll':
                    window.addEventListener('scroll', debounce(this.captureScroll(), 200));
                    break;
            }
        });
    }
    // https://developer.chrome.com/docs/web-platform/page-lifecycle-api#developer-recommendations-for-each-state
    // https://github.com/GoogleChromeLabs/page-lifecycle
    listenPage() {
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.baseInfo.stayTime = new Date().getTime() - this.baseInfo.startTime;
                this.send();
            }
            else {
                this.baseInfo.startTime = new Date().getTime();
            }
        });
        // 页面关闭，页面刷新，页面跳转，切换，'beforeunload' ,'hashchange' , 或者时间到了，都会触发这个事件。时间的话...大概是每一次send之后会重置一个东西，到达阈值就会自动发一下。
        // 问题是你现在把停留时间和其他事件的上报绑定了... 这部分直接放进 baseInfo 里确实看起来挺方便... 但另一些就不好做了...
        // 想一下用户一直在上面点点点但就是不离开... 还是要有一个限制，阈值，比如 event 数量到达一定程度就要发一次，或者时间到了就要发一次。
        // 不过这个问题...现在可能也没那么重要，先放着吧。或者，普通事件随便发，但对通过 visibilitychange 触发的发送，搞些特殊。嗯，已经有特殊了，
        window.addEventListener('beforeunload', () => {
            this.send();
        });
    }
    // 自定义事件 push 进入 events 数组
    pushEvent(event) {
        this.events.push(event);
    }
    json2Blob(data) {
        const blob = new Blob([JSON.stringify(data)], {
            type: 'application/json',
        });
        return blob;
    }
    send() {
        this.baseInfo.endTime = new Date().getTime();
        const data = {
            baseInfo: this.baseInfo,
            events: this.events,
        };
        const blob = this.json2Blob(data);
        navigator.sendBeacon(this.baseInfo.reportUrl, blob);
        this.events = [];
    }
    /**
     * below are the tracker functions
     */
    captureClick(e) {
        const target = e.target;
        this.events.push({
            type: 'action_click',
            time: new Date().getTime(),
            pageUrl: window.location.href,
            data: {
                // dom 以及 react dom 的结构存在循环引用...，只存一下 id 什么的吧
                target: (target === null || target === void 0 ? void 0 : target.id) || (target === null || target === void 0 ? void 0 : target.className) || (target === null || target === void 0 ? void 0 : target.tagName) || 'null',
                x: e.clientX,
                y: e.clientY,
                width: window.innerWidth,
                height: window.innerHeight,
            }
        });
    }
    captureScroll() {
        const scroll = {
            lastScrollTop: 0,
            lastScrollTime: new Date().getTime(),
            scrollTop: document.documentElement.scrollTop,
            scrollTime: new Date().getTime(),
        };
        let that = this;
        return function () {
            scroll.scrollTop = document.documentElement.scrollTop;
            scroll.scrollTime = new Date().getTime();
            if (scroll.scrollTime - scroll.lastScrollTime > 1000) {
                scroll.lastScrollTime = scroll.scrollTime;
            }
            that.events.push({
                type: 'action_scroll',
                time: new Date().getTime(),
                pageUrl: window.location.href,
                data: {
                    scrollTop: scroll.scrollTop,
                    distance: scroll.scrollTop - scroll.lastScrollTop,
                    time: scroll.scrollTime - scroll.lastScrollTime,
                }
            });
            scroll.lastScrollTop = scroll.scrollTop;
            scroll.lastScrollTime = scroll.scrollTime;
        };
    }
}
/**
 * helpers
 *
 */
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

export { FufuTracker as default };
