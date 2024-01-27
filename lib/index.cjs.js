'use strict';

const sdkVersion = '0.0.0';
class FufuTracker {
    constructor(config) {
        this.events = [];
        this.pageUrl = '';
        this.userId = '';
        this.startTime = 0;
        this.endTime = 0;
        this.extra = {};
        this.eventTobeRecord = [];
        this.baseInfo = config;
        this.pageUrl = window.location.href;
        this.eventTobeRecord = config.eventTobeRecord;
        this.startTime = new Date().getTime();
        this.installConfig();
        this.listenPage();
    }
    installConfig() {
        this.userId = this.baseInfo.appId;
        this.extra = {
            sdkVersion: sdkVersion,
            device: ''
        };
        this.captureEvents(this.eventTobeRecord, 'action');
    }
    captureEvents(MouseEventList, targetKey, data) {
        MouseEventList.forEach(event => {
            window.addEventListener(event, () => {
                this.events.push({
                    type: event,
                    pageUrl: this.pageUrl,
                    data: Object.assign({ targetKey }, data)
                });
            });
        });
    }
    // https://developer.chrome.com/docs/web-platform/page-lifecycle-api#developer-recommendations-for-each-state
    // https://github.com/GoogleChromeLabs/page-lifecycle
    listenPage() {
        window === null || window === void 0 ? void 0 : window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.endTime = new Date().getTime();
                this.send();
            }
            else {
                this.startTime = new Date().getTime();
            }
        });
        // 页面关闭，页面刷新，页面跳转，切换，'beforeunload' ,'hashchange' , 或者时间到了，都会触发这个事件。时间的话...大概是每一次send之后会重置一个东西，到达阈值就会自动发一下。
        window === null || window === void 0 ? void 0 : window.addEventListener('beforeunload', () => {
            this.endTime = new Date().getTime();
            this.send();
        });
    }
    json2Blob(data) {
        const blob = new Blob([JSON.stringify(data)], {
            type: 'application/json',
        });
        return blob;
    }
    send() {
        const data = {
            baseInfo: this.baseInfo,
            events: this.events,
        };
        const blob = this.json2Blob(data);
        navigator.sendBeacon(this.baseInfo.baseUrl, blob);
    }
}

module.exports = FufuTracker;
