/** @type import('@vue/cli-service').ProjectOptions */
const path = require('path')

// yarn add javascript-obfuscator@2.5.0 webpack-obfuscator@2.6.0
const WebpackObfuscator = require('webpack-obfuscator');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  configureWebpack: {
    plugins:  process.env.NODE_ENV === 'development' ? [] : [
      new WebpackObfuscator({
        compact: true,
        debugProtection: true,
        debugProtectionInterval: true,
        disableConsoleOutput: true,
        reservedNames: [],
        rotateStringArray: true,
        seed: 1,
        selfDefending: true,
        sourceMap: false,
        sourceMapBaseUrl: '',
        sourceMapFileName: '',
        sourceMapMode: 'separate',
        stringArray: true,
        // splitStrings: true,
        // renameGlobals: true,
        // renameProperties: true,
        // splitStringsChunkLength: 5,
        stringArrayEncoding: ['none'],
        stringArrayThreshold: 0.8,
        unicodeEscapeSequence: true
      })
    ]
  },
  // https://github.com/neutrinojs/webpack-chain/tree/v4#getting-started
  chainWebpack(config) {
    // We provide the app's title in Webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    config.set('name', 'Via')

    // Set up all the aliases we use in our app.
    config.resolve.alias.clear().merge(require('./aliases.config').webpack)

    // Don't allow importing .vue files without the extension, as
    // it's necessary for some Vetur autocompletions.
    config.resolve.extensions.delete('.vue')

    // Only enable performance hints for production builds,
    // outside of tests.
    config.performance.hints(
      process.env.NODE_ENV === 'production' &&
        !process.env.VUE_APP_TEST &&
        'warning'
    )
    config.resolve.alias.set(
      'vue$',
      // If using the runtime only build
      // path.resolve(__dirname, 'node_modules/vue/dist/vue.runtime.esm.js')
      // Or if using full build of Vue (runtime + compiler)
      path.resolve(__dirname, 'node_modules/vue/dist/vue.esm.js')
    )
  },
  css: {
    // Enable CSS source maps.
    sourceMap: false,
  },
  productionSourceMap: false,
  // Configure Webpack's dev server.
  // https://cli.vuejs.org/guide/cli-service.html
  devServer: {

    ...(process.env.API_BASE_URL // Proxy API endpoints to the production base URL.
      ? {
          proxy: {
            '/api': {
              target: process.env.API_BASE_URL,
              changeOrigin: true,
              onProxyReq(proxyReq) {
                proxyReq.setHeader('origin', 'http://localhost:8080');
              }
            },
          },
        } // Proxy API endpoints a local mock API.
      : {
          before: require('./tests/mock-api'),
        }),
    disableHostCheck: true,

    // proxy: {
    //   '/api': {
    //     target: 'https://getnada.com/api/v1/inboxes/shrumschrabjnalio@vomoto.com',
    //     changeOrigin: true
    //   }
    // }


    // port: 8080,
    // proxy: {
    //   '^/api': {
    //     target: 'https://getnada.com',
    //     changeOrigin: true,
    //     pathRewrite: { '^/api': '/api/v1' },
    //     headers: {
    //       Referer: 'https://getnada.com'
    //     onProxyReq(proxyReq) {
    //       proxyReq.setHeader('origin', 'http://localhost:8080');
    //     },
    //   },
    // },



    // test cors
    // proxy: {
    //   '/api': {
    //   target: 'https://getnada.com',
    //   pathRewrite: { '^/api': '/api/v1/inboxes/' },
    //   changeOrigin: true,
    //   secure: false
    //   }
    // }

  },
}
