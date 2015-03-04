import Option = require('./option');
import Event = require('./event');
import _e = require('./engine');
import Engine = _e.Engine;
import EngineOption = _e.EngineOption;


class TsuikyoOption extends Option {
    // readonly な property を使いたいが、EcmaScript5 を前提にしなければいけない
    // →IE6,7,8 で使えない
    public keyboard: string = "jp";
    public eventRoot: any = window.document;

    public layout: string = "qwejp";
    public im: string = "roma";
    public flex: string = "flex";
    public prevent: boolean = true;
    public strictParse: boolean = false;

    constructor(args: any) {
        super();
        this.parse(args);
    }

    getEngineOption(): EngineOption {
        return new EngineOption({
            layout: this.layout,
            im: this.im,
            flex: this.flex,
            strictParse: this.strictParse
        });
    }
}

class Tsuikyo {
    private engine: Engine;
    private keyStrokeObservable: Event.KeyStrokeObservable;

    constructor(rawOption: any) {
        var option = new TsuikyoOption(rawOption);

        this.engine = new Engine(option.getEngineOption());
        this.keyStrokeObservable = new Event.KeyStrokeObservable(
            option.keyboard, option.eventRoot, option.prevent);

        this.listen();
    }

    public layout(_layout) {
        return this.engine.layout(_layout);
    }

    public listen(userCallback?) {
        this.keyStrokeObservable.subscribe(
            (e: Event.KeyStrokeEvent) => this.engine.stroke(e)
            );
        return this.engine.listen(userCallback);
    }

    public sleep() {
        this.keyStrokeObservable.dispose();
        return this.engine.sleep();
    }

    public make(src, tag, flex) {
        return this.engine.make(src, tag, flex);
    }

    public stroke(e, test) {
        return this.engine.stroke(e, test);
    }

    public test(e: any) {
        return this.engine.test(e);
    }

    public words() {
        return this.engine.words();
    }
}

export = Tsuikyo;
