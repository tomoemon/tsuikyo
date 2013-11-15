
!function($){
    if ('im' in $) {
        return;
    }

    function __addRule(r, i, j, rules, reach, ret) {
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
                r[l] = $.util.clone(r[l]);
                r[l].n = [r[l + 1]];
                dsum += r[l].d;
            }
            nextPos = i + dsum;
            r[r.length - 1].n = ret[nextPos];
            r[0].dsum = dsum;
            head = r[0];
            tail = r[r.length - 1];
        } else {
            r = $.util.clone(r);
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
    function __parse(src, table, ruleMaxLength, strictParse) {
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
                    __addRule(rule[l], i, j, rules, reach, ret);
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

    $.im = (function() {
        var im = {}, romaTable, asciiExp, fasciiExp, fasciiExp2, fasciiHash, kataExp, ascii, fascii, hiraBase, hiraDaku, hiraNoDaku, hiraHan, hiraNoHan, daku, handaku;
        romaTable = {
            'あ':['a'],
            'ぁ':['xa','la'],
            'い':['i','yi'],
            'いぇ':['ye'],
            'ぃ':['xi','li','xyi','lyi'],
            'う':['u','wu','whu'],
            'うぁ':['wha'],
            'うぃ':['wi','whi'],
            'うぇ':['we','whe'],
            'うぉ':['who'],
            'ぅ':['xu','lu'],
            'ゔ':['vu'],
            'ゔぁ':['va'],
            'ゔぃ':['vi','vyi'],
            'ゔぇ':['ve','vye'],
            'ゔぉ':['vo'],
            'ゔゃ':['vya'],
            'ゔゅ':['vyu'],
            'ゔょ':['vyo'],
            'え':['e'],
            'ぇ':['xe','le','lye','xye'],
            'お':['o'],
            'ぉ':['xo','lo'],
            'か':['ka','ca'],
            'ゕ':['lka','xka'],
            'が':['ga'],
            'き':['ki'],
            'きゃ':['kya'],
            'きぃ':['kyi'],
            'きゅ':['kyu'],
            'きぇ':['kye'],
            'きょ':['kyo'],
            'ぎ':['gi'],
            'ぎゃ':['gya'],
            'ぎぃ':['gyi'],
            'ぎゅ':['gyu'],
            'ぎぇ':['gye'],
            'ぎょ':['gyo'],
            'く':['ku','cu','qu'],
            'くぁ':['qa','qwa','kwa'],
            'くぃ':['qi','qwi','qyi'],
            'くぅ':['qwu'],
            'くぇ':['qe','qye','qwe'],
            'くぉ':['qo','qwo'],
            'くゃ':['qya'],
            'くゅ':['qyu'],
            'くょ':['qyo'],
            'ぐ':['gu'],
            'ぐぁ':['gwa'],
            'ぐぃ':['gwi'],
            'ぐぅ':['gwu'],
            'ぐぇ':['gwe'],
            'ぐぉ':['gwo'],
            'け':['ke'],
            'ゖ':['lke','xke'],
            'げ':['ge'],
            'こ':['ko','co'],
            'ご':['go'],
            'さ':['sa'],
            'ざ':['za'],
            'し':['si','ci','shi'],
            'しゃ':['sya','sha'],
            'しぃ':['syi'],
            'しゅ':['syu','shu'],
            'しぇ':['sye','she'],
            'しょ':['syo','sho'],
            'じ':['zi','ji'],
            'じゃ':['ja','jya','zya'],
            'じぃ':['jyi','zyi'],
            'じゅ':['ju','jyu','zyu'],
            'じぇ':['je','jye','zye'],
            'じょ':['jo','jyo','zyo'],
            'す':['su'],
            'すぁ':['swa'],
            'すぃ':['swi'],
            'すぅ':['swu'],
            'すぇ':['swe'],
            'すぉ':['swo'],
            'ず':['zu'],
            'せ':['se','ce'],
            'ぜ':['ze'],
            'そ':['so'],
            'ぞ':['zo'],
            'た':['ta'],
            'だ':['da'],
            'ち':['ti','chi'],
            'ちゃ':['tya','cha','cya'],
            'ちぃ':['tyi','cyi'],
            'ちゅ':['tyu','cyu','chu'],
            'ちぇ':['tye','che','cye'],
            'ちょ':['tyo','cyo','cho'],
            'ぢ':['di'],
            'ぢゃ':['dya'],
            'ぢぃ':['dyi'],
            'ぢゅ':['dyu'],
            'ぢぇ':['dye'],
            'ぢょ':['dyo'],
            'つ':['tu','tsu'],
            'つぁ':['tsa'],
            'つぃ':['tsi'],
            'つぇ':['tse'],
            'つぉ':['tso'],
            'づ':['du'],
            'て':['te'],
            'てぃ':['thi'],
            'てぇ':['the'],
            'てゃ':['tha'],
            'てゅ':['thu'],
            'てょ':['tho'],
            'で':['de'],
            'でぃ':['dhi'],
            'でぇ':['dhe'],
            'でゃ':['dha'],
            'でゅ':['dhu'],
            'でょ':['dho'],
            'と':['to'],
            'とぁ':['twa'],
            'とぃ':['twi'],
            'とぅ':['twu'],
            'とぇ':['twe'],
            'とぉ':['two'],
            'ど':['do'],
            'どぁ':['dwa'],
            'どぃ':['dwi'],
            'どぅ':['dwu'],
            'どぇ':['dwe'],
            'どぉ':['dwo'],
            'な':['na'],
            'に':['ni'],
            'にゃ':['nya'],
            'にぃ':['nyi'],
            'にゅ':['nyu'],
            'にぇ':['nye'],
            'にょ':['nyo'],
            'ぬ':['nu'],
            'ね':['ne'],
            'の':['no'],
            'は':['ha'],
            'ば':['ba'],
            'ぱ':['pa'],
            'ひ':['hi'],
            'ひゃ':['hya'],
            'ひぃ':['hyi'],
            'ひゅ':['hyu'],
            'ひぇ':['hye'],
            'ひょ':['hyo'],
            'び':['bi'],
            'びゃ':['bya'],
            'びぃ':['byi'],
            'びゅ':['byu'],
            'びぇ':['bye'],
            'びょ':['byo'],
            'ぴ':['pi'],
            'ぴゃ':['pya'],
            'ぴぃ':['pyi'],
            'ぴゅ':['pyu'],
            'ぴぇ':['pye'],
            'ぴょ':['pyo'],
            'ふ':['hu','fu'],
            'ふぁ':['fa','fwa'],
            'ふぃ':['fi','fwi','fyi'],
            'ふぅ':['fwu'],
            'ふぇ':['fe','fwe'],
            'ふぉ':['fo','fwo'],
            'ふゃ':['fya'],
            'ふゅ':['fyu'],
            'ふょ':['fyo'],
            'ぶ':['bu'],
            'ぷ':['pu'],
            'へ':['he'],
            'べ':['be'],
            'ぺ':['pe'],
            'ほ':['ho'],
            'ぼ':['bo'],
            'ぽ':['po'],
            'ま':['ma'],
            'み':['mi'],
            'みゃ':['mya'],
            'みぃ':['myi'],
            'みゅ':['myu'],
            'みぇ':['mye'],
            'みょ':['myo'],
            'む':['mu'],
            'め':['me'],
            'も':['mo'],
            'や':['ya'],
            'ゃ':['xya','lya'],
            'ゆ':['yu'],
            'ゅ':['xyu','lyu'],
            'よ':['yo'],
            'ょ':['xyo','lyo'],
            'ら':['ra'],
            'り':['ri'],
            'りゃ':['rya'],
            'りぃ':['ryi'],
            'りゅ':['ryu'],
            'りぇ':['rye'],
            'りょ':['ryo'],
            'る':['ru'],
            'れ':['re'],
            'ろ':['ro'],
            'わ':['wa'],
            'ゎ':['xwa','lwa'],
            'ゐ':['wyi'],
            'ゑ':['wye'],
            'を':['wo'],
            'ん':function(cont) {
                var ret = ['nn','xn', "n'"];
                var head, rest, inter, inters, dsum;

                for (var i = 0; i < cont.length; ++i) {
                    head = cont[i].k[0];
                    rest = cont[i].k.slice(1);
                    if ("aiueony".indexOf(head) < 0) {
                        if (rest.length) {
                            inters = [
                                {k: ['n', head], d: 1},
                                {k: rest,        d: cont[i].d}
                            ];
                            dsum = cont[i].d;
                            inter = cont[i];
                            while (dsum < cont[i].dsum) {
                                // copy intermediate nodes
                                inter = inter.n[0];
                                inters.push($.util.clone(inter));
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
            'っ':function(cont) {
                var ret = ['xtu','xtsu','ltu','ltsu'];
                var head, rest, inter, inters, dsum;

                for (var i = 0; i < cont.length; ++i) {
                    head = cont[i].k[0];
                    rest = cont[i].k.slice(1);
                    if (head !== "n" && rest.length) {
                        inters = [
                            {k: [head, head], d: 1},
                            {k: rest        , d: cont[i].d}
                        ];

                        dsum = cont[i].d;
                        inter = cont[i];
                        while (dsum < cont[i].dsum) {
                            // copy intermediate nodes
                            inter = inter.n[0];
                            inters.push($.util.clone(inter));
                            dsum += inter.d;
                        }
                        ret.push(inters);
                    }
                }

                return ret;
            },
            "ー":["-"],
            "。":["."],
            "、":[","],
            "・":["/"]
        };
        asciiExp = /[\x20-\x7e\n\t]/g;
        fasciiExp = /[\uFF01-\uFF5E]/g;
        fasciiExp2 = /[　￥”“〜]|(\r\n)/g;
        fasciiHash = {"　": " ", "￥": "\\", "”":"\"", "“":"\"", "〜":"~", "\r\n":"\n"};
        kataExp = /[\u30A1-\u30F6]/g;
        ascii = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"#$%&'()-=^~\\|@`[{;+:*]},<.>/?_ \t\n";
        fascii = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９！＂＃＄％＆＇（）－＝＾～￥｜＠｀［｛；＋：＊］｝，＜．＞／？＿　\t\n";
        hiraBase = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっー。、・「」";
        hiraDaku = "がぎぐげござじずぜぞだぢづでどばびぶべぼ";
        hiraNoDaku = "かきくけこさしすせそたちつてとはひふへほ";
        hiraHan = "ぱぴぷぺぽ";
        hiraNoHan = "はひふへほ";
        daku = "゛";
        handaku = "゜";

        // fix full width ascii -> ascii
        function asciiFix(str) {
            return str.replace(fasciiExp, function(m) {
                return String.fromCharCode(m.charCodeAt() - 0xFEE0);
            }).replace(fasciiExp2, function(m) {
                return fasciiHash[m];
            });
        }

        // fix Katakana -> Hiragana
        function kataFix(str) {
            return str.replace(kataExp, function(m) {
                return String.fromCharCode(m.charCodeAt() - 0x0060);
            });
        }

        // scan table and modify
        function modTable(t, fn) {
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
                        t[mod.i] = $.util.clone(t[mod.i]);
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

        im.ascii = function() {
            var acceptKeysyms = {};

            $.util.each(ascii, function(e) {
                acceptKeysyms[e] = e;
            });

            return {
                symTable: acceptKeysyms,
                parser: function(src, strictParse) {
                    var ret = [];
                    src = asciiFix(src);
                    src.replace(asciiExp, function(m) {
                        ret.push([{
                            k: [m],
                            d: 1
                        }]);
                    });
                    $.util.each(ret, function(e, i) {
                        if (i + 1 < ret.length) {
                            e[0].n = ret[i + 1];
                        }
                    });
                    if (ret.length !== src.length) {
                        strictParse && alert("parse error");
                    }
                    return ret;
                }
            };
        };
        im.jis = function() {
            var t = {}, acceptKeysyms = {};

            // add basic rules
            $.util.each(hiraBase, function(e) {
                t[e] = [e];
                acceptKeysyms[e] = e;
            });

            // add dakuon rules
            $.util.each(hiraDaku, function(e, i) {
                t[e] = [hiraNoDaku.charAt(i) + daku];
            });
            acceptKeysyms[daku] = daku;

            // add handakuon rules
            $.util.each(hiraHan, function(e, i) {
                t[e] = [hiraNoHan.charAt(i) + handaku];
            });
            acceptKeysyms[handaku] = handaku;

            // add ascii rules
            $.util.each(ascii, function(e, i) {
                t[e] = [e];
                acceptKeysyms[e] = fascii.charAt(i);
            });

            return {
                overload: $.client.keyboard.jis,
                symTable: acceptKeysyms,
                parser: function(src, strictParse) {
                    src = asciiFix(src);
                    src = kataFix(src);
                    return __parse(src, t, 1, strictParse);
                }
            };
        };
        im.roma = function() {
            var t = $.util.clone(romaTable), acceptKeysyms = {}, ruleMaxLength = 2;

            // add ascii rules
            $.util.each(ascii, function(e) {
                t[e] = [e];
                acceptKeysyms[e] = e;
            });

            return {
                symTable: acceptKeysyms,
                parser: function(src, strictParse) {
                    src = asciiFix(src);
                    src = kataFix(src);
                    return __parse(src, t, ruleMaxLength, strictParse);
                }
            };
        };
        im.dvojp = function() {
            var t = $.util.clone(romaTable), acceptKeysyms = {}, ruleMaxLength = 3, extKeys, altYSelector, diph;

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
            altYSelector = {p:1,f:2,g:2,_k:2,r:1,l:1,d:2,h:2,t:2,n:1,s:1,q:1,j:1,k:1,x:1,b:2,m:2,w:1,v:1,z:1};
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
            modTable(t, function(keys, i, j) {
                for (j = 0; j < keys.length; ++j) {
                    if (keys[j] === "k") {
                        keys[j] = "_k";
                        return {
                            m: "add",
                            v: {k: keys},
                            i: i
                        };
                    }
                }
            });

            // add alternative 'y' rules
            modTable(t, function(keys, str, j) {
                if (keys.length === 3 && keys[1] === "y" && str.length === 2 && "ゃぃゅぇょ".indexOf(str.charAt(1)) >= 0) {
                    keys[1] = altYSelector[keys[0]];
                    if (keys !== void 0) {
                        keys[1] = "_y" + keys[1];
                        return {
                            m: "add",
                            v: {k: keys},
                            i: str
                        };
                    }
                }
            });

            // add diphthong rules ('ai', 'ou', 'ei')
            modTable(t, function(keys, str, j) {
                var ret, last, tail, d;
                last = keys.length - 1;
                tail = keys[last];
                d = diph[tail];

                if (last > 0) {
                    keys[last] = "_" + tail + "nn";
                    ret = {
                        m: "add",
                        i: str + "ん",
                        v: {k: keys}
                    };

                    if (d) {
                        keys = keys.slice();
                        keys[last] = "_" + tail + d.k;
                        ret = [ret, {
                            m: "add",
                            i: str + d.h,
                            v: {k: keys}
                        }];
                    }
                }

                return ret;
            });

            // add ascii rules
            $.util.each(ascii, function(e) {
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

            return {
                overload: extKeys,
                symTable: acceptKeysyms,
                parser: function(src, strictParse) {
                    src = asciiFix(src);
                    src = kataFix(src);
                    return __parse(src, t, ruleMaxLength, strictParse);
                }
            };
        };

        return im;
    })();
}(Tsuikyo);
