type EventType = 'action_click' | 'action_scroll' | 'action_route' | 'error' | 'performance' | 'request';
interface BaseConfig {
    appId: string;
    reportUrl: string;
    eventsTobeRecord: EventType[];
    userId?: string | (() => string);
}
declare class FufuTracker {
    private baseInfo;
    private eventsTobeRecord;
    private events;
    private timer;
    constructor(config: BaseConfig);
    installConfig(): void;
    listenPage(): void;
    json2Blob(data: {
        [key: string]: unknown;
    }): Blob;
    send(): void;
    /**
     * below are the tracker functions
     */
    captureClick(e: MouseEvent): void;
    captureScroll(): () => void;
}

export { FufuTracker as default };
