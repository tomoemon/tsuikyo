class Util {
    // make a prototype copy
    static clone(source: any): any {
        var clone = function () { };
        clone.prototype = source;
        return new clone();
    }

    // make a prototype copy and extend it
    static extend(source: any, extension: any): any {
        var i, ret = Util.clone(source);
        for (i in extension) {
            ret[i] = extension[i];
        }
        return ret;
    }

    // like Array.forEach
    static each(a, fn) {
        var i;
        if (a instanceof Function) {
            return;
        } else if (typeof a === "string") {
            for (i = 0; i < a.length; ++i) {
                if (fn(a.charAt(i), i)) {
                    break;    // avoid [] indexer for legacy browsers
                }
            }
        } else if (a instanceof Array) {
            for (i = 0; i < a.length; ++i) {
                if (fn(a[i], i)) {
                    break;
                }
            }
        } else {
            for (i in a) {
                if (fn(a[i], i)) {
                    break;
                }
            }
        }

        return a;
    }

    // like Array.filter
    static filter(a, fn) {
        var ret = [], i;
        if (typeof a === "string") {
            for (i = 0; i < a.length; ++i) {
                // avoid [] indexer for legacy browsers
                if (fn(a.charAt(i), i)) {
                    ret.push(a.charAt(i));
                }
            }
        } else {
            for (i = 0; i < a.length; ++i) {
                if (fn(a[i], i)) {
                    ret.push(a[i]);
                }
            }
        }
        return ret;
    }

    // like Array.map
    static map(a, fn) {
        var ret = [], i;
        if (typeof a === "string") {
            for (i = 0; i < a.length; ++i) {
                ret.push(fn(a.charAt(i), i));    // avoid [] indexer for legacy browsers
            }
        } else {
            for (i = 0; i < a.length; ++i) {
                ret.push(fn(a[i], i));
            }
        }
        return ret;
    }

    static uniq(a) {
        var ret = [], s = {}, i;
        for (i = 0; i < a.length; ++i) {
            if (!s[a[i]] && a[i] !== void 0) ret.push(a[i]);
            s[a[i]] = true;
        }
        return ret;
    }

    static find(a, v) {
        var ret = false;

        Util.each(a, function (e, i) {
            if (typeof e === "object") {
                if (arguments.callee(e, v) !== false) {
                    ret = i;
                    return true;
                }
            } else {
                if (e === v) {
                    ret = i;
                    return true;
                }
            }
        });

        return ret;
    }
}
export = Util;
