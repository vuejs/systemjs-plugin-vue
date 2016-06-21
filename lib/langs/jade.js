module.exports = function (raw, filename, options) {
  return System.import('@node/jade').then(jade => {
    return new Promise((resolve, reject) => {
      var html
      try {
        html = jade.compile(raw, Object.assign({}, options.jade))()
      } catch (err) {
        return reject(err)
      }
      resolve(html)
    })
  })
}
