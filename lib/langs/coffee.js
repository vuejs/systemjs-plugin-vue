module.exports = function (raw, filename, options) {
  return new Promise((resolve, reject) => {
    var coffee = require('@node/coffee-script')
    var compiled
    try {
      compiled = coffee.compile(raw, Object.assign({
        bare: true,
        filename: filename,
        sourceMap: options.sourceMap
      }, options.coffee))
    } catch (err) {
      return reject(err)
    }
    if (options.sourceMap) {
      compiled = {
        code: compiled.js,
        map: compiled.v3SourceMap
      }
    }
    resolve(compiled)
  })
}
