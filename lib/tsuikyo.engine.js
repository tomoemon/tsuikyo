/**
 * tsuikyo.js v2.0.0 - typing game module for web apps
 * http://dvorak.jp/softwares/tsuikyo.htm
 *
 * Copyright 2010, Shutaro Takimoto <wh@dvorak.jp>
 * Licensed under the MIT license
 *
 */
!function($) {
    if ('engine' in $) {
        return;
    }

    var engine, Word, Node, __defaultOpts;
    __defaultOpts = {
        keyboard: "jp",
        layout: "qwejp",
        im: "roma",
        flex: "flex",
        eventRoot: window.document,
        prevent: true,
        strictParse: false,
        report: false
    };

    engine = $.util.class({
        // public:
        init: function(args) {
            args = args || {};

            // opts is a prototype child of __defaultOpts
            this._opts = $.util.clone(__defaultOpts);

            // apply specified arguments
            for (var k in args) {
                switch (k) {
                    case "keyboard":
                    case "layout":
                    case "im":
                    case "eventRoot":
                    case "prevent":
                    case "strictParse":
                    case "flex":
                        this._opts[k] = args[k];
                        break;
                    default:
                        throw new Error("unknown argument '" + k + "'");
                }
            }

            // apply input settings
            this._initConfig();
            this._overloadLayout();
            this._makeWrapper();

            this.listen();
        },

        layout: function(layout) {
            if (!layout) {
                return this._opts.layout;
            } else {
                this._opts.layout = layout;
                this._initConfig();
                this._overloadLayout();
            }
        },

        listen: function(callback) {
            if (callback !== void 0) {
                this._callback = callback;
            }

            if (this._state !== engine.STATE_LISTEN) {
                // start handling key events
                this._wrapKeyEvents();
                this._state = engine.STATE_LISTEN;
            }

            return this;
        },

        sleep: function() {
            if (this._state !== engine.STATE_SLEEP) {
                // stop handling key events
                this._unwrapKeyEvents();
                this._state = engine.STATE_SLEEP;
            }

            return this;
        },

        make: function(src, tag, flex) {
            flex = flex || this._opts.flex;
            return new Word(this, src, tag, flex);
        },

        stroke: function(e, test) {
            if (typeof e === "string" || e === void 0) {
                e = this._makeEventObj(e);
            } else if (e.key === void 0) {
                e = this._makeEventObj("", e);
            }
            e.test = !!test;

            if (this._callback instanceof Function) {
                // main callback
                if (this._callback(e) === false) {
                    // prevented
                    return;
                }
            }

            if (e.sendable) {
                // send the keystroke to all listening word
                for (var i = 0; i < this._listen.length; ++i) {
                    this._listen[i].stroke(e, test);
                }
            }
        },
        test: function(e) {
            this.stroke(e, true);
        },

        words: function() {
            return this._listen.slice();
        },

        // private:
        _state: 0,
        _opts: null,
        _keyboard: null,
        _layout: null,
        _im: null,
        _listen: [],
        _wrapper: null,
        _callback: null,

        _makeEventObj: function(key, env) {
            var e = {};
            var keysyms;
            var keyCheck = this._im.symTable;

            e.type = "keystroke";

            if (env) {
                e.target = env.target;
                e.mod = env.shift;
                keysyms = this._layout[env.keyCode][e.mod ? 1 : 0];
                if (keysyms instanceof Array) {
                    e.key = keysyms[0];
                    e.allSyms = keysyms;
                } else {
                    e.key = keysyms;
                    e.allSyms = [keysyms];
                }
                e.keyCode = env.keyCode;
                e.nativeCode = env.nativeCode;
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
        },
        _makeWrapper: function() {
            var that = this, keyFilter, env, fire, wrapper;
            keyFilter = this._keyboard;
            env = {
                prevent: this._opts.prevent,
                report: this._opts.report,
                type: "",            // event type (keydown / keypress / keyup)
                target: null,        // event src element
                keyState: {},        // flag to block key repeat
                identified: false,    // flag to cancel keypress trigger
                nativeCode: 0,        // native keyCode of the browser
                keyCode: 0,            // converted keyCode
                shift: false
            };
            fire = function() {
                var e;
                env.shift = !!env.keyState[16];
                e = that._makeEventObj("", env);
                that.stroke(e);
            };
            wrapper = function(event) {
                var e, c, cc;
                e = event || window.event;
                c = e.keyCode || e.which || e.charCode;

                env.type = e.type;
                env.target = e.target || e.srcElement;
                env.shift = !!env.keyState[16];

                switch (e.type) {
                    case "keydown":
                        env.nativeCode = c;
                        c = env.keyCode = keyFilter(c, env);
                        if (c >= 0) {
                            // the key has been identified
                            if (!env.keyState[c]) {
                                env.keyState[c] = true;
                                fire();
                                env.identified = true;        // cancel keypress process
                            } else {
                                // block key repeat
                            }
                        } else {
                            // need to check keypress event to identify the key
                            env.identified = false;
                        }
                        break;
                    case "keypress":
                        if (!env.identified) {
                            c = env.keyCode = keyFilter(c, env);
                            if (!env.keyState[c]) {
                                env.keyState[c] = env.nativeCode + 1;
                                fire();
                            } else {
                                // block key repeat
                            }
                        } else {
                            // the key has already been identified in keydown event
                        }
                        break;
                    case "keyup":
                        env.nativeCode = c;
                        c = keyFilter(c, env);
                        if (c >= 0) {
                            if (env.keyState[c]) {
                                env.keyState[c] = false;
                            } else {
                                if (c !== 244 && env.report) {
                                    throw new Error("keyup from unpressed key");
                                }
                            }
                        } else {
                            // find the pressing key and reset it
                            for (cc in env.keyState) {
                                if (env.keyState[cc] === env.nativeCode + 1) {
                                    env.keyState[cc] = false;
                                    break;
                                }
                            }
                        }
                        break;
                    default:
                        if (env.report) {
                            throw new Error("key-event wrapper caught an unexpected event.");
                        }
                        break;
                }

                // cancel default action
                e.returnValue = true;
                if (env.prevent) {
                    if (! (c < 0 && ($.client.browser.ie || $.client.browser.chrome || $.client.browser.safari))) {
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
            };

            this._wrapper = wrapper;
            return wrapper;
        },
        _wrapKeyEvents: function() {
            var root = this._opts.eventRoot || {}, wrap = this._wrapper;

            if (root.addEventListener) {
                // DOM Level 2
                root.addEventListener("keydown", wrap, false);
                root.addEventListener("keypress", wrap, false);
                root.addEventListener("keyup", wrap, false);
            } else if (root.attachEvent) {
                // IE
                root.attachEvent("onkeydown", wrap);
                root.attachEvent("onkeypress", wrap);
                root.attachEvent("onkeyup", wrap);
            } else if (root.onkeydown) {
                // DOM Level 0 (trad)
                root.onkeydown = wrap;
                root.onkeypress = wrap;
                root.onkeyup = wrap;
            } else {
                if (this._opts.report) {
                    throw new Error("failed to add events.");
                }
            }
        },
        _unwrapKeyEvents: function() {
            var root = this._opts.eventRoot || {}, wrap = this._wrapper;

            if (root.removeEventListener) {
                // DOM Level 2
                root.removeEventListener("keydown", wrap, false);
                root.removeEventListener("keypress", wrap, false);
                root.removeEventListener("keyup", wrap, false);
            } else if (root.detachEvent) {
                // IE
                root.detachEvent("onkeydown", wrap);
                root.detachEvent("onkeypress", wrap);
                root.detachEvent("onkeyup", wrap);
            } else if (root.onkeydown) {
                // DOM Level 0 (trad)
                root.onkeydown = void 0;
                root.onkeypress = void 0;
                root.onkeyup = void 0;
            } else {
                if (this._opts.report) {
                    throw new Error("failed to remove events.");
                }
            }
        },
        _parse: function(src) {
            return (this._im.parser instanceof Function) && this._im.parser(src);
        },
        _addListenWord: function(word) {
            for (var i = 0; i < this._listen.length; ++i) {
                if (this._listen[i] === word) {
                    // already registered
                    return false;
                }
            }
            this._listen.push(word);
            return true;
        },
        _removeListenWord: function(word) {
            for (var i = 0; i < this._listen.length; ++i) {
                if (this._listen[i] === word) {
                    this._listen.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        _initConfig: function() {
            this._keyboard = $.client.keyboard[this._opts.keyboard];
            this._im = $.im[this._opts.im]();
            this._layout = $.layout[this._opts.layout]
        },
        _overloadLayout: function() {
            var layout, mix, a, k, i, j;
            layout = $.util.clone(this._layout);
            mix = this._im.overload;

            if (!mix) {
                return;
            }

            for (i in mix) {
                if (i.charAt(0) === "_") {
                    k = $.util.find(layout, i.slice(1));
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
                    if (this._opts.report) {
                        throw new Error("fail to mix keymap");
                    }
                }
            }

            this._layout = layout;
        }
    });

    Word = $.util.class({
        // public:
        tag: null,

        init: function(tsuikyo, src, tag, flex) {
            if (tsuikyo) {
                this._ts = tsuikyo;
                this._src = src;
                this.tag = tag;
                this._flex = flex;
                this._nodeSrc = tsuikyo._parse(src, tsuikyo._opts.strictParse);
                this._chkJunctionCache = [];
                this._state = engine.STATE_SLEEP;
            }
            this._nodes = this._linkNode(new Node(this._nodeSrc[0]));    // entry point
            this._activeNode = this._selectNode();
            this._input = [];
            if (flex === "fixed") {
                this._nodes = [this._activeNode];
            }

            return this;
        },
        listen: function(callback) {
            if (callback !== void 0) {
                this._callback = callback;
            }
            if (this._state === engine.STATE_SLEEP) {
                this._state = engine.STATE_LISTEN;
                this._ts._addListenWord(this);
            }

            return this;
        },
        sleep: function() {
            this._state = engine.STATE_SLEEP;
            this._ts._removeListenWord(this);

            return this;
        },
        stroke: function(e, test) {
            var ret, ee;
            if (typeof e === "string" || e === void 0) {
                e = this._ts._makeEventObj(e);
            } else if (e.key === void 0) {
                e = this._ts._makeEventObj("", e);
            }

            ret = this._accept(e, test);
            ee = $.util.extend(e, {
                ret: ret,
                test: !!test,
                type: "keystroked",
                accept: ret > engine.TYPE_MISS,
                miss: ret === engine.TYPE_MISS,
                finish: ret >= engine.TYPE_FINISH
            });

            if (this._state === engine.STATE_LISTEN && this._callback instanceof Function) {
                this._callback(ee);
            }
            return ee;
        },
        test: function(e) {
            return this.stroke(e, true);
        },

        totalCount: function() {
            return this._input.length;
        },
        acceptCount: function() {
            return this._activeNode.keys().length;
        },
        missCount: function(includeCancel) {
            if (includeCancel) {
                return this.totalCount() - this.acceptCount();
            } else {
                return this._missCount;
            }
        },
        cancelCount: function() {
            return this.totalCount() - this.acceptCount() - this._missCount;
        },
        pos: function() {
            return this._activeNode.pos;
        },
        kpos: function() {
            return this._activeNode.keys().length;
        },
        str: function(p) {
            if (p === void 0) {
                p = this._src.length;
            }
            if (p >= 0) {
                return this._src.slice(0, p);
            } else {
                return this._src.slice(-p - 1);
            }
        },
        rstr: function(p) {
            return this.str(-p - 1);
        },
        kstr: function(p) {
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
            return $.util.map(keysyms, function(e) {
                return conv[e];
            }).join("");
        },
        rkstr: function(p) {
            return this.kstr(-p - 1);
        },
        nextKeys: function() {
            var head = this._activeNode.next(), next;
            next = $.util.map(this._nodes, function(node) {
                return node.next();
            });
            next.unshift(head);

            return $.util.uniq(next);
        },
        keysyms: function() {
            return this._selectNodeToEnd().keys();
        },
        finished: function() {
            return this.pos() === this._src.length;
        },

        // private:
        _state: engine.STATE_PREINIT,
        _ts: null,
        _flex: "",
        _callback: null,

        _src: "",
        _nodeSrc: [],
        _nodes: [],
        _activeNode: null,
        _input: [],
        _missCount: 0,
        _cancelCount: 0,

        _accept: function(e, test) {
            var ret = [], retMax, i;

            for (i = 0; i < this._nodes.length; ++i) {
                ret.push(this._nodes[i].accept(e, test));
            }

            retMax = Math.max.apply(null, ret);

            if (!test && retMax !== engine.TYPE_IGNORE) {
                // refresh the word state
                this._refresh(retMax);
                this._input.push(e);
            }

            return retMax;
        },
        _refresh: function(type) {
            var ns, newNodes, linkedNodes, i;

            ++this.inputCount;

            if (type !== engine.TYPE_MISS) {
                // get all appropriate nodes
                ns = $.util.filter(this._nodes, function(node, i) {
                    return node.ret === type;
                });
            }

            switch (type) {
                case engine.TYPE_MISS:    // no transition
                    ++this._missCount;
                    break;
                case engine.TYPE_INNER:    // internal transit
                    if (this._flex === "flex") {
                        this._nodes = ns;
                    }
                    this._activeNode = this._selectNode(ns);
                    break;
                case engine.TYPE_TRANSIT:    // node transit
                    if (this._flex === "flex") {
                        this._nodes = ns.slice();    // hard copy
                        newNodes = [];
                    } else {
                        // include TYPE_INNER nodes as candidates to be active
                        newNodes = $.util.filter(this._nodes, function(node, i) {
                            return node.ret === engine.TYPE_INNER;
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
                case engine.TYPE_JUNCTION:    // node transit and reach junction
                case engine.TYPE_FINISH:    // node transit and reach the end point
                    this._nodes = this._linkNode(this._selectNode(ns));
                    this._activeNode = this._selectNode();
                    break;
                case engine.TYPE_FINISHED:    // already reached the end point
                    this._input.pop();
                    break;
                default:
                    if (this._ts._opts.report) {
                        throw new Error("Word._refresh: unknown refresh type " + type);
                    }
                    break;
            }

            if (this._flex === "fixed" && this._nodes.length > 1) {
                // when fixed mode, remains active node only
                this._nodes = [this._activeNode];
            }
        },
        _linkNode: function(parent) {
            var tailPos = this._src.length, next, isJunction, node, ret = [], i;

            if (!parent.n) {
                parent.n =  [new Node(null, parent)];
            }
            next = parent.n;

            for (i = 0; i < next.length; ++i) {
                isJunction = this._chkJunction(parent.pos + parent.d + next[i].d);
                node = new Node(next[i], parent, isJunction, tailPos);
                ret.push(node);
            }

            return ret;
        },
        _hideNode: function(node) {
            for (var i = 0; i < this._nodes.length; ++i) {
                if (this._nodes[i] === node) {
                    this._nodes.splice(i, 1);
                    break;
                }
            }
        },
        _selectNode: function(ns) {
            var sel, filters;
            sel = function(nodes, f) {
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
                function(node) { return node.pos; },
                function(node) { return node.pos + node.d; },
                function(node) { return node.pos + (node.dsum || node.d); },
                function(node) { return node.i; },
                function(node) { return -node.k.length; }
            ];
            ns = ns || this._nodes;

            if (ns.length > 1) {
                $.util.each(filters, function(f) {
                    ns = sel(ns, f);
                    return ns.length === 1;    // true means break the loop
                });
            }

            return ns[0];
        },
        _selectNodeToEnd: function(start) {
            var node = start || this._activeNode;

            while(node.n && node.n.length) {
                node = this._selectNode(this._linkNode(node));
            }

            node = new Node(null, node, true, this._src.length);
            node.parent.n = [node];
            return node;
        },
        _chkJunctionCache: null,
        _chkJunction: function(pos) {
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
    });

    Node = $.util.class({
        k: [],
        i: 0,
        d: 0,
        dsum: 0,
        n: [],
        parent: null,
        isJunction: true,
        tailPos: -1,
        ret: -1,

        init: function(nodeSrc, parent, isJunction, tailPos) {
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
        },
        accept: function(e, test) {
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
                                this.ret = engine.TYPE_FINISH;
                            } else {
                                this.ret = engine.TYPE_JUNCTION;
                            }
                        } else {
                            this.ret = engine.TYPE_TRANSIT;
                        }
                    } else {
                        this.ret = engine.TYPE_INNER;
                    }
                    test && --this.i;
                } else if (!this.k.length) {
                    // end point always returns TYPE_FINISHED
                    this.ret = engine.TYPE_FINISHED;
                } else {
                    this.ret = engine.TYPE_MISS;
                }
            } else {
                this.ret = engine.TYPE_IGNORE;
            }

            return this.ret;
        },
        _pos: function() {
            if (this.parent && this.parent.pos !== void 0) {
                return this.parent.pos + this.parent.d;
            } else {
                return 0;
            }
        },
        keys: function() {
            var keys, n = this.parent;
            keys = [this.k.slice(0, this.i)];

            while (n) {
                keys.push(n.k);
                n = n.parent;
            }

            return Array.prototype.concat.apply([], keys.reverse());
        },
        next: function() {
            return this.k[this.i];
        }
    });

    // enum
    $.util.each([
        "TYPE_IGNORE",
        "TYPE_MISS",
        "TYPE_INNER",
        "TYPE_TRANSIT",
        "TYPE_JUNCTION",
        "TYPE_FINISH",
        "TYPE_FINISHED",

        "STATE_PREINIT",
        "STATE_SLEEP",
        "STATE_LISTEN"
    ], function(e, i) {
        engine[e] = engine.prototype[e] = Word.prototype[e] = i - 1;
    });
    $.engine = engine;

}(Tsuikyo);

