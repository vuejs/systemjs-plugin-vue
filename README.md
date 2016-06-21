# systemjs-plugin-vue

> SystemJS plugin for Vue single file components

## Usage

This plugin is only tested with jspm 0.17+ and Vue.js 2.0+.

``` bash
jspm install npm:vue@2.0.0-alpha.5
jspm install --dev npm:systemjs-plugin-vue
```

``` js
System.config({
  "meta": {
    "*.vue": {
      "loader": "systemjs-plugin-vue"
    }
  }
})
```

## Features

- ES2015 by default (requires `systemsjs-plugin-babel`)

- `lang="xxx"` pre-processors

- Scoped CSS

- PostCSS support

- CSS are automatically extracted across all components and injected as a single `<style>` tag

## Caveats

- This doesn't work for in-browser JIT compilation due to multiple Node dependencies. Use `jspm bundle -wid` during development, it's faster anyway.

- SystemJS' hot reload mechanism is quite limiting and it's currently not possible to support the same level of hot-reload available in `vue-loader` and `vueify`.

## Pre-Processors

To enable a pre-processor, you need to install the corresponding pre-processor module **via npm, not jspm**. Example:

``` bash
npm install less --save-dev
```
``` html
<style lang="less">
  /* use less! */
</style>
```

These are the preprocessors supported out of the box:

- stylus
- less
- scss (via `node-sass`, use `sass` in [config section](#configuring-options))
- jade
- pug
- coffee-script (use `coffee` in [config section](#configuring-options))

## Configuring Options

You can add a Vue section in your SystemJS config:

``` js
System.config({
  vue: {
    // options
  }
})
```

Or, alternatively, create a `vue.config.js` file at the root of your project, and export the configuration object.

### Passing Options to Pre-Processors

Just add a nested object under `vue`:

``` js
System.config({
  vue: {
    less: {
      paths: [...] // custom less @import paths
    }
  }
})
```

### Custom Lang Compiler

You can provide custom `lang` compilers under the `compilers` option. It is recommended to use `vue.config.js` for custom compilers, and in most cases you will want to import your Node dependencies as raw Node modules:

``` js
// vue.config.js
export default {
  compilers: {
    'my-lang' (raw, filename) {
      return System.import('@node/my-lang').then(myLang => {
        return myLang.compile(raw) // assumes returning a promise
      })
    }
  }
}
```

### PostCSS Configuration

Use `vue.postcss` in your SystemJS config file. The option can be:

- An array of plugins. Each plugin can either be a string module name or an array with the first element being the module name and the second element being an options object to be passed to that plugin.

  Example:

  ``` js
  System.config({
    vue: {
      postcss: [
        'postcss-nested',
        ['autoprefixer', { browsers: 'last 2 versions' }]
      ]
    }
  })
  ```

- An object containing `options` (passed to `postcss.process()`) and `plugins`. The parser and stringifier options can also be string module names and will be resolved automatically.

  Example:

  ``` js
  System.config({
    vue: {
      postcss: {
        options: {
          parser: 'sugarss'
        },
        plugins: [...]
      }
    }
  })
  ```

If using `vue.config.js`, you can also directly provide the imported plugins instead of string module names.
