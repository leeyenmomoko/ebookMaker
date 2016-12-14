"use strict";

require("babel-polyfill");

var request = require("request");
var cheerio = require('cheerio');
var Epub = require("epub-gen");
var settings = require('./settings.json');

// http://ck101.com/thread-1321314-1-1.html
var serial = '1321314';
var source = 'ck101';
var title = '聖戒';
var author = '遊魂';
//console.log(settings);

var chkTitle = function chkTitle(str) {
  var titleRegex = /.*第[1234567890零一二兩三四五六七八九十百佰千萬億兆京垓]*章.*/g;
  if (str.match(titleRegex)) {
    return true;
  }
  return false;
};

var getPages = function getPages(serial, source) {
  console.log(settings);
  console.log('aa' + serial + source);
  var url = settings[source].link.replace('[serial]', serial).replace('[page]', 1);
  console.log(url);
  var promise = new Promise(function (resolve, reject) {
    var url = settings[source].link.replace('[serial]', serial).replace('[page]', 1);
    console.log(url);
    var req = request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        (function () {
          var $ = cheerio.load(body);
          var pages = [];
          $(settings[source].pages_container).each(function (i, elem) {
            var pageString = $(elem).text().replace('...', '').trim();
            if (/^\d*$/g.test(pageString)) {
              pages.push(pageString);
            }
          });
          resolve(Math.max.apply(Math, pages));
        })();
      }
    });
  });
  return promise;
};

var getContent = function getContent(serial, source, page) {
  var promise = new Promise(function (resolve, reject) {
    var url = settings[source].link.replace('[serial]', serial).replace('[page]', page);
    var req = request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        (function () {
          var outputContents = [];
          var $ = cheerio.load(body, {
            normalizeWhitespace: true
          });

          // remove Tags

          var _loop = function _loop(tag) {
            if ($(tag).length > 0) {
              $(tag).each(function (i, elem) {
                switch (settings[source].removeTags[tag]) {
                  case 'removeTag':
                    $(elem).replaceWith($(elem).text());
                    break;
                  case "cleanDuplicate":
                    if (typeof $(elem).next()[0] !== 'undefined' && $(elem).next()[0].name === 'br') {
                      $(elem).remove();
                    }
                    break;
                  default:
                    $(elem).replaceWith(settings[source].removeTags[tag]);
                }
              });
            }
          };

          for (var tag in settings[source].removeTags) {
            _loop(tag);
          }

          // parse title & content
          $(settings[source].main_content_container).each(function (i, elem) {
            var article = {
              title: '',
              content: ''
            };

            var originalContents = $(elem).contents(); //.replace('...', '').trim();
            originalContents.each(function (i, line) {
              var content = $(line).text().trim().replace(' ', '').replace(' ', '');
              if (content !== '') {
                // check title or content
                if (chkTitle(content) && article.title === '') {
                  var last = void 0;
                  for (var titleSpliter in settings[source].title_spliter) {
                    var find = content.indexOf(settings[source].title_spliter[titleSpliter]);
                    if (find !== -1) {
                      article.title = content.substr(find + 1);
                    }
                  }
                } else {
                  article.content += "<p>" + content + "</p>\n";
                }
              }
            });

            if (article.content.trim() !== '') {
              outputContents.push(article);
            }
          });
          console.log('page ' + page + ' completed.');
          resolve(outputContents);
        })();
      } else {
        reject(error);
      }
    });
  });

  return promise;
};

var loadSource = function _callee(serial, source, method) {
  var allContents, lastPage, allPormises, page, pageContents;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('starting load page');
          allContents = [];
          _context.next = 4;
          return regeneratorRuntime.awrap(getPages(serial, source));

        case 4:
          lastPage = _context.sent;
          allPormises = [];
          page = 1;

        case 7:
          if (!(page <= lastPage)) {
            _context.next = 21;
            break;
          }

          console.log('start page ' + page);
          pageContents = void 0;

          if (!(method === 'await')) {
            _context.next = 17;
            break;
          }

          _context.next = 13;
          return regeneratorRuntime.awrap(getContent(serial, source, page));

        case 13:
          pageContents = _context.sent;

          allContents[page - 1] = pageContents;
          _context.next = 18;
          break;

        case 17:
          if (method === 'promise') {
            pageContents = getContent(serial, source, page);
            allPormises[page - 1] = pageContents;
          }

        case 18:
          page++;
          _context.next = 7;
          break;

        case 21:
          if (!(method === 'await')) {
            _context.next = 25;
            break;
          }

          return _context.abrupt("return", allContents);

        case 25:
          if (!(method === 'promise')) {
            _context.next = 27;
            break;
          }

          return _context.abrupt("return", new Promise(function (resolve, reject) {
            Promise.all(allPormises).then(function (datas) {
              //allContents = datas;
              resolve(datas);
            });
          }));

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, undefined);
};

var makeBook = function _callee2(serial, source, title, author, method) {
  var datas, option, chapter, page, articleIndex;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('start makeBook');
          _context2.next = 3;
          return regeneratorRuntime.awrap(loadSource(serial, source, method));

        case 3:
          datas = _context2.sent;


          //console.log(datas);
          option = {
            title: title, // *Required, title of the book.
            author: author, // *Required, name of the author.
            publisher: "Sample Publisher", // optional
            cover: "", // Url or File path, both ok.
            content: []
          };
          // var data = {
          //   lang: 'zh-TW',
          //   title: title,
          //   author: [author],
          //   publisher: 'Sample Publisher',
          //   description: 'none',
          //   contents: [],
          //   identifiers: {},
          //   dates: {
          //     published: new Date().toISOString().split('.')[0]+ 'Z',
          //     modified: new Date().toISOString().split('.')[0]+ 'Z'
          //   },
          //   appendChapterTitles: true,
          //   output: 'output/' + title + '.epub'
          // };
          //console.log(data);
          //data.author.push(author);

          chapter = 0;

          for (page in datas) {
            for (articleIndex in datas[page]) {
              option.content.push({
                "title": datas[page][articleIndex].title,
                "data": datas[page][articleIndex].content,
                "author": author
              });
            }
          }

          new Epub(option, "output/" + title + ".epub");
          console.timeEnd('Some_Name_Here');

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  }, null, undefined);
};

console.log('Loading function');

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = function (event, context, callback) {
  //console.log('Received event:', JSON.stringify(event, null, 2));

  var done = function done(err, res) {
    return callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? err.message : JSON.stringify(res),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  switch (event.httpMethod) {
    case 'DELETE':
      break;
    case 'GET':
      break;
    case 'POST':

      console.log(event);
      makeBook(event.body.serial, event.body.source, event.body.title, event.body.author, 'promise');
      break;
    case 'PUT':
      dynamo.updateItem(JSON.parse(event.body), done);
      break;
    default:
      done(new Error("Unsupported method \"" + event.httpMethod + "\""));
  }
};
var event = {
  "httpMethod": "POST",
  "body": {
    "serial": "1321314",
    "source": "ck101",
    "title": "聖戒",
    "author": "遊魂"
  }
};
exports.handler(event, '', '');
