var util = require('util');
var url = require('url');
var fs = require('fs');
var agent = require('superagent');
var shortCodes = require('../public/data.json');
var accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
var dataUrl = 'https://api.instagram.com/v1/media/shortcode/%s?access_token=%s';
var filePath = __dirname + '/../public/data/%s.json';

function next () {
    var shortCode = shortCodes.shift();
    if ( ! shortCode) return;

    var path = util.format(filePath, shortCode);
    fs.exists(path, function (exists) {
        if ( ! exists) {
            console.log('Fetching %s', shortCode);
            get(shortCode);
        } else {
            next();
        }
    });
}

function get (shortCode) {
    var url = util.format(dataUrl, shortCode, accessToken);

    agent
        .get(url)
        .on('error', function () {
            console.log('Unable to fetch data for %s', shortCode);
            next();
        })
        .end(function (res) {
            save(shortCode, res.body.data);
        });
}

function secureUrl (insecureUrl) {
    var urlObj = url.parse(insecureUrl);
    urlObj.protocol = 'https';
    return url.format(urlObj);
}

function save (shortCode, data) {
    var path = util.format(filePath, shortCode);
    var file = JSON.stringify({
        id: shortCode,
        date: data.created_time,
        url: data.link,
        type: data.type,
        location: data.location,
        caption: data.caption && data.caption.text,
        image: {
            standard: secureUrl(data.images.low_resolution.url),
            retina: secureUrl(data.images.standard_resolution.url)
        }
    });

    fs.writeFile(path, file, function (err) {
        if (err) console.log('Unable to save data for %s', shortCode);
        next();
    });
}

for (var i = 0; i < 5; i++) {
    next();
}
