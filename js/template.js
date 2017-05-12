/**
Tryon template helper

*/

'use strict';

;
(function() {
    var womenSwiperContainer;
    var menSwiperContainer;
    var overlay;

    document.addEventListener('change', function(e) {
        e = e || event;
        if (e.target.matches('.trying__choose-gender')) {
            changeGenderType(e);
        }
        if (e.target.matches('#tryon-photo-upload')) {
            choosePhoto(e);
            uploadPhoto(e);
        }
    })
    document.addEventListener('click', function(e) {
        if (e.target.closest('.trying__little-photo-slide') && !e.target.closest('.trying__little-photo-slide_active')) {
            changeCurPhoto(e);
        }
        if (e.target.matches('.webcam-btn')) {
            activateWebcamMode(e);
        }
        if (e.target.matches('#tryon-photo-upload-btn')) {
            var event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            })
            document.getElementById('tryon-photo-upload').dispatchEvent(event);
            //uploadPhoto(e);
        }
        if (e.target.closest('#tryon-zoom-in')) {
            zoom(e, 'in');
        }
        if (e.target.closest('#tryon-zoom-out')) {
            zoom(e, 'out');
        }
        if (e.target.closest('#tryon-rotate-left')) {
            rotate(e, 'left');
        }
        if (e.target.closest('#tryon-rotate-right')) {
            rotate(e, 'right');
        }

    })


    /**
    * Zoom glasses
    * @param {Event} click event
    * @param {String} zoomType type of zooming. One of the next values: left, right
    */
    function zoom(e, zoomType) {

        if (document.getElementById('image').classList.contains('trying__hidden'))
            return;

        var tmpImg;
        var event;
        var zoomScale;

        if ('in' == zoomType) {
            zoomScale = 1.1;
        } else {
            zoomScale = 0.9
        }


        //generate event to catch in tryon library
        event = new CustomEvent('stopDraw', {
            bubbles: true,
            cancelable: true,
            detail: {}
        })
        e.target.dispatchEvent(event);

        tmpImg = document.createElement('img');
        tmpImg.onload = function(e) {
            var canvasContext;
            var oldOverlayWidth;
            var oldOverlayHeight;
            var overlayContext;
            oldOverlayWidth = overlay.getAttribute('width');
            oldOverlayHeight = overlay.getAttribute('height');
            overlay.setAttribute('width', Math.round(overlay.getAttribute('width') * zoomScale));
            overlay.setAttribute('height', Math.round(overlay.getAttribute('height') * zoomScale));
            if ('in' == zoomType) {
                overlay.style.left = parseInt(overlay.style.left) - (overlay.getAttribute('width') - oldOverlayWidth) / 2 + 'px';
                overlay.style.top = parseInt(overlay.style.top) - (overlay.getAttribute('height') - oldOverlayHeight) / 2 + 'px';
            } else {
                overlay.style.left = parseInt(overlay.style.left) + (oldOverlayWidth - overlay.getAttribute('width')) / 2 + 'px';
                overlay.style.top = parseInt(overlay.style.top) + (oldOverlayHeight - overlay.getAttribute('height')) / 2 + 'px';
            }
            overlayContext = overlay.getContext('2d');
            overlayContext.clearRect(0, 0, overlay.getAttribute('width'), overlay.getAttribute('height'));
            overlayContext.drawImage(tmpImg, 0, 0, overlay.getAttribute('width'), overlay.getAttribute('height'));

        }
        tmpImg.src = document.getElementsByName('tryon-glasses')[0].value;
    }
    /**
    * Rotate glasses
    * @param {Event} click event
    * @param {String} rotateType type of zooming. One of the next values: in, out
    */
    function rotate(e, rotateType) {
        var transformDegree;
        var event;
        if (document.getElementById('image').classList.contains('trying__hidden'))
            return;
        //generate event to catch in tryon library
        event = new CustomEvent('stopDraw', {
            bubbles: true,
            cancelable: true,
            detail: {}
        })
        e.target.dispatchEvent(event);

        overlay.style.transformOrigin = '50% 50% 0';
        transformDegree = overlay.style.transform.match(/[0-9-\.]+/);
        transformDegree = parseFloat(transformDegree[0]);
        if ('right' == rotateType && transformDegree < 1) {
            transformDegree += 0.05;
        } else if (transformDegree > -1) {
            transformDegree -= 0.05;
        }
        overlay.style.transform = 'rotate(' + (transformDegree) + 'rad)';
    }

    /**
    * Change gender type beetween men and women
    */
    function changeGenderType(e) {
        var event;
        var elemContainer = e.target.closest('.trying');
        if ('women' == e.target.dataset.valueId) {
            elemContainer.querySelector('.trying__little-photo-container[data-container-type="men"]')
                .style.display = 'none';
            elemContainer.querySelector('.trying__little-photo-container[data-container-type="women"]')
                .style.display = 'block';
            if (!womenSwiperContainer) {
                //need for swipe preview photos
                womenSwiperContainer = new Swiper('#tryon-women-container', {
                    scrollbar: '#woman_photo_scrollbar',
                    scrollbarHide: false,
                    slidesPerView: 'auto',
                    centeredSlides: false,
                    spaceBetween: 20,
                    grabCursor: true,
                    scrollbarDraggable: true,
                    mousewheelControl: true
                });
            }

        } else {
            elemContainer.querySelector('.trying__little-photo-container[data-container-type="women"]')
                .style.display = 'none';
            elemContainer.querySelector('.trying__little-photo-container[data-container-type="men"]')
                .style.display = 'block';
        }
        //generate event to catch in tryon library
        event = new CustomEvent('changeGenderType', {
            bubbles: true,
            cancelable: true,
            detail: {
                gender: e.target.dataset.valueId
            }
        })
        e.target.dispatchEvent(event);
    }

    /**
    * Choice another photo
    */
    function changeCurPhoto(e) {
        var eyePositions = [];
        var target;
        var elemContainer;
        var event;
        overlay.style.cursor = 'move';

        target = e.target.closest('.trying__little-photo-slide');
        elemContainer = e.target.closest('.trying');
        if (elemContainer.querySelector('.trying__little-photo-slide_active'))
            elemContainer.querySelector('.trying__little-photo-slide_active').classList.remove('trying__little-photo-slide_active');
        target.classList.add('trying__little-photo-slide_active');
        document.getElementById('video').classList.add('trying__hidden');
        document.getElementById('image').classList.remove('trying__hidden');
        if (target.dataset.positionLeft && target.dataset.positionLeft.trim())
            eyePositions.push(target.dataset.positionLeft.split(','));
        if (target.dataset.positionRight && target.dataset.positionLeft.trim())
            eyePositions.push(target.dataset.positionRight.split(','));
        //generate event to catch in tryon library
        event = new CustomEvent('changeCurPhoto', {
            bubbles: true,
            cancelable: true,
            detail: {
                photoSrc: target.getElementsByTagName('img')[0].src,
                trackerCanvas: document.getElementById('image'),
                eyePositions: eyePositions
            }
        })
        e.target.dispatchEvent(event);

    }

    /**
    * Enable webcam mode
    * @param {Event} e click event
    */
    function activateWebcamMode(e) {
        var elemContainer = e.target.closest('.trying');
        var event;
        elemContainer.querySelector('.trying__little-photo-slide_active').classList.remove('trying__little-photo-slide_active');
        overlay.style.cursor = 'auto';
        document.getElementById('image').classList.add('trying__hidden');
        document.getElementById('video').classList.remove('trying__hidden');
        //generate event to catch in tryon library
        event = new CustomEvent('activateWebcamMode', {
            bubbles: true,
            cancelable: true,
            detail: {
                trackerCanvas: document.getElementById('video')
            }
        })
        e.target.dispatchEvent(event);
    }

    /**
    * Upload new photo
    * @param {Event} e click event
    */
    function uploadPhoto(e) {
        var event;
        document.getElementById('image').classList.remove('trying__hidden');
        document.getElementById('video').classList.add('trying__hidden');
        //generate event to catch in tryon library
        event = new CustomEvent('uploadPhoto', {
            bubbles: true,
            cancelable: true,
            detail: {
                inputElement: document.getElementById('tryon-photo-upload'),
                submitPath: '/verstka/try-on/uploader.php',
                postFileName: 'afile',
                trackerCanvas: document.getElementById('image'),
                success: addUserPhoto,
                error: function(data) {

                }
            }
        });
        e.target.dispatchEvent(event);
    }
    /**
    * Function running after uploading photo
    * @param {Object} options Photo options
    * @param {String} options.photoSrc Photo URL
    */
    function addUserPhoto(options) {
        if (!options.photoSrc)
            return false;
        var elementToAdd;
        var curGenderType;
        var photoContainer;
        curGenderType = document.querySelector('input[name="gender"]:checked').dataset.valueId;
        document.cookie = 'tryon_user_photo_path=' + encodeURIComponent(options.photoSrc) + '; path=/; expires=' + (new Date(+(new Date()) + 30 * 24 * 60 * 60 * 1000)).toUTCString();
        document.cookie = 'tryon_user_gender=' + encodeURIComponent(curGenderType) + '; path=/; expires=' + (new Date(+(new Date()) + 30 * 24 * 60 * 60 * 1000)).toUTCString();
        if (document.querySelector('.trying__little-photo-slide_active'))
            document.querySelector('.trying__little-photo-slide_active').classList.remove('trying__little-photo-slide_active');

        elementToAdd = document.createElement('div');
        photoContainer = document.querySelector('.trying__little-photo-container[data-container-type=' + curGenderType + ']').children[0];
        photoContainer.insertBefore(elementToAdd, photoContainer.children[0]);
        elementToAdd.classList.add('trying__little-photo-slide');
        elementToAdd.classList.add('trying__little-photo-slide_active');
        elementToAdd.appendChild(document.createElement('a'));
        elementToAdd.children[0].appendChild(document.createElement('img'));
        elementToAdd.children[0].children[0].src = options.photoSrc;
        return true;
    }

    /**
    * Changing file info in file text input
    * @param {Event} e Event
    */
    function choosePhoto(e) {
        var filePath = e.target.value;
        filePath = filePath.slice(filePath.lastIndexOf('\\') + 1);
        document.querySelector('label[for="tryon-photo-upload"]').innerHTML = filePath;
    }

    /**
    * Cross browser way to get coordinates of HTML node
    * @param {Node} element DOM element
    */
    function getCoords(elem) {
        var box = elem.getBoundingClientRect();
        var body = document.body;
        var docEl = document.documentElement;
        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;
        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
        return { top: Math.round(top), left: Math.round(left) };
    }


    window.addEventListener('load', function(e) {
        menSwiperContainer = new Swiper('#tryon-men-container', {
            scrollbar: '#man_photo_scrollbar',
            scrollbarHide: false,
            slidesPerView: 'auto',
            centeredSlides: false,
            spaceBetween: 20,
            grabCursor: true,
            scrollbarDraggable: true,
            mousewheelControl: true
        });
        document.querySelector('.trying__little-photo-container[data-container-type="women"]').style.display = 'none';
    })


    /**
    * Realization of drag glasses
    */
    window.addEventListener('load', function(e) {
        overlay = document.getElementById('overlay');
        overlay.style.cursor = 'move';
        overlay.onmousedown = function(e) {
            var rotateRadians;
            var coords;
            if (document.getElementById('image').classList.contains('trying__hidden'))
                return;
            var event = new CustomEvent('stopDraw', {
                bubbles: true,
                cancelable: true,
                detail: {}
            })
            e.target.dispatchEvent(event);

            function moveAt(e) {
                var container = document.getElementById('container');
                var containerCoods = getCoords(container);
                if (e.pageX - shiftX - containerCoods.left < 0)
                    return;
                if (e.pageY - shiftY - containerCoods.top < 0)
                    return;
                if (e.pageX - shiftX + overlay.clientWidth > containerCoods.left + container.clientWidth)
                    return;
                if (e.pageY - shiftY + overlay.clientHeight > containerCoods.top + container.clientHeight)
                    return;
                overlay.style.left = e.pageX - shiftX - containerCoods.left + 'px';
                overlay.style.top = e.pageY - shiftY - containerCoods.top + 'px';
            }
            coords = getCoords(overlay);
            if (overlay.style.transform) {
                //calculate if the glasses have the tilt angle
                rotateRadians = overlay.style.transform.match(/[0-9\.]+/)[0];
                coords.top = coords.top + Math.ceil(overlay.getAttribute('width') / 2 * Math.sin(rotateRadians));
            }
            //save shift of X and Y positions
            var shiftX = e.pageX - coords.left;
            var shiftY = e.pageY - coords.top;
            moveAt(e);
            document.onmousemove = function(e) {
                moveAt(e);
            };
            overlay.onmouseup = function(e) {
                document.onmousemove = null;
                overlay.onmouseup = null;
            }
        }
        overlay.ondragstart = function(e) {
            return false;
        }
    })





})();
