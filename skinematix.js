var Twit = require('twit');
var T = new Twit(require('./config.js'));
var moment = require('moment');
var wikipedia = require("node-wikipedia");
var Wikifetch = require("wikifetch").WikiFetch;
var wikifetch = new Wikifetch();
var ParseEnglish = require('parse-english');
var parseEnglish = new ParseEnglish();
var _ = require('lodash');
var nlcstToString = require('nlcst-to-string');

function skinematix(tryNum) {

    if (typeof(tryNum) === 'undefined') {
        tryNum = 0;
        console.log('running skinematix at ' + moment().format());
    } else if (tryNum > 3) {
        console.log('giving up');
    } else {
        console.log('retrying (#' + tryNum + ') at ' + moment().format());
    }

    wikipedia.categories.all("Erotic thriller films", function(data) {

        var page;

        if (!data) {
            console.log('failed to fetch category');
            return skinematix(tryNum + 1);
        }

        page = _.sample(data).title;

        if (!page) {
            console.log('failed to select page');
            return skinematix(tryNum + 1);
        }

        wikifetch.fetch(page, function(err, data) {

            var plot, paragraph, sentence;

            if (err) {
                console.log('error fetching page: ' + JSON.stringify(err));
                return skinematix(tryNum + 1);
            }

            plot = data['sections']['Plot[edit]'];

            if (!plot) {
                console.log('no plot for page ' + page);
                return skinematix(tryNum + 1);
            }

            paragraph = parseEnglish.tokenizeParagraph(plot.text).children;

            if (!paragraph) {
                console.log('failed to tokenize plot');
                return skinematix(tryNum + 1);
            }

            sentence = nlcstToString(_.sample(_.filter(paragraph, {type: 'SentenceNode'})));

            if (!sentence) {
                console.log('failed to convert SentenceNode to string');
                return skinematix(tryNum + 1);
            }

            console.log(sentence);

            T.autoTweet(sentence, '(%n/%m) %s', function(err, count) {
                if (err) {
                    console.log('tweet error:' + JSON.stringify(err));
                } else {
                    console.log('tweeted ' + count + ' part(s)');
                }
            });
        });
    });

}

skinematix();
setInterval(skinematix, 1000 * 3600);

