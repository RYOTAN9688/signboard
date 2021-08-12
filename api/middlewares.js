const jsonServer = require('json-server')

module.exports = [
  //GET /api/v1/cardsにアクセスするための設定（必須）
  jsonServer.rewriter({ '/api/:ver/*': '/$2' }),
  delay(1_000, 100),
  cleanNull('cardsOrder'),
]

//レイテンシー（ユーザのアクションとその結果の応答時間）を再現
function delay(max, min = 0) {
  return (req, res, next) => {
    setTimeout(next, Math.random() ** 2 * (max - min) + min)
  }
}

//nullになった値を削除
//不具合を起こさないようGETリクエストのタイミングで実行

function cleanNull(path) {
  return (req, res, next) => {
    try {
      if (req.method !== 'GET') return

      const db = req.app.db
      const { isNull } = db._

      const newValue = db.get(path).omitBy(isNull).value()
      db.set(path, newValue).write()
    } catch (err) {
      console.error(err)
    } finally {
      next()
    }
  }
}
