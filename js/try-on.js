/**
 * TryOn library
 * The library for online try on glasses in foto or video mode. 
 *
 * Copyright (c) 2017, Dmitry Ragozin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

var tryOn = (function(pub) {
    var _elem;
    var _options = {};
    var _faceTracker;
    var _drawOptions = {};

    /**
     * Render tryon HTML element. Private method.
     */
    function _render() {
        _elem = document.createElement('div');
        _elem.innerHTML = _options.template(_options.templateParams);
        _elem.addEventListener('changeGenderType', _onChangeGenderType);
        _elem.addEventListener('changeCurPhoto', _onChangeCurPhoto);
        _elem.addEventListener('activateWebcamMode', _onActivateWebcamMode);
        _elem.addEventListener('uploadPhoto', _onUploadPhoto);
        _elem.addEventListener('stopDraw', _onStopDraw);
    }

    /**
     * Module initialization. Private method.
     * @param {Object} options Module options
     * @param {Function} options.template Function to create HTML template with options.templateParams parameters    
     * @param {Object} options.templateParams Parameters for creating HTML template
     * @param {Object} options.faceTracker Wrapper for face tracking module
     */
    function _init(options) {
        if (options.template)
            _options.template = options.template;
        if (options.templateParams)
            _options.templateParams = options.templateParams;
        else
            _options.templateParams = {};
        if (options.faceContainerWidth)
            _options.faceContainerWidth = options.faceContainerWidth;
        if (options.faceContainerHeight)
            _options.faceContainerHeight = options.faceContainerHeight;
        if (options.faceTracker)
            _faceTracker = options.faceTracker;
    }


    /**
    * Stop draw method
    */
    function _onStopDraw(e) {
        _faceTracker.stopDraw();
    }

    /**
     * Start drawing of glasses. Private method.
     * @param {Object} options Drawing options    
     * @param {String} options.fotoSrc URL of user face photo. If is this parameter not exist or empty function will run webcam mode
     * @param {Object} options.trackerParams The parameters to pass to face tracker module
     * @param {Node} options.trackerCanvas Container holding the user face (image or video)    
     * @param {Node} options.overlayCanvas Container holding the glasses    
     * @param {Object} options.model Face model for face tracker    
     * @param {Number} options.renderMaxLoopNum Maximum number of iterations to drawing glasses
     * @param {Array} options.eyePositions If this parameter exist - glasses will be draw without automatic determination of the positions of the eyes by face tracker
     * @param {String} options.glassesSrc URL of glasses image
     * @param {Number} options.containerWidth Width of container for trackerCanvas
     */    
    function _draw(options) {
        var modelEyePositions = [];
        _drawOptions = options;
        if (options.fotoSrc) {
            //foto mode
            _faceTracker.init({
                viewType: 'foto',
                glassesSrc: options.glassesSrc,
                trackerParams: options.trackerParams,
                trackerCanvas: options.trackerCanvas,
                overlayCanvas: options.overlayCanvas,
                model: options.model,
                renderMaxLoopNum: options.renderMaxLoopNum,
                fotoSrc: options.fotoSrc,
                containerWidth: options.faceContainerWidth,
                eyePositions: options.eyePositions
            });
        } else {
            //video mode
            _faceTracker.init({
                viewType: 'video',
                glassesSrc: options.glassesSrc,
                trackerParams: options.trackerParams,
                trackerCanvas: options.trackerCanvas,
                overlayCanvas: options.overlayCanvas,
                model: options.model,
                containerWidth: options.faceContainerWidth,
            });
        }
    }

    function _onChangeGenderType(e) {}

    /**
    * changeCurPhoto event handler
    @param {object} e event object
    */
    function _onChangeCurPhoto(e) {
        if (!e.detail || !e.detail.photoSrc)
            return false;
        _faceTracker.stopDraw();
        _faceTracker.init({
            viewType: 'foto',
            glassesSrc: _drawOptions.glassesSrc,
            trackerParams: _drawOptions.trackerParams,
            trackerCanvas: e.detail.trackerCanvas,
            overlayCanvas: _drawOptions.overlayCanvas,
            model: _drawOptions.model,
            renderMaxLoopNum: _drawOptions.renderMaxLoopNum,
            fotoSrc: e.detail.photoSrc,
            containerWidth: _drawOptions.faceContainerWidth,
            eyePositions: e.detail.eyePositions
        });
        return true;
    }

    /**
    * activateWebcamMode event handler
    @param {object} e event object
    */
    function _onActivateWebcamMode(e) {
        _faceTracker.stopDraw();

        return _faceTracker.init({
            viewType: 'video',
            glassesSrc: _drawOptions.glassesSrc,
            trackerParams: _drawOptions.trackerParams,
            trackerCanvas: e.detail.trackerCanvas,
            overlayCanvas: _drawOptions.overlayCanvas,
            model: _drawOptions.model,
            containerWidth: _drawOptions.faceContainerWidth,
        });


    }

    /**
    * uploadPhoto event handler
    @param {Object} e event object
    @param {String} e.detail.postFileName Name of posted photo
    @param {String} e.detail.submitPath Path to script, which handles post request with photo
    @param {String} e.detail.inputElement Input container, which store local photo path
    @param {String} e.detail.trackerCanvas Container holding the user face (image or video)
    @param {Function} e.detail.success Function, which will be run after success upload
    @param {Function} e.detail.error Function, which will be run after unsuccessful upload
    */
    function _onUploadPhoto(e) {
        var error = {};
        var postFileName;
        var file;
        var xhr;
        var fd;
        var submitPath;

        if (!e || !e.detail || !e.detail.inputElement || !e.detail.inputElement.files[0]) {
            error.errorNo = 1;
            error.errorText = 'wrong input parameters';
            error.data = {};
            if (e.detail && e.detail.error && e.detail.error instanceof Function) {
                e.detail.error(error);
            }
            return false;
        }
        postFileName = e.detail.postFileName || 'afile';
        submitPath = e.detail.submitPath || location.href;
        file = e.detail.inputElement.files[0];
        xhr = new XMLHttpRequest();
        fd = new FormData();
        fd.append(postFileName, file);
        xhr.onload = xhr.onerror = function() {
            if (this.status == 200) {
                _onChangeCurPhoto({
                    detail: {
                        photoSrc: this.response,
                        trackerCanvas: e.detail.trackerCanvas,
                    }
                });
                if (e.detail && e.detail.success && e.detail.success instanceof Function) {
                    e.detail.success({
                        photoSrc: this.response
                    });
                }
            } else {
                error.errorNo = 2;
                error.errorText = 'wrong server response';
                error.data = {
                    serverResponse: this.response
                };
            }

        };
        xhr.open("POST", submitPath, true);
        xhr.send(fd);
        return true;
    }

    /**
     * Module initialization
     * @param {Object} options Module options
     * @param {Function} options.template Function to create HTML template with options.templateParams parameters    
     * @param {Object} options.templateParams Parameters for creating HTML template
     * @param {Object} options.faceTracker Wrapper for face tracking module
     */
    pub.init = function(options) {
        _init(options);
    }

    /**
     * Render tryon HTML element
     */
    pub.render = function() {
        _render();
    }

    /**
     * Return rendered HTML tryon element
     */
    pub.getElem = function() {
        if (!_elem)
            render();
        return _elem;
    }

    /**
     * Start drawing of glasses
     * @param {Object} options Drawing options    
     * @param {String} options.fotoSrc URL of user face photo. If is this parameter not exist or empty function will run webcam mode
     * @param {Object} options.trackerParams The parameters to pass to face tracker module
     * @param {Node} options.trackerCanvas Container holding the user face (image or video)    
     * @param {Node} options.overlayCanvas Container holding the glasses    
     * @param {Object} options.model Face model for face tracker    
     * @param {Number} options.renderMaxLoopNum Maximum number of iterations to drawing glasses
     * @param {Array} options.eyePositions If this parameter exist - glasses will be draw without automatic determination of the positions of the eyes by face tracker
     * @param {String} options.glassesSrc URL of glasses image
     * @param {Number} options.containerWidth Width of container for trackerCanvas
     */
    pub.draw = function(options) {
        _draw(options);
    }

    return pub;

})(tryOn || {});
