const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const glob = require('glob');
const AutoPrefixer = require('autoprefixer');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const cssNano = require('cssnano');

class THPConcatPlugin {
  constructor(options) {
    // console.log(options);
    this.options = Object.assign({}, options);
  }

  apply(compiler) {
    const $this = this;
    compiler.plugin('emit', (compilation, cb) => {
      const compilationClone = compilation;

      const arrCSS = Object.keys(compilationClone.assets).filter(
        x => $this.options.css.files.includes(x),
      );

      arrCSS.sort((a, b) => a - b);
      let css = '';
      arrCSS.map((x) => {
        // console.log(x);
        css += compilationClone.assets[x]._value;
        return delete compilationClone.assets[x];
      });

      compilationClone.assets[$this.options.css.name] = {
        source() {
          return css;
        },
        size() {
          return css.length;
        },
      };

      const arrJS = Object.keys(compilationClone.assets).filter(
        x => $this.options.js.files.includes(x),
      );

      let js = '';
      arrJS.map((x) => {
        // console.log(x);
        js += compilationClone.assets[x]._value;
        return delete compilationClone.assets[x];
      });

      compilationClone.assets[$this.options.js.name] = {
        source() {
          return js;
        },
        size() {
          return js.length;
        },
      };
      cb();
    });

    compiler.hooks.compilation.tap('THPConcatPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(
        'THPConcatPlugin',
        (data, cb) => {
          const dataClone = data;
          if (dataClone.plugin !== undefined) {
            dataClone.assets.css = [$this.options.css.name];

            const newJS = dataClone.assets.js.filter(x => !$this.options.js.files.includes(x));
            newJS.unshift($this.options.js.name);
            dataClone.assets.js = newJS;

            cb(null, dataClone);
          }
        },
      );
    });
  }
}

const generateHtmlPlugins = (templateDir, folder, ignoreScript) => {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  const htmlOutput = [];
  templateFiles.map((item) => {
    // Split names and extension
    const parts = item.split('.');
    const name = parts[0];
    if (name !== '') {
      const extension = parts[1];
      return htmlOutput.push(new HtmlWebpackPlugin({
        chunks: ['main', `page_${name}`],
        filename: folder ? `${folder}${name}.html` : `${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
        minify: false,
        production: true,
        inject: ignoreScript === undefined ? true : ignoreScript,
      }));
    }
  });

  return htmlOutput;
};

const htmlPlugins = generateHtmlPlugins('./app/views/pages');
const handlebarTemplate = generateHtmlPlugins('./app/views/handlebars', './particle/', false);

const entry = {
  main: './app/scripts/project/main.js',
};

const pages = glob
  .sync('./app/scripts/project/pages/*.js')
  .reduce((x, y) => Object.assign(x, {
    [`page_${path.basename(y, '.js')}`]: y,
  }), {});

const dynamic = glob
  .sync('./app/scripts/project/widgets/*.js')
  .reduce((x, y) => Object.assign(x, {
    [`widgets/${path.basename(y, '.js')}`]: y,
  }), {});

Object.assign(pages, dynamic);
Object.assign(entry, pages);

const resourceInSCSS = [];

module.exports = {
  mode: 'production',
  target: 'web',
  entry,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scripts/[name].min.js',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        vendor: {
          name: 'vendor',
          // sync + async chunks
          chunks: 'all',
          // import file path containing node_modules
          test: /(node_modules)/,
        },
        common: {
          name: 'common',
          chunks: 'all',
          reuseExistingChunk: true,
          enforce: true,
          test: /(truonghoangphuc)/,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: [path.resolve(__dirname, './app/assets/styles/_internal.scss')],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          }, {
            loader: 'css-loader',
            options: {
              url: (url) => {
                if (url.includes('fonts')) {
                  return true;
                }
                const n = url.split('/');
                resourceInSCSS.push({
                  context: './app/assets/images/upload/',
                  from: `**/${n[n.length - 1]}`,
                  to: 'assets/images/upload/',
                });
                return false;
              },
            },
          }, {
            loader: 'postcss-loader',
            options: {
              autoprefixer: {
                browsers: ['last 2 versions'],
              },
              plugins: () => [
                AutoPrefixer('last 2 versions', 'ie >= 10'),
              ],
            },
          }, {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        include: path.resolve(__dirname, './app/assets/styles/_internal.scss'),
        use: [
          {
            loader: 'css-loader',
          }, {
            loader: 'postcss-loader',
            options: {
              autoprefixer: {
                browsers: ['last 2 versions'],
              },
              ident: 'postcss',
              plugins: () => [
                AutoPrefixer,
              ],
            },
          }, {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.pug$/,
        use: [{
          loader: 'pug-loader',
          query: {
            pretty: true,
            self: true,
          },
        }],
      },
      {
        test: /.(fonts.*).(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/fonts/',
            publicPath: '../fonts/',
          },
        }],
      },
      {
        test: /.(images.*).(png|jpe?g|gif|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: (url, resourcePath) => {
              if (/(upload)/.test(resourcePath)) {
                return path.resolve(__dirname, resourcePath).split(`${path.sep}app${path.sep}`)[1];
              }

              return `assets/images/${url}`;
            },
          },
        }],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/styles/[name].min.css',
    }),
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssNano,
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
      canPrint: true,
    }),
    new CopyWebpackPlugin([{
      from: 'app/data',
      to: 'data',
      ignore: ['*.DS_Store'],
    }, {
      from: 'app/manifest.json',
      to: './',
    }]),
    new CopyWebpackPlugin(resourceInSCSS),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsOptions: { source: false },
    }),
  ].concat(handlebarTemplate).concat(htmlPlugins).concat([
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
    }),
    new THPConcatPlugin({
      css: {
        files: ['assets/styles/common.min.css', 'assets/styles/main.min.css'],
        name: 'assets/styles/app.min.css',
      },
      js: {
        files: ['scripts/vendor.min.js', 'scripts/common.min.js', 'scripts/main.min.js'],
        name: 'scripts/app.min.js',
      },
    }),
  ]),
};
