 
class Option {
    protected parse(args: any) {
        for (var key in args) {
            if (key in this) {
                this[key] = args[key];
            }
            else {
                throw new Error("unknown option: '" + key + "'");
            }
        }
    }
}

export = Option;
