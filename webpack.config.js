const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',

  entry: {
    bundle: path.resolve(__dirname, 'src/index.js')
  },
  output: {
    filename: '[name][contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist')
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true
  },

  module: {
    rules: [
      { 
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'] 
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({ 
      title: 'RSS-agregator',
      filename: 'index.html',
      template: 'src/template.html'
     })
  ]
}