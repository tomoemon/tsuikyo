import _b = require('./user_agent.browser');
import Browser = _b.Browser;
import BrowserType = _b.BrowserType;

export class UserAgent {
    constructor(private window: any, private navigator: any) {
    }

    static instanciate(): UserAgent {
        return new UserAgent(window, navigator);
    }

    // detect the browser and os from UA
    // modified jquery.client.js (public domain) : http://www.quirksmode.org/js/detect.html
    public browser: Browser = function (): Browser {
        var ret: any = {},
            useragent = this.navigator.userAgent,
            navigatorvendor = this.navigator.vendor,
            navigatorappversion = this.navigator.appVersion, d, bv, ds, dp, vs, btype, idx, c, i, fn;
        d = [    // ** order-sensitive! **
            {
                s: useragent,
                sub: "Chrome",
                id: "Chrome",
                btype: BrowserType.Chrome
            },
            {
                s: navigatorvendor,
                sub: "Apple",
                id: "Safari",
                ver: "Version",
                btype: BrowserType.Safari
            },
            {        // Opera 10+
                prop: this.window.opera,
                id: "Opera",
                ver: "Version",
                btype: BrowserType.Opera
            },
            {
                s: useragent,
                sub: "Firefox",
                id: "Firefox",
                btype: BrowserType.Firefox
            },
            {
                s: useragent,
                sub: "MSIE",
                id: "IE",
                ver: "MSIE",
                btype: BrowserType.InternetExplorer
            },
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
                } else if ((idx = navigatorappversion.indexOf(vs)) !== -1) {
                    bv = parseFloat(navigatorappversion.slice(idx + vs.length + 1).replace(/\./g, fn));
                    break;
                } else {
                    bv = -1;
                }
            }
        }

        if (btype) {
            return new Browser(btype, bv);
        } else {
            return new Browser(BrowserType.Unknown, -1);
        }
    } ();


    public os = function () {
        var ret: any = {}, os, ds, idx, c, i, d, ua = this.navigator.userAgent,
            np = this.navigator.platform;
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
        } else {
            ret.name = "unknown";
            ret.unknown = true;
        }

        return ret;
    } ();

    public getKeyCodeFilter(type: string): KeyCodeFilter {
        if (type === "jp") {
            return new JpKeyCodeFilter(this);
        }
        throw new Error("unknown filter type: " + type);
    }
}

export interface KeyCodeFilter {
    keypress(code: number, shifted: boolean): number;
    keydown(code: number, shifted: boolean): number;
    keyup(code: number, shifted: boolean): number;
}

class JpKeyCodeFilter implements KeyCodeFilter {
    private keypressTable: { [index: string]: any };
    private keydownTable: { [index: string]: any };

    constructor(useragent: UserAgent) {
        var browser = useragent.browser;

        this.keypressTable = {
            33: 49,    // ! -> 1
            34: 50,    // " -> 2
            35: 51,    // # -> 3
            36: 52,    // $ -> 4
            37: 53,    // % -> 5
            38: 54,    // & -> 6
            39: 55,    // ' -> 7
            40: 56,    // ( -> 8
            41: 57,    // ) -> 9
            42: 186,    // * -> OEM_1
            43: ! browser.isFirefox() ? 187: // + -> OEM_PLUS
                function (shifted) {
                    if (shifted) {
                        return 187;    // OEM_PLUS
                    } else {
                        return 107;    // NUM_PLUS
                    }
                },
            44: 188,    // , -> OEM_COMMA
            45: 189,    // - -> OEM_MINUS
            46: 190,    // . -> OEM_PERIOD
            47: 191,    // / -> OEM_2
            58: 186,    // : -> OEM_1
            59: 187,    // ; -> OEM_PLUS
            60: 188,    // < -> OEM_COMMA
            61: 180,    // = -> OEM_MINUS
            62: 190,    // > -> OEM_PERIOD
            63: 191,    // ? -> OEM_2
            64: 192,    // @ -> OEM_3
            91: 219,    // [ -> OEM_4
            92: 220,    // \ -> OEM_5
            93: 221,    // ] -> OEM_6
            94: 222,    // ^ -> OEM_7
            95: 226,    // _ -> OEM_102
            96: 192,    // ` -> OEM_3
            97: 65,    // a -> A
            98: 66,    // b -> B
            99: 67,    // c -> C
            100: 68,    // d -> D
            101: 69,    // e -> E
            102: 70,    // f -> F
            103: 71,    // g -> G
            104: 72,    // h -> H
            105: 73,    // i -> I
            106: 74,    // j -> J
            107: 75,    // k -> K
            108: 76,    // l -> L
            109: 77,    // m -> M
            110: 78,    // n -> N
            111: 79,    // o -> O
            112: 80,    // p -> P
            113: 81,    // q -> Q
            114: 82,    // r -> R
            115: 83,    // s -> S
            116: 84,    // t -> T
            117: 85,    // u -> U
            118: 86,    // v -> V
            119: 87,    // w -> W
            120: 88,    // x -> X
            121: 89,    // y -> Y
            122: 90,    // z -> Z
            123: 219,    // { -> OEM_4
            124: 220,    // | -> OEM_5
            125: 221,    // } -> OEM_6
            126: 222        // ~ -> OEM_7
        };
        this.keydownTable = (function (browser: Browser) {
            var version = browser.getVersion();
            var t: { [index: string]: any } = {};

            switch (browser.getType()) {
                case BrowserType.InternetExplorer:
                    t[243] = 244;        // HanZen
                    break;
                case BrowserType.Firefox:
                    t[109] = 189;        // -
                    t[59] = 186;         // :
                    t[107] = -1;         // ;, num+ -> [keypress]
                    t[243] = 244;        // HanZen
                    break;
                case BrowserType.Chrome:
                    t[243] = 244;        // HanZen
                    t[229] = 244;        // HanZen
                    break;
                case BrowserType.Safari:
                    t[229] = 244;    // HanZen
                    break;
                case BrowserType.Opera:
                    t[0] = 93;            // menu
                    t[42] = 106;        // num*
                    t[43] = 107;        // num+
                    t[47] = 111;        // num/
                    t[78] = -1;            // n, numDot -> n
                    t[208] = 240;        // Eisu
                    for (var i = 48; i <= 57; ++i) {
                        t[i] = i;        // num0 ~ num9 -> 0-9
                    }
                    t[45] = 109;    // num-, ins -> num-
                    t[50] = -1;        // @, 2, num2 -> [keypress]
                    t[54] = -1;        // ^, 6, num6 -> [keypress]
                    t[59] = -1;        // ;, : -> [keypress]
                    t[109] = 189;    // -
                    t[219] = 219;    // [, LWin, RWin -> [
                    t[220] = 220;    // \|, \_ -> \|
                    t[210] = 242;    // Kana
                    t[211] = 244;    // HanZen
                    t[212] = 244;    // HanZen
                    break;
                default:
                    break;
            }

            return t;
        })(browser);
    }
    keydown(rawCode: number, shifted: boolean): number {
        return this.keydownTable[rawCode] || rawCode;
    }
    keyup(rawCode: number, shifted: boolean): number {
        return this.keydownTable[rawCode] || rawCode;
    }
    keypress(rawCode: number, shifted: boolean): number {
        var c = this.keypressTable[c];
        if (c instanceof Function) {
            c = c(shifted);
        }
        return c || rawCode;
    }
}
