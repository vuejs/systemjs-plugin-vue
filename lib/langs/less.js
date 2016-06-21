var path = require('path')

module.exports = function (raw, filename, options) {
  return System.import('@node/less').then(less => {
    return new Promise((resolve, reject) => {
      var opts = Object.assign({
        filename: path.basename(filename)
      }, options.less)

      // provide import path
      var dir = path.dirname(filename)
      var paths = [dir, process.cwd()]
      opts.paths = opts.paths
        ? opts.paths.concat(paths)
        : paths

      less.render(raw, opts, (err, res) => {
        if (err) {
          return reject(err)
        }
        // Less 2.0 returns an object instead rendered string
        if (typeof res === 'object') {
          res = res.css
        }
        resolve(res)
      })
    })
  })
}
