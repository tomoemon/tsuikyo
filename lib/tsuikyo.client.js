!function($) {
    if ('client' in $) {
        return;
    }
    $.client = {};

    // detect the browser and os from UA
    // modified jquery.client.js (public domain) : http://www.quirksmode.org/js/detect.html
    $.client.browser = (function() {
        var ret = {}, ua = navigator.userAgent, nv = navigator.vendor, na = navigator.appVersion, d, bn, bv, ds, dp, vs, idx, c, i, fn;
        d = [    // ** order-sensitive! **
            {
                s: ua,
                sub: "Chrome",
                id: "Chrome"
            },{
                s: ua,
                sub: "OmniWeb",
                ver: "OmniWeb/",
                id: "OmniWeb"
            },{
                s: nv,
                sub: "Apple",
                id: "Safari",
                ver: "Version"
            },{        // Opera 10+
                prop: window.opera,
                id: "Opera",
                ver: "Version"
            },{        // Opera -9
                prop: window.opera,
                id: "Opera"
            },{
                s: nv,
                sub: "iCab",
                id: "iCab"
            },{
                s: nv,
                sub: "KDE",
                id: "Konqueror"
            },{
                s: ua,
                sub: "Firefox",
                id: "Firefox"
            },{        // Firefox trunk build
                s: ua,
                sub: "Minefield",
                id: "Firefox",
                ver: "Minefield"
            },{        // Firefox 1 branch build
                s: ua,
                sub: "Phoenix",
                id: "Firefox",
                ver: "Phoenix"
            },{        // Firefox 2 branch build
                s: ua,
                sub: "BonEcho",
                id: "Firefox",
                ver: "BonEcho"
            },{        // Firefox 3 branch build
                s: ua,
                sub: "GranParadiso",
                id: "Firefox",
                ver: "GranParadiso"
            },{        // Firefox 3.5 branch build
                s: ua,
                sub: "Shiretoko",
                id: "Firefox",
                ver: "Shiretoko"
            },{        // Firefox 3.6 branch build
                s: ua,
                sub: "Namoroka",
                id: "Firefox",
                ver: "Namoroka"
            },{        // Firefox 3.7 branch build
                s: ua,
                sub: "Lorentz",
                id: "Firefox",
                ver: "Lorentz"
            },{        // Firefox for Debian
                s: ua,
                sub: "Iceweasel",
                id: "Firefox",
                ver: "Iceweasel"
            },{        // Firefox in GNU
                s: ua,
                sub: "IceCat",
                id: "Firefox",
                ver: "IceCat"
            },{
                s: nv,
                sub: "Camino",
                id: "Camino"
            },{        // for Netscape 6
                s: ua,
                sub: "Netscape6",
                id: "Netscape6"
            },{        // for newer Netscapes (7-)
                s: ua,
                sub: "Netscape",
                id: "Netscape6"
            },{
                s: ua,
                sub: "MSIE",
                id: "IE",
                ver: "MSIE"
            },{        // unknown but gecko
                s: ua,
                sub: "Gecko",
                id: "Mozilla",
                ver: "rv"
            },{        // for older Netscapes (4-)
                s: ua,
                sub: "Mozilla",
                id: "Netscape",
                ver: "Mozilla"
            }
        ];

        fn = function() {
            return (c++ === 1) ? '' : '.';
        };

        for (i = 0; i < d.length; ++i) {
            ds = d[i].s;
            dp = d[i].prop;
            if (ds && ds.indexOf(d[i].sub) !== -1 || dp) {
                vs = d[i].ver || d[i].id;
                bn = d[i].id;
                c = 0;
                if ((idx = ua.indexOf(vs)) !== -1) {
                    bv = parseFloat(ua.slice(idx + vs.length + 1).replace(/\./g, fn));
                    break;
                } else if ((idx = na.indexOf(vs)) !== -1) {
                    bv = parseFloat(na.slice(idx + vs.length + 1).replace(/\./g, fn));
                    break;
                } else {
                    bv = -1;
                }
            }
        }

        if (bn) {
            bn = bn.toLowerCase();
            ret.name = bn;
            ret.version = bv;
            ret[bn] = bv;
        } else {
            ret.name = "unknown";
            ret.version = -1;
            ret.unknown = -1;
        }

        return ret;
    })();


    $.client.os = (function() {
        var ret = {}, os, ds, idx, c, i, d, ua = navigator.userAgent, np = navigator.platform;
        d = [
            {
                s: np,
                sub: "Win",
                id: "Windows"
            },{
                s: np,
                sub: "Mac",
                id: "Mac"
            },{
                s: ua,
                sub: "iPhone",
                id: "iOS"
            },{
                s: np,
                sub: "Linux",
                id: "Unix"
            },{
                s: np,
                sub: "SunOS",
                id: "Unix"
            },{
                s: np,
                sub: "BSD",
                id: "Unix"
            },{
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
    })();


    $.client.keyboard = (function(browser){
        var kbd;

        kbd = {};        // identify physical keycode

        kbd.jp = (function() {
            var keypressTableBase, keypressTable, keydownTable;
            keypressTableBase = {
                 33: 49,    // ! -> 1
                 34: 50,    // " -> 2
                 35: 51,    // # -> 3
                 36: 52,    // $ -> 4
                 37: 53,    // % -> 5
                 38: 54,    // & -> 6
                 39: 55,    // ' -> 7
                 40: 56,    // ( -> 8
                 41: 57,    // ) -> 9
                 42:186,    // * -> OEM_1
                 43:187,    // + -> OEM_PLUS
                 44:188,    // , -> OEM_COMMA
                 45:189,    // - -> OEM_MINUS
                 46:190,    // . -> OEM_PERIOD
                 47:191,    // / -> OEM_2
                 58:186,    // : -> OEM_1
                 59:187,    // ; -> OEM_PLUS
                 60:188,    // < -> OEM_COMMA
                 61:180,    // = -> OEM_MINUS
                 62:190,    // > -> OEM_PERIOD
                 63:191,    // ? -> OEM_2
                 64:192,    // @ -> OEM_3
                 91:219,    // [ -> OEM_4
                 92:220,    // \ -> OEM_5
                 93:221,    // ] -> OEM_6
                 94:222,    // ^ -> OEM_7
                 95:226,    // _ -> OEM_102
                 96:192,    // ` -> OEM_3
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
                123:219,    // { -> OEM_4
                124:220,    // | -> OEM_5
                125:221,    // } -> OEM_6
                126:222        // ~ -> OEM_7
            };
            keypressTable = (function(b, v) {
                var t = keypressTableBase;

                switch (b) {
                    case "firefox":
                        t[43] = function(env) {
                            if (env.shift) {
                                return 187;    // OEM_PLUS
                            } else {
                                return 107;    // NUM_PLUS
                            }
                        };
                        break;
                    default:
                        break;
                }

                return t;
            })(browser.name, browser.version);

            keydownTable = (function(b, v) {
                var i, t = {};

                switch (b) {
                    case "ie":
                        t[243] = 244;        // HanZen
                        break;
                    case "netscape6":
                        // treat Netscape as Firefox
                        v = 1;
                        // ** FALL THROUGH **
                    case "firefox":
                        t[109] = 189;        // -
                        t[59] = 186;        // :

                        if (v >= 3) {
                            t[107] = -1;    // ;, num+ -> [keypress]
                            t[243] = 244;    // HanZen
                        } else {
                            t[61] = 187;    // ;
                            t[229] = 244;    // HanZen, Henkan, Kana -> HanZen
                        }
                        break;
                    case "chrome":
                        t[243] = 244;        // HanZen
                        t[229] = 244;        // HanZen
                        break;
                    case "safari":
                        if (v >= 5) {
                            t[229] = 244;    // HanZen
                        } else {
                            t[229] = 244;    // HanZen, Henkan, Kana -> HanZen
                        }
                        break;
                    case "opera":
                        t[0] = 93;            // menu
                        t[42] = 106;        // num*
                        t[43] = 107;        // num+
                        t[47] = 111;        // num/
                        t[78] = -1;            // n, numDot -> n
                        t[208] = 240;        // Eisu
                        for (i = 48; i <= 57; ++i) {
                            t[i] = i;        // num0 ~ num9 -> 0-9
                        }
                        if (v < 9.5) {
                            t[44] = 188;    // ,
                            t[45] = 189;    // -, ins, num- -> hyphen
                            t[46] = 190;    // dot, del -> dot
                            t[47] = 191;    // /
                            t[58] = 186;    // :
                            t[59] = 187;    // ;
                            t[64] = 192;    // @
                            t[91] = 219;    // [, LWin -> [
                            t[92] = 220;    // \|, \_, RWin -> \|
                            t[93] = 221;    // ]
                            t[94] = 222;    // ^
                        } else {
                            t[45] = 109;    // num-, ins -> num-
                            t[50] = -1;        // @, 2, num2 -> [keypress]
                            t[54] = -1;        // ^, 6, num6 -> [keypress]
                            t[59] = -1;        // ;, : -> [keypress]
                            t[109] = 189;    // -
                            t[219] = 219;    // [, LWin, RWin -> [
                            t[220] = 220;    // \|, \_ -> \|
                        }
                        if (v < 10) {
                            t[197] = 244;    // HanZen, Henkan, Kana -> HanZen
                        } else {
                            t[210] = 242;    // Kana
                            t[211] = 244;    // HanZen
                            t[212] = 244;    // HanZen
                        }
                        break;
                    default:
                        break;
                }

                return t;
            })(browser.name, browser.version);

            return function(c, env) {
                var orig = c;

                switch (env.type) {
                    case "keydown":
                    case "keyup":
                        c = keydownTable[c];
                        break;
                    case "keypress":
                        c = keypressTable[c];
                        if (c instanceof Function) {
                            c = c(env);
                        }
                        break;
                    default:
                        if (env.report) {
                            throw new Error("unknown event type");
                        }
                        break;
                }
                return c || orig;
            };
        })();

        kbd.jis = function() {
            var jmap;
            jmap = {
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

            // fix \ key problem
            if (browser.opera) {
                jmap[220][0] = [jmap[220][0], "ろ"];
                jmap[220][1] = [jmap[220][1], "ろ"];
            }

            return jmap;
        }();

        kbd.us = void 0;    // !TODO

        return kbd;
    })($.client.browser);
}(Tsuikyo);

