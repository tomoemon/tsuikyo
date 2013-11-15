
!function(window, undefined) {
    if ('Tsuikyo' in window) {
        return;
    }
    window.Tsuikyo = {};
    var $ = window.Tsuikyo;

    $.util = {};

    // create a new class
    $.util.class = function(src) {
        var klass = function() {
            this.init.apply(this, arguments);
        };
        klass.prototype = src;
        return klass;
    }

    // make a prototype copy
    $.util.clone = function(src) {
        var clone = function(){};
        clone.prototype = src;
        return new clone();
    }

    // make a prototype copy and extend it
    $.util.extend = function(src, ext) {
        var i, ret = $.util.clone(src);
        for (i in ext) {
            ret[i] = ext[i];
        }
        return ret;
    }

    // like Array.forEach
    $.util.each = function(a, fn) {
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
    $.util.filter = function(a, fn) {
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
    $.util.map = function(a, fn) {
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

    $.util.uniq = function(a) {
        var ret = [], s = {}, i;
        for (i = 0; i < a.length; ++i) {
            if (!s[a[i]] && a[i] !== void 0) ret.push(a[i]);
            s[a[i]] = true;
        }
        return ret;
    }

    $.util.find = function(a, v) {
        var ret = false;

        $.util.each(a, function(e, i) {
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
}(window);
