/**
Tryon template controller

*/

var scriptController = new function() {
    var tryOnElem;
    var tracker;
    var models = {};
    models.men = [{
        filePath: "content/models/1.jpg",
        eyePositions: [
            [129, 236],
            [248, 233]
        ]
    }, {
        filePath: "content/models/2.jpg",
        eyePositions: [
            [128, 236],
            [250, 237]
        ]
    }, {
        filePath: "content/models/3.jpg",
        eyePositions: [
            [129, 235],
            [253, 235]
        ]
    }, {
        filePath: "content/models/4.jpg",
        eyePositions: [
            [128, 236],
            [252, 234]
        ]
    }, {
        filePath: "content/models/5.jpg",
        eyePositions: [
            [127, 236],
            [249, 238]
        ]
    }, {
        filePath: "content/models/6.jpg",
        eyePositions: [
            [128, 235],
            [252, 235]
        ]
    }, {
        filePath: "content/models/7.jpg",
        eyePositions: [
            [127, 233],
            [251, 237]
        ]
    }, {
        filePath: "content/models/8.jpg",
        eyePositions: [
            [129, 237],
            [251, 235]
        ]
    }, ];
    models.women = [{
        filePath: "content/models/9.jpg",
        eyePositions: [
            [136, 235],
            [251, 236]
        ]
    }, {
        filePath: "content/models/10.jpg",
        eyePositions: [
            [129, 235],
            [250, 235]
        ]
    }, {
        filePath: "content/models/11.jpg",
        eyePositions: [
            [130, 238],
            [256, 239]
        ]
    }, {
        filePath: "content/models/12.jpg",
        eyePositions: [
            [136, 225],
            [252, 224]
        ]
    }, {
        filePath: "content/models/13.jpg",
        eyePositions: [
            [134, 238],
            [251, 239]
        ]
    }, {
        filePath: "content/models/14.jpg",
        eyePositions: [
            [129, 236],
            [254, 238]
        ]
    }, {
        filePath: "content/models/15.jpg",
        eyePositions: [
            [130, 238],
            [251, 237]
        ]
    }, {
        filePath: "content/models/16.jpg",
        eyePositions: [
            [130, 236],
            [251, 237]
        ]
    }, ];
    /**
    * Get cookie by name
    */
    this.getCookie = function(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    if (this.getCookie('tryon_user_photo_path') && 'men' == this.getCookie('tryon_user_gender')) {
        models.men.unshift({
            filePath: this.getCookie('tryon_user_photo_path'),
            eyePositions: []
        })
    }
    if (this.getCookie('tryon_user_photo_path') && 'women' == this.getCookie('tryon_user_gender')) {
        models.women.unshift({
            filePath: this.getCookie('tryon_user_photo_path'),
            eyePositions: []
        })
    }

    this.createTryOnElem = function() {
    	//initialize
        tryOn.init({
            template: _.template(document.getElementById('tryon-template').innerHTML),
            templateParams: {
                menModels: models.men,
                womenModels: models.women,
                localPhotos: true,
                webcam: true,
                rz: false,
                controls: true,
            },
            faceTracker: faceClmTracker,
        });
        //render
        tryOn.render();
        tryOnElem = tryOn.getElem();
        document.getElementById('tryon-container').appendChild(tryOnElem);
        tryOn.draw({
            glassesSrc: document.getElementsByName('tryon-glasses')[0].value,
            trackerParams: {
                stopOnConvergence: false
            },
            trackerCanvas: document.getElementById('image'),
            overlayCanvas: document.getElementById('overlay'),
            model: pModel,
            renderMaxLoopNum: 100,
            fotoSrc: models.men[0].filePath,
            eyePositions: models.men[0].eyePositions,
            faceContainerWidth: document.getElementById('container').clientWidth,
        })
        return;
    }
}
window.addEventListener('load', function(e) {
    e = e || event;
    scriptController.createTryOnElem();
    return;
})
