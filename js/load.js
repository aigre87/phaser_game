
var bootState = {
	preload: function () {
		game.stage.backgroundColor = '#2c3e50';
		game.load.image('loading', 'assets/images/loading.png');
		game.load.image('loading2', 'assets/images/loading2.png');
	},
	create: function() {
		this.game.state.start('load');
	}
};


var loadState = {
	preload: function () {
	    label2 = game.add.text(Math.floor(w/2)+0.5, Math.floor(h/2)-15+0.5, 'Загрузка...', { font: '30px Arial', fill: '#fff' });
		label2.anchor.setTo(0.5, 0.5);

		preloading2 = game.add.sprite(w/2, h/2+15, 'loading2');
		preloading2.x -= preloading2.width/2;
		preloading = game.add.sprite(w/2, h/2+19, 'loading');
		preloading.x -= preloading.width/2;
		game.load.setPreloadSprite(preloading);

		game.load.image('player', 'assets/images/player.png');
		game.load.image('star', 'assets/images/star.png');
		game.load.image('pixel', 'assets/images/pixel.png');
		game.load.image('fire', 'assets/images/tear.png');
		game.load.image('bonus', 'assets/images/bonus3.png');
		game.load.image('enemyBonus', 'assets/images/enemyBonus.png');
		game.load.image('turret', 'assets/images/turret3.png');
		game.load.spritesheet('enemy1', 'assets/images/enemyk11.png', 56, 72);
		game.load.spritesheet('enemy2', 'assets/images/enemyk51.png', 40, 40);
		game.load.spritesheet('enemy3', 'assets/images/enemyk41.png', 40, 40);
		game.load.spritesheet('bullet', 'assets/images/bullet.png', 16, 32);
		game.load.spritesheet('sound', 'assets/images/sound.png', 28, 22);

		game.load.audio('music', 'assets/sounds/music.wav');
		game.load.audio('fire', 'assets/sounds/fire2.wav');
		game.load.audio('circular', 'assets/sounds/circular.wav');
		game.load.audio('laser', 'assets/sounds/laser3.wav');
		game.load.audio('bonus', 'assets/sounds/bonus2.wav');
		game.load.audio('hit', 'assets/sounds/hit2.wav');
		game.load.audio('enemyUpgrade', 'assets/sounds/enemyUpgrade.wav');
		game.load.audio('explosion', 'assets/sounds/explosion2.wav');
	},
	create: function () {
		game.state.start('menu');
	}
};
