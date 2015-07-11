import Util = require('./util');
import Layout = require('./layout');
import Type = require('./engine.type');
import EngineState = require('./engine.state');
import Event = require('./event');
import KeyStrokeObservable = Event.KeyStrokeObservable;
import KeyStrokeEvent = Event.KeyStrokeEvent;
import im = require('./input_method');
import Option = require('./option');

export class EngineOption extends Option {
    private _layout: string = "qwejp";
    private _im: string = "roma";
    private _flex: string = "flex";
    private _strictParse: boolean = false;

    get layout() {
        return this._layout;
    }
    get im() {
        return this._im;
    }
    get flex() {
        return this._flex;
    }
    get strictParse() {
        return this._strictParse;
    }

    constructor(args: any) {
        super();
        this.parse(args);
    }
}

export class Engine {

    // public:
    constructor(option: EngineOption) {
        this._opts = option;

        // apply input settings
        this._initConfig();
    }

    listen(userCallback = undefined) {
        if (userCallback !== void 0) {
            this._userCallback = userCallback;
        }

        if (this._state !== EngineState.LISTEN) {
            this._state = EngineState.LISTEN;
        }

        return this;
    }

    sleep() {
        if (this._state !== EngineState.SLEEP) {
            // stop handling key events
            this._state = EngineState.SLEEP;
        }

        return this;
    }

    make(src, tag, flex) {
        flex = flex || this._opts.flex;
        return new Word(this, src, tag, flex);
    }

    stroke(e, test: any = undefined) {
        if (typeof e === "string" || e === void 0) {
            e = this._makeEventObj(e);
        } else if (e.key === void 0) {
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
    }

    test(e) {
        this.stroke(e, true);
    }

    words() {
        return this._activeWords.slice();
    }

    // private:
    private _state = 0;
    private _opts: EngineOption = null;
    private _layout = null;
    private _im: im.InputMethod = null;
    private _activeWords = [];
    private _userCallback = null;

    private _makeEventObj(key, env: KeyStrokeEvent = undefined) {
        var e: any = {};
        var keysyms;
        var keyCheck = this._im.symTable;

        e.type = "keystroke";

        if (env) {
            e.mod = env.shifted();
            keysyms = this._layout[env.keyCode][e.mod ? 1 : 0];
            if (keysyms instanceof Array) {
                e.key = keysyms[0];
                e.allSyms = keysyms;
            } else {
                e.key = keysyms;
                e.allSyms = [keysyms];
            }
            e.keyCode = env.keyCode;
        } else {
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
    }

    private _parse(src) {
        return (this._im.parser instanceof Function) && this._im.parser(src);
    }

    private _addListenWord(word) {
        for (var i = 0; i < this._activeWords.length; ++i) {
            if (this._activeWords[i] === word) {
                // already registered
                return false;
            }
        }
        this._activeWords.push(word);
        return true;
    }

    private _removeListenWord(word) {
        for (var i = 0; i < this._activeWords.length; ++i) {
            if (this._activeWords[i] === word) {
                this._activeWords.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    private _initConfig() {
        this._im = new im.InputMethodFactory()[this._opts.im]();
        this._layout = Layout[this._opts.layout];
        this._overloadLayout();
    }

    private _overloadLayout() {
        var layout, mix, a, k, i, j;
        layout = Util.clone(this._layout);
        mix = this._im.overload;

        if (!mix) {
            return;
        }

        for (i in mix) {
            if (i.charAt(0) === "_") {
                k = Util.find(layout, i.slice(1));
                if (k === false) continue;
            } else {
                k = i;
            }
            if (!layout[k]) {
                layout[k] = mix[i];
            } else if (layout[k] instanceof Array && layout[k].length === mix[i].length) {
                a = [];
                for (j = 0; j < layout[k].length; ++j) {
                    a.push(Array.prototype.concat(layout[k][j], mix[i][j]));
                }
                layout[k] = a;
            } else {
                throw new Error("fail to mix keymap");
            }
        }

        this._layout = layout;
    }
}

class Word {
    // public:
    tag = null;

    constructor(tsuikyo, src, tag, flex) {
        this.init(tsuikyo, src, tag, flex);
    }

    init(tsuikyo, src, tag, flex) {
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
        this._nodes = this._linkNode(new Node(this._nodeSrc[0]));    // entry point
        this._activeNode = this._selectNode();
        this._input = [];
        if (flex === "fixed") {
            this._nodes = [this._activeNode];
        }
        return this;
    }

    listen(userCallback: any = undefined) {
        if (userCallback !== void 0) {
            this._userCallback = userCallback;
        }
        if (this._state === EngineState.SLEEP) {
            this._state = EngineState.LISTEN;
            this._ts._addListenWord(this);
        }

        return this;
    }

    sleep() {
        this._state = EngineState.SLEEP;
        this._ts._removeListenWord(this);

        return this;
    }

    stroke(e: any = undefined, test: any = undefined) {
        var ret, ee;
        if (typeof e === "string" || e === void 0) {
            e = this._ts._makeEventObj(e);
        } else if (e.key === void 0) {
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
    }

    test(e) {
        return this.stroke(e, true);
    }

    totalCount() {
        return this._input.length;
    }

    acceptCount() {
        return this._activeNode.keys().length;
    }

    missCount(includeCancel) {
        if (includeCancel) {
            return this.totalCount() - this.acceptCount();
        } else {
            return this._missCount;
        }
    }

    cancelCount() {
        return this.totalCount() - this.acceptCount() - this._missCount;
    }

    pos() {
        return this._activeNode.pos;
    }

    kpos() {
        return this._activeNode.keys().length;
    }

    str(p: any = undefined) {
        if (p === void 0) {
            p = this._src.length;
        }
        if (p >= 0) {
            return this._src.slice(0, p);
        } else {
            return this._src.slice(-p - 1);
        }
    }

    rstr(p) {
        return this.str(-p - 1);
    }

    kstr(p: any = undefined) {
        var conv = this._ts._im.symTable, kpos = this.kpos(), keysyms;

        if (p === void 0) {
            keysyms = this._selectNodeToEnd().keys();
        } else if (p >= 0) {
            if (p <= kpos) {
                keysyms = this._activeNode.keys().slice(0, p);
            } else {
                keysyms = this._selectNodeToEnd().keys().slice(0, p);
            }
        } else {
            keysyms = this._selectNodeToEnd().keys().slice(-p - 1);
        }
        return Util.map(keysyms, function (e) {
            return conv[e];
        }).join("");
    }

    rkstr(p: any = undefined) {
        return this.kstr(-p - 1);
    }

    nextKeys() {
        var head = this._activeNode.next(), next;
        next = Util.map(this._nodes, function (node) {
            return node.next();
        });
        next.unshift(head);

        return Util.uniq(next);
    }

    keysyms() {
        return this._selectNodeToEnd().keys();
    }

    finished() {
        return this.pos() === this._src.length;
    }

    // private:
    private _state = EngineState.PREINIT;
    private _ts = null;
    private _flex = "";
    private _userCallback = null;

    private _src = "";
    private _nodeSrc = [];
    private _nodes = [];
    private _activeNode = null;
    private _input = [];
    private _missCount = 0;
    private _cancelCount = 0;

    private _accept(e, test) {
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
    }

    private _refresh(type) {
        var ns, newNodes, linkedNodes, i;

        if (type !== Type.MISS) {
            // get all appropriate nodes
            ns = Util.filter(this._nodes, function (node, i) {
                return node.ret === type;
            });
        }

        switch (type) {
            case Type.MISS:    // no transition
                ++this._missCount;
                break;
            case Type.INNER:    // internal transit
                if (this._flex === "flex") {
                    this._nodes = ns;
                }
                this._activeNode = this._selectNode(ns);
                break;
            case Type.TRANSIT:    // node transit
                if (this._flex === "flex") {
                    this._nodes = ns.slice();    // hard copy
                    newNodes = [];
                } else {
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
            case Type.JUNCTION:    // node transit and reach junction
            case Type.FINISH:    // node transit and reach the end point
                this._nodes = this._linkNode(this._selectNode(ns));
                this._activeNode = this._selectNode();
                break;
            case Type.FINISHED:    // already reached the end point
                this._input.pop();
                break;
            default:
                throw new Error("Word._refresh: unknown refresh type " + type);
        }

        if (this._flex === "fixed" && this._nodes.length > 1) {
            // when fixed mode, remains active node only
            this._nodes = [this._activeNode];
        }
    }

    private _linkNode(parent) {
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
    }

    private _hideNode(node) {
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i] === node) {
                this._nodes.splice(i, 1);
                break;
            }
        }
    }

    private _selectNode(ns: any = undefined) {
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
                return ns.length === 1;    // true means break the loop
            });
        }

        return ns[0];
    }

    private _selectNodeToEnd(start: any = undefined) {
        var node = start || this._activeNode;

        while (node.n && node.n.length) {
            node = this._selectNode(this._linkNode(node));
        }

        node = new Node(null, node, true, this._src.length);
        node.parent.n = [node];
        return node;
    }

    private _chkJunctionCache = null;

    private _chkJunction(pos) {
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
    }
}

class Node {
    k = [];
    i = 0;
    d = 0;
    dsum = 0;
    n = [];
    parent = null;
    isJunction = true;
    tailPos = -1;
    ret = -1;
    pos = 0;

    constructor(nodeSrc, parent = undefined, isJunction = undefined, tailPos = undefined) {
        if (!nodeSrc) {
            this.ret = 5;    // end point
        } else if (nodeSrc instanceof Array) {
            this.n = nodeSrc; // entry point
        } else {
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
    accept(e, test) {
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
                        } else {
                            this.ret = Type.JUNCTION;
                        }
                    } else {
                        this.ret = Type.TRANSIT;
                    }
                } else {
                    this.ret = Type.INNER;
                }
                test && --this.i;
            } else if (!this.k.length) {
                // end point always returns TYPE.FINISHED
                this.ret = Type.FINISHED;
            } else {
                this.ret = Type.MISS;
            }
        } else {
            this.ret = Type.IGNORE;
        }

        return this.ret;
    }

    keys() {
        var keys, n = this.parent;
        keys = [this.k.slice(0, this.i)];

        while (n) {
            keys.push(n.k);
            n = n.parent;
        }

        return Array.prototype.concat.apply([], keys.reverse());
    }

    next() {
        return this.k[this.i];
    }

    private _pos() {
        if (this.parent && this.parent.pos !== void 0) {
            return this.parent.pos + this.parent.d;
        } else {
            return 0;
        }
    }
}
