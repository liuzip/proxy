const path = require('path')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  mode: 'production',
  entry: './src/core/index.ts',
  output: {
    path: path.resolve(__dirname + '/dist'),
    filename: 'core.bundle.js'
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
