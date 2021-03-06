////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Harris Khurram
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// ngCore
var Class              = require('../../NGCore/Client/Core/Class').Class;
var GL2                = require('../../NGCore/Client/GL2').GL2;
var GLUI               = require('../../NGGo/GLUI').GLUI;
var State              = require('../../NGCore/Client/UI').UI.State;
var Capabilities       = require('../../NGCore/Client/Core/Capabilities').Capabilities;
var FileSystem         = require('../../NGCore/Client/Storage/FileSystem').FileSystem;
var OrientationEmitter = require('../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;

// ngGo
var ServerSync         = require('../Service/Data/ServerSync').ServerSync;

exports.GUIBuilder = ServerSync.singleton(
/** @lends Framework.GUIBuilder.prototype */
{
    classname: 'GUIBuilder',
    /**
     * @class The <code>Builde</code> class is a Singleton class for
     * craeting GLUI and GL2 element against json.
     * @constructs The default constructor.
     * @status Android, Flash
     */
    initialize: function()
    {
        this._basePath = "";
        this._defaultAnchor = [0, 0];
        this._defaultUVs = [0, 0, 1, 1];
        this._defaultDepth = 20000;
        this._defaultFont = 'Arial';
        this._defaultSize = [128, 128];
        this._defaultFontLocation = GL2.Text.FontLocation.Default;
        this._userDefinedTypes = [];
    },
    /**
     * Creates the components from JSON string or JS object.
     * @name Framework.GUIBuilder#loadConfigFromData
     * @example var controller = {};
     * Framework.GUIBuilder.loadConfigFromData(aJSONDef, controller);
     * @param {String} jsonData The JSON format to extract GLUI and Gl2 component.
     * @param {Object} controller The object to store all nodes.
     * @status Android, Test
     * @function
     */
    /**
     * Takes JSON file or URI for JSON to iterarate the component and store all nodes in controller.
     * @name Framework.GUIBuilder#loadConfigFromFile
     * @example var controller = {};
     * Framework.GUIBuilder.loadConfigFromFile("./Content/infowindow.json", controller, function(error, data) {
     *
     * });
     * @param {String} jsonData The JSON format to extract GLUI and Gl2 component.
     * @param {Object} controller The object to store all nodes.
     * @status Android, Test
     * @function
     */
    /**
     * Gets the base path for images.
     * @returns {String} Base path
     */
    get basePath()
    {
        return this._basePath;
    },
    /**
     * Sets the base path for images.
     * Default value of this parameter is <code>""</code>.
     * @param {String} basePath Image base path
     */
    set basePath(value)
    {
        this._basePath = value;
    },
    /**
     * Gets the default anchor for images
     * @returns {Number[]} Default anchor
     */
    get defaultAnchor()
    {
        return this._defaultAnchor.slice();
    },
    /**
     * Sets the default anchor for images.
     * Default value of this parameter is <code>[0, 0]</code>.
     * @param {Number[]} anchor Default anchor.
     */
    set defaultAnchor(value)
    {
        this._defaultAnchor = value;
    },
    /**
     * Gets the default font for text.
     * @returns {String} Default anchor
     */
    get defaultFont()
    {
        return this._defaultFont;
    },
    /**
     * Sets the default font for text.
     * Default value of this parameter is <code>'Arial'</code>.
     * @param {String} font Default font.
     */
    set defaultFont(value)
    {
        this._defaultFont = value;
    },
    /**
     * Gets the default font location for text.
     * @returns {GL2.Text.FontLocatio} Default font location
     */
    get defaultFontLocation()
    {
        return this._defaultFontLocation;
    },
    /**
     * Sets the default font location for text.
     * Default value of this parameter is <code>GL2.Text.FontLocation.Default</code>.
     * @param {GL2.Text.FontLocation} location Font location
     * */
    set defaultFontLocation(value)
    {
        this._defaultFontLocation = value;
    },
    /**
     * Gets the default depth for node.
     * @returns {Number} Default depth
     * */
    get defaultDepth()
    {
        return this._defaultDepth;
    },
    /**
     * Sets the default depth for node.
     * Default value of this parameter is <code>20000</code>.
     * @param {Number} depth Default depth
     */
    set defaultDepth(value)
    {
        this._defaultDepth = value;
    },
    /**
     * Registers the user defined type.
     * @param {String} type The type name defined by user.
     * @param {Function} methodDefinition The definition of type defined by user.
     * @name Framework.GUIBuilder#registerTypeMethod
     * @status Android, Test
     */
    registerTypeMethod: function(type, methodDefinition)
    {
        if (typeof type === 'string' && typeof methodDefinition === 'function')
        {
            this._userDefinedTypes[type] = methodDefinition;
        }
    },
    /**
     * Checks wether method are defined by user or not.
     * @private
     */
    _checkUserDefinedMethods: function(controller, def)
    {
        var type = def.type;
        var userDefinedTypes = this._userDefinedTypes;
        var userType;
        for (userType in userDefinedTypes)
        {
            if (userDefinedTypes.hasOwnProperty(userType))
            {
                if (type === userType)
                {
                    return this._userDefinedTypes[type](controller, def);
                }
            }
        }
        NgLogE("<NGGo> Element type not found in GUIBuilder.js");
        return null;
    },
    /** @private */
    _destroyElement: function(elem)
    {
        if(typeof elem ==='object')
        {
            if(elem.gluiobj)
            {
                elem.gluiobj.destroy();
                elem.gluiobj = null;
                elem = null;
            }
            else
            {
                elem.destroy();
                elem=null;
            }
        }
    },
    /** @private */
    __onLoadData: function(jsonData, controller)
    {
        var attr;
        if (jsonData.defaultPath)
        {
            this.setDefaultPath(jsonData.defaultPath);
        }
        if (!controller.__nodes)
        {
            controller.__nodes = [];
        }
        controller.destroyAll = function()
        {
            var i;
            for (i=0; i < this.__nodes.length; ++i)
            {
                this.__nodes[i].destroy();

                if (this.__nodes[i].gluiobj &&
                    this.__nodes[i].gluiobj._internalGLObject.__objectRegistryId) {
                        this.__nodes[i].gluiobj._internalGLObject.destroy();
                }
            }
        };
        for (attr in jsonData)
        {
            if (jsonData.hasOwnProperty(attr))
            {
            	NgLogD("++++ attr:" + attr);
                var json = jsonData[attr];
                var root = this._buildUI(controller, json);
                root.setDepth(this._defaultDepth);
            }
        }
        return controller;
    },
    /**
     * @private
     */
    _buildUI: function(controller, def,  parentElem)
    {
        var elem = this._createElement(controller, def, parentElem);
        if (def.children)
        {
            var i;
            for (i=0; i<def.children.length; ++i)
            {
                var child = this._buildUI(controller, def.children[i], elem);
                elem.addChild(child);
            }
        }
        return elem;
    },
    /**
     * @private
     */
    _createElement: function(controller, def, parentElem)
    {
    	NgLogD("++++ create element type:" + def.type);
        var elem;
        switch (def.type)
        {
        case "button":
            elem = this._createGLUIElement(GLUI.Button, controller, def);
            break;
        case "checkbox":
            elem = this._createGLUIElement(GLUI.CheckBox, controller, def);
            break;
        case "image":
            elem = this._createGLUIElement(GLUI.Image, controller, def);
            break;
        case "label":
            elem = this._createGLUIElement(GLUI.Label, controller, def);
            break;
        case "view":
            elem = this._createGLUIElement(GLUI.View, controller, def);
            break;
        case "node":
            elem = this._createNode(controller, def);
            break;
        case "sprite":
            elem = this._createSprite(controller, def);
            break;
        case "text":
            elem = this._createText(controller, def);
            break;
        default:
            elem = this._checkUserDefinedMethods(controller, def);
            break;
        }
        if (def.name)
        {
            elem.name = def.name;
            controller[def.name] = elem;
            if (parentElem)
            {
                parentElem[def.name] = elem;
            }
        }
        controller.__nodes.push(elem);

        elem.type = def.type;
        elem.align = def.align;
        elem.marginRight = def.marginRight;
        elem.marginLeft = def.marginLeft;
        elem.valign = def.valign;
        elem.marginBottom = def.marginBottom;
        elem.marginTop = def.marginTop;
        elem.layout = def.layout;
        if (!elem.layout && parentElem)
        {
            elem.layout = parentElem.layout;
        }
        return elem;
    },
    /** @private */
    _createActionCaller: function(controller, elem, action)
    {
        var caller = function()
        {
            if (typeof action === 'string')
            {
                var fnByString = controller["action_" + action];
                fnByString.call(controller, elem);
            }
            else if (typeof action === 'object')
            {
                var fnByObject = controller["action_" + action.name];
                var params = [elem];
                if (action.param)
                {
                    params.push(action.param);
                }
                if (action.params)
                {
                    params = params.concat(action.params);
                }
                fnByObject.apply(controller, params);
            }
        };
        return caller;
    },
    /** @private */
    _createGLUIElement: function(elementType, controller, def)
    {
        var shallowCopy = function(obj)
        {
            var newObj = {};
            var key;
            for (key in obj)
            {
                if (obj.hasOwnProperty(key))
                {
                    newObj[key] = obj[key];
                }
            }
            return newObj;
        };

        var attrs = shallowCopy(def.attrs);

        var action = attrs.action;
        delete attrs.action;

        var elem = new elementType(attrs);

        if (action)
        {
            elem.setOnClick(this._createActionCaller(controller, elem, action));
        }

        var glObject = elem.getGLObject();
        glObject.gluiobj = elem;
        return glObject;
    },
    /**
     * create and reutrn GL2.Node.
     * @private
     */
    _createNode: function(controller, def)
    {
        var attrs = def.attrs;
        var frame = attrs.frame;
        var elem = new GL2.Node();
        var anchor = def.attrs.anchor || this._defaultAnchor;
        var uvs = def.attrs.uvs || this._defaultUVs;

        elem.getFrame = function()
        {
            return this._frame;
        };

        var self = this;
        elem.setFrame = function(frame)
        {
            this.setPosition(frame[0], frame[1]);
            this._frame = frame;
        };
        var key;
        for (key in attrs)
        {
            if (attrs.hasOwnProperty(key))
            {
                switch (key)
                {
                case "frame":
                    elem.setFrame(frame);
                    break;
                default:
                    this._applyProperty(elem, key, attrs[key], def.name);
                }
            }
        }
        return elem;
    },
    /**
     * create and reutrn GL2.Sprite.
     * @private
     * */
    _createSprite: function(controller, def)
    {
        var attrs = def.attrs;
        var frame = attrs.frame;
        var image = attrs.image;
        var anchor = (image) ? image.anchor : this._defaultAnchor;
        var uvs = (image) ? image.uvs : this._defaultUVs;
        var size = (image) ? image.size : this._defaultSize;

        var Sprite = require('../GLUI/Sprite').URLSprite;

        var elem = new Sprite();

        elem.getFrame = function()
        {
            return this._frame;
        };
        var self = this;
        elem.setFrame = function(frame)
        {
            if (image)
            {
                elem.setImage(self._basePath + image.url, [frame[2], frame[3]], anchor, uvs);
            }
            this.setPosition(frame[0], frame[1]);
            this._frame = frame;
        };
        var key, methodCall, argsArr;
        //iterate through attributes
        for (key in attrs)
        {
            if (attrs.hasOwnProperty(key))
            {
                switch (key)
                {
                case "frame":
                    elem.setFrame(frame);
                    break;
                case "image":
                    if (!frame)
                    {
                        elem.setImage(self._basePath + image.url, size, anchor, uvs);
                    }
                    break;
                case "animation":
                    //currently animation is not supported
                    break;
                default:
                    this._applyProperty(elem, key, attrs[key], def.name);
                }
            }
        }
        return elem;
    },
    /**
     * create and reutrn GL2.Text.
     * @private
     * */
    _createText: function(controller, def)
    {
        var attrs = def.attrs;
        var frame = attrs.frame;
        var horizontalAlignment = attrs.horizontalAlign;
        var verticalAlignment = attrs.verticalAlign;
        var overflowMode = attrs.overflowMode;
        var fontFamily = attrs.fontFamily;
        var fontLocation = attrs.fontLocation;

        var elem = new GL2.Text();

        elem.getFrame = function()
        {
            return this._frame;
        };
        elem.setFrame = function(frame)
        {
            this.setPosition(frame[0], frame[1]);
            this._frame = frame;
        };
        var key;
        for (key in attrs)
        {
            if (attrs.hasOwnProperty(key))
            {
                switch (key)
                {
                case "frame":
                    elem.setFrame(frame);
                    break;
                case "horizontalAlign":
                    if (String(horizontalAlignment).toLowerCase.search("right") !== -1)
                    {
                        horizontalAlignment = GL2.Text.HorizontalAlign.Right;
                    }
                    else if (String(horizontalAlignment).toLowerCase.search("left") !== -1)
                    {
                        horizontalAlignment = GL2.Text.HorizontalAlign.Left;
                    }
                    else // include "center"
                    {
                        horizontalAlignment = GL2.Text.HorizontalAlign.Center;
                    }
                    elem.setHorizontalAlign(horizontalAlignment);
                    break;
                case "verticalAlign":
                    if (String(verticalAlignment).toLowerCase.search("bottom") !== -1)
                    {
                        verticalAlignment = GL2.Text.VerticalAlign.Bottom;
                    }
                    else if (String(verticalAlignment).toLowerCase.search("top") !== -1)
                    {
                        verticalAlignment = GL2.Text.VerticalAlign.Top;
                    }
                    else // include "middle"
                    {
                        verticalAlignment = GL2.Text.HorizontalAlign.Middle;
                    }
                    elem.setVerticalAlign(verticalAlignment);
                    break;
                case "overflowMode":
                    if (String(overflowMode).toLowerCase.search("reducefontsize") !== -1)
                    {
                        overflowMode = GL2.Text.OverflowMode.ReduceFontSize;
                    }
                    else // include "multiline"
                    {
                        overflowMode = GL2.Text.OverflowMode.Multiline;
                    }
                    elem.setOverflowMode(overflowMode);
                    break;
                case "fontLocation":
                    if (String(fontLocation).toLowerCase.search("bundled"))
                    {
                        fontLocation = GL2.Text.FontLocation.Bundled;
                    }
                    else if (String(fontLocation).toLowerCase.search("system"))
                    {
                        fontLocation = GL2.Text.FontLocation.System;
                    }
                    else if (String(fontLocation).toLowerCase.search("manifest"))
                    {
                        fontLocation = GL2.Text.FontLocation.Manifest;
                    }
                    else // include "default"
                    {
                        fontLocation= GL2.Text.FontLocation.Default;
                    }
                    elem.setFontLocation(fontLocation);
                    break;
                default:
                    this._applyProperty(elem, key, attrs[key], def.name);
                }
            }
        }
        return elem;
    },
    /** @private */
    _applyProperty: function(elem, key, value, name)
    {
        console.log(name + ": " + key);
        var methodCall = [];
        methodCall.push('set');
        methodCall.push(key.charAt(0).toUpperCase());
        methodCall.push(key.substr(1));
        methodCall = methodCall.join("");

        if(elem[methodCall])
        {
            elem[methodCall].call(elem, value);
        }
        else
        {
            console.log('<NGGo> | ' + key + ' property not defined for ' + name);
        }
    }
});
