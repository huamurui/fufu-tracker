interface BaseConfig {
    appId: string;
    baseUrl: string;
    eventTobeRecord: string[];
}
declare class FufuTracker {
    private baseInfo;
    private events;
    private pageUrl;
    private userId;
    private startTime;
    private endTime;
    private extra;
    private eventTobeRecord;
    constructor(config: BaseConfig);
    installConfig(): void;
    captureEvents<T>(MouseEventList: string[], targetKey: string, data?: T): void;
    listenPage(): void;
    json2Blob(data: {
        [key: string]: unknown;
    }): Blob;
    send(): void;
}

export { FufuTracker as default };
