/**
 * @author lucnd
 */

var Core 			= require('../../../../NGCore/Client/Core').Core;
var GL2  			= require('../../../../NGCore/Client/GL2').GL2;
var SceneDirector 	= require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 	= require('../../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var ParticleEmitter = require('../../../../NGGo/Service/Graphics/ParticleEmitter').ParticleEmitter;
var Logger 			= require('../../../utils/Logger').Logger;

var mainSceneController = 
{
	
	initialize: function() {
		this.currentBattle = "";
		this.enemyTurn = false;
		this.isFightingE = false;
		this.isFighting = false;
		this._skillTypeS = 1;
		this._skillTypeE = 1;
	},

	initData: function(sumoObj, isEnemy) {
		var hp = 200;
		var ap = 1000;
		var dp = 400;
		var name = "dragon";
		
		if (isEnemy) {
			if (this.currentBattle === "Battle1") {
				ap = 600;
				dp = 300;
			} else {
				ap = 1600;
				dp = 600;
			}
		}
		
		sumoObj.hp = hp;
		sumoObj.ap = ap;
		sumoObj.dp = dp;
		sumoObj.name = name;
	},
	
	setupHero: function(hero) {		
		if(hero) {
				hero.setAnim("hero", "stand");
				this.MainGame.addChild(hero.getAnim());
		}
			
	},
	setupMonster: function(monsters) {		
		if(monsters) {
			for(var i in monsters) {
				var mon = monsters[i];
				mon.setAnim("evil", "stand");
				this.MainGame.addChild(mon.getNode());
			}
		}
	}
};

exports.MissionMainSceneController = Core.MessageListener.subclass(mainSceneController);
