cd %~dp0\..\
del dist\* /Q
node tools\webpack.js
node tools\dos2unix.js dist\tsuikyo.js dist\tsuikyo.script.js
copy dist\tsuikyo.script.js demo\tsuikyo.js
