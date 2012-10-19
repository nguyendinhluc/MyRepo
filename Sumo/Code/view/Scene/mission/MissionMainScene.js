/**
 * @author sonnn
 */
var ScreenManager		 = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../../NGCore/Client/GL2').GL2;
var MainSceneController	 = require('../../../controller/mission/MainSceneController').MainSceneController;
var SceneDirector 		 = require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var Sumo		 		 = require('../../../model/Entity/Sumo').Sumo;
var Monster		 		 = require('../../../model/Entity/Monster').Monster;
var Skill		 		 = require('../../../model/Entity/Skill').Skill;
var GlobalParameter 	 = require('../../../utils/GlobalParameter').GlobalParameter;
var Mission		 		 = require('../../../model/Entity/Mission').Mission;
var Hero		 		 = require('../../../model/Entity/Hero').Hero;

var mainScene = {
	initialize: function() {
		this.controller = new MainSceneController();
		
		this.mission = new Mission();
		this.monsters = {};
		this.hero = {}
		
		if(this.mission && this.mission.data && this.mission.data.monsters) {
			for(var i = 0; i < this.mission.data.monsters.length; i++ ) {
				var mon = new Monster(this.mission.data.monsters[i]);
				mon.setPosition(this.mission.data.monsters[i].x, this.mission.data.monsters[i].y);
				this.monsters[this.mission.data.monsters[i].monster_id] = mon;
			}
		}

		if(this.mission && this.mission.data && this.mission.data.hero) {
			this.hero = new Hero(this.mission.data.hero);
			this.hero.setPosition(this.mission.data.hero.x, this.mission.data.hero.y);
		}
		
	    this.controller.offsetX = GlobalParameter.battle.enemy.x + 40 - (GlobalParameter.battle.player.x - 40);
	},
	
	onEnter: function(prevScene, option) {
		this.controller.currentBattle = option;
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/mission/MainScene.json", this.controller, function ()
	    {
	    	ScreenManager.getRootNode().addChild(this.node);
	    	this.controller.MainGame.setDepth(0);
	    	this.node.addChild(this.controller.MainGame);
	    	this.controller.setupHero(this.hero);
	    	this.controller.setupMonster(this.monsters);
	    	
	    }.bind(this));
	},

	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.MissionMainScene = Scene.subclass(mainScene);
