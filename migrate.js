var fs = require('fs');
var util = require('util');
var moment = require('moment');
var shortCodes = require('./data.json');
var sql = [];

var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var sqlFormat =
    'INSERT INTO `photos` ' +
    '(`id`, `caption`, `type`, `image_standard`, `image_retina`, `published_at`, `created_at`, `updated_at`) ' +
    'VALUES (\'%s\', \'%s\', \'%s\', \'%s\', \'%s\', \'%s\', \'%s\', \'%s\');';

//2014-10-24 22:10:02

var hasEnded = false;
function end() {
    if (hasEnded) {
        return;
    } else {
        hasEnded = true;
    }

    console.log(sql.length);
    fs.writeFile('./dump.sql', sql.join('\n\n'));
}

function process(shortCode) {
    return function (err, data) {
        if (err) {
            console.log('Unable to process ' + shortCode);
            next();

            return;
        }

        var json = JSON.parse(data);

        var date = moment.unix(+json.date).format(dateFormat);
        var now = moment().format(dateFormat);

        var caption = json.caption ? json.caption.replace(/'/g, '\\\'') : '';

        sql.push(util.format(sqlFormat,
            json.id, caption, json.type, json.image.standard, json.image.retina, date, now, now
        ));

        next();
    };
}

function next() {
    var shortCode = shortCodes.shift();
    if ( ! shortCode) return end();

    var filename = util.format('./data/%s.json', shortCode);
    fs.readFile(filename, process(shortCode));
}

next();
