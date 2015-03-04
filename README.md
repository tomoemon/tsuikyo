Tsuikyo
---------------------------

W/H さん作の Tsuikyo からローマ字かな変換部分だけ取り出そうとするプロジェクト。
> タイピングゲームを作る上で地味でめんどくてしかも適当にやるとバグりがちな部分を任せて楽ができるよというもの．
> https://code.google.com/p/tsuikyo/
> http://dvorak.jp/softwares/tsuikyo2.htm

変わらない部分
---------------------------

* IE6 以降をサポートする（ECMAScript5 以降の機能を使わない）
 * IE8 のシェアが 1% を切ったら IE6, 7, 8 のサポートを外す
* 複数ブラウザのサポート (Chrome, Firefox, IE, Opera, Safari)
* 複数のキーボードをサポート
* 複数の入力方式をサポート

変わる（可能性のある）部分
--------------------------

* (done) コードベースを JavaScript から TypeScript へ
* (done) ローマ字かな変換部分がブラウザ依存している部分があるので分離する (im.js, client.js)
* (done) タイピングゲームに必要な要素とキーイベント周りが一緒になっている (engine.js)
* (done) webpack.js で1ファイルへの結合、minify を自動化
* unittest の作成
* Tsuikyo, Word, Node が提供するインターフェース

ライセンス
--------------------------

MIT ライセンス

