const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/core/index.js',
  output: {
    path: path.resolve(__dirname + '/dist'),
    filename: 'core.bundle.js'
  }
}
