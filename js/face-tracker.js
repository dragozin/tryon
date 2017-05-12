/**
 * Face tracker wrapper for TryOn library
 * Wrapper for using clmtracker library.
 *
 * Copyright (c) 2017, Dmitry Ragozin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

var faceClmTracker = (function(pub) {

    var _clmTracker;
    var _model;
    var _trackerCanvas;
    var _trackerContext;
    var _overlayCanvas;
    var _overlayContext;
    var _fotoImg;
    var _glassesSrc;
    var _glassesImg;
    var _renderLoopInc = 0;
    var _renderMaxLoopNum = 0;
    var _viewType = 'foto';
    var _containerWidth;
    var _eyePositions;
    var _fotoImgScaleDivider = 1;
    var runnerTimeOut;




    /**
    * Function for drawing animation frame. 
    */
    function _renderLoop() {
        var eyePositions = [];
        var positions;        
        if ((_renderMaxLoopNum == 0) || (_renderMaxLoopNum == undefined) || (_renderMaxLoopNum > 0 && _renderLoopInc < _renderMaxLoopNum)) {
            //if current iteration less then _renderMaxLoopNum or _renderMaxLoopNum is undefined
            runnerTimeOut = requestAnimationFrame(_renderLoop);
            if (_eyePositions.length) { // if _eyePositions is set
                if (1 != _fotoImgScaleDivider) { //If the proportions of the photo are changed, we must change the proportions of glasses
                    for (var i = 0; i < _eyePositions.length; i++) {
                        eyePositions[i] = [];
                        eyePositions[i][0] = _eyePositions[i][0]*_fotoImgScaleDivider;
                        eyePositions[i][1] = _eyePositions[i][1]*_fotoImgScaleDivider;
                    }
                } else {
                    eyePositions = _eyePositions;
                }
                _drawGlasses(eyePositions, _overlayCanvas);
                _clmTracker.stop(); // stop drawing looper because eye positions - are constant               
            } else {
                positions = _clmTracker.getCurrentPosition();
                if (positions) {
                    eyePositions = _getEyePositions(_model, _clmTracker.getCurrentParameters());                
                    _drawGlasses(eyePositions, _overlayCanvas);
                    _renderLoopInc++;
                }
            }
        } else {
          _clmTracker.stop();
        }
    }


    /**
    * Calculate the positions of the eye with clmtrackr face tracker library
    * @param {Object} model Face model for face tracker
    * @param {Object} parameters Current face parameters calculates by clmtrackr module
    */
    function _getEyePositions(model, parameters) {
        var dottedPoints = [];
        var meanShape;
        var ret;
        var point;
        var i; 
        var x;
        var y;
        var a;
        var b;

        for (var i = 0; i < model.path.normal.length; i++) {
            if ('number' == typeof(model.path.normal[i])) {
                dottedPoints.push(model.path.normal[i]);
            }
        }

        // load mean shape
        meanShape = [];
        for (i = 0; i < model.patchModel.numPatches; i++) {
            meanShape[i] = [model.shapeModel.meanShape[i][0], model.shapeModel.meanShape[i][1]];
        }

        ret = [];
        for (var inc = 0; inc < dottedPoints.length; inc++) {
            point = dottedPoints[inc];
            i = point * 2;
            x = meanShape[i / 2][0];
            y = meanShape[i / 2][1];
            for (var j = 0; j < model.shapeModel.numEvalues; j++) {
                x += model.shapeModel.eigenVectors[i][j] * parameters[j + 4];
                y += model.shapeModel.eigenVectors[i + 1][j] * parameters[j + 4];
            }
            a = parameters[0] * x - parameters[1] * y + parameters[2];
            b = parameters[0] * y + parameters[1] * x + parameters[3];
            x += a;
            y += b;
            ret.push([x, y]);
        }
        return ret;
    }


    /**
    * Drawing glasses. Private method.
    * @param {Array} eyePositions Array with coordinates of eye positions
    * @param {Node} canvas container for drawing glasses
    */
    function _drawGlasses(eyePositions, canvas) {
        var img = document.createElement('img');
        img.onload = function() {
            var canvasContext;
            var eyeDistance = eyePositions[1][0] - eyePositions[0][0]; // get width distance beetween eyes
            var eyeHeigth = eyePositions[1][1] - eyePositions[0][1]; // get height distance beetween eyes
            var eyeDegree = Math.atan(eyeHeigth / eyeDistance); // get eye tilt angle
            var divider = img.width / eyeDistance * 0.46;
            var leftX = eyePositions[0][0] - Math.floor(img.width / divider * 0.27);
            var leftY = eyePositions[0][1] - Math.floor(img.height / divider * 0.34);
            canvas.style.left = leftX + 'px';
            canvas.style.top = leftY + 'px';
            canvas.setAttribute('width', Math.floor(img.width / divider));
            canvas.setAttribute('height', Math.floor(img.height / divider));
            canvas.style.transform = 'rotate(' + eyeDegree + 'rad)';
            canvas.style.transformOrigin = eyePositions[0][0] - leftX +'px ' + (eyePositions[0][1] - leftY) + 'px' + ' 0';
            canvasContext = canvas.getContext('2d');
            canvasContext.clearRect(0, 0, Math.floor(img.width / divider), Math.floor(img.height / divider));
            canvasContext.drawImage(img, 0, 0, img.width / divider, img.height / divider);
        }
        img.src = _glassesSrc;
    }

    /**
     * Wrapper initialization. Private method.
     * @param {Object} options Wrapper options
     * @param {String} options.viewType View mode. One of the next values: foto, video
     * @param {String} options.glassesSrc URL of glasses image
     * @param {String} options.trackerParams The parameters to pass to face tracker module
     * @param {Node} options.trackerCanvas Container holding the user face (image or video)
     * @param {Node} options.overlayCanvas Container holding the glasses
     * @param {Object} options.model Face model for face tracker
     * @param {Number} options.renderMaxLoopNum Maximum number of iterations to drawing glasses
     * @param {String} options.fotoSrc URL of user face photo. If is this parameter not exist or empty function will run webcam mode
     * @param {Number} options.containerWidth Width of container for trackerCanvas
     * @param {Number} options.eyePositions If this parameter exist - glasses will be draw without automatic determination of the positions of the eyes by face tracker
     */
    function _init(options) {
        var divider;
        var videoSelector;

        _renderLoopInc = 0;
        _viewType = options.viewType;
        _glassesSrc = options.glassesSrc;
        _clmTracker = new clm.tracker(options.trackerParams);
        _trackerCanvas = options.trackerCanvas;
        _overlayCanvas = options.overlayCanvas;
        _overlayContext = _overlayCanvas.getContext('2d');
        _model = options.model;
        _clmTracker.init(_model);
        _renderMaxLoopNum = options.renderMaxLoopNum;
        _containerWidth = options.containerWidth;
        _eyePositions = options.eyePositions || [];

        if (_viewType == 'foto') {
            _trackerContext = _trackerCanvas.getContext('2d');
            _fotoImg = document.createElement('img');
            _fotoImg.onload = function(e) {
                divider = 1;
                if (_fotoImg.width > _containerWidth) {
                    divider = _containerWidth / _fotoImg.width;
                }
                _fotoImgScaleDivider = divider;


              _trackerCanvas.setAttribute('width', parseInt(_fotoImg.width * divider));
              _trackerCanvas.setAttribute('height', parseInt(_fotoImg.height * divider));
              _trackerContext.drawImage(_fotoImg,0,0,parseInt(_fotoImg.width * divider), parseInt(_fotoImg.height * divider));
              _draw(); //drawing after loading image
            }
            _fotoImg.src = options.fotoSrc;
        }
        if (_viewType == 'video') {
            videoSelector = { video: true };
            if (!navigator.getUserMedia) {
                alert('no access to camera');
                return false;
            }
                
            navigator.getUserMedia(videoSelector, function(stream) {
                _trackerCanvas.setAttribute('width', parseInt(_containerWidth));
                if (_trackerCanvas.mozCaptureStream) {
                    _trackerCanvas.mozSrcObject = stream;
                } else {
                    _trackerCanvas.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                }
                _trackerCanvas.play();
                
                _trackerCanvas.onloadeddata = function(){
                    _trackerCanvas.setAttribute('height',_trackerCanvas.clientHeight);
                };
                _draw();
                return true;
            }, function() {

            });
        }
        return false;
    }

    function _draw() {
      _clmTracker.start(_trackerCanvas);
      _renderLoop();
    }

    function _stopDraw() {
        _clmTracker.stop();
        cancelAnimationFrame(runnerTimeOut);
    }

    /**
     * Wrapper initialization and start drawing
     * @param {Object} options Wrapper options
     * @param {String} options.viewType View mode. One of the next values: foto, video
     * @param {String} options.glassesSrc URL of glasses image
     * @param {String} options.trackerParams The parameters to pass to face tracker module
     * @param {Node} options.trackerCanvas Container holding the user face (image or video)
     * @param {Node} options.overlayCanvas Container holding the glasses
     * @param {Object} options.model Face model for face tracker
     * @param {Number} options.renderMaxLoopNum Maximum number of iterations to drawing glasses
     * @param {String} options.fotoSrc URL of user face photo. If is this parameter not exist or empty function will run webcam mode
     * @param {Number} options.containerWidth Width of container for trackerCanvas
     * @param {Number} options.eyePositions If this parameter exist - glasses will be draw without automatic determination of the positions of the eyes by face tracker
     */
    pub.init = function(options) {
      return _init(options);
    }


    /**
    * Start drawing
    */
    pub.draw = function() {
        _draw();
    }

    /**
    * Stop drawing
    */
    pub.stopDraw = function(){
        _stopDraw();
    }

    return pub;
})(faceClmTracker || {});