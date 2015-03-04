/**
 * convert CRLF to LF
 */
var fs = require('fs');
var argv = process.argv.slice(2);
argv.forEach(function(arg) {
    var buffer = fs.readFileSync(arg).toString();
    fs.writeFile(arg, buffer.replace(/\r\n/g, "\n").replace(/\t/g, ""));
})
