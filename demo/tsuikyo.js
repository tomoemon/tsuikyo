var Tsuikyo =
/******/ (function(modules) { // webpackBootstrap
/******/ // The module cache
/******/ var installedModules = {};

/******/ // The require function
/******/ function __webpack_require__(moduleId) {

/******/ // Check if module is in cache
/******/ if(installedModules[moduleId])
/******/ return installedModules[moduleId].exports;

/******/ // Create a new module (and put it into the cache)
/******/ var module = installedModules[moduleId] = {
/******/ exports: {},
/******/ id: moduleId,
/******/ loaded: false
/******/ };

/******/ // Execute the module function
/******/ modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ // Flag the module as loaded
/******/ module.loaded = true;

/******/ // Return the exports of the module
/******/ return module.exports;
/******/ }


/******/ // expose the modules object (__webpack_modules__)
/******/ __webpack_require__.m = modules;

/******/ // expose the module cache
/******/ __webpack_require__.c = installedModules;

/******/ // __webpack_public_path__
/******/ __webpack_require__.p = "";

/******/ // Load entry module and return exports
/******/ return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Option = __webpack_require__(1);
var Event = __webpack_require__(2);
var _e = __webpack_require__(6);
var Engine = _e.Engine;
var EngineOption = _e.EngineOption;
var TsuikyoOption = (function (_super) {
    __extends(TsuikyoOption, _super);
    function TsuikyoOption(args) {
        _super.call(this);
        this._keyboard = "jp";
        this._eventRoot = window.document;
        this._layout = "qwejp";
        this._im = "roma";
        this._flex = "flex";
        this._prevent = true;
        this._strictParse = false;
        this.parse(args);
    }
    Object.defineProperty(TsuikyoOption.prototype, "keyboard", {
        get: function () {
            return this._keyboard;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsuikyoOption.prototype, "eventRoot", {
        get: function () {
            return this._eventRoot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsuikyoOption.prototype, "layout", {
        get: function () {
            return this._layout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsuikyoOption.prototype, "im", {
        get: function () {
            return this._im;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsuikyoOption.prototype, "flex", {
        get: function () {
            return this._flex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsuikyoOption.prototype, "prevent", {
        get: function () {
            return this._prevent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TsuikyoOption.prototype, "strictParse", {
        get: function () {
            return this._strictParse;
        },
        enumerable: true,
        configurable: true
    });
    TsuikyoOption.prototype.getEngineOption = function () {
        return new EngineOption({
            layout: this._layout,
            im: this._im,
            flex: this._flex,
            strictParse: this._strictParse
        });
    };
    return TsuikyoOption;
})(Option);
var Tsuikyo = (function () {
    function Tsuikyo(rawOption) {
        var option = new TsuikyoOption(rawOption);
        this.engine = new Engine(option.getEngineOption());
        this.keyStrokeObservable = new Event.KeyStrokeObservable(option.keyboard, option.eventRoot, option.prevent);
        this.listen();
    }
    Tsuikyo.prototype.listen = function (userCallback) {
        var _this = this;
        this.keyStrokeObservable.subscribe(function (e) { return _this.engine.stroke(e); });
        return this.engine.listen(userCallback);
    };
    Tsuikyo.prototype.sleep = function () {
        this.keyStrokeObservable.dispose();
        return this.engine.sleep();
    };
    Tsuikyo.prototype.make = function (src, tag, flex) {
        return this.engine.make(src, tag, flex);
    };
    Tsuikyo.prototype.stroke = function (e, test) {
        return this.engine.stroke(e, test);
    };
    Tsuikyo.prototype.test = function (e) {
        return this.engine.test(e);
    };
    Tsuikyo.prototype.words = function () {
        return this.engine.words();
    };
    return Tsuikyo;
})();
module.exports = Tsuikyo;
//# sourceMappingURL=tsuikyo.js.map

/***/ },
/* 1 */
/***/ function(module, exports) {

var Option = (function () {
    function Option() {
    }
    Option.prototype.parse = function (args) {
        for (var key in args) {
            if (key in this) {
                this["_" + key] = args[key];
            }
            else {
                throw new Error("unknown option: '" + key + "'");
            }
        }
    };
    return Option;
})();
module.exports = Option;
//# sourceMappingURL=option.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

var _u = __webpack_require__(3);
var UserAgent = _u.UserAgent;
var Util = __webpack_require__(5);
var user_agent = UserAgent.instanciate();
var KeyStrokeEvent = (function () {
    function KeyStrokeEvent(keyCode, // converted keyCode
        keyState // flag to block key repeat
        ) {
        this.keyCode = keyCode;
        this.keyState = keyState;
    }
    KeyStrokeEvent.prototype.shifted = function () {
        return !!this.keyState[16];
    };
    return KeyStrokeEvent;
})();
exports.KeyStrokeEvent = KeyStrokeEvent;
var KeyStrokeObservable = (function () {
    /**
    @param callback stroke イベントを受け取るメソッド (初期段階では Engine.fire)
    */
    function KeyStrokeObservable(keyboard, element, prevent) {
        var _this = this;
        this.element = element;
        this.prevent = prevent;
        /**
         * keyup 時に直前の keydown における nativeKeyCode を参照するために一時保存
         */
        this.nativeKeyCode = -1;
        this.keyState = {};
        this.pressedKeyState = {};
        this.stroked = false;
        this.browser = user_agent.browser;
        this.keyFilter = user_agent.getKeyCodeFilter(keyboard);
        this.keyObservable = new KeyEventObservable(element);
        this.keyObservable.subscribe(function (rawEvent) { return _this.wrapper(rawEvent); });
    }
    KeyStrokeObservable.prototype.shifted = function () {
        return !!this.keyState[16];
    };
    KeyStrokeObservable.prototype.subscribe = function (callback) {
        this.callback = callback;
    };
    KeyStrokeObservable.prototype.dispose = function () {
        this.callback = function () { };
    };
    KeyStrokeObservable.prototype.wrapper = function (rawEvent) {
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
                        this.stroked = true; // cancel keypress process
                    }
                    else {
                    }
                }
                else {
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
                    }
                    else {
                    }
                }
                else {
                }
                break;
            case "keyup":
                keyCode = this.keyFilter.keyup(nativeKeyCode, this.shifted());
                if (keyCode >= 0) {
                    if (this.keyState[keyCode]) {
                        this.keyState[keyCode] = false;
                    }
                    else {
                        if (keyCode !== 244) {
                            throw new Error("keyup from unpressed key");
                        }
                    }
                }
                else {
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
            if (!(keyCode < 0 && (this.browser.isInternetExplorer()
                || this.browser.isChrome()
                || this.browser.isSafari()))) {
                if (e.preventDefault instanceof Function) {
                    e.preventDefault();
                }
                e.returnValue = false;
                try {
                    e.keyCode = 0; // cancel function-keys in IE
                }
                catch (err) {
                }
            }
            else {
            }
        }
        return e.returnValue;
    };
    return KeyStrokeObservable;
})();
exports.KeyStrokeObservable = KeyStrokeObservable;
var KeyEventType;
(function (KeyEventType) {
    KeyEventType[KeyEventType["keydown"] = 0] = "keydown";
    KeyEventType[KeyEventType["keypress"] = 1] = "keypress";
    KeyEventType[KeyEventType["keyup"] = 2] = "keyup";
})(KeyEventType || (KeyEventType = {}));
var KeyEvent = (function () {
    function KeyEvent(type, // event type (keydown / keypress / keyup)
        target, // event src element
        keyState, // flag to block key repeat
        identified, // flag to cancel keypress trigger
        nativeCode, // native keyCode of the browser
        keyCode, // converted keyCode
        shift) {
        this.type = type;
        this.target = target;
        this.keyState = keyState;
        this.identified = identified;
        this.nativeCode = nativeCode;
        this.keyCode = keyCode;
        this.shift = shift;
    }
    return KeyEvent;
})();
var KeyEventObservable = (function () {
    function KeyEventObservable(element) {
        this.element = element;
    }
    KeyEventObservable.prototype.subscribe = function (callback) {
        var root = this.element;
        this.callback = callback;
        if (root.addEventListener) {
            // DOM Level 2
            root.addEventListener("keydown", callback, false);
            root.addEventListener("keypress", callback, false);
            root.addEventListener("keyup", callback, false);
        }
        else if (root.attachEvent) {
            // IE
            root.attachEvent("onkeydown", callback);
            root.attachEvent("onkeypress", callback);
            root.attachEvent("onkeyup", callback);
        }
        else if (root.onkeydown) {
            // DOM Level 0 (trad)
            root.onkeydown = callback;
            root.onkeypress = callback;
            root.onkeyup = callback;
        }
        else {
            throw new Error("failed to add listener.");
        }
    };
    KeyEventObservable.prototype.remove = function () {
        var root = this.element;
        var callback = this.callback;
        if (root.removeEventListener) {
            // DOM Level 2
            root.removeEventListener("keydown", callback, false);
            root.removeEventListener("keypress", callback, false);
            root.removeEventListener("keyup", callback, false);
        }
        else if (root.detachEvent) {
            // IE
            root.detachEvent("onkeydown", callback);
            root.detachEvent("onkeypress", callback);
            root.detachEvent("onkeyup", callback);
        }
        else if (root.onkeydown) {
            // DOM Level 0 (trad)
            root.onkeydown = void 0;
            root.onkeypress = void 0;
            root.onkeyup = void 0;
        }
        else {
            throw new Error("failed to remove listener.");
        }
    };
    return KeyEventObservable;
})();
//# sourceMappingURL=event.js.map

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

var _b = __webpack_require__(4);
var Browser = _b.Browser;
var BrowserType = _b.BrowserType;
var UserAgent = (function () {
    function UserAgent(window, navigator) {
        this.window = window;
        this.navigator = navigator;
        // detect the browser and os from UA
        // modified jquery.client.js (public domain) : http://www.quirksmode.org/js/detect.html
        this.browser = function () {
            var ret = {}, useragent = this.navigator.userAgent, navigatorvendor = this.navigator.vendor, navigatorappversion = this.navigator.appVersion, d, bv, ds, dp, vs, btype, idx, c, i, fn;
            d = [
                {
                    s: useragent,
                    sub: "Chrome",
                    id: "Chrome",
                    btype: BrowserType.Chrome
                }, {
                    s: useragent,
                    sub: "OmniWeb",
                    ver: "OmniWeb/",
                    id: "OmniWeb",
                    btype: BrowserType.OmniWeb
                }, {
                    s: navigatorvendor,
                    sub: "Apple",
                    id: "Safari",
                    ver: "Version",
                    btype: BrowserType.Safari
                }, {
                    prop: this.window.opera,
                    id: "Opera",
                    ver: "Version",
                    btype: BrowserType.Opera
                }, {
                    prop: this.window.opera,
                    id: "Opera",
                    btype: BrowserType.Opera
                }, {
                    s: navigatorvendor,
                    sub: "iCab",
                    id: "iCab",
                    btype: BrowserType.iCab
                }, {
                    s: navigatorvendor,
                    sub: "KDE",
                    id: "Konqueror",
                    btype: BrowserType.Konqueror
                }, {
                    s: useragent,
                    sub: "Firefox",
                    id: "Firefox",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "Minefield",
                    id: "Firefox",
                    ver: "Minefield",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "Phoenix",
                    id: "Firefox",
                    ver: "Phoenix",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "BonEcho",
                    id: "Firefox",
                    ver: "BonEcho",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "GranParadiso",
                    id: "Firefox",
                    ver: "GranParadiso",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "Shiretoko",
                    id: "Firefox",
                    ver: "Shiretoko",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "Namoroka",
                    id: "Firefox",
                    ver: "Namoroka",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "Lorentz",
                    id: "Firefox",
                    ver: "Lorentz",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "Iceweasel",
                    id: "Firefox",
                    ver: "Iceweasel",
                    btype: BrowserType.Firefox
                }, {
                    s: useragent,
                    sub: "IceCat",
                    id: "Firefox",
                    ver: "IceCat",
                    btype: BrowserType.Firefox
                }, {
                    s: navigatorvendor,
                    sub: "Camino",
                    id: "Camino",
                    btype: BrowserType.Camino
                }, {
                    s: useragent,
                    sub: "Netscape6",
                    id: "Netscape6",
                    btype: BrowserType.Netscape6
                }, {
                    s: useragent,
                    sub: "Netscape",
                    id: "Netscape6",
                    btype: BrowserType.Netscape6
                }, {
                    s: useragent,
                    sub: "MSIE",
                    id: "IE",
                    ver: "MSIE",
                    btype: BrowserType.InternetExplorer
                }, {
                    s: useragent,
                    sub: "Gecko",
                    id: "Mozilla",
                    ver: "rv",
                    btype: BrowserType.Mozilla
                }, {
                    s: useragent,
                    sub: "Mozilla",
                    id: "Netscape",
                    ver: "Mozilla",
                    btype: BrowserType.Mozilla
                }
            ];
            fn = function () {
                return (c++ === 1) ? '' : '.';
            };
            for (i = 0; i < d.length; ++i) {
                ds = d[i].s;
                dp = d[i].prop;
                if (ds && ds.indexOf(d[i].sub) !== -1 || dp) {
                    vs = d[i].ver || d[i].id;
                    btype = d[i].type;
                    c = 0;
                    if ((idx = useragent.indexOf(vs)) !== -1) {
                        bv = parseFloat(useragent.slice(idx + vs.length + 1).replace(/\./g, fn));
                        break;
                    }
                    else if ((idx = navigatorappversion.indexOf(vs)) !== -1) {
                        bv = parseFloat(navigatorappversion.slice(idx + vs.length + 1).replace(/\./g, fn));
                        break;
                    }
                    else {
                        bv = -1;
                    }
                }
            }
            if (btype) {
                return new Browser(btype, bv);
            }
            else {
                return new Browser(BrowserType.Unknown, -1);
            }
        }();
        this.os = function () {
            var ret = {}, os, ds, idx, c, i, d, ua = this.navigator.userAgent, np = this.navigator.platform;
            d = [
                {
                    s: np,
                    sub: "Win",
                    id: "Windows"
                }, {
                    s: np,
                    sub: "Mac",
                    id: "Mac"
                }, {
                    s: ua,
                    sub: "iPhone",
                    id: "iOS"
                }, {
                    s: np,
                    sub: "Linux",
                    id: "Unix"
                }, {
                    s: np,
                    sub: "SunOS",
                    id: "Unix"
                }, {
                    s: np,
                    sub: "BSD",
                    id: "Unix"
                }, {
                    s: ua,
                    sub: "X11",
                    id: "Unix"
                }
            ];
            for (i = 0; i < d.length; ++i) {
                ds = d[i].s;
                if (ds && ds.indexOf(d[i].sub) !== -1) {
                    os = d[i].id;
                    break;
                }
            }
            if (os) {
                os = os.toLowerCase();
                ret.name = os;
                ret[os] = true;
            }
            else {
                ret.name = "unknown";
                ret.unknown = true;
            }
            return ret;
        }();
    }
    UserAgent.instanciate = function () {
        return new UserAgent(window, navigator);
    };
    UserAgent.prototype.getKeyCodeFilter = function (type) {
        if (type === "jp") {
            return new JpKeyCodeFilter(this);
        }
        throw new Error("unknown filter type: " + type);
    };
    return UserAgent;
})();
exports.UserAgent = UserAgent;
var JpKeyCodeFilter = (function () {
    function JpKeyCodeFilter(useragent) {
        var browser = useragent.browser;
        this.keypressTable = {
            33: 49,
            34: 50,
            35: 51,
            36: 52,
            37: 53,
            38: 54,
            39: 55,
            40: 56,
            41: 57,
            42: 186,
            43: !browser.isFirefox() ? 187 :
                function (shifted) {
                    if (shifted) {
                        return 187; // OEM_PLUS
                    }
                    else {
                        return 107; // NUM_PLUS
                    }
                },
            44: 188,
            45: 189,
            46: 190,
            47: 191,
            58: 186,
            59: 187,
            60: 188,
            61: 180,
            62: 190,
            63: 191,
            64: 192,
            91: 219,
            92: 220,
            93: 221,
            94: 222,
            95: 226,
            96: 192,
            97: 65,
            98: 66,
            99: 67,
            100: 68,
            101: 69,
            102: 70,
            103: 71,
            104: 72,
            105: 73,
            106: 74,
            107: 75,
            108: 76,
            109: 77,
            110: 78,
            111: 79,
            112: 80,
            113: 81,
            114: 82,
            115: 83,
            116: 84,
            117: 85,
            118: 86,
            119: 87,
            120: 88,
            121: 89,
            122: 90,
            123: 219,
            124: 220,
            125: 221,
            126: 222 // ~ -> OEM_7
        };
        this.keydownTable = (function (browser) {
            var version = browser.getVersion();
            var t = {};
            switch (browser.getType()) {
                case BrowserType.InternetExplorer:
                    t[243] = 244; // HanZen
                    break;
                case BrowserType.Netscape6:
                    // treat Netscape as Firefox
                    version = 1;
                // ** FALL THROUGH **
                case BrowserType.Firefox:
                    t[109] = 189; // -
                    t[59] = 186; // :
                    if (version >= 3) {
                        t[107] = -1; // ;, num+ -> [keypress]
                        t[243] = 244; // HanZen
                    }
                    else {
                        t[61] = 187; // ;
                        t[229] = 244; // HanZen, Henkan, Kana -> HanZen
                    }
                    break;
                case BrowserType.Chrome:
                    t[243] = 244; // HanZen
                    t[229] = 244; // HanZen
                    break;
                case BrowserType.Safari:
                    if (version >= 5) {
                        t[229] = 244; // HanZen
                    }
                    else {
                        t[229] = 244; // HanZen, Henkan, Kana -> HanZen
                    }
                    break;
                case BrowserType.Opera:
                    t[0] = 93; // menu
                    t[42] = 106; // num*
                    t[43] = 107; // num+
                    t[47] = 111; // num/
                    t[78] = -1; // n, numDot -> n
                    t[208] = 240; // Eisu
                    for (var i = 48; i <= 57; ++i) {
                        t[i] = i; // num0 ~ num9 -> 0-9
                    }
                    if (version < 9.5) {
                        t[44] = 188; // ,
                        t[45] = 189; // -, ins, num- -> hyphen
                        t[46] = 190; // dot, del -> dot
                        t[47] = 191; // /
                        t[58] = 186; // :
                        t[59] = 187; // ;
                        t[64] = 192; // @
                        t[91] = 219; // [, LWin -> [
                        t[92] = 220; // \|, \_, RWin -> \|
                        t[93] = 221; // ]
                        t[94] = 222; // ^
                    }
                    else {
                        t[45] = 109; // num-, ins -> num-
                        t[50] = -1; // @, 2, num2 -> [keypress]
                        t[54] = -1; // ^, 6, num6 -> [keypress]
                        t[59] = -1; // ;, : -> [keypress]
                        t[109] = 189; // -
                        t[219] = 219; // [, LWin, RWin -> [
                        t[220] = 220; // \|, \_ -> \|
                    }
                    if (version < 10) {
                        t[197] = 244; // HanZen, Henkan, Kana -> HanZen
                    }
                    else {
                        t[210] = 242; // Kana
                        t[211] = 244; // HanZen
                        t[212] = 244; // HanZen
                    }
                    break;
                default:
                    break;
            }
            return t;
        })(browser);
    }
    JpKeyCodeFilter.prototype.keydown = function (rawCode, shifted) {
        return this.keydownTable[rawCode] || rawCode;
    };
    JpKeyCodeFilter.prototype.keyup = function (rawCode, shifted) {
        return this.keydownTable[rawCode] || rawCode;
    };
    JpKeyCodeFilter.prototype.keypress = function (rawCode, shifted) {
        var c = this.keypressTable[c];
        if (c instanceof Function) {
            c = c(shifted);
        }
        return c || rawCode;
    };
    return JpKeyCodeFilter;
})();
//# sourceMappingURL=user_agent.js.map

/***/ },
/* 4 */
/***/ function(module, exports) {

(function (BrowserType) {
    BrowserType[BrowserType["InternetExplorer"] = 0] = "InternetExplorer";
    BrowserType[BrowserType["Chrome"] = 1] = "Chrome";
    BrowserType[BrowserType["Camino"] = 2] = "Camino";
    BrowserType[BrowserType["Firefox"] = 3] = "Firefox";
    BrowserType[BrowserType["iCab"] = 4] = "iCab";
    BrowserType[BrowserType["Konqueror"] = 5] = "Konqueror";
    BrowserType[BrowserType["Mozilla"] = 6] = "Mozilla";
    BrowserType[BrowserType["Netscape6"] = 7] = "Netscape6";
    BrowserType[BrowserType["Opera"] = 8] = "Opera";
    BrowserType[BrowserType["OmniWeb"] = 9] = "OmniWeb";
    BrowserType[BrowserType["Safari"] = 10] = "Safari";
    BrowserType[BrowserType["Unknown"] = 11] = "Unknown";
})(exports.BrowserType || (exports.BrowserType = {}));
var BrowserType = exports.BrowserType;
var Browser = (function () {
    function Browser(type, version) {
        this.type = type;
        this.version = version;
    }
    Browser.prototype.getType = function () {
        return this.type;
    };
    Browser.prototype.getVersion = function () {
        return this.version;
    };
    Browser.prototype.isFirefox = function () {
        return this.type == BrowserType.Firefox;
    };
    Browser.prototype.isOpera = function () {
        return this.type == BrowserType.Opera;
    };
    Browser.prototype.isChrome = function () {
        return this.type == BrowserType.Chrome;
    };
    Browser.prototype.isSafari = function () {
        return this.type == BrowserType.Safari;
    };
    Browser.prototype.isInternetExplorer = function () {
        return this.type == BrowserType.InternetExplorer;
    };
    return Browser;
})();
exports.Browser = Browser;
//# sourceMappingURL=user_agent.browser.js.map

/***/ },
/* 5 */
/***/ function(module, exports) {

var Util = (function () {
    function Util() {
    }
    // make a prototype copy
    Util.clone = function (source) {
        var clone = function () { };
        clone.prototype = source;
        return new clone();
    };
    // make a prototype copy and extend it
    Util.extend = function (source, extension) {
        var i, ret = Util.clone(source);
        for (i in extension) {
            ret[i] = extension[i];
        }
        return ret;
    };
    // like Array.forEach
    Util.each = function (a, fn) {
        var i;
        if (a instanceof Function) {
            return;
        }
        else if (typeof a === "string") {
            for (i = 0; i < a.length; ++i) {
                if (fn(a.charAt(i), i)) {
                    break; // avoid [] indexer for legacy browsers
                }
            }
        }
        else if (a instanceof Array) {
            for (i = 0; i < a.length; ++i) {
                if (fn(a[i], i)) {
                    break;
                }
            }
        }
        else {
            for (i in a) {
                if (fn(a[i], i)) {
                    break;
                }
            }
        }
        return a;
    };
    // like Array.filter
    Util.filter = function (a, fn) {
        var ret = [], i;
        if (typeof a === "string") {
            for (i = 0; i < a.length; ++i) {
                // avoid [] indexer for legacy browsers
                if (fn(a.charAt(i), i)) {
                    ret.push(a.charAt(i));
                }
            }
        }
        else {
            for (i = 0; i < a.length; ++i) {
                if (fn(a[i], i)) {
                    ret.push(a[i]);
                }
            }
        }
        return ret;
    };
    // like Array.map
    Util.map = function (a, fn) {
        var ret = [], i;
        if (typeof a === "string") {
            for (i = 0; i < a.length; ++i) {
                ret.push(fn(a.charAt(i), i)); // avoid [] indexer for legacy browsers
            }
        }
        else {
            for (i = 0; i < a.length; ++i) {
                ret.push(fn(a[i], i));
            }
        }
        return ret;
    };
    Util.uniq = function (a) {
        var ret = [], s = {}, i;
        for (i = 0; i < a.length; ++i) {
            if (!s[a[i]] && a[i] !== void 0)
                ret.push(a[i]);
            s[a[i]] = true;
        }
        return ret;
    };
    Util.find = function (a, v) {
        var ret = false;
        Util.each(a, function (e, i) {
            if (typeof e === "object") {
                if (arguments.callee(e, v) !== false) {
                    ret = i;
                    return true;
                }
            }
            else {
                if (e === v) {
                    ret = i;
                    return true;
                }
            }
        });
        return ret;
    };
    return Util;
})();
module.exports = Util;
//# sourceMappingURL=util.js.map

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Util = __webpack_require__(5);
var Layout = __webpack_require__(8);
var Type = __webpack_require__(9);
var EngineState = __webpack_require__(7);
var im = __webpack_require__(10);
var Option = __webpack_require__(1);
var EngineOption = (function (_super) {
    __extends(EngineOption, _super);
    function EngineOption(args) {
        _super.call(this);
        this._layout = "qwejp";
        this._im = "roma";
        this._flex = "flex";
        this._strictParse = false;
        this.parse(args);
    }
    Object.defineProperty(EngineOption.prototype, "layout", {
        get: function () {
            return this._layout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EngineOption.prototype, "im", {
        get: function () {
            return this._im;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EngineOption.prototype, "flex", {
        get: function () {
            return this._flex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EngineOption.prototype, "strictParse", {
        get: function () {
            return this._strictParse;
        },
        enumerable: true,
        configurable: true
    });
    return EngineOption;
})(Option);
exports.EngineOption = EngineOption;
var Engine = (function () {
    // public:
    function Engine(option) {
        // private:
        this._state = 0;
        this._opts = null;
        this._layout = null;
        this._im = null;
        this._activeWords = [];
        this._userCallback = null;
        this._opts = option;
        // apply input settings
        this._initConfig();
    }
    Engine.prototype.listen = function (userCallback) {
        if (userCallback === void 0) { userCallback = undefined; }
        if (userCallback !== void 0) {
            this._userCallback = userCallback;
        }
        if (this._state !== EngineState.LISTEN) {
            this._state = EngineState.LISTEN;
        }
        return this;
    };
    Engine.prototype.sleep = function () {
        if (this._state !== EngineState.SLEEP) {
            // stop handling key events
            this._state = EngineState.SLEEP;
        }
        return this;
    };
    Engine.prototype.make = function (src, tag, flex) {
        flex = flex || this._opts.flex;
        return new Word(this, src, tag, flex);
    };
    Engine.prototype.stroke = function (e, test) {
        if (test === void 0) { test = undefined; }
        if (typeof e === "string" || e === void 0) {
            e = this._makeEventObj(e);
        }
        else if (e.key === void 0) {
            e = this._makeEventObj("", e);
        }
        e.test = !!test;
        if (this._userCallback instanceof Function) {
            // main callback
            if (this._userCallback(e) === false) {
                // prevented
                return;
            }
        }
        if (e.sendable) {
            // send the keystroke to all listening word
            for (var i = 0; i < this._activeWords.length; ++i) {
                this._activeWords[i].stroke(e, test);
            }
        }
    };
    Engine.prototype.test = function (e) {
        this.stroke(e, true);
    };
    Engine.prototype.words = function () {
        return this._activeWords.slice();
    };
    Engine.prototype._makeEventObj = function (key, env) {
        if (env === void 0) { env = undefined; }
        var e = {};
        var keysyms;
        var keyCheck = this._im.symTable;
        e.type = "keystroke";
        if (env) {
            e.mod = env.shifted();
            keysyms = this._layout[env.keyCode][e.mod ? 1 : 0];
            if (keysyms instanceof Array) {
                e.key = keysyms[0];
                e.allSyms = keysyms;
            }
            else {
                e.key = keysyms;
                e.allSyms = [keysyms];
            }
            e.keyCode = env.keyCode;
        }
        else {
            e.key = key;
            e.allSyms = [key];
        }
        // chk if the key is sendable
        for (var i = 0; i < e.allSyms.length; ++i) {
            if (keyCheck[e.allSyms[i]] !== void 0) {
                e.sendable = true;
                e.keyChar = keyCheck[e.allSyms[i]];
                break;
            }
        }
        return e;
    };
    Engine.prototype._parse = function (src) {
        return (this._im.parser instanceof Function) && this._im.parser(src);
    };
    Engine.prototype._addListenWord = function (word) {
        for (var i = 0; i < this._activeWords.length; ++i) {
            if (this._activeWords[i] === word) {
                // already registered
                return false;
            }
        }
        this._activeWords.push(word);
        return true;
    };
    Engine.prototype._removeListenWord = function (word) {
        for (var i = 0; i < this._activeWords.length; ++i) {
            if (this._activeWords[i] === word) {
                this._activeWords.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Engine.prototype._initConfig = function () {
        this._im = new im.InputMethodFactory()[this._opts.im]();
        this._layout = Layout[this._opts.layout];
        this._overloadLayout();
    };
    Engine.prototype._overloadLayout = function () {
        var layout, mix, a, k, i, j;
        layout = Util.clone(this._layout);
        mix = this._im.overload;
        if (!mix) {
            return;
        }
        for (i in mix) {
            if (i.charAt(0) === "_") {
                k = Util.find(layout, i.slice(1));
                if (k === false)
                    continue;
            }
            else {
                k = i;
            }
            if (!layout[k]) {
                layout[k] = mix[i];
            }
            else if (layout[k] instanceof Array && layout[k].length === mix[i].length) {
                a = [];
                for (j = 0; j < layout[k].length; ++j) {
                    a.push(Array.prototype.concat(layout[k][j], mix[i][j]));
                }
                layout[k] = a;
            }
            else {
                throw new Error("fail to mix keymap");
            }
        }
        this._layout = layout;
    };
    return Engine;
})();
exports.Engine = Engine;
var Word = (function () {
    function Word(tsuikyo, src, tag, flex) {
        // public:
        this.tag = null;
        // private:
        this._state = EngineState.PREINIT;
        this._ts = null;
        this._flex = "";
        this._userCallback = null;
        this._src = "";
        this._nodeSrc = [];
        this._nodes = [];
        this._activeNode = null;
        this._input = [];
        this._missCount = 0;
        this._cancelCount = 0;
        this._chkJunctionCache = null;
        this.init(tsuikyo, src, tag, flex);
    }
    Word.prototype.init = function (tsuikyo, src, tag, flex) {
        /* demo/benchmark.htm, demo/multiword.htm において
        word.init() を呼び出しているのでいったん constructor から分離 */
        if (tsuikyo) {
            this._ts = tsuikyo;
            this._src = src;
            this.tag = tag;
            this._flex = flex;
            this._nodeSrc = tsuikyo._parse(src, tsuikyo._opts.strictParse);
            this._chkJunctionCache = [];
            this._state = EngineState.SLEEP;
        }
        this._nodes = this._linkNode(new Node(this._nodeSrc[0])); // entry point
        this._activeNode = this._selectNode();
        this._input = [];
        if (flex === "fixed") {
            this._nodes = [this._activeNode];
        }
        return this;
    };
    Word.prototype.listen = function (userCallback) {
        if (userCallback === void 0) { userCallback = undefined; }
        if (userCallback !== void 0) {
            this._userCallback = userCallback;
        }
        if (this._state === EngineState.SLEEP) {
            this._state = EngineState.LISTEN;
            this._ts._addListenWord(this);
        }
        return this;
    };
    Word.prototype.sleep = function () {
        this._state = EngineState.SLEEP;
        this._ts._removeListenWord(this);
        return this;
    };
    Word.prototype.stroke = function (e, test) {
        if (e === void 0) { e = undefined; }
        if (test === void 0) { test = undefined; }
        var ret, ee;
        if (typeof e === "string" || e === void 0) {
            e = this._ts._makeEventObj(e);
        }
        else if (e.key === void 0) {
            e = this._ts._makeEventObj("", e);
        }
        ret = this._accept(e, test);
        ee = Util.extend(e, {
            ret: ret,
            test: !!test,
            type: "keystroked",
            accept: ret > Type.MISS,
            miss: ret === Type.MISS,
            finish: ret >= Type.FINISH
        });
        if (this._state === EngineState.LISTEN && this._userCallback instanceof Function) {
            this._userCallback(ee);
        }
        return ee;
    };
    Word.prototype.test = function (e) {
        return this.stroke(e, true);
    };
    Word.prototype.totalCount = function () {
        return this._input.length;
    };
    Word.prototype.acceptCount = function () {
        return this._activeNode.keys().length;
    };
    Word.prototype.missCount = function (includeCancel) {
        if (includeCancel) {
            return this.totalCount() - this.acceptCount();
        }
        else {
            return this._missCount;
        }
    };
    Word.prototype.cancelCount = function () {
        return this.totalCount() - this.acceptCount() - this._missCount;
    };
    Word.prototype.pos = function () {
        return this._activeNode.pos;
    };
    Word.prototype.kpos = function () {
        return this._activeNode.keys().length;
    };
    Word.prototype.str = function (p) {
        if (p === void 0) { p = undefined; }
        if (p === void 0) {
            p = this._src.length;
        }
        if (p >= 0) {
            return this._src.slice(0, p);
        }
        else {
            return this._src.slice(-p - 1);
        }
    };
    Word.prototype.rstr = function (p) {
        return this.str(-p - 1);
    };
    Word.prototype.kstr = function (p) {
        if (p === void 0) { p = undefined; }
        var conv = this._ts._im.symTable, kpos = this.kpos(), keysyms;
        if (p === void 0) {
            keysyms = this._selectNodeToEnd().keys();
        }
        else if (p >= 0) {
            if (p <= kpos) {
                keysyms = this._activeNode.keys().slice(0, p);
            }
            else {
                keysyms = this._selectNodeToEnd().keys().slice(0, p);
            }
        }
        else {
            keysyms = this._selectNodeToEnd().keys().slice(-p - 1);
        }
        return Util.map(keysyms, function (e) {
            return conv[e];
        }).join("");
    };
    Word.prototype.rkstr = function (p) {
        if (p === void 0) { p = undefined; }
        return this.kstr(-p - 1);
    };
    Word.prototype.nextKeys = function () {
        var head = this._activeNode.next(), next;
        next = Util.map(this._nodes, function (node) {
            return node.next();
        });
        next.unshift(head);
        return Util.uniq(next);
    };
    Word.prototype.keysyms = function () {
        return this._selectNodeToEnd().keys();
    };
    Word.prototype.finished = function () {
        return this.pos() === this._src.length;
    };
    Word.prototype._accept = function (e, test) {
        var ret = [], retMax, i;
        for (i = 0; i < this._nodes.length; ++i) {
            ret.push(this._nodes[i].accept(e, test));
        }
        retMax = Math.max.apply(null, ret);
        if (!test && retMax !== Type.IGNORE) {
            // refresh the word state
            this._refresh(retMax);
            this._input.push(e);
        }
        return retMax;
    };
    Word.prototype._refresh = function (type) {
        var ns, newNodes, linkedNodes, i;
        if (type !== Type.MISS) {
            // get all appropriate nodes
            ns = Util.filter(this._nodes, function (node, i) {
                return node.ret === type;
            });
        }
        switch (type) {
            case Type.MISS:
                ++this._missCount;
                break;
            case Type.INNER:
                if (this._flex === "flex") {
                    this._nodes = ns;
                }
                this._activeNode = this._selectNode(ns);
                break;
            case Type.TRANSIT:
                if (this._flex === "flex") {
                    this._nodes = ns.slice(); // hard copy
                    newNodes = [];
                }
                else {
                    // include TYPE.INNER nodes as candidates to be active
                    newNodes = Util.filter(this._nodes, function (node, i) {
                        return node.ret === Type.INNER;
                    });
                }
                for (i = 0; i < ns.length; ++i) {
                    linkedNodes = this._linkNode(ns[i]);
                    this._nodes = this._nodes.concat(linkedNodes);
                    newNodes = newNodes.concat(linkedNodes);
                    this._hideNode(ns[i]);
                }
                this._activeNode = this._selectNode(newNodes);
                break;
            case Type.JUNCTION: // node transit and reach junction
            case Type.FINISH:
                this._nodes = this._linkNode(this._selectNode(ns));
                this._activeNode = this._selectNode();
                break;
            case Type.FINISHED:
                this._input.pop();
                break;
            default:
                throw new Error("Word._refresh: unknown refresh type " + type);
        }
        if (this._flex === "fixed" && this._nodes.length > 1) {
            // when fixed mode, remains active node only
            this._nodes = [this._activeNode];
        }
    };
    Word.prototype._linkNode = function (parent) {
        var tailPos = this._src.length, next, isJunction, node, ret = [], i;
        if (!parent.n) {
            parent.n = [new Node(null, parent)];
        }
        next = parent.n;
        for (i = 0; i < next.length; ++i) {
            isJunction = this._chkJunction(parent.pos + parent.d + next[i].d);
            node = new Node(next[i], parent, isJunction, tailPos);
            ret.push(node);
        }
        return ret;
    };
    Word.prototype._hideNode = function (node) {
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i] === node) {
                this._nodes.splice(i, 1);
                break;
            }
        }
    };
    Word.prototype._selectNode = function (ns) {
        if (ns === void 0) { ns = undefined; }
        var sel, filters;
        sel = function (nodes, f) {
            var i, j, v, a = [], max = -Infinity;
            for (i = 0; i < nodes.length; ++i) {
                v = f(nodes[i]);
                if (v > max) {
                    max = v;
                    j = a.length;
                }
                if (v === max) {
                    a.push(nodes[i]);
                }
            }
            return a.slice(j);
        };
        filters = [
            function (node) { return node.pos; },
            function (node) { return node.pos + node.d; },
            function (node) { return node.pos + (node.dsum || node.d); },
            function (node) { return node.i; },
            function (node) { return -node.k.length; }
        ];
        ns = ns || this._nodes;
        if (ns.length > 1) {
            Util.each(filters, function (f) {
                ns = sel(ns, f);
                return ns.length === 1; // true means break the loop
            });
        }
        return ns[0];
    };
    Word.prototype._selectNodeToEnd = function (start) {
        if (start === void 0) { start = undefined; }
        var node = start || this._activeNode;
        while (node.n && node.n.length) {
            node = this._selectNode(this._linkNode(node));
        }
        node = new Node(null, node, true, this._src.length);
        node.parent.n = [node];
        return node;
    };
    Word.prototype._chkJunction = function (pos) {
        var nodeSrc, d, i, j;
        if (this._chkJunctionCache[pos] !== void 0) {
            return this._chkJunctionCache[pos];
        }
        nodeSrc = this._nodeSrc;
        for (i = 0; i < pos; ++i) {
            for (j = 0; j < nodeSrc[i].length; ++j) {
                d = nodeSrc[i][j].dsum || nodeSrc[i][j].d;
                if (pos < i + d) {
                    return this._chkJunctionCache[pos] = false;
                }
            }
        }
        return this._chkJunctionCache[pos] = true;
    };
    return Word;
})();
var Node = (function () {
    function Node(nodeSrc, parent, isJunction, tailPos) {
        if (parent === void 0) { parent = undefined; }
        if (isJunction === void 0) { isJunction = undefined; }
        if (tailPos === void 0) { tailPos = undefined; }
        this.k = [];
        this.i = 0;
        this.d = 0;
        this.dsum = 0;
        this.n = [];
        this.parent = null;
        this.isJunction = true;
        this.tailPos = -1;
        this.ret = -1;
        this.pos = 0;
        if (!nodeSrc) {
            this.ret = 5; // end point
        }
        else if (nodeSrc instanceof Array) {
            this.n = nodeSrc; // entry point
        }
        else {
            this.k = nodeSrc.k;
            this.d = nodeSrc.d;
            this.dsum = nodeSrc.dsum || this.d;
            this.n = nodeSrc.n;
        }
        this.parent = parent;
        this.isJunction = isJunction;
        this.tailPos = tailPos;
        this.pos = this._pos();
    }
    Node.prototype.accept = function (e, test) {
        var keyMatch, nextSym = this.k[this.i], i;
        if (typeof e === "object" && e.allSyms) {
            for (i = e.allSyms.length - 1; i >= 0; i--) {
                if (e.allSyms[i] === nextSym) {
                    keyMatch = true;
                    break;
                }
            }
            if (keyMatch) {
                if (this.k.length === ++this.i) {
                    if (this.isJunction) {
                        if (this.tailPos === this.pos + this.d) {
                            this.ret = Type.FINISH;
                        }
                        else {
                            this.ret = Type.JUNCTION;
                        }
                    }
                    else {
                        this.ret = Type.TRANSIT;
                    }
                }
                else {
                    this.ret = Type.INNER;
                }
                test && --this.i;
            }
            else if (!this.k.length) {
                // end point always returns TYPE.FINISHED
                this.ret = Type.FINISHED;
            }
            else {
                this.ret = Type.MISS;
            }
        }
        else {
            this.ret = Type.IGNORE;
        }
        return this.ret;
    };
    Node.prototype.keys = function () {
        var keys, n = this.parent;
        keys = [this.k.slice(0, this.i)];
        while (n) {
            keys.push(n.k);
            n = n.parent;
        }
        return Array.prototype.concat.apply([], keys.reverse());
    };
    Node.prototype.next = function () {
        return this.k[this.i];
    };
    Node.prototype._pos = function () {
        if (this.parent && this.parent.pos !== void 0) {
            return this.parent.pos + this.parent.d;
        }
        else {
            return 0;
        }
    };
    return Node;
})();
//# sourceMappingURL=engine.js.map

/***/ },
/* 7 */
/***/ function(module, exports) {

var EngineState;
(function (EngineState) {
    EngineState[EngineState["PREINIT"] = 6] = "PREINIT";
    EngineState[EngineState["SLEEP"] = 7] = "SLEEP";
    EngineState[EngineState["LISTEN"] = 8] = "LISTEN";
})(EngineState || (EngineState = {}));
module.exports = EngineState;
//# sourceMappingURL=engine.state.js.map

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

var Util = __webpack_require__(5);
var Layout = (function () {
    function Layout() {
    }
    Layout.qwejp = {
        48: ["0", "0"],
        49: ["1", "!"],
        50: ["2", '"'],
        51: ["3", "#"],
        52: ["4", "$"],
        53: ["5", "%"],
        54: ["6", "&"],
        55: ["7", "'"],
        56: ["8", "("],
        57: ["9", ")"],
        65: ["a", "A"],
        66: ["b", "B"],
        67: ["c", "C"],
        68: ["d", "D"],
        69: ["e", "E"],
        70: ["f", "F"],
        71: ["g", "G"],
        72: ["h", "H"],
        73: ["i", "I"],
        74: ["j", "J"],
        75: ["k", "K"],
        76: ["l", "L"],
        77: ["m", "M"],
        78: ["n", "N"],
        79: ["o", "O"],
        80: ["p", "P"],
        81: ["q", "Q"],
        82: ["r", "R"],
        83: ["s", "S"],
        84: ["t", "T"],
        85: ["u", "U"],
        86: ["v", "V"],
        87: ["w", "W"],
        88: ["x", "X"],
        89: ["y", "Y"],
        90: ["z", "Z"],
        189: ["-", "="],
        222: ["^", "~"],
        220: ["\\", "|"],
        192: ["@", "`"],
        219: ["[", "{"],
        187: [";", "+"],
        186: [":", "*"],
        221: ["]", "}"],
        188: [",", "<"],
        190: [".", ">"],
        191: ["/", "?"],
        226: ["\\", "_"],
        112: ["F1", "F1"],
        113: ["F2", "F2"],
        114: ["F3", "F3"],
        115: ["F4", "F4"],
        116: ["F5", "F5"],
        117: ["F6", "F6"],
        118: ["F7", "F7"],
        119: ["F8", "F8"],
        120: ["F9", "F9"],
        121: ["F10", "F10"],
        122: ["F11", "F11"],
        123: ["F12", "F12"],
        124: ["F13", "F13"],
        125: ["F14", "F14"],
        126: ["F15", "F15"],
        127: ["F16", "F16"],
        27: ["Esc", "Esc"],
        9: [["Tab", "\t"], ["Tab", "\t"]],
        16: ["Shift", "Shift"],
        17: ["Ctrl", "Ctrl"],
        18: ["Alt", "Alt"],
        91: ["LWin", "LWin"],
        92: ["RWin", "RWin"],
        93: ["Menu", "Menu"],
        244: ["IME", "IME"],
        25: ["IME", "IME"],
        240: ["Eisu", "Eisu"],
        20: ["CapsLock", "CapsLock"],
        29: ["Muhenkan", "Muhenkan"],
        28: ["Henkan", "Henkan"],
        242: ["Kana", "Kana"],
        13: [["Enter", "\n"], ["Enter", "\n"]],
        32: [["Space", " "], ["Space", " "]],
        8: ["Bksp", "Bksp"],
        37: ["Left", "Left"],
        38: ["Up", "Up"],
        39: ["Right", "Right"],
        40: ["Down", "Down"],
        45: ["Ins", "Ins"],
        46: ["Del", "Del"],
        36: ["Home", "Home"],
        35: ["End", "End"],
        33: ["PgDn", "PgDn"],
        34: ["PgUp", "PgUp"],
        145: ["ScLock", "ScLock"],
        19: ["Pause", "Pause"],
        144: ["NumLock", "NumLock"],
        96: ["0", "0"],
        97: ["1", "1"],
        98: ["2", "2"],
        99: ["3", "3"],
        100: ["4", "4"],
        101: ["5", "5"],
        102: ["6", "6"],
        103: ["7", "7"],
        104: ["8", "8"],
        105: ["9", "9"],
        106: ["*", "*"],
        107: ["+", "+"],
        109: ["-", "-"],
        110: [".", "."],
        111: ["/", "/"]
    };
    Layout.qweus = Util.extend(Layout.qwejp, {
        48: ["0", ")"],
        50: ["2", "@"],
        54: ["6", "^"],
        55: ["7", "&"],
        56: ["8", "*"],
        57: ["9", "("],
        189: ["-", "_"],
        222: ["+", "="],
        220: ["\\", "|"],
        192: ["[", "{"],
        219: ["]", "}"],
        187: [";", ":"],
        186: ["'", '"'],
        221: ["`", "~"],
        188: [",", "<"],
        190: [".", ">"],
        191: ["/", "?"],
        226: ["`", "~"]
    });
    Layout.dvo = Util.extend(Layout.qweus, {
        65: ["a", "A"],
        66: ["x", "X"],
        67: ["j", "J"],
        68: ["e", "E"],
        69: [".", ">"],
        70: ["u", "U"],
        71: ["i", "I"],
        72: ["d", "D"],
        73: ["c", "C"],
        74: ["h", "H"],
        75: ["t", "T"],
        76: ["n", "N"],
        77: ["m", "M"],
        78: ["b", "B"],
        79: ["r", "R"],
        80: ["l", "L"],
        81: ["'", '"'],
        82: ["p", "P"],
        83: ["o", "O"],
        84: ["y", "Y"],
        85: ["g", "G"],
        86: ["k", "K"],
        87: [",", "<"],
        88: ["q", "Q"],
        89: ["f", "F"],
        90: [";", ":"],
        189: ["[", "{"],
        222: ["]", "}"],
        220: ["\\", "|"],
        192: ["/", "?"],
        219: ["=", "+"],
        187: ["s", "S"],
        186: ["-", '_'],
        221: ["`", "~"],
        188: ["w", "W"],
        190: ["v", "V"],
        191: ["z", "Z"],
        226: ["`", "~"]
    });
    Layout.colemak = Util.extend(Layout.qweus, {
        68: ["s", "S"],
        69: ["f", "F"],
        70: ["t", "T"],
        71: ["d", "D"],
        73: ["u", "U"],
        74: ["n", "N"],
        75: ["e", "E"],
        76: ["i", "I"],
        78: ["k", "K"],
        79: ["y", "Y"],
        80: [";", ":"],
        82: ["p", "P"],
        83: ["r", "R"],
        84: ["g", "G"],
        85: ["l", "L"],
        89: ["j", "J"],
        187: ["o", "O"]
    });
    return Layout;
})();
module.exports = Layout;
//# sourceMappingURL=layout.js.map

/***/ },
/* 9 */
/***/ function(module, exports) {

var Type;
(function (Type) {
    Type[Type["IGNORE"] = -1] = "IGNORE";
    Type[Type["MISS"] = 0] = "MISS";
    Type[Type["INNER"] = 1] = "INNER";
    Type[Type["TRANSIT"] = 2] = "TRANSIT";
    Type[Type["JUNCTION"] = 3] = "JUNCTION";
    Type[Type["FINISH"] = 4] = "FINISH";
    Type[Type["FINISHED"] = 5] = "FINISHED";
})(Type || (Type = {}));
module.exports = Type;
//# sourceMappingURL=engine.type.js.map

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

var Util = __webpack_require__(5);
var _u = __webpack_require__(3);
var UserAgent = _u.UserAgent;
var user_agent = UserAgent.instanciate();
function addRule(r, i, j, rules, reach, ret) {
    var nextPos, dsum, head, tail;
    if (typeof r === "string") {
        nextPos = i + j;
        head = tail = {
            k: r.split(""),
            d: j,
            n: ret[nextPos]
        };
    }
    else if (r.length) {
        // link intermediate nodes
        dsum = 0;
        r = r.slice();
        for (var l = r.length - 1; l >= 0; l--) {
            r[l] = Util.clone(r[l]);
            r[l].n = [r[l + 1]];
            dsum += r[l].d;
        }
        nextPos = i + dsum;
        r[r.length - 1].n = ret[nextPos];
        r[0].dsum = dsum;
        head = r[0];
        tail = r[r.length - 1];
    }
    else {
        r = Util.clone(r);
        if (r.d === void 0)
            r.d = j;
        nextPos = i + r.d;
        r.n = ret[nextPos];
        head = tail = r;
    }
    rules.push(head);
    if (!reach[nextPos]) {
        reach[nextPos] = [];
    }
    reach[nextPos].push(tail);
}
// default parser used from __embed.im.*
function parse(src, table, ruleMaxLength, strictParse) {
    var ret = [], reach = [], rules, rule, i, j, l, len;
    // scan backward
    len = src.length;
    for (i = len - 1; i >= 0; i--) {
        rules = [];
        for (j = 1; j <= ruleMaxLength && i + j <= len; ++j) {
            rule = table[src.slice(i, i + j)];
            if (rule === void 0) {
                continue;
            }
            else if (rule instanceof Function) {
                rule = rule(ret[i + j] || []);
            }
            for (l = 0; l < rule.length; ++l) {
                addRule(rule[l], i, j, rules, reach, ret);
            }
        }
        ret[i] = rules;
    }
    // check if any dead-end
    for (i = 0; i < reach.length - 1; ++i) {
        // if dead-end exists
        if (reach[i] && (!ret[i] || !ret[i].length)) {
            if (strictParse) {
                throw new Error("parse error");
            }
            else {
                // pass through it
                for (j = 0; j < reach[i].length; ++j) {
                    ++reach[i][j].d;
                    reach[i][j].n = ret[i + 1];
                    if (!reach[i + 1]) {
                        reach[i + 1] = [];
                    }
                }
                reach[i + 1] = reach[i + 1].concat(reach[i]);
                reach[i] = null;
            }
        }
    }
    return ret;
}
var InputMethodFactory = (function () {
    function InputMethodFactory() {
        this.romaTable = {
            'あ': ['a'],
            'ぁ': ['xa', 'la'],
            'い': ['i', 'yi'],
            'いぇ': ['ye'],
            'ぃ': ['xi', 'li', 'xyi', 'lyi'],
            'う': ['u', 'wu', 'whu'],
            'うぁ': ['wha'],
            'うぃ': ['wi', 'whi'],
            'うぇ': ['we', 'whe'],
            'うぉ': ['who'],
            'ぅ': ['xu', 'lu'],
            'ゔ': ['vu'],
            'ゔぁ': ['va'],
            'ゔぃ': ['vi', 'vyi'],
            'ゔぇ': ['ve', 'vye'],
            'ゔぉ': ['vo'],
            'ゔゃ': ['vya'],
            'ゔゅ': ['vyu'],
            'ゔょ': ['vyo'],
            'え': ['e'],
            'ぇ': ['xe', 'le', 'lye', 'xye'],
            'お': ['o'],
            'ぉ': ['xo', 'lo'],
            'か': ['ka', 'ca'],
            'ゕ': ['lka', 'xka'],
            'が': ['ga'],
            'き': ['ki'],
            'きゃ': ['kya'],
            'きぃ': ['kyi'],
            'きゅ': ['kyu'],
            'きぇ': ['kye'],
            'きょ': ['kyo'],
            'ぎ': ['gi'],
            'ぎゃ': ['gya'],
            'ぎぃ': ['gyi'],
            'ぎゅ': ['gyu'],
            'ぎぇ': ['gye'],
            'ぎょ': ['gyo'],
            'く': ['ku', 'cu', 'qu'],
            'くぁ': ['qa', 'qwa', 'kwa'],
            'くぃ': ['qi', 'qwi', 'qyi'],
            'くぅ': ['qwu'],
            'くぇ': ['qe', 'qye', 'qwe'],
            'くぉ': ['qo', 'qwo'],
            'くゃ': ['qya'],
            'くゅ': ['qyu'],
            'くょ': ['qyo'],
            'ぐ': ['gu'],
            'ぐぁ': ['gwa'],
            'ぐぃ': ['gwi'],
            'ぐぅ': ['gwu'],
            'ぐぇ': ['gwe'],
            'ぐぉ': ['gwo'],
            'け': ['ke'],
            'ゖ': ['lke', 'xke'],
            'げ': ['ge'],
            'こ': ['ko', 'co'],
            'ご': ['go'],
            'さ': ['sa'],
            'ざ': ['za'],
            'し': ['si', 'ci', 'shi'],
            'しゃ': ['sya', 'sha'],
            'しぃ': ['syi'],
            'しゅ': ['syu', 'shu'],
            'しぇ': ['sye', 'she'],
            'しょ': ['syo', 'sho'],
            'じ': ['zi', 'ji'],
            'じゃ': ['ja', 'jya', 'zya'],
            'じぃ': ['jyi', 'zyi'],
            'じゅ': ['ju', 'jyu', 'zyu'],
            'じぇ': ['je', 'jye', 'zye'],
            'じょ': ['jo', 'jyo', 'zyo'],
            'す': ['su'],
            'すぁ': ['swa'],
            'すぃ': ['swi'],
            'すぅ': ['swu'],
            'すぇ': ['swe'],
            'すぉ': ['swo'],
            'ず': ['zu'],
            'せ': ['se', 'ce'],
            'ぜ': ['ze'],
            'そ': ['so'],
            'ぞ': ['zo'],
            'た': ['ta'],
            'だ': ['da'],
            'ち': ['ti', 'chi'],
            'ちゃ': ['tya', 'cha', 'cya'],
            'ちぃ': ['tyi', 'cyi'],
            'ちゅ': ['tyu', 'cyu', 'chu'],
            'ちぇ': ['tye', 'che', 'cye'],
            'ちょ': ['tyo', 'cyo', 'cho'],
            'ぢ': ['di'],
            'ぢゃ': ['dya'],
            'ぢぃ': ['dyi'],
            'ぢゅ': ['dyu'],
            'ぢぇ': ['dye'],
            'ぢょ': ['dyo'],
            'つ': ['tu', 'tsu'],
            'つぁ': ['tsa'],
            'つぃ': ['tsi'],
            'つぇ': ['tse'],
            'つぉ': ['tso'],
            'づ': ['du'],
            'て': ['te'],
            'てぃ': ['thi'],
            'てぇ': ['the'],
            'てゃ': ['tha'],
            'てゅ': ['thu'],
            'てょ': ['tho'],
            'で': ['de'],
            'でぃ': ['dhi'],
            'でぇ': ['dhe'],
            'でゃ': ['dha'],
            'でゅ': ['dhu'],
            'でょ': ['dho'],
            'と': ['to'],
            'とぁ': ['twa'],
            'とぃ': ['twi'],
            'とぅ': ['twu'],
            'とぇ': ['twe'],
            'とぉ': ['two'],
            'ど': ['do'],
            'どぁ': ['dwa'],
            'どぃ': ['dwi'],
            'どぅ': ['dwu'],
            'どぇ': ['dwe'],
            'どぉ': ['dwo'],
            'な': ['na'],
            'に': ['ni'],
            'にゃ': ['nya'],
            'にぃ': ['nyi'],
            'にゅ': ['nyu'],
            'にぇ': ['nye'],
            'にょ': ['nyo'],
            'ぬ': ['nu'],
            'ね': ['ne'],
            'の': ['no'],
            'は': ['ha'],
            'ば': ['ba'],
            'ぱ': ['pa'],
            'ひ': ['hi'],
            'ひゃ': ['hya'],
            'ひぃ': ['hyi'],
            'ひゅ': ['hyu'],
            'ひぇ': ['hye'],
            'ひょ': ['hyo'],
            'び': ['bi'],
            'びゃ': ['bya'],
            'びぃ': ['byi'],
            'びゅ': ['byu'],
            'びぇ': ['bye'],
            'びょ': ['byo'],
            'ぴ': ['pi'],
            'ぴゃ': ['pya'],
            'ぴぃ': ['pyi'],
            'ぴゅ': ['pyu'],
            'ぴぇ': ['pye'],
            'ぴょ': ['pyo'],
            'ふ': ['hu', 'fu'],
            'ふぁ': ['fa', 'fwa'],
            'ふぃ': ['fi', 'fwi', 'fyi'],
            'ふぅ': ['fwu'],
            'ふぇ': ['fe', 'fwe'],
            'ふぉ': ['fo', 'fwo'],
            'ふゃ': ['fya'],
            'ふゅ': ['fyu'],
            'ふょ': ['fyo'],
            'ぶ': ['bu'],
            'ぷ': ['pu'],
            'へ': ['he'],
            'べ': ['be'],
            'ぺ': ['pe'],
            'ほ': ['ho'],
            'ぼ': ['bo'],
            'ぽ': ['po'],
            'ま': ['ma'],
            'み': ['mi'],
            'みゃ': ['mya'],
            'みぃ': ['myi'],
            'みゅ': ['myu'],
            'みぇ': ['mye'],
            'みょ': ['myo'],
            'む': ['mu'],
            'め': ['me'],
            'も': ['mo'],
            'や': ['ya'],
            'ゃ': ['xya', 'lya'],
            'ゆ': ['yu'],
            'ゅ': ['xyu', 'lyu'],
            'よ': ['yo'],
            'ょ': ['xyo', 'lyo'],
            'ら': ['ra'],
            'り': ['ri'],
            'りゃ': ['rya'],
            'りぃ': ['ryi'],
            'りゅ': ['ryu'],
            'りぇ': ['rye'],
            'りょ': ['ryo'],
            'る': ['ru'],
            'れ': ['re'],
            'ろ': ['ro'],
            'わ': ['wa'],
            'ゎ': ['xwa', 'lwa'],
            'ゐ': ['wyi'],
            'ゑ': ['wye'],
            'を': ['wo'],
            'ん': function (cont) {
                var ret = ['nn', 'xn', "n'"];
                var head, rest, inter, inters, dsum;
                for (var i = 0; i < cont.length; ++i) {
                    head = cont[i].k[0];
                    rest = cont[i].k.slice(1);
                    if ("aiueony".indexOf(head) < 0) {
                        if (rest.length) {
                            inters = [
                                { k: ['n', head], d: 1 },
                                { k: rest, d: cont[i].d }
                            ];
                            dsum = cont[i].d;
                            inter = cont[i];
                            while (dsum < cont[i].dsum) {
                                // copy intermediate nodes
                                inter = inter.n[0];
                                inters.push(Util.clone(inter));
                                dsum += inter.d;
                            }
                        }
                        else {
                            inters = {
                                k: ['n', head],
                                d: cont[i].d + 1
                            };
                        }
                        ret.push(inters);
                    }
                }
                return ret;
            },
            'っ': function (cont) {
                var ret = ['xtu', 'xtsu', 'ltu', 'ltsu'];
                var head, rest, inter, inters, dsum;
                for (var i = 0; i < cont.length; ++i) {
                    head = cont[i].k[0];
                    rest = cont[i].k.slice(1);
                    if (head !== "n" && rest.length) {
                        inters = [
                            { k: [head, head], d: 1 },
                            { k: rest, d: cont[i].d }
                        ];
                        dsum = cont[i].d;
                        inter = cont[i];
                        while (dsum < cont[i].dsum) {
                            // copy intermediate nodes
                            inter = inter.n[0];
                            inters.push(Util.clone(inter));
                            dsum += inter.d;
                        }
                        ret.push(inters);
                    }
                }
                return ret;
            },
            "ー": ["-"],
            "。": ["."],
            "、": [","],
            "・": ["/"]
        };
        this.asciiExp = /[\x20-\x7e\n\t]/g;
        this.fasciiExp = /[\uFF01-\uFF5E]/g;
        this.fasciiExp2 = /[　￥”“〜]|(\r\n)/g;
        this.fasciiHash = { "　": " ", "￥": "\\", "”": "\"", "“": "\"", "〜": "~", "\r\n": "\n" };
        this.kataExp = /[\u30A1-\u30F6]/g;
        this.asciiChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"#$%&'()-=^~\\|@`[{;+:*]},<.>/?_ \t\n";
        this.fasciiChars = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９！＂＃＄％＆＇（）－＝＾～￥｜＠｀［｛；＋：＊］｝，＜．＞／？＿　\t\n";
        this.hiraBase = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっー。、・「」";
        this.hiraDaku = "がぎぐげござじずぜぞだぢづでどばびぶべぼ";
        this.hiraNoDaku = "かきくけこさしすせそたちつてとはひふへほ";
        this.hiraHan = "ぱぴぷぺぽ";
        this.hiraNoHan = "はひふへほ";
        this.daku = "゛";
        this.handaku = "゜";
    }
    // fix full width ascii -> ascii
    InputMethodFactory.prototype.asciiFix = function (str) {
        var _this = this;
        return str.replace(this.fasciiExp, function (m) {
            return String.fromCharCode(m.charCodeAt() - 0xFEE0);
        }).replace(this.fasciiExp2, function (m) {
            return _this.fasciiHash[m];
        });
    };
    // fix Katakana -> Hiragana
    InputMethodFactory.prototype.kataFix = function (str) {
        return str.replace(this.kataExp, function (m) {
            return String.fromCharCode(m.charCodeAt() - 0x0060);
        });
    };
    // scan table and modify
    InputMethodFactory.prototype.modTable = function (t, fn) {
        var mods = [];
        var i, j, k, row, keys, mod;
        for (i in t) {
            row = t[i];
            if (row instanceof Function) {
                continue;
            }
            for (j = 0; j < row.length; ++j) {
                keys = row[j];
                if (typeof keys === "object") {
                    keys = keys.k.slice();
                }
                else {
                    keys = keys.split("");
                }
                mod = fn(keys, i, j);
                if (mod !== void 0) {
                    if (mod instanceof Array) {
                        for (k = 0; k < mod.length; ++k) {
                            mods.push(mod[k]);
                        }
                    }
                    else {
                        mods.push(mod);
                    }
                }
            }
        }
        for (i = 0; i < mods.length; ++i) {
            mod = mods[i];
            switch (mod.m) {
                case "add":
                    if (t[mod.i]) {
                        t[mod.i] = t[mod.i].concat(mod.v);
                    }
                    else {
                        t[mod.i] = [mod.v];
                    }
                    break;
                case "mod":
                    t[mod.i] = Util.clone(t[mod.i]);
                    t[mod.i][mod.j] = mod.v;
                    break;
                case "rep":
                    t[mod.i] = mod.v;
                    break;
                default:
                    throw new Error("failed to scan im table");
            }
        }
        return t;
    };
    InputMethodFactory.prototype.ascii = function () {
        var _this = this;
        var acceptKeysyms = {};
        Util.each(this.asciiChars, function (e) {
            acceptKeysyms[e] = e;
        });
        return new InputMethod(acceptKeysyms, function (src, strictParse) {
            var ret = [];
            src = _this.asciiFix(src);
            src.replace(_this.asciiExp, function (m) {
                ret.push([{
                        k: [m],
                        d: 1
                    }]);
            });
            Util.each(ret, function (e, i) {
                if (i + 1 < ret.length) {
                    e[0].n = ret[i + 1];
                }
            });
            if (ret.length !== src.length) {
                strictParse && alert("parse error");
            }
            return ret;
        });
    };
    InputMethodFactory.prototype.jis = function () {
        var _this = this;
        var t = {}, acceptKeysyms = {};
        var jmap = {
            48: ["わ", "を"],
            49: ["ぬ", "ぬ"],
            50: ["ふ", "ふ"],
            51: ["あ", "ぁ"],
            52: ["う", "ぅ"],
            53: ["え", "ぇ"],
            54: ["お", "ぉ"],
            55: ["や", "ゃ"],
            56: ["ゆ", "ゅ"],
            57: ["よ", "ょ"],
            65: ["ち", "ち"],
            66: ["こ", "こ"],
            67: ["そ", "そ"],
            68: ["し", "し"],
            69: ["い", "ぃ"],
            70: ["は", "は"],
            71: ["き", "き"],
            72: ["く", "く"],
            73: ["に", "に"],
            74: ["ま", "ま"],
            75: ["の", "の"],
            76: ["り", "り"],
            77: ["も", "も"],
            78: ["み", "み"],
            79: ["ら", "ら"],
            80: ["せ", "せ"],
            81: ["た", "た"],
            82: ["す", "す"],
            83: ["と", "と"],
            84: ["か", "か"],
            85: ["な", "な"],
            86: ["ひ", "ひ"],
            87: ["て", "て"],
            88: ["さ", "さ"],
            89: ["ん", "ん"],
            90: ["つ", "っ"],
            189: ["ほ", "ほ"],
            222: ["へ", "へ"],
            220: ["ー", "ー"],
            192: ["゛", "゛"],
            219: ["゜", "「"],
            187: ["れ", "れ"],
            186: ["け", "け"],
            221: ["む", "」"],
            188: ["ね", "、"],
            190: ["る", "。"],
            191: ["め", "・"],
            226: ["ろ", "ろ"]
        };
        // add basic rules
        Util.each(this.hiraBase, function (e) {
            t[e] = [e];
            acceptKeysyms[e] = e;
        });
        // add dakuon rules
        Util.each(this.hiraDaku, function (e, i) {
            t[e] = [_this.hiraNoDaku.charAt(i) + _this.daku];
        });
        acceptKeysyms[this.daku] = this.daku;
        // add handakuon rules
        Util.each(this.hiraHan, function (e, i) {
            t[e] = [_this.hiraNoHan.charAt(i) + _this.handaku];
        });
        acceptKeysyms[this.handaku] = this.handaku;
        // add ascii rules
        Util.each(this.asciiChars, function (e, i) {
            t[e] = [e];
            acceptKeysyms[e] = _this.fasciiChars.charAt(i);
        });
        // fix \ key problem
        if (user_agent.browser.isOpera()) {
            jmap[220][0] = [jmap[220][0], "ろ"];
            jmap[220][1] = [jmap[220][1], "ろ"];
        }
        return new InputMethod(acceptKeysyms, function (src, strictParse) {
            src = _this.asciiFix(src);
            src = _this.kataFix(src);
            return parse(src, t, 1, strictParse);
        }, jmap);
    };
    InputMethodFactory.prototype.roma = function () {
        var _this = this;
        var t = Util.clone(this.romaTable), acceptKeysyms = {}, ruleMaxLength = 2;
        // add ascii rules
        Util.each(this.asciiChars, function (e) {
            t[e] = [e];
            acceptKeysyms[e] = e;
        });
        return new InputMethod(acceptKeysyms, function (src, strictParse) {
            src = _this.asciiFix(src);
            src = _this.kataFix(src);
            return parse(src, t, ruleMaxLength, strictParse);
        });
    };
    InputMethodFactory.prototype.dvojp = function () {
        var _this = this;
        var t = Util.clone(this.romaTable), acceptKeysyms = {}, ruleMaxLength = 3, extKeys, altYSelector, diph;
        extKeys = {
            "_c": ["_k", "_k"],
            "_h": ["_y1", "_y1"],
            "_n": ["_y2", "_y2"],
            "_'": ["_ai", "_ai"],
            "_,": ["_ou", "_ou"],
            "_.": ["_ei", "_ei"],
            "_;": ["_ann", "_ann"],
            "_q": ["_onn", "_onn"],
            "_j": ["_enn", "_enn"],
            "_k": ["_unn", "_unn"],
            "_x": ["_inn", "_inn"]
        };
        altYSelector = { p: 1, f: 2, g: 2, _k: 2, r: 1, l: 1, d: 2, h: 2, t: 2, n: 1, s: 1, q: 1, j: 1, k: 1, x: 1, b: 2, m: 2, w: 1, v: 1, z: 1 };
        diph = {
            a: {
                h: "い",
                k: "i"
            },
            o: {
                h: "う",
                k: "u"
            },
            e: {
                h: "い",
                k: "i"
            }
        };
        // add alternative 'k' rules
        this.modTable(t, function (keys, i, j) {
            for (j = 0; j < keys.length; ++j) {
                if (keys[j] === "k") {
                    keys[j] = "_k";
                    return {
                        m: "add",
                        v: { k: keys },
                        i: i
                    };
                }
            }
        });
        // add alternative 'y' rules
        this.modTable(t, function (keys, str, j) {
            if (keys.length === 3 && keys[1] === "y" && str.length === 2 && "ゃぃゅぇょ".indexOf(str.charAt(1)) >= 0) {
                keys[1] = altYSelector[keys[0]];
                if (keys !== void 0) {
                    keys[1] = "_y" + keys[1];
                    return {
                        m: "add",
                        v: { k: keys },
                        i: str
                    };
                }
            }
        });
        // add diphthong rules ('ai', 'ou', 'ei')
        this.modTable(t, function (keys, str, j) {
            var ret, last, tail, d;
            last = keys.length - 1;
            tail = keys[last];
            d = diph[tail];
            if (last > 0) {
                keys[last] = "_" + tail + "nn";
                ret = {
                    m: "add",
                    i: str + "ん",
                    v: { k: keys }
                };
                if (d) {
                    keys = keys.slice();
                    keys[last] = "_" + tail + d.k;
                    ret = [ret, {
                            m: "add",
                            i: str + d.h,
                            v: { k: keys }
                        }];
                }
            }
            return ret;
        });
        // add ascii rules
        Util.each(this.asciiChars, function (e) {
            t[e] = [e];
            acceptKeysyms[e] = e;
        });
        // add exteded keys
        acceptKeysyms._k = "k"; // or "c"
        acceptKeysyms._y1 = "y"; // or "h"
        acceptKeysyms._y2 = "y"; // or "n"
        acceptKeysyms._ai = "ai"; // or "'"
        acceptKeysyms._ou = "ou"; // or ","
        acceptKeysyms._ei = "ei"; // or "."
        acceptKeysyms._ann = "ann"; // or ";"
        acceptKeysyms._onn = "onn"; // or "q"
        acceptKeysyms._enn = "enn"; // or "j"
        acceptKeysyms._unn = "unn"; // or "k"
        acceptKeysyms._inn = "inn"; // or "x"
        return new InputMethod(acceptKeysyms, function (src, strictParse) {
            src = _this.asciiFix(src);
            src = _this.kataFix(src);
            return parse(src, t, ruleMaxLength, strictParse);
        }, extKeys);
    };
    return InputMethodFactory;
})();
exports.InputMethodFactory = InputMethodFactory;
var InputMethod = (function () {
    function InputMethod(symTable, parser, overload) {
        this.symTable = symTable;
        this.parser = parser;
        this.overload = overload;
    }
    return InputMethod;
})();
exports.InputMethod = InputMethod;
//# sourceMappingURL=input_method.js.map

/***/ }
/******/ ]);