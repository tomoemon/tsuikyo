import Option = require('./option');
import Event = require('./event');
import _e = require('./engine');
import Engine = _e.Engine;
import EngineOption = _e.EngineOption;


class TsuikyoOption extends Option {
    private _keyboard: string = "jp";
    private _eventRoot: any = window.document;

    private _layout: string = "qwejp";
    private _im: string = "roma";
    private _flex: string = "flex";
    private _prevent: boolean = true;
    private _strictParse: boolean = false;

    get keyboard() {
        return this._keyboard;
    }
    get eventRoot() {
        return this._eventRoot;
    }
    get layout() {
        return this._layout;
    }
    get im() {
        return this._im;
    }
    get flex() {
        return this._flex;
    }
    get prevent() {
        return this._prevent;
    }
    get strictParse() {
        return this._strictParse;
    }

    constructor(args: any) {
        super();
        this.parse(args);
    }

    getEngineOption(): EngineOption {
        return new EngineOption({
            layout: this._layout,
            im: this._im,
            flex: this._flex,
            strictParse: this._strictParse
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
