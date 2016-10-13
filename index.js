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
  var promise = new Promise(function (resolve, reject) {
    var url = settings[source].link.replace('[serial]', serial).replace('[page]', 1);
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
          allContents = [];
          _context.next = 3;
          return regeneratorRuntime.awrap(getPages(serial, source));

        case 3:
          lastPage = _context.sent;
          allPormises = [];
          page = 1;

        case 6:
          if (!(page <= lastPage)) {
            _context.next = 20;
            break;
          }

          console.log('start page ' + page);
          pageContents = void 0;

          if (!(method === 'await')) {
            _context.next = 16;
            break;
          }

          _context.next = 12;
          return regeneratorRuntime.awrap(getContent(serial, source, page));

        case 12:
          pageContents = _context.sent;

          allContents[page - 1] = pageContents;
          _context.next = 17;
          break;

        case 16:
          if (method === 'promise') {
            pageContents = getContent(serial, source, page);
            allPormises[page - 1] = pageContents;
          }

        case 17:
          page++;
          _context.next = 6;
          break;

        case 20:
          if (!(method === 'await')) {
            _context.next = 24;
            break;
          }

          return _context.abrupt("return", allContents);

        case 24:
          if (!(method === 'promise')) {
            _context.next = 26;
            break;
          }

          return _context.abrupt("return", new Promise(function (resolve, reject) {
            Promise.all(allPormises).then(function (datas) {
              //allContents = datas;
              resolve(datas);
            });
          }));

        case 26:
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
          _context2.next = 2;
          return regeneratorRuntime.awrap(loadSource(serial, source, method));

        case 2:
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

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  }, null, undefined);
};

console.time('Some_Name_Here');

makeBook(serial, source, title, author, 'promise');
