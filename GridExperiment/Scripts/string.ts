class StringExt {

    // Return all pattern matches with captured groups
    static execAll(regex: RegExp, value: string): string[]
    {
        var match = null;
        var matches = new Array();

        while (match = regex.exec(value))
        {
            var matchArray = [];

            for (var i in match) {
                if (parseInt(i) == i) {
                    matchArray.push(match[i]);
                }
            }
            matches.push(matchArray);
        }
        return matches;
    }
}

interface String {

    toCamelCase(): string;
    toJavaCase(): string;
    template(replacements: any): string;
    format(replacements: any[]): string;
}

String.prototype.toCamelCase = function () {

    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toJavaCase = function () {

    return this.charAt(0).toLowerCase() + this.slice(1);
};

String.prototype.template = function (replacements) {

    var result: string = this;
    var matches = StringExt.execAll(/\{\{(.*?)\}\}/g, result);
    if (matches) {

        matches.forEach(function (token) {

            var key = token[1];
            var value = _.has(replacements, key) ? replacements[key] : "(null)";
            result = result.replace(token[0], value);
        });
    }

    return result;
}

String.prototype.format = function (replacements) {

    if (!_.isArray(replacements))
        throw "replacements must be an array";

    var result: string = this;
    var matches = StringExt.execAll(/\{(\d+)\}/g, result);

    if (matches) {

        matches.forEach(function (token) {

            var key = parseInt(token[1]);
            if (key >= replacements.length)
                throw "format index {0} out of range {1}".format([key, replacements]);

            var value = replacements[key];
            result = result.replace(token[0], value);
        });
    }

    return result;
}