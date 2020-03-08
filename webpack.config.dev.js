require('core-js/stable');
require('regenerator-runtime/runtime');

const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
const AutoPrefixer = require('autoprefixer');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const generateHtmlPlugins = (templateDir, folder, ignoreScript) => {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  const htmlOutput = [];
  templateFiles.map((item) => {
    // Split names and extension
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];
    return htmlOutput.push(new HtmlWebpackPlugin({
      chunks: ['main', `${name}`, 'development'],
      filename: folder ? `${folder}${name}.html` : `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      minify: false,
      production: false,
      inject: ignoreScript === undefined ? true : ignoreScript,
    }));
  });

  return htmlOutput;
};

const htmlPlugins = generateHtmlPlugins('./app/views/pages');
const handlebarTemplate = generateHtmlPlugins('./app/views/handlebars', './particle/', false);

const entry = {
  main: './app/scripts/project/main.js',
  development: './app/scripts/project/development.js',
};

const pages = glob
  .sync('./app/scripts/project/pages/*.js')
  .reduce((x, y) => Object.assign(x, {
    [path.basename(y, '.js')]: y,
  }), {});

// const dynamic = glob
//   .sync('./app/scripts/project/widgets/*.js')
//   .reduce((x, y) => Object.assign(x, {
//     [path.basename(y, '.js')]: y,
//   }), {});

// Object.assign(pages, dynamic);
Object.assign(entry, pages);

module.exports = {

  mode: 'development',
  entry,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
  },
  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT || 3200,
    contentBase: './app',
    watchContentBase: true,
    https: true,
    watchOptions: {
      ignored: ['test'],
    },
    allowedHosts: [
      'thp.test',
    ],
  },
  devtool: 'source-map',
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
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
              hmr: true,
            },
          }, {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          }, {
            loader: 'postcss-loader',
            options: {
              autoprefixer: {
                browsers: ['last 2 versions'],
              },
              plugins: () => [
                AutoPrefixer,
              ],
            },
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
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
            exports: false,
          },
        }],
      },
      {
        test: /.(fonts.*).(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        }],
      },
      {
        test: /.(images.*).(png|jpe?g|gif|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        }],
      },
    ],
  },
  plugins: [].concat(handlebarTemplate).concat(htmlPlugins).concat([
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
    }),
  ]),
};
