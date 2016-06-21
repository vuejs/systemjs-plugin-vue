var path = require('path')

module.exports = function (raw, filename, options) {
  return System.import('@node/node-sass').then(sass => {
    return new Promise((resolve, reject) => {
      var sassOptions = Object.assign({
        data: raw,
        sourceComments: true,
        success: (res) => {
          if (typeof res === 'object') {
            resolve(res.css)
          } else {
            resolve(res) // compat for node-sass < 2.0.0
          }
        },
        error: reject
      }, options.sass)

      var dir = path.dirname(filename)
      var paths = [dir, process.cwd()]
      sassOptions.includePaths = sassOptions.includePaths
        ? sassOptions.includePaths.concat(paths)
        : paths

      sass.render(
        sassOptions,
        // callback for node-sass > 3.0.0
        (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.css.toString())
          }
        }
      )
    })
  })
}
