mockserver
==========

https://github.com/deflis/mockserver

HTTPでパスに対する出力を流し込んだり、ログを取得したり出来るHTTPサーバです。
主にzaffy( https://github.com/tomoemon/zaffy )と組み合わせて使うことを想定されています。

## mockserverを起動するには

nodejsをインストールします。（最近のバージョンを推奨）

mockserverをcloneして、ディレクトリ上で

`node server.js`

とすると、ポート8888でmockserverが起動します。（2012/12/17現在）

## mockserver への出力データ登録方法

mockserverへのデータ登録はHTTPを用いて行います。

PUTメソッドでJSONをそのままrawで送信するか、GETもしくはPOSTでdataパラメータにJSONを指定します。

`PUT /load`

    {"/":"test"}

`HTTP/1.1 200 OK`

    {"status":"OK","data":{"/":"test"}}

### mockserver の出力データJSONの仕様

    {"/path":"data"}

のような、パス名をキーとし、出力をデータとした構造を受け付けます。それ以外のデータ形式の場合の動作は保証しません。

## mockserver のログ取得機能

mockserverはHTTPを使ってJSONでログを取得することができます。

GETメソッドで/logにアクセスします。

`GET /log`

    [{"request":{"url":"/","path":"/","method":"GET","headers":{"user-agent":"user_agent","host":"localhost:8888","accept":"*/*"},"parsed":{"pathname":"/","path":"/","href":"/"},"querystring":{}},"response":{"status":200,"headers":{"Content-Type":"text/html"},"data":"test"}}]

## mockserver のログクリア機能

DELETEメソッドで/logにアクセスするとログがクリアされます。

`DETELE /log`

    {"status":"OK"}

`GET /log`

    []

## 動作サンプル

プロジェクトに添付してあるindex.htmlがデモページになっています。

cloneしてそのまま実行し、サーバにアクセスするとデモが実行できますのでお試しください。
