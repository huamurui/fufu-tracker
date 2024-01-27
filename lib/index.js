(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.tracker = factory());
})(this, (function () { 'use strict';

  const sdkVersion = '0.0.0';
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
          window === null || window === void 0 ? void 0 : window.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'hidden') {
                  this.send();
              }
              else {
                  this.baseInfo.startTime = new Date().getTime();
                  this.timer = window.setInterval(() => {
                      this.send();
                  }, 1000);
              }
          });
          // 页面关闭，页面刷新，页面跳转，切换，'beforeunload' ,'hashchange' , 或者时间到了，都会触发这个事件。时间的话...大概是每一次send之后会重置一个东西，到达阈值就会自动发一下。
          window === null || window === void 0 ? void 0 : window.addEventListener('beforeunload', () => {
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
          this.baseInfo.endTime = new Date().getTime();
          const data = {
              baseInfo: this.baseInfo,
              events: this.events,
          };
          const blob = this.json2Blob(data);
          navigator.sendBeacon(this.baseInfo.reportUrl, blob);
          this.events = [];
          this.timer && window.clearInterval(this.timer);
      }
      /**
       * below are the tracker functions
       */
      captureClick(e) {
          this.events.push({
              type: 'action_click',
              time: new Date().getTime(),
              pageUrl: window.location.href,
              data: {
                  targetKey: e === null || e === void 0 ? void 0 : e.target,
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
              if (scroll.scrollTime - scroll.lastScrollTime > 20000) {
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

  return FufuTracker;

}));
