import _u = require('./user_agent');
import UserAgent = _u.UserAgent;
import KeyCodeFilter = _u.KeyCodeFilter;
import _b = require('./user_agent.browser');
import Browser = _b.Browser;
import Util = require('./util');

var user_agent = UserAgent.instanciate();

export class KeyStrokeEvent {
    constructor(
        public keyCode: number,                      // converted keyCode
        public keyState: { [index: number]: boolean} // flag to block key repeat
        ) { }

    shifted(): boolean {
        return !!this.keyState[16];
    }
}

export class KeyStrokeObservable {
    private keyObservable: KeyEventObservable;

    /**
     * keyup 時に直前の keydown における nativeKeyCode を参照するために一時保存
     */
    private nativeKeyCode: number = -1;
    private keyState: { [index: number]: boolean} = {};
    private pressedKeyState: { [index: number]: number } = {};
    private stroked: boolean = false;

    private callback: (x: KeyStrokeEvent) => any;

    private browser: Browser;
    private keyFilter: KeyCodeFilter;

    private shifted(): boolean {
        return !!this.keyState[16];
    }

    /**
    @param callback stroke イベントを受け取るメソッド (初期段階では Engine.fire)
    */
    constructor(keyboard: string, private element, private prevent) {
        this.browser = user_agent.browser;
        this.keyFilter = user_agent.getKeyCodeFilter(keyboard);
        this.keyObservable = new KeyEventObservable(element);
        this.keyObservable.subscribe((rawEvent: any) => this.wrapper(rawEvent));
    }

    public subscribe(callback: (x: KeyStrokeEvent) => any) {
        this.callback = callback;
    }

    public dispose() {
        this.callback = function () { };
    }

    private wrapper(rawEvent: any) {
        var e = rawEvent || window.event;
        var nativeKeyCode = e.keyCode || e.which || e.charCode;
        var keyCode;

        switch (e.type) {
            case "keydown":
                this.nativeKeyCode = nativeKeyCode; // update only here

                keyCode = this.keyFilter.keydown(nativeKeyCode, this.shifted());
                if (keyCode >= 0) {
                    // the key has been identified
                    if (!this.keyState[keyCode]) {
                        this.keyState[keyCode] = true;
                        this.callback(new KeyStrokeEvent(keyCode, Util.clone(this.keyState)));
                        this.stroked = true;        // cancel keypress process
                    } else {
                        // block key repeat
                    }
                } else {
                    // need to check keypress event to identify the key
                    this.stroked = false;
                }
                break;
            case "keypress":
                if (!this.stroked) {
                    keyCode = this.keyFilter.keypress(nativeKeyCode, this.shifted());
                    if (!this.keyState[keyCode]) {
                        this.keyState[keyCode] = true;
                        // 直前の keydown したときの nativeKeyCode を参照する
                        this.pressedKeyState[this.nativeKeyCode] = keyCode;
                        this.callback(new KeyStrokeEvent(keyCode, Util.clone(this.keyState)));
                    } else {
                        // block key repeat
                    }
                } else {
                    // the key has already been identified in keydown event
                }
                break;
            case "keyup":
                keyCode = this.keyFilter.keyup(nativeKeyCode, this.shifted());
                if (keyCode >= 0) {
                    if (this.keyState[keyCode]) {
                        this.keyState[keyCode] = false;
                    } else {
                        if (keyCode !== 244) {
                            throw new Error("keyup from unpressed key");
                        }
                    }
                } else {
                    // find the pressing key and reset it
                    if (nativeKeyCode in this.pressedKeyState) {
                        this.keyState[this.pressedKeyState[nativeKeyCode]] = false;
                        delete this.pressedKeyState[nativeKeyCode];
                    }
                }
                break;
            default:
                throw new Error("key-event wrapper caught an unexpected event.");
        }

        // cancel default action
        e.returnValue = true;
        if (this.prevent) {
            if (!(
                keyCode < 0 && (
                    this.browser.isInternetExplorer()
                    || this.browser.isChrome()
                    || this.browser.isSafari()
                    )
                )) {
                if (e.preventDefault instanceof Function) {
                    e.preventDefault();
                }
                e.returnValue = false;
                try {
                    e.keyCode = 0;    // cancel function-keys in IE
                } catch (err) {
                    // ignore
                }
            } else {
                // Since preventDefault() suppress its keypress event in IE and Webkit,
                // we should not prevent keydown when the charCode, which can only be got in keypress, is required to identify the key
            }
        }
        return e.returnValue;
    }
}


enum KeyEventType {
    keydown,
    keypress,
    keyup
}

class KeyEvent {
    constructor(
        private type: KeyEventType,  // event type (keydown / keypress / keyup)
        private target: any,         // event src element
        private keyState: any,       // flag to block key repeat
        private identified: boolean, // flag to cancel keypress trigger
        private nativeCode: number,  // native keyCode of the browser
        private keyCode: number,     // converted keyCode
        private shift: boolean
        ) { }
}
 

class KeyEventObservable {
    private callback: ((event: any) => boolean);

    constructor(private element) {
    }

    subscribe(callback: (event: any) => boolean) {
        var root = this.element;
        this.callback = callback;

        if (root.addEventListener) {
            // DOM Level 2
            root.addEventListener("keydown", callback, false);
            root.addEventListener("keypress", callback, false);
            root.addEventListener("keyup", callback, false);
        } else if (root.attachEvent) {
            // IE
            root.attachEvent("onkeydown", callback);
            root.attachEvent("onkeypress", callback);
            root.attachEvent("onkeyup", callback);
        } else if (root.onkeydown) {
            // DOM Level 0 (trad)
            root.onkeydown = callback;
            root.onkeypress = callback;
            root.onkeyup = callback;
        } else {
            throw new Error("failed to add listener.");
        }
    }

    remove() {
        var root = this.element;
        var callback = this.callback;

        if (root.removeEventListener) {
            // DOM Level 2
            root.removeEventListener("keydown", callback, false);
            root.removeEventListener("keypress", callback, false);
            root.removeEventListener("keyup", callback, false);
        } else if (root.detachEvent) {
            // IE
            root.detachEvent("onkeydown", callback);
            root.detachEvent("onkeypress", callback);
            root.detachEvent("onkeyup", callback);
        } else if (root.onkeydown) {
            // DOM Level 0 (trad)
            root.onkeydown = void 0;
            root.onkeypress = void 0;
            root.onkeyup = void 0;
        } else {
            throw new Error("failed to remove listener.");
        }
    }
}
