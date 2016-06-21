var path = require('path')

module.exports = function (raw, filename, options) {
  return System.import('@node/stylus').then(stylus => {
    return new Promise((resolve, reject) => {
      var opts = Object.assign({
        filename: path.basename(filename)
      }, options.stylus)

      var dir = path.dirname(filename)
      var paths = [dir, process.cwd()]
      opts.paths = opts.paths
        ? opts.paths.concat(paths)
        : paths

      // using the renderer API so that we can
      // check deps after compilation
      var renderer = stylus(raw)
      Object.keys(opts).forEach((key) => {
        renderer.set(key, opts[key])
      })

      renderer.render((err, res) => {
        if (err) return reject(err)
        resolve(res)
      })
    })
  })
}
