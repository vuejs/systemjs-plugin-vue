var compiler = require('vue-template-compiler')
var falafel = require('falafel')
var compileCSS = require('./lib/style-rewriter.js')
var genId = require('./lib/gen-id.js')

exports.translate = function (load, opts) {
  var sfc = load.metadata.sfc = compiler.parseComponent(load.source, { pad: true })
  // style
  var hasScoped = sfc.styles.some(s => s.scoped)
  var scopeId = hasScoped ? 'data-v-' + genId(load.name) : null
  var vueOpts = this.vue || {}
  if (sfc.styles.length) {
    var style = Promise.all(sfc.styles.map(s => {
      return compileCSS(scopeId, s, load.name, opts.minify, vueOpts)
    })).then(compiledStyles => {
      return compiledStyles.join('\n')
    })
    if (typeof window !== 'undefined') {
      style.then(injectStyle)
    } else {
      load.metadata.vueStyle = style
    }
  }
  var templateModuleName = getTemplateModuleName(load.name)
  // in-browser template handling
  if (typeof window !== 'undefined' && sfc.template) {
    System.set(templateModuleName, System.newModule(
      compiler.compileToFunctions(sfc.template.content)
    ))
  }
  // script
  let script = sfc.script ? sfc.script.content : ''
  if (sfc.template) {
    script = script || 'export default {}'
    script = falafel(script, {
      ecmaVersion: 6,
      sourceType: 'module'
    }, node => {
      if (node.type === 'ObjectExpression') {
        if (node.parent && node.parent.type === 'ExportDefaultDeclaration') {
          node.update(node.source().replace(/^\{/,
            `{render:__renderFns__.render,` +
            `staticRenderFns:__renderFns__.staticRenderFns,` +
            (scopeId ? `_scopeId:"${scopeId}",` : '')
          ))
        }
      }
    })

    script = `var __renderFns__ = System.get(${templateModuleName});` + script
  }
  return script
}

var cssInject = "(function(c){if (typeof document == 'undefined') return; var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})"
if (typeof window === 'undefined') {
  exports.bundle = function (loads) {
    var style = Promise.all(
      loads
        .map(load => load.metadata.vueStyle)
        .filter(s => s)
    ).then(styles => {
      return `${cssInject}(${JSON.stringify(styles.join('\n'))});\n`
    })

    var templateModules = loads
      .filter(l => l.metadata.sfc.template)
      .map(l => compileTemplateAsModule(l.name, l.metadata.sfc.template.content))
      .join('\n')

    return style.then(style => templateModules + '\n' + style)
  }
}

function injectStyle (style) {
  var styleTag = document.createElement('style')
  styleTag.textContent = style
  document.head.appendChild(styleTag)
}

function getTemplateModuleName (name) {
  return JSON.stringify(System.getCanonicalName(name) + '.template')
}

function compileTemplateAsModule (name, template) {
  name = getTemplateModuleName(name)
  var fns = compiler.compile(template)
  return `System.set(${name},System.newModule({\n` +
    `render:${toFn(fns.render)},\n` +
    `staticRenderFns:[${fns.staticRenderFns.map(toFn).join(',')}]\n` +
  `}));`
}

function toFn (code) {
  return `function(){${code}}`
}
