/**
Polyfills for TryOn library
*/
'use strict';
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           return window.setTimeout(callback, 1000/60);
         };
})();

/**
 * Provides cancelRequestAnimationFrame in a cross browser way.
 */
window.cancelRequestAnimFrame = (function() {
  return window.cancelAnimationFrame ||
         window.webkitCancelRequestAnimationFrame ||
         window.mozCancelRequestAnimationFrame ||
         window.oCancelRequestAnimationFrame ||
         window.msCancelRequestAnimationFrame ||
         window.clearTimeout;
})();    
window.navigator.getUserMedia = window.navigator.getUserMedia ||
                     window.navigator.webkitGetUserMedia ||
                     window.navigator.mozGetUserMedia;    


(function(ELEMENT) {
        ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
        ELEMENT.closest = ELEMENT.closest || function closest(selector) {
            if (!this) return null;
            if (this.matches(selector)) return this;
            if (!this.parentElement) {return null}
            else return this.parentElement.closest(selector)
          };
    }(Element.prototype));  

(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();


(function (window) {
  try {
    new MouseEvent('test');
    return false; // No need to polyfill
  } catch (e) {
    (function(window) {
      function MouseEvent(eventType, params) {
        params = params || { bubbles: false, cancelable: false };
        var mouseEvent = document.createEvent('MouseEvent');
        mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        return mouseEvent;
      }

      MouseEvent.prototype = Event.prototype;

      window.MouseEvent = MouseEvent;

    })(window);
  }

  // Polyfills DOM4 MouseEvent

})(window);