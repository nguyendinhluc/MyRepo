var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var LevelUpDetailController = require("../Controller/LevelUpDetailController").LevelUpDetailController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.LevelUpDetailScene = Scene.subclass({
    classname: "LevelUpDetailScene",
    sceneName: "LevelUpDetailScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new LevelUpDetailController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/LevelUpDetailView.json",
            self.controller,
            function (e) {
                Layer.addRootChild(self.controller.LevelUpDetailView, Layer.Depth.TOP);
                self.controller.onSceneLoaded();
            }
        );
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
        this.controller.active();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        Layer.removeRootChild(this.controller.LevelUpDetailView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
