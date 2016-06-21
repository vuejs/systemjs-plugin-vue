module.exports = function (raw, filename, options) {
  return new Promise((resolve, reject) => {
    var pug = require('@node/pug')
    try {
      var html = pug.compile(raw, Object.assign({}, options.pug))()
    } catch (err) {
      return reject(err)
    }
    resolve(html)
  })
}
