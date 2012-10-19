/********************************************************************************************
 * Class Name: MainGame 
 * 
 * @Description: 
 * 
 *******************************************************************************************/

var Core					= require('../../NGCore/Client/Core').Core;
var GL2						= require('../../NGCore/Client/GL2').GL2;
var ConfigurationManager    = require('../../NGGo/Framework/ConfigurationManager').ConfigurationManager;
var ScreenManager			= require('../../NGGo/Service/Display/ScreenManager').ScreenManager;
var SceneDirector 			= require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 			= require('../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
//var MissionMainScene 		= require('../module/mission/view/Scene/MissionMainScene').MissionMainScene;
//var MissionDebugScene 		= require('../module/mission/view/Scene/MissionDebugScene').MissionDebugScene;
var MissionScene	 		= require('../module/mission/MissionScene').MissionScene;

exports.MainGame_Mission = Core.Class.subclass({
	initialize:function() {
	    NgLogD("++++ MainGame");
	    this.registerScenes();
	    
	    ConfigurationManager.begin(function (err)
	    {
	        if (err)
	        {
	            console.log("Something went very wrong: " + err);
	        } else {
	            var w1 = Core.Capabilities.getScreenWidth();
	            var h1 = Core.Capabilities.getScreenHeight();
	            platformOS = Core.Capabilities.getPlatformOS();
	            
	            var w = 480;
	            var h = 320;
	            var onload = function() {
				        if (platformOS === 'Android') {
				        	w = h1/1.5;
				        	h = w1/1.5;
				        } 
				        
				        ScreenManager.register(
				        {
				            type: "LetterBox",
				            name: "GUI",
				            logicalSize: [w, h]
				        });
				        
				        ScreenManager.setDefault("GUI");
				        
				        if (platformOS === 'Android') {
				        	var scale = ScreenManager.screenSetting._scale;
				        	var ws = scale * w1;
				        	var hs = scale * h1;
				        	//var path = "/?q=BEGIN&scale=" + scale +"&ws=" + ws + "&hs=" + hs + "&w1=" + w1 + "&h1="+h1;
				        	//ServerConsole.log(path);
					        var backdrop2 = new GL2.Sprite();
					        backdrop2.setImage("Content/bg1.png", [h1 - scale * w1, w1], [0, 0]);
					        backdrop2.setDepth(65535);
					        backdrop2.setPosition(ws, 0);
					        GL2.Root.addChild(backdrop2);
				        
				        }
				        
				        GL2.Root.addChild(ScreenManager.getRootNode());
				        
				        Core.UpdateEmitter.setTickRate(0.05);
				        
						// Push main scene
				    	//SceneDirector.push("MISSION_DEBUG_SCENE");
				    	SceneDirector.push("MISSION_SCENE");
	                };
	                
	            ScreenManager.setLandscape(onload);
	        }
	    });
	},
	
	registerScenes: function() {
		console.log("SON:in registerScenes");
		//SceneFactory.register(MissionDebugScene, "MISSION_DEBUG_SCENE");
    	//SceneFactory.register(MissionMainScene, "MISSION_MAIN_SCENE");
    	SceneFactory.register(MissionScene, "MISSION_SCENE");
	}
});
