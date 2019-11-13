const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/test.js',
  output:{
      path: path.resolve(__dirname + '/dist'),
      filename: 'test.bundle.js'
  }
}
