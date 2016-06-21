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

## Supported Features

- ES2015 by default (requires `systemsjs-plugin-babel`)
- Scoped CSS
- CSS are automatically extracted across all components and injected as a single `<style>` tag
- PostCSS support

## Caveats

- This most likely won't work for in-browser JIT compilation. Use `jspm bundle -wid` during development.

- It's quite difficult to get big Node dependencies work properly in SystemJS' plugin system (e.g. Less, SASS...), so currently pre-processors via `lang="xxx"` are not supported. However PostCSS is supported (see config below).

- SystemJS' hot reload mechanism is quite limiting and it's currently not possible to support the same level of hot-reload available in `vue-loader` and `vueify`.

## PostCSS Configuration

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

- An object containing `options` (passed to `postcss.process()`) and `plugins`. The parser and stringifier options are expected to be string module names and will be resolved automatically.

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
