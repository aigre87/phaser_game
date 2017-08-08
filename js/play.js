/*
  Programming and art made by www.lessmilk.com
  You can freely look at the code below, 
  but you are not allowed to use the code or art to make your own games
*/



var playState = {

	create: function () {
		this.cursor = this.game.input.keyboard.createCursorKeys();
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Add player
		this.player = this.game.add.sprite(w/2, h-30, 'player');
		this.player.anchor.setTo(0.5, 1);
		game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
		this.player.body.setSize(this.player.width, this.player.height-10, 0, 0);

		// Add stars
		// var emitter = game.add.emitter(game.world.centerX, 0, 200);
		// emitter.alpha = 0.8;
		// emitter.width = game.world.width;
		// emitter.makeParticles('star');
		// emitter.minParticleScale = 0.2;
		// emitter.maxParticleScale = 0.7;
		// emitter.setYSpeed(100, 300);
		// emitter.setXSpeed(0, 0);
		// emitter.minRotation = 0;
		// emitter.maxRotation = 0;
		// emitter.start(false, 7000, 100, 0);
		// emitter.gravity = 0;

		// Init fires
	    this.fires = game.add.group();
	    this.fires.createMultiple(100, 'fire');
	    this.fires.setAll('checkWorldBounds', true);
	    this.fires.setAll('outOfBoundsKill', true);

		// Init turrets
	    this.turrets = game.add.group();
	    this.turrets.createMultiple(20, 'turret');
	    this.turrets.setAll('checkWorldBounds', true);	
	    this.turrets.setAll('outOfBoundsKill', true);	

	    // Init enemies
	    this.enemies = game.add.group();

	    // Explosion
	    this.explosion = game.add.emitter(0, 0, 50);
	    this.explosion.makeParticles('pixel');
	    this.explosion.setYSpeed(-150, 150);
			this.explosion.setXSpeed(-150, 150);
	    this.explosion.gravity = 0;

	    // Init bonus
	    this.bonuses = game.add.group();
	    this.bonuses.createMultiple(10, 'bonus');
	    this.bonuses.setAll('checkWorldBounds', true);
	    this.bonuses.setAll('outOfBoundsKill', true);

	    // Init enemyBonus
	    this.enemyBonuses = game.add.group();
	    this.enemyBonuses.createMultiple(10, 'enemyBonus');

	    // Init bullets
	    this.bullets = game.add.group();
	    this.bullets.createMultiple(20, 'bullet');
	    this.bullets.setAll('checkWorldBounds', true);
	    this.bullets.setAll('outOfBoundsKill', true);

	    // Add labels
	    var style = { font: '25px Arial', fill: '#ffffff' };
	    this.scoreLabel = game.add.text(20, 20, '0', style);
	    this.livesLabel = game.add.text(w-20, 20, '3', style);
	    this.livesLabel.anchor.setTo(1, 0);

	    // Add bonus Bar
	    this.bonusBar = this.game.add.sprite(w/2, 25, 'loading');
	    this.bonusBar.anchor.setTo(0.5, 0.5);
	    this.bonusBar.scale.setTo(0, 1);

	    // Init sounds
	    this.fireSound = game.add.audio('fire');
	    this.laserSound = game.add.audio('laser');
	    this.enemyUpgradeSound = game.add.audio('enemyUpgrade');
			this.circularSound = game.add.audio('circular');
	    this.hitSound = game.add.audio('hit');
	    this.explosionSound = game.add.audio('explosion');	
	    this.bonusSound = game.add.audio('bonus');	
	    this.music = game.add.sound('music'); 
    	if (sound) this.music.play('', 0, 0.5, true);

		// Init vars
		this.lives = 3;
		this.playerY = h-30;
		this.isFiring = false;
		this.enemyTime = game.time.now + 2000;
		this.fireTime = 0;
		this.bonusTime = 0;
		this.enemyBonusTime = 0;
		this.bonusType = 1;
		this.bulletTime = game.time.now + 5000;
		this.nextBonus = 1;
		score = 0;
	},

	update: function() {
		if (!this.player.alive) {
			if (this.laserSound.isPlaying) this.laserSound.stop();
			return;
		}

		// Collisions
		game.physics.arcade.overlap(this.player, this.bonuses, this.takeBonus, null, this);
		game.physics.arcade.overlap(this.enemies, this.fires, this.hitEnemy, null, this);
		game.physics.arcade.overlap(this.player, this.enemies, this.playerHit, null, this);
		game.physics.arcade.overlap(this.player, this.bullets, this.playerHit, null, this);
		game.physics.arcade.overlap(this.enemies, this.enemyBonuses, this.takeEnemyBonus, null, this);

		this.movePlayer();

		// Fire
		if (this.cursor.up.isDown) {
			this.isFiring = true;
			this.newFire();
		}
		else {
			if (this.laserSound.isPlaying) this.laserSound.stop();
	    	this.isFiring = false;
	    }

	    // Fire turrets
	    this.turrets.forEachAlive(function(t){
	    	if (t.time_ > this.game.time.now) 
	    		return;

	    	t.time_ = this.game.time.now + 50;
	    	this.oneFire(t.x, t.y, t.angle);
	    }, this);

	    // Add bonus
		if (this.game.time.now > this.bonusTime) {
			this.bonusTime = game.time.now + 15000;
	        this.newBonus();
	    }

	    // Add enemyBonus
		if (this.game.time.now > this.enemyBonusTime) {
			this.enemyBonusTime = game.time.now + 20000;
	        this.newEnemyBonus();
	    }

	   	if (this.game.time.now > this.enemyTime) {
			this.enemyTime = game.time.now + 700;
	        this.newEnemy();
	    }

	    // Add bullets
	   	if (this.game.time.now > this.bulletTime) {
			this.bulletTime = game.time.now + Math.max(1000 - score/4, 200);
	        this.newBullet();
	    }	    
	},

	tweenTint(obj, startColor, endColor, time = 250, delay = 0, callback = null) {
	    // check if is valid object
	    if (obj) {
	        // create a step object
	        let colorBlend = { step: 0 };
	        // create a tween to increment that step from 0 to 100.
	        let colorTween = this.game.add.tween(colorBlend).to({ step: 100 }, time, Phaser.Easing.Linear.None, delay);
	        // add an anonomous function with lexical scope to change the tint, calling Phaser.Colour.interpolateColor
	        colorTween.onUpdateCallback(() => {
	            obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
	        });
	        // set object to the starting colour
	        obj.tint = startColor;
	        // if you passed a callback, add it to the tween on complete
	        if (callback) {
	            colorTween.onComplete.add(callback, this);
	        }
	        // finally, start the tween
	        colorTween.start(); 
	    }
	},

	newFire: function() {
		if (this.game.time.now < this.fireTime)
			return;
		
		if (this.bonusType == 3) {
			if (sound) this.fireSound.play('', 0, 0.5, false);
			this.fireTime = game.time.now + 200;
			this.oneFire(this.player.x-10, this.player.y-this.player.height, 0);
			this.oneFire(this.player.x+10, this.player.y-this.player.height, 0);
		}
		else if (this.bonusType == 2) {
			if (sound) this.fireSound.play('', 0, 0.8, false);
			this.fireTime = game.time.now + 200;
			this.oneFire(this.player.x-5, this.player.y-this.player.height, -5);
			this.oneFire(this.player.x, this.player.y-this.player.height, -2);
			this.oneFire(this.player.x, this.player.y-this.player.height, 2);
			this.oneFire(this.player.x+5, this.player.y-this.player.height, 5);
		}
		else if (this.bonusType == 1) {
			if (sound) this.fireSound.play('', 0, 0.5, false);
			this.fireTime = game.time.now + 20;
			this.oneFire(this.player.x, this.player.y-this.player.height, rand(16)-8);
		}
		else if (this.bonusType == 4) {
			if (!this.laserSound.isPlaying && sound) this.laserSound.play('', 0, 1, true);
			this.fireTime = game.time.now + 15;
			this.oneFire(this.player.x, this.player.y-this.player.height, 0, 2);			
		}
		else if (this.bonusType == 5) {
			if (sound) this.circularSound.play();
			this.fireTime = game.time.now + 800;
			this.newTurret();	
		}
		else if (this.bonusType == 6) {
			if (sound) this.fireSound.play('', 0, 1, false);
			this.fireTime = game.time.now + 300;
			this.oneFire(this.player.x, this.player.y-this.player.height, 0.1);
		}

		if (this.bonusType != 4)
			game.add.tween(this.player).to({y:this.playerY+5}, 50)
	            .to({y:this.playerY}, 50).start();
	},

	oneFire: function(x, y, angle) {
	    var fire = this.fires.getFirstDead();
	    game.physics.arcade.enable(fire);
	    fire.anchor.setTo(0.5, 1);
	    fire.body.setSize(fire.width, fire.height/40, 0, 0);
	    fire.reset(x, y);
	    fire.scale.setTo(1, 1);

	    if (angle == 0.1) {
	    	fire.type = 2;
	    	fire.scale.setTo(1, 3);
	    	angle = 0;
	    }

	    fire.angle = angle;
	    game.physics.arcade.velocityFromAngle(fire.angle-90, 500, fire.body.velocity);
	},

	newTurret: function() {
		var turret = this.turrets.getFirstDead();
		game.physics.arcade.enable(turret);
		turret.anchor.setTo(0.5, 0.5);
		turret.reset(this.player.x, this.player.y-this.player.height);
		turret.body.angularVelocity = 350;
		turret.body.velocity.y = - 180;
		turret.angle = 0;
		turret.time_ = 0;
	},

	newBonus: function() {
	    var bonus = this.bonuses.getFirstDead();
	    game.physics.arcade.enable(bonus);
	    bonus.anchor.setTo(0.5, 0.5);
	    bonus.reset(rand(w-50)+25, 0-bonus.height/2+1);
	    bonus.body.velocity.y = 100;
	    bonus.body.angularVelocity = 50;
	},

	newEnemyBonus: function() {
	    var enemyBonus = this.enemyBonuses.getFirstDead();
	    game.physics.arcade.enable(enemyBonus);
	    enemyBonus.anchor.setTo(0.5, 0.5);
	    enemyBonus.reset(rand(w-100)+50, 50);
	    enemyBonus.body.velocity.y = 0;
	    enemyBonus.body.angularVelocity = 50;
	},

	newBullet: function() {
	    var bullet = this.bullets.getFirstDead();
	    if (!bullet) return;

	    game.physics.arcade.enable(bullet);
	    bullet.anchor.setTo(0.5, 0.5);
	    bullet.animations.add('move');
		bullet.animations.play('move', 4, true);
	    bullet.reset(rand(w-20)+10, 0-bullet.height/2+1);
	    bullet.body.velocity.y = 200;
	},

	takeBonus: function(player, bonus) {
		this.nextBonus += 1;
		if (this.nextBonus == 7) this.nextBonus = 2;
		this.bonusType = this.nextBonus;

		this.bonusBar.scale.setTo(1, 1);
		game.add.tween(this.bonusBar.scale).to({x:0}, 12000).start();

		game.time.events.add(12000, function(){
			if (this.laserSound.isPlaying) this.laserSound.stop();
			this.bonusType = 1;
		}, this);
	
		bonus.kill();
		game.add.tween(this.player.scale).to({x:1.4, y:1.4}, 50)
			.to({x:1, y:1}, 150).start();

		if (sound) this.bonusSound.play();
		//this.addScore(100);
	},

	newEnemy: function() {
		var enemyType = rand(3);
		if (enemyType == 0) {
			var img = 'enemy1';
			var speed = 100;
			var health = 300;
			var points = 3;
		}
		else if (enemyType == 1) {
			var img = 'enemy2';
			var speed = 200;
			var health = 50;
			var points = 1;
		}
		else if (enemyType == 2) {
			var img = 'enemy3';
			var speed = 150;
			var health = 150;
			var points = 2;
		}

	    var enemy = this.enemies.create(rand(w-50)+25, 0, img);
	    enemy.enemyType = enemyType;
	    enemy.points = points;
	    enemy.y -= enemy.height/2+1;
	    game.physics.arcade.enable(enemy);

 			enemy.checkWorldBounds = true;
	    enemy.outOfBoundsKill = false;

	    enemy.anchor.setTo(0.5, 0.5);
	    enemy.scale.setTo(1, 1);
	    enemy.body.velocity.y = speed;
	    enemy.health = health;

	    enemy.animations.add('move');
	    enemy.animations.play('move', 4, true);
	    var $this = this;
	    enemy.events.onOutOfBounds.add(function() {
	    	if( enemy.world.y > 0 ){
	    		$this.playerHit(null, enemy);
	      	enemy.kill();
	    	}
	    });

	},

	takeEnemyBonus: function(enemy, enemyBonus){
		if (!enemy.alive) return;

		game.time.events.add(12000, function(){
			if (this.enemyUpgradeSound.isPlaying) this.enemyUpgradeSound.stop();
		}, this);
	
		enemyBonus.kill();


		if (sound) this.enemyUpgradeSound.play();

		var oldVY = enemy.body.velocity.y;
		enemy.body.velocity.y = 0;
		// new 2 enemys
		game.time.events.add(200, function(){

			game.add.tween(enemy.scale).to({x:1.4, y:1.4}, 500)
			.to({x:1, y:1}, 500).start();

			this.tweenTint(enemy, 0xffffff, 0x0E7500, 500, 0, function(){

				this.tweenTint(enemy, 0x0E7500, 0xFF0000, 500, 0, function(){

					console.log(enemy);

					var oldEnemyType = enemy.enemyType;
					var oldEnemyWidth = enemy.width;
					var oldWorldPositionX =enemy.worldPosition.x;
					var oldWorldPositionY =enemy.worldPosition.y;

					enemy.alive = false;
					enemy.events.onOutOfBounds.removeAll();
					enemy.kill();

					if (oldEnemyType == 0) {
						var img = 'enemy1';
						var speed = 100;
						var health = 300;
						var points = 3;
					}
					else if (oldEnemyType == 1) {
						var img = 'enemy2';
						var speed = 200;
						var health = 50;
						var points = 1;
					}
					else if (oldEnemyType == 2) {
						var img = 'enemy3';
						var speed = 150;
						var health = 150;
						var points = 2;
					}

					for(var i=0; i<2; i++){
				    var newEnemy = this.enemies.create(oldWorldPositionX, oldWorldPositionY, img);
				    newEnemy.enemyType = oldEnemyType;
				    newEnemy.points = points;
				    game.physics.arcade.enable(newEnemy);

			 			newEnemy.checkWorldBounds = true;
				    newEnemy.outOfBoundsKill = false;

				    newEnemy.anchor.setTo(0.5, 0.5);
				    newEnemy.scale.setTo(1, 1);
				    if( i == 0){
							game.add.tween(newEnemy).to({x: oldWorldPositionX+(newEnemy.width/2)+5}, 250).start();
				    }else if( i == 1 ){
		    			game.add.tween(newEnemy).to({x: oldWorldPositionX-(newEnemy.width/2)-5}, 250).start();
				    }
				    
				    newEnemy.body.velocity.y = speed;
				    newEnemy.health = health;

				    newEnemy.animations.add('move');
				    newEnemy.animations.play('move', 4, true);
				    var $this = this;
				    newEnemy.events.onOutOfBounds.add(function() {
				    	if( newEnemy.world.y > 0 ){
				    		$this.playerHit(null, newEnemy);
				      	newEnemy.kill();
				    	}
				    });
					}

				});
			});
		}, this);
	},

	hitEnemy: function(enemy, fire) {
		if (!enemy.alive) return;

		if (fire.type == 2)
			enemy.health = 0;
		else {
			fire.kill();
			enemy.health -= 25;	
			enemy.y -= 10;
		}

		if (enemy.health <= 0) {
			enemy.alive = false;
			enemy.events.onOutOfBounds.removeAll();
			this.explosion.x = enemy.x;
			this.explosion.y = enemy.y;
			this.explosion.start(true, 600, null, 15);
			game.add.tween(enemy.scale).to({x:0, y:0}, 150).start();
			enemy.body.velocity.y = 0;
			if (sound) this.explosionSound.play();
			this.addScore(1);
		}
	},

	playerHit: function(player, enemy) {
		enemy.kill();
		if (sound && this.lives >= 0 ){
			this.hitSound.play();
			game.stage.backgroundColor = '#fff';

			game.time.events.add(50, function(){
				game.stage.backgroundColor = '#2c3e50';
			}, this);
		} 
		
		this.lives -= 1;
		this.livesLabel.text = this.lives;
		this.bonus = 5;

		if (this.lives == 0) {
			this.player.alive = false;
			if (this.laserSound.isPlaying) this.laserSound.stop();

			this.explosion.x = this.player.x;
			this.explosion.y = this.player.y-this.player.height/2;
			this.explosion.start(true, 1000, null, 30);
			this.player.kill();
			game.add.tween(this.music).to({volume:0}, 1200).start();

			game.time.events.add(1200, function(){
				this.music.stop();
				this.game.state.start('menu');
			}, this);
		}


	},

	movePlayer: function() {
		this.player.body.velocity.x = 0;

		if (this.cursor.left.isDown)
	        this.player.body.velocity.x = -450;
	    else if (this.cursor.right.isDown)
	        this.player.body.velocity.x = 450;

	    if (this.isFiring)
	    	this.player.body.velocity.x *= 0.6;
	},

	addScore: function(x) {
		score += x;
		this.scoreLabel.text = score;
	}
};

