const path = require('path');

module.exports = {
  mode: 'development',

  // 複数のエントリーポイントを設定
  entry: {
    game: './public/src/game.js',
    interface: './public/src/inputInterface.js'
  },

  // [name]を使って出力ファイル名を動的に設定
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public', 'dist')
  },

  plugins: [
  ]
};
