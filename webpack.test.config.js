const path = require('path')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  mode: 'development',
  entry: './src/core/index.ts',
  output: {
    path: path.resolve(__dirname + '/test/dist'),
    filename: 'core.bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname + '/test'),
    host: 'localhost',
    port: 8080,
    open: true,
    inline: true,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  plugins: [
    new CheckerPlugin()
  ]
}
