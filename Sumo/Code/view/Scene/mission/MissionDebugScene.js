/**
 * @author lucnd
 */
var ScreenManager		 = require('../../../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../../../../NGCore/Client/GL2').GL2;
var DebugSceneController	 = require('../../../controller/mission/DebugSceneController').DebugSceneController;

var debugScene = {
	initialize: function() {
		this.controller = new DebugSceneController();
	},
	
	onEnter: function(prevScene, option) {
		this.node = new GL2.Node();
		console.log("SON:in debugScene1");
	    GUIBuilder.loadConfigFromFile("Config/Scene/mission/DebugScene.json", this.controller, function() {
	    	console.log("SON:in debugScene2:"+this.controller);
	    	this.node.addChild(this.controller.DebugScene);
	        ScreenManager.getRootNode().addChild(this.node);
	        console.log("SON:in debugScene3");
	    }.bind(this));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.MissionDebugScene = Scene.subclass(debugScene);
