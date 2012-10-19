var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var MissionCompleteDetailController = require("../Controller/MissionCompleteDetailController").MissionCompleteDetailController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.MissionCompleteDetailScene = Scene.subclass({
    classname: "MissionCompleteDetailScene",
    sceneName: "MissionCompleteDetailScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new MissionCompleteDetailController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/MissionCompleteDetailView.json",
            self.controller,
            function (e) {
                Layer.addRootChild(self.controller.MissionCompleteDetailView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.MissionCompleteDetailView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
