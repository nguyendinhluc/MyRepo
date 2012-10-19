////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class     = require('../..//NGCore/Client/Core/Class').Class;
var GL2     = require('../..//NGCore/Client/GL2').GL2;
var Storage = require('../../NGCore/Client/Storage').Storage;
var NGGOError = require('../Foundation/NGGOError').NGGOError;

////////////////////////////////////////////////////////////////////////////////

exports.AnimationManager = Class.singleton(
/** @lends Framework.AnimationManager.prototype */
{
    /**
     * Error code of <code>AnimationManager</code> class.
     * @namespace ERROR
     */
    ERROR:
    {
        INVALID_TYPE: 1,
        INVALID_PATH: 2,
        FILE_READ_ERROR: 3,
        NETWORK_ERROR: 4,
        ASSET_NOT_FOUND: 5,
        FILE_NOT_FOUND: 404,
        PARSE_ERROR: 10
    },
    /**
     * @class The <code>AnimationManager</code> is the main “Gateway” object for constructing and playing animations.
     * <br><br>
     * The animation manager has the following properties:
     * <ul>
     * <li>Factory object for the AnimationController objects.</li>
     * <li>Monitors and manages the cache of “loaded” animations.</li>
     * <li>Manages the animation definitions that can be used by the system.</li>
     * </ul>
     * @constructs Constructor for the the object
     * @param {Array} sourceArray Array of objects defined as { src : {gl2.node}, name : {string} }
     * @param {Object} observer Object that will get the callbacks for the system
     * @name Framework.AnimationManager
     * @augments Core.Class
     */
    initialize : function()
    {
        //var gAnimationsCachedByProtoId = [];
        //var gAnimationsByNameCachedByProtoId = [];
        this.mAnimationMap = null;
        this.mAnimationMeta = null;

        this.mCacheSize = 0;
        this.mMaxCacheSize = -1;
        this.mAnimationCache = {};
        this.mAtlasRoot = "Content";
    },

    /**
     * Setter method for the content root the manager will use to fish out the sprite sheets.
     * @param {String} root Content root data.
     */
    setContentRoot : function(root)
    {
        this.mAtlasRoot = root;
    },

    /**
     * Loads the configuration from a flat file.
     * <br><br>
     * First parameter of callback function is error.
     * @param {String} animationFile The animation map file name.
     * @param {Function} [callback] Callback faunction it is called when loading is finished.
     */
    loadConfigFromFile : function(animationFile, callback)
    {
        // Read the animation file
        var fs = Storage.FileSystem;
        var self = this;
        var error;
        callback = callback || function() {};
        fs.readFile(animationFile, function(err, data)
        {
            if(err)
            {
                // We could not read the given animation file
                console.log("[ngGo AnimationManager: loadConfigFromFile] " +
                            "could not read the main animation file");
                error = new NGGOError(this.ERROR.INVALID_PATH,
                                      "AnimationManager: Error occured when reading "
                                       + animationFile);
                callback(error);
            }
            else
            {
                var parseSuccess = true;
                var configFiles = null;
                // Parse the json data
                try
                {
                    configFiles = JSON.parse(data);
                }
                catch(ex)
                {
                    parseSuccess = false;
                    console.log("[ngGo AnimationManager: loadConfigFromFile] " +
                                "Could not parse the main json data");
                    error = new NGGOError(this.ERROR.PARSE_ERROR,
                                         "AnimationManager: JSON Parse error in, "
                                         + animationFile + "  " + ex);
                    callback(error);
                }

                if(parseSuccess)
                {
                    if(configFiles.data)
                    {
                        // 1) Load the animation file
                        fs.readFile(configFiles.data, function(err2, dataData)
                        {
                            if(err2)
                            {
                                console.log("[ngGo AnimationManager: loadConfigFromFile] " +
                                            "could not read the animation definition file: " +
                                            configFiles.data);
                                error = new NGGOError(this.ERROR.INVALID_PATH,
                                          "AnimationManager: Error occured when reading "
                                          + configFiles.data);
                                callback(error);
                            }
                            else
                            {
                                // So the meta info is optional BUT if it is defined
                                // it must be valid!!!
                                if(configFiles.meta)
                                {
                                    fs.readFile(configFiles.meta, function(err3, dataMeta)
                                    {
                                        if(err3)
                                        {
                                            console.log("[ngGo AnimationManager: loadConfigFromFile] " +
                                                        "could not read the animation meta file: " +
                                                        configFiles.meta);
                                            error = new NGGOError(this.ERROR.INVALID_PATH,
                                              "AnimationManager: Error occured when"
                                              + " reading " + configFiles.meta);
                                            callback(error);
                                        }
                                        else
                                        {
                                            error = self.loadConfigFromData(dataData, dataMeta);
                                            callback(error);
                                        }
                                    });
                                }
                                else
                                {
                                    error = self.loadConfigFromData(dataData);
                                    callback(error);
                                }
                            }
                        });
                    }
                    else
                    {
                        console.log("[ngGo AnimationManager: loadConfigFromFile] " +
                                    "No data defined.");
                        error = new NGGOError(this.ERROR.NO_DATA_ERROR,
                                  "AnimationManager: No data is in "
                                  + animationFile);
                        callback(error);
                    }
                }
            }
        });
    },

    /**
     * Loads the configuration from a data set.
     * @param {String} animData JSON data which should be JSON data.
     * @param {String} metaData JSON data for the meta information.
     * @returns {Number} Error code (0:ok 1:error)
     */
    loadConfigFromData : function(animData, metaData)
    {
        var error;
        try
        {
            this.mAnimationMap = JSON.parse(animData);
        }
        catch(err)
        {
            // We hit an error parse on the json.  This is bad
            console.log("[ngGo AnimationManager: loadConfigFromData] " +
                        "could not parse the animation map json");
            error = new NGGOError(this.ERROR.NO_DATA_ERROR,
                      "AnimationManager: Could not parse the animation map json");
        }

        if(!error)
        {
            if(metaData)
            {
                try
                {
                    this.mAnimationMeta = JSON.parse(metaData);
                }
                catch(err2)
                {
                    // We hit an error parse on the json.  This is bad
                    console.log("[ngGo AnimationManager: loadConfigFromData] " +
                                "could not parse the animation meta json");
                    error = new NGGOError(this.ERROR.NO_DATA_ERROR,
                               "AnimationManager: Could not parse the animation meta json");
                }
            }
        }
        return error;
    },

    /**
     * Resets the AnimationManager and all its data
     */
    reset : function()
    {
        this.mAnimationMap = null;
    },

    /**
     * Accessor for the animation map data
     * @returns {Object} animation map used by the system
     */
    getAnimationMap : function()
    {
        return this.mAnimationMap;
    },

    /**
     * Gets the number of frames for a given group/animation.
     * @param {String} group Group name.
     * @param {String} animation Animation name.
     * @returns {Number} If invalid name or anim -1 is returned otherwise the count it returned.
     */
    getFrameCount : function(group, animation)
    {
        var count = -1;
        if(this.mAnimationMap)
        {
            var groupObj = this.mAnimationMap.atlas[group];
            if(groupObj && groupObj.type)
            {
                var anim = groupObj.type[animation];
                if(anim)
                {
                    count = anim.length;
                }
            }
        }
        return count;
    },

    /**
     * Returns the list of frameData for a given group and animation.
     * @param {String} group Group name.
     * @param {String} animation Animation name.
     * @returns {Array} List of frameData. If it not found, returns <code>null</code>
     */
    getFrameData : function(group, animation)
    {
        var frames = null;
        if(this.mAnimationMap)
        {
            var groupObj = this.mAnimationMap.atlas[group];
            if(groupObj && groupObj.type)
            {
                frames = groupObj.type[animation];
            }
        }
        return frames;
    },

    /**
     * Constructs GL2.Animation class from sprite atlas.
     * @param {String} group Group name.
     * @param {String} animation Animation name.
     * @returns {GL2.Sprite}
     */
    getAnimationGL2 : function(group, animationDef, frameDuration)
    {
        var  animation = null;
        if(this.mAnimationMap)
        {
            var groupObj = this.mAnimationMap.atlas[group];
            if(groupObj && groupObj.type)
            {
                var frames = groupObj.type[animationDef];
                if(frames)
                {
                    var cacheAnim = this._getCachedAnimation(group, animationDef);
                    if(cacheAnim)
                    {
                        animation = cacheAnim;
                    }
                    else
                    {
                        // Construct that animation from the given name...
                        animation = this._loadAnimation(group, animationDef, frames, groupObj.meta.asset, groupObj.meta.size, null, frameDuration);
                    }
                }
            }
        }
        return animation;
    },
    /**
     * Accessor to the motion data defined in JSON
     * @param {String} motionName Motion name.
     * @returns         Returns the raw json object or null if motion does not exists.
     *                  Currently the caller must check for null and parse the data.
     *                  The class {MotionController} does this already and is suggested
     *                  for use.
     */
    getMotionData : function(motionName)
    {
        var motion = null;

        if( this.mAnimationMap &&
            this.mAnimationMap.motions &&
            this.mAnimationMap.motions[motionName])
        {
            motion = this.mAnimationMap.motions[motionName];
        }

        return motion;
    },

    /** @private */
    _getCachedAnimation : function(group, animationDef)
    {
        var anim = null;
        if(this.mAnimationCache && this.mAnimationCache[group])
        {
            anim = this.mAnimationCache[group][animationDef];
        }
        return anim;
    },

    /** @private */
    _loadAnimation : function(group, animationName, animationFrames, spriteSheetAsset, spriteSheetSize, animationMeta, frameDuration)
    {
        // Check the arguments
        var animLen = animationFrames.length;

        // Default we will assume 10fps of animation per second
        // I should really document this somewhere....
        var frameDelay = frameDuration;

        var animation = new GL2.Animation();
        var idx;
        for(idx = 0; idx < animLen; ++idx)
        {
            var frame = animationFrames[idx];
            // It is possible you may have some null values.  These SHOULD have been
            // caught by the mapping tools but just in case they were not it doesn't
            // hurt to pull a little check... just a little on....
            if(frame)
            {
                var uvOne = ((frame.loc[0]*1.0)/(spriteSheetSize[0]*1.0));
                var uvTwo = ((frame.loc[1]*1.0)/(spriteSheetSize[1]*1.0));
                var uvThree = (frame.loc[0]*1.0+frame.size[0]*1.0)/(spriteSheetSize[0]* 1.0);
                var uvFour = (((frame.loc[1]*1.0)+(frame.size[1]*1.0))/(spriteSheetSize[1]*1.0));
                var width = frame.size[0]*1.0;
                var height = frame.size[1]*1.0;

                var xOff = 0.5 - (frame.off[0]*1.0)/(frame.size[0]);
                var yOff = 0.5 + (frame.off[1]*1.0)/(frame.size[1]);

                var uvs;
                if(frame.rot)
                {
                    console.log("[ngGo AnimationManager: _loadAnimation] " +
                        "The sprite sheet containes rotated sprites and ngCore currently does not allow this.\n"+
                        "Please change your data associated with sprite sheet: " + spriteSheetAsset);

                }
                uvs = [uvOne, uvTwo, uvThree - uvOne, uvFour - uvTwo];

                var gl2Frame = new GL2.Animation.Frame(this.mAtlasRoot + '/' + spriteSheetAsset,
                                                    frameDelay,
                                                    [width, height],
                                                    [xOff, yOff],
                                                    uvs);
                animation.pushFrame(gl2Frame);
            }
        }

        // Now lets store this guy into the cache
        if(this.mCacheSize < this.mMaxCacheSize || -1 === this.mMaxCacheSize)
        {
            if(!this.mAnimationCache[group])
            {
                this.mAnimationCache[group] = {};
            }

            this.mAnimationCache[group][animationName] = animation;
            ++this.mCacheSize;
        }

        return animation;
    }
});
