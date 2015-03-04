import Util = require('./util');
import _u = require('./user_agent');
import UserAgent = _u.UserAgent;

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
    } else if (r.length) {
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
    } else {
        r = Util.clone(r);
        if (r.d === void 0) r.d = j;
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
            } else if (rule instanceof Function) {
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
            } else {
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

export class InputMethodFactory {
    private romaTable = {
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
        'ん': (cont) => {
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
                    } else {
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
        'っ': (cont) => {
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
    private asciiExp = /[\x20-\x7e\n\t]/g;
    private fasciiExp = /[\uFF01-\uFF5E]/g;
    private fasciiExp2 = /[　￥”“〜]|(\r\n)/g;
    private fasciiHash = { "　": " ", "￥": "\\", "”": "\"", "“": "\"", "〜": "~", "\r\n": "\n" };
    private kataExp = /[\u30A1-\u30F6]/g;
    private asciiChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"#$%&'()-=^~\\|@`[{;+:*]},<.>/?_ \t\n";
    private fasciiChars = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９！＂＃＄％＆＇（）－＝＾～￥｜＠｀［｛；＋：＊］｝，＜．＞／？＿　\t\n";
    private hiraBase = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっー。、・「」";
    private hiraDaku = "がぎぐげござじずぜぞだぢづでどばびぶべぼ";
    private hiraNoDaku = "かきくけこさしすせそたちつてとはひふへほ";
    private hiraHan = "ぱぴぷぺぽ";
    private hiraNoHan = "はひふへほ";
    private daku = "゛";
    private handaku = "゜";

    // fix full width ascii -> ascii
    private asciiFix(str) {
        return str.replace(this.fasciiExp, (m) => {
            return String.fromCharCode(m.charCodeAt() - 0xFEE0);
        }).replace(this.fasciiExp2, (m) => {
            return this.fasciiHash[m];
        });
    }

    // fix Katakana -> Hiragana
    private kataFix(str) {
        return str.replace(this.kataExp, (m) => {
            return String.fromCharCode(m.charCodeAt() - 0x0060);
        });
    }

    // scan table and modify
    private modTable(t, fn) {
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
                } else {
                    keys = keys.split("");
                }
                mod = fn(keys, i, j);
                if (mod !== void 0) {
                    if (mod instanceof Array) {
                        for (k = 0; k < mod.length; ++k) {
                            mods.push(mod[k]);
                        }
                    } else {
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
                    } else {
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
    }

    ascii() {
        var acceptKeysyms = {};

        Util.each(this.asciiChars, (e) => {
            acceptKeysyms[e] = e;
        });

        return new InputMethod(
            acceptKeysyms,
            (src, strictParse) => {
                var ret = [];
                src = this.asciiFix(src);
                src.replace(this.asciiExp, (m) => {
                    ret.push([{
                        k: [m],
                        d: 1
                    }]);
                });
                Util.each(ret, (e, i) => {
                    if (i + 1 < ret.length) {
                        e[0].n = ret[i + 1];
                    }
                });
                if (ret.length !== src.length) {
                    strictParse && alert("parse error");
                }
                return ret;
            }
        );
    }

    jis() {
        var t = {}, acceptKeysyms = {};
        var jmap: any = {
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
        Util.each(this.hiraBase, (e) => {
            t[e] = [e];
            acceptKeysyms[e] = e;
        });

        // add dakuon rules
        Util.each(this.hiraDaku, (e, i) => {
            t[e] = [this.hiraNoDaku.charAt(i) + this.daku];
        });
        acceptKeysyms[this.daku] = this.daku;

        // add handakuon rules
        Util.each(this.hiraHan, (e, i) => {
            t[e] = [this.hiraNoHan.charAt(i) + this.handaku];
        });
        acceptKeysyms[this.handaku] = this.handaku;

        // add ascii rules
        Util.each(this.asciiChars, (e, i) => {
            t[e] = [e];
            acceptKeysyms[e] = this.fasciiChars.charAt(i);
        });

        // fix \ key problem
        if (user_agent.browser.isOpera()) {
            jmap[220][0] = [jmap[220][0], "ろ"];
            jmap[220][1] = [jmap[220][1], "ろ"];
        }

        return new InputMethod(
            acceptKeysyms,
            (src, strictParse) => {
                src = this.asciiFix(src);
                src = this.kataFix(src);
                return parse(src, t, 1, strictParse);
            },
            jmap
        );
    }

    roma() {
        var t = Util.clone(this.romaTable), acceptKeysyms = {}, ruleMaxLength = 2;

        // add ascii rules
        Util.each(this.asciiChars, (e) => {
            t[e] = [e];
            acceptKeysyms[e] = e;
        });

        return new InputMethod(
            acceptKeysyms,
            (src, strictParse) => {
                src = this.asciiFix(src);
                src = this.kataFix(src);
                return parse(src, t, ruleMaxLength, strictParse);
            }
        );
    }

    dvojp() {
        var t = Util.clone(this.romaTable), acceptKeysyms: any = {},
            ruleMaxLength = 3, extKeys, altYSelector, diph;

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
        this.modTable(t, (keys, i, j) => {
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
        this.modTable(t, (keys, str, j) => {
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
        this.modTable(t, (keys, str, j) => {
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
        Util.each(this.asciiChars, (e) => {
            t[e] = [e];
            acceptKeysyms[e] = e;
        });

        // add exteded keys
        acceptKeysyms._k = "k";    // or "c"
        acceptKeysyms._y1 = "y";    // or "h"
        acceptKeysyms._y2 = "y";    // or "n"
        acceptKeysyms._ai = "ai";    // or "'"
        acceptKeysyms._ou = "ou";    // or ","
        acceptKeysyms._ei = "ei";    // or "."
        acceptKeysyms._ann = "ann";    // or ";"
        acceptKeysyms._onn = "onn";    // or "q"
        acceptKeysyms._enn = "enn";    // or "j"
        acceptKeysyms._unn = "unn";    // or "k"
        acceptKeysyms._inn = "inn";    // or "x"

        return new InputMethod(
            acceptKeysyms,
            (src, strictParse) => {
                src = this.asciiFix(src);
                src = this.kataFix(src);
                return parse(src, t, ruleMaxLength, strictParse);
            },
            extKeys
        );
    }
}

export class InputMethod {
    constructor(public symTable, public parser, public overload?) {
    }
}
 