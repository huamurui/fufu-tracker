type EventType = 'action_click' | 'action_scroll' | 'action_route' | 'error' | 'performance' | 'request';
interface BaseConfig {
    appId: string;
    reportUrl: string;
    eventsTobeRecord: EventType[];
    userId?: string | (() => string);
    stayTime?: number;
}
interface EventData {
    type?: EventType;
    time?: Date | number;
    device?: string;
    userId?: string;
    pageUrl?: string;
    requestUrl?: string;
    extra?: Record<string, unknown>;
    data?: Record<string, unknown>;
}
declare class FufuTracker {
    private baseInfo;
    private eventsTobeRecord;
    private events;
    private timer;
    constructor(config: BaseConfig);
    installConfig(): void;
    listenPage(): void;
    pushEvent(event: EventData): void;
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
