module.exports = function (raw, filename, options) {
  return new Promise((resolve, reject) => {
    var jade = require('@node/jade')
    try {
      var html = jade.compile(raw, Object.assign({}, options.jade))()
    } catch (err) {
      return reject(err)
    }
    resolve(html)
  })
}
