const path = require('path');

module.exports = {
  mode: 'development',

  entry: {
    game: './public/src/game.js',
    index: './public/src/index.js',
    player1: './public/src/player1.js',
    p1Desc: './public/src/p1Desc.js',
    player2: './public/src/player2.js',
    p2Desc: './public/src/p2Desc.js',
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public', 'dist')
  },

  plugins: [
  ]
};
