var postcss = require('postcss')
var selectorParser = require('postcss-selector-parser')
var cache = require('lru-cache')(100)

var currentId
var addId = postcss.plugin('add-id', function () {
  return function (root) {
    root.each(function rewriteSelector (node) {
      if (!node.selector) {
        // handle media queries
        if (node.type === 'atrule' && node.name === 'media') {
          node.each(rewriteSelector)
        }
        return
      }
      node.selector = selectorParser(function (selectors) {
        selectors.each(function (selector) {
          var node = null
          selector.each(function (n) {
            if (n.type !== 'pseudo') node = n
          })
          selector.insertAfter(node, selectorParser.attribute({
            attribute: currentId
          }))
        })
      }).process(node.selector).result
    })
  }
})

module.exports = function (id, style, name, minify, opts) {
  var css = style.content.trim()
  var scoped = style.scoped
  if (!scoped && !minify) {
    return Promise.resolve(css)
  }
  var key = id + '!!' + css
  var val = cache.get(key)
  if (val) {
    return Promise.resolve(val)
  } else {
    var postcssOpts = opts.postcss || {}
    var plugins = Array.isArray(postcssOpts)
      ? postcssOpts.slice()
      : Array.isArray(postcssOpts.plugins)
        ? postcssOpts.plugins.slice()
        : []
    // resolve postcss plugins
    plugins = Promise.all(plugins.map(resolvePlugin))
      .then(plugins => {
        // scoped css rewrite
        if (scoped) {
          plugins.push(addId)
        }
        // minification
        if (minify) {
          plugins.push(require('cssnano')(Object.assign({
            safe: true
          }, opts.cssnano)))
        }
        return plugins
      })
    // resolve postcss options
    var optionsPromises = []
    var pos = Object.assign({}, postcssOpts.options)
    if (pos) {
      var parser = pos.parser || (pos.syntax && pos.syntax.parser)
      if (parser) {
        optionsPromises.push(System.import(parser).then(parser => {
          pos.parser = parser
        }))
      }
      var stringifier = pos.stringifier || (pos.syntax && pos.syntax.stringifier)
      if (stringifier) {
        optionsPromises.push(System.import(stringifier)).then(stringifier => {
          pos.stringifier = stringifier
        })
      }
    }

    return Promise.all(optionsPromises).then(() => plugins).then(plugins => {
      currentId = id
      return postcss(plugins)
        .process(css, pos)
        .then(res => res.css)
    })
  }
}

function resolvePlugin (p) {
  if (typeof p === 'string') {
    return System.import(p)
  } else if (Array.isArray(p)) {
    return System.import(p[0]).then(plugin => plugin(p[1]))
  }
}
