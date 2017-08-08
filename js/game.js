var w = 500;
var h = 800;
var score = 0;
var bestScore = 0;
var sound = 1;

var game = new Phaser.Game(w, h, Phaser.AUTO, 'gameContainer');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

game.state.start('boot');

function rand(num){ return Math.floor(Math.random() * num) };