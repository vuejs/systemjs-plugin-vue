module.exports = function (raw, filename, options) {
  return new Promise((resolve, reject) => {
    var path = require('@node/path')
    var sass = require('@node/node-sass')

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
}
