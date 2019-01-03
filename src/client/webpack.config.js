const { resolve, join } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: resolve(__dirname, 'src'),
  entry: './index.tsx',
  output: {
    path: resolve(__dirname, '../../target/public'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(tsx?)|(js)?$/,
        include: join(__dirname, 'src'),
        exclude: [/node_modules/, /\/src\/index.html/],
        use: [
          {
            loader: 'babel-loader',
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              localIdentName: '[local]--[hash:base64:8]',
              modules: true,
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'Title',
      alwaysWriteToDisk: true,
      filename: 'index.html',
      template: './index.html',
      minify: false,
    }),
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  devServer: {
    // contentBase: join(__dirname, '/'),
    compress: true,
    port: 3000,
    hot: true
  },

};
