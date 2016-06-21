module.exports = function (raw, filename, options) {
  return System.import('@node/pug').then(pug => {
    return new Promise((resolve, reject) => {
      var html
      try {
        html = pug.compile(raw, Object.assign({}, options.pug))()
      } catch (err) {
        return reject(err)
      }
      resolve(html)
    })
  })
}
