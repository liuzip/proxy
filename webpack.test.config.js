const path = require('path')

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
  }
}
