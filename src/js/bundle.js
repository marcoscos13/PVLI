(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');
//var TestScene = require('./test_scene.js');
//var TestScene2 = require('./test_scene2.js');
//var Stack = require('./stack.js');
//var Inheritance = require('./inheritance.js');

var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
    //this.game.load.image('preloader_bar', 'images/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('preloader');
  }
};


var PreloaderScene = {
  preload: function () {
    //this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    //this.loadingBar.anchor.setTo(0, 0.5);
    //this.load.setPreloadSprite(this.loadingBar);

    // TODO: load here the assets for the game    
    this.game.load.baseURL = 'https://marcoscos13.github.io/CombatCity/src/';
    this.game.load.crossOrigin = 'anonymous';
    this.game.load.image('logo', 'images/phaser.png');
    this.game.load.image('tank', 'images/tanque.png');
    this.game.load.image('muro', 'images/muro.png');
    this.game.load.image('metal', 'images/metal.png');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('white', 'images/white.png');
  },

  create: function () {
    this.game.state.start('play');
  }
};


window.onload = function () {
  var game = new Phaser.Game(900, 700, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene); //Escena de juego
  //game.state.add('play', TestScene); //Escena de testing ------------------------------
  //game.state.add('play', TestScene2); //Escena de testing 2 ------------------------------

  game.state.start('boot');
};

},{"./play_scene.js":2}],2:[function(require,module,exports){
'use strict';

var player;
var cursors;
var bloquesGroup;
var bulletsGroup;
var wallsGroup;
var objectsScale = new Par(3, 3);

var bulletVel;
var bulletTime;
var bullet;

var blockSize = 48;

var PlayScene = {
    preload: function(){
        this.load.text('level01', 'levels/level01.json');
    },

    create: function(){

        //Físicas
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#2d2d2d';
        cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        //Fondo negro
        var bg = this.game.add.image((this.game.width - blockSize*13)/2, (this.game.height - blockSize*13)/2,'background');
        bg.height = blockSize*13;
        bg.width = blockSize*13;

        //Creación de Bloques

        this.levelData = JSON.parse(this.game.cache.getText('level01')); //Parsea el JSON

        bloquesGroup = this.game.add.group();
        bloquesGroup.enableBody = true;
        bloquesGroup.physicsBodyType = Phaser.Physics.ARCADE;

        for (var j = 0; j < 13; j++){
            for (var i = 0; i < 13; i++){
                var BloquePos = getCell(this.game,i,j);
                var bloque;
                var row = this.levelData.map[j].row;
                var blockCreated = true; //Bool para controlar si ha creado algun bloque

                if (row.charAt(i*2) == '1') //Si es ladrillo
                    bloque = new Collider(this.game, BloquePos, objectsScale, 'muro');
                else if (row.charAt(i*2) == '2') //Si es metal
                    bloque = new Collider(this.game, BloquePos, objectsScale, 'metal');
                else blockCreated = false;

                if (blockCreated){
                    bloque.body.immovable = true;
                    bloque.anchor.setTo(0,0);
                    bloque.body.collideWorldBounds = true;
                    bloquesGroup.add(bloque);
                }
            }
        }


        //Parades límite
        wallsGroup = this.game.add.group();
        var posZero = new Par(0,0);
        var wallScale = new Par(3, 3);

        //Muro Invisible Izquierda
        var wallL = new Collider(this.game, posZero, wallScale, 'white');
        wallL.anchor.setTo(0,0);
        wallL.body.immovable = true;
        wallL.height = 13*blockSize;
        wallL.y = (this.game.height - (13*blockSize))/2;
        wallL.body.collideWorldBounds = true;
        wallL.width = (this.game.width - (13*blockSize))/2;
        wallL.visible = false;
        wallsGroup.add(wallL);

        //Muro Invisible Derecha
        var wallR = new Collider(this.game, posZero, wallScale, 'white');
        wallR.anchor.setTo(0,0);
        wallR.body.immovable = true;
        wallR.height = 13*blockSize;
        wallR.y = (this.game.height - (13*blockSize))/2;
        wallR.x = this.game.width/2 + 13*blockSize;
        wallR.body.collideWorldBounds = true;
        wallR.width = (this.game.width - (13*blockSize))/2;
        wallR.visible = false;
        wallsGroup.add(wallR);

        //Muro Invisible Arriba
        var wallU = new Collider(this.game, posZero, wallScale, 'white');
        wallU.anchor.setTo(0,0);
        wallU.body.immovable = true;
        wallU.width = this.game.width;
        wallU.height = (this.game.height - 13*blockSize)/2
        wallU.body.collideWorldBounds = true;
        wallU.visible = false;
        wallsGroup.add(wallU);

        //Muro Invisible Arriba
        var wallD = new Collider(this.game, posZero, wallScale, 'white');
        wallD.anchor.setTo(0,0);
        wallD.body.immovable = true;
        wallD.width = this.game.width;
        wallD.height = (this.game.height - 13*blockSize)/2
        wallD.y = this.game.height/2 + 13*blockSize;
        wallD.body.collideWorldBounds = true;
        wallD.visible = false;
        wallsGroup.add(wallD);

        //Creación del player
        var playerPos = getCell(this.game, 6, 13);
        playerPos._x += 24;
        playerPos._y += 24;
        var playerVel = new Par(140, 140);
        var playerDir = new Par (0, 0);

        //Balas y arma del jugador
        bulletVel = 300;
        bulletTime = 450;
        //Se inicializa el grupo de las balas
        bulletsGroup = this.game.add.group();
        bulletsGroup.enableBody = true;
        bulletsGroup.physicsBodyType = Phaser.Physics.ARCADE;
    
        //Se crean las balas y se añaden al grupo
        for (var i = 0; i < 1; i++){ //i = numero de balas
            var bloque = this.game.add.sprite(0, 0, 'muro');
            bloque.name = "muro" + i;
            bloque.exists = false;
            bloque.visible = false;
            bloque.checkWorldBounds = true;
            bloque.anchor.setTo(0.5, 0.5);
            bloque.events.onOutOfBounds.add(resetBullet, this);
            bulletsGroup.add(bloque);
        }

        //Player
        player = new Player(this.game, playerPos, objectsScale, playerVel, playerDir, bulletsGroup, bulletVel, bulletTime,  cursors, 'tank');
        player.body.collideWorldBounds = true;
        player._direction._x = 1;
        player._direction._y = 0;
        
    },
    
    update: function(){
        this.game.physics.arcade.collide(player, bloquesGroup);
        this.game.physics.arcade.collide(player, wallsGroup);
        this.game.physics.arcade.overlap(bulletsGroup, bloquesGroup, collisionHandler, null, this);
        this.game.physics.arcade.overlap(bulletsGroup, wallsGroup, resetBullet, null, this);
        // //Provisional, esto hay que meterlo en el update de Player ---------------------------------------------------------------------
        // if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        // {
        //     fireBullet(this);
        // }
    },

    render: function(){
        // this.game.debug.text( "PlayScene", 50, 60 );
        // this.game.debug.text( "Direction X: " + player._direction._x, 50, 80 );
        // this.game.debug.text( "Direction Y: " + player._direction._y, 50, 100 );
        // this.game.debug.text( "Player X: " + player.x, 50, 120 );
        // this.game.debug.text( "Player Y: " + player.y, 50, 140 );
    }
};

module.exports = PlayScene;

//'Struct' para pares
function Par(x, y)
{
    this._x=x;
    this._y=y;
}

function getCell(game, x, y){
    var temp_x = game.width/2 - (blockSize * 13)/2;
    var temp_y = game.height/2 - (blockSize * 13)/2;
    for (var i = 0; i < x; i++){
        temp_x += blockSize;
    }
    for (var j = 0; j < y; j++){
        temp_y += blockSize;
    }
    var pos = new Par(temp_x, temp_y);
    return pos;
}

// Called if the bullet goes out of the screen
function resetBullet (bullet) {
    bullet.kill();
}

// Called if the bullet hits one of the block sprites
function collisionHandler (bullet, block) {
    bullet.kill();
    block.kill();
}
},{}]},{},[1]);