const webpack = require('webpack');
const ThreadsPlugin = require('threads-plugin')
const dotenv = require('dotenv').config({ path: __dirname + '/config.env' });
const fs = require('fs')

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const archElectronConfig = {}

if (fs.existsSync('/usr/lib/electron16') && fs.existsSync('/usr/lib/electron16/version')) {
  archElectronConfig.electronDist = '/usr/lib/electron16'
  archElectronConfig.electronVersion = fs.readFileSync('/usr/lib/electron16/version', { encoding: 'utf-8' }).replace('v', '')
}

const secrets = {}
if (dotenv.parsed) {
  secrets['process.env.YoutubeClientID'] = JSON.stringify(dotenv.parsed['YOUTUBECLIENTID'])
  secrets['process.env.YoutubeClientSecret'] = JSON.stringify(dotenv.parsed['YOUTUBECLIENTSECRET'])
  secrets['process.env.LastFmApiKey'] = JSON.stringify(dotenv.parsed['LASTFMAPIKEY'])
  secrets['process.env.LastFmSecret'] = JSON.stringify(dotenv.parsed['LASTFMSECRET'])
}

module.exports = {
  runtimeCompiler: true,
  pages: {
    index: {
      entry: 'src/mainWindow/main.ts',
      template: 'public/index.html',
      filename: 'index.html',
    },
    preferenceWindow: {
      entry: 'src/preferenceWindow/main.ts',
      template: 'public/index.html',
      filename: 'preferenceWindow.html',
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.browser': 'true',
        ...secrets
      }),

      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),

      // new BundleAnalyzerPlugin()
    ],
    externals: {
      'better-sqlite3': 'commonjs better-sqlite3', "vm2": "require('vm2')", 'sharp': "require('sharp')"
    },
    devtool: 'source-map',
    resolve: {
      fallback: {
        stream: require.resolve("stream-browserify"),
        fs: false,
        util: false,
        os: false,
        url: false,
        net: false,
        assert: false,
        crypto: false,
        dgram: false,
        buffer: require.resolve("buffer")
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      mainProcessWatch: ['src/utils/main', 'src/utils/extensions', 'src/utils/common.ts'],
      customFileProtocol: 'moosync://./',
      builderOptions: {
        ...archElectronConfig,
        appId: 'org.moosync.Moosync',
        productName: 'Moosync',
        artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
        icon: "./build/icons/512x512.png",
        win: {
          publisherName: "Moosync"
        },
        mac: {
          icon: "./build/icons/icon.icns"
        },
        linux: {
          icon: "./build/icons/",
          target: ['AppImage', 'deb', 'tar.gz', 'pacman']
        },
        nsis: {
          oneClick: false,
          perMachine: true,
        },
        fileAssociations: [{
          ext: "mp3",
          description: "Music file extension",
          role: "Viewer"
        }, {
          ext: "flac",
          description: "Music file extension",
          role: "Viewer"
        }, {
          ext: "aac",
          description: "Music file extension",
          role: "Viewer"
        }, {
          ext: "ogg",
          description: "Music file extension",
          role: "Viewer"
        }, {
          ext: "wav",
          description: "Music file extension",
          role: "Viewer"
        }, {
          ext: "m4a",
          description: "Music file extension",
          role: "Viewer"
        }, {
          ext: "webm",
          description: "Music file extension",
          role: "Viewer"
        }, {
          ext: "wv",
          description: "Music file extension",
          role: "Viewer"
        }],
        publish: [{
          provider: 'github',
          owner: 'Moosync',
          repo: 'moosync-app',
          vPrefixedTagName: true,
          releaseType: "draft"
        }],
        asarUnpack: ['*.worker.js', 'sandbox.js'],
        protocols: [
          {
            name: "Default protocol",
            schemes: [
              "moosync"
            ]
          }
        ],
        beforeBuild: "scripts/fontFix.js",
      },
      nodeIntegration: false,
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: true,
      preload: 'src/utils/preload/preload.ts',
      externals: [
        'better-sqlite3', 'vm2', 'sharp'
      ],
      chainWebpackMainProcess: (config) => {
        config.module
          .rule('babel')
          .before('ts')
          .exclude
          .add(/node_modules|regenerator-runtime|core-js|webpack/)
          .end()
          .use('babel')
          .loader('babel-loader')
          .options({
            presets: [['@babel/preset-env', { modules: false }]],
            plugins: ['@babel/plugin-proposal-class-properties', ["@babel/plugin-transform-runtime", { "regenerator": true, }], "@babel/plugin-syntax-bigint"]
          })

        config.entry("sandbox").add(__dirname + '/src/utils/extensions/sandbox/index.ts').end()
        config.plugin('thread')
          .use(ThreadsPlugin, [{ target: 'electron-node-worker' }]);
        
      },
    },
    autoRouting: {
      pages: 'src/mainWindow/pages',
      importPrefix: '@/mainWindow/pages/',
      chunkNamePrefix: 'page-'
    }
  },
}