var $window = $(window),
    $document = $(document),
    $grid = $('.media-grid');

var shortCodes = [];
var loadingUrl = './loading.png';
var isRetina = window.devicePixelRatio > 1;

var mediaTemplate =
    '<article class="media">' +
        '<figure class="media-preview">' +
            '<img src="{image}" class="media-image">' +
            '<figcaption class="media-caption"></figcaption>' +
        '</figure>' +
    '</article>';

function throttle (fn, time) {
    var last = 0;
    return function () {
        var now = Date.now(),
            since = now - last;

        if (since >= time) {
            last = now;
            fn.apply(this, arguments);
        }
    };
}

function delay (fn, time) {
    return function () {
        var that = this,
            args = arguments;

        setTimeout(function () {
            fn.apply(that, args);
        }, time);
    };
}

function subst (str, data) {
    return str.replace(/\{(\w+)\}/g, function (match, key) {
        return data[key] || '';
    });
}

function next () {
    shortCodes.splice(0, 10).forEach(function (shortCode) {
        var $loading = $(subst(mediaTemplate, {
            image: loadingUrl
        })).appendTo($grid);

        load(shortCode).then(delay(function (data) {
            var $image = $loading.find('.media-image');
            image($image, data.image.standard, data.image.retina);

            var $caption = $loading.find('.media-caption');
            $caption.text(data.caption);
        }, 1000));
    });
}

function image ($image, standard, retina) {
    var imageUrl = isRetina ? retina : standard;

    var image = new Image;
    image.src = imageUrl;

    image.onload = function () {
        $image.attr('src', imageUrl);
    };
}

function load (shortCode) {
    return $.get('./data/' + shortCode + '.json');
}

var scroll = throttle(function () {
    var documentBox = $document.height() - 300;
    var windowBox = $window.scrollTop() + $window.height();
    if (windowBox >= documentBox) next();
}, 100);

function init () {
    $window.on('scroll', scroll);
    scroll();
}

$.get('./data.json').then(function (data) {
    shortCodes = data;
    init();
});
