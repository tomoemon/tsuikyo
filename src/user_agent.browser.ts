export enum BrowserType {
    InternetExplorer,
    Chrome,
    Firefox,
    Mozilla,
    Opera,
    Safari,
    Unknown
}

export class Browser {
    constructor(private type: BrowserType, private version: number) {
    }

    public getType(): BrowserType {
        return this.type;
    }
    public getVersion(): number {
        return this.version;
    }
    public isFirefox() {
        return this.type == BrowserType.Firefox;
    }
    public isOpera() {
        return this.type == BrowserType.Opera;
    }
    public isChrome() {
        return this.type == BrowserType.Chrome;
    }
    public isSafari() {
        return this.type == BrowserType.Safari;
    }
    public isInternetExplorer() {
        return this.type == BrowserType.InternetExplorer;
    }
}

 