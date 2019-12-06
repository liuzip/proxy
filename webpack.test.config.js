const path = require('path')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  mode: 'development',
  entry: './src/core/index.js',
  output: {
    path: path.resolve(__dirname + '/src/test/dist'),
    filename: 'core.bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname + '/src/test'),
    host: 'localhost',
    port: 8080,
    open: true,
    inline: true,
  },
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
