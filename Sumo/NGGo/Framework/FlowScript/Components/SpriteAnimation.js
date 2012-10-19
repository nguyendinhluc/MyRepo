////////////////////////////////////////////////////////////////////////////////
/**
*  @author:    Chris Jimison
*  Website:    http://www.ngmoco.com
*  Copyright:  2010, by ngmoco:) llc
*              Unauthorized redistribution of source code is 
*              strictly prohibited. Violators will be prosecuted.
* 
*  @brief:     
*/
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class = require('../../../Foundation/Class').Class;
var Component = require('../Component').Component;
var UUID = require('../Component').UUID;
var AnimationManager = require('../../../Framework/AnimationManager').AnimationManager;

////////////////////////////////////////////////////////////////////////////////
// Class SpriteAnimation
exports.SpriteAnimation = Component.subclass(
/** @lends Framework.FlowScript.SpriteAnimation.prototype */
{
    classname : "SpriteAnimation",
   

    _onReceive : function(port, ip)
    {
        ip.active.setAnimation( AnimationManager.getAnimationGL2( this._iip.required.group,
                                                                  this._iip.required.type), 0);
        this.send(0, ip);
    }

}); // end of class SpriteAnimation

exports.SpriteAnimation.factoryUUID = UUID.SPRITE_ANIMATION;

