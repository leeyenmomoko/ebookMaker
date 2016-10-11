"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require("babel-polyfill");
var request = require("request");
var cheerio = require('cheerio');
var settings = require('./settings.json');
// http://ck101.com/thread-1321314-1-1.html
var serial = '1321314';
var source = 'ck101';
//console.log(settings);

var getPage = function _callee(serial, source) {
  var url, req;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          url = settings[source].link.replace('[serial]', serial).replace('[page]', 1);
          _context.next = 3;
          return regeneratorRuntime.awrap(request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var _ret = function () {
                var $ = cheerio.load(body);
                var pages = [];
                $('div.pgs div.pg a').each(function (i, elem) {
                  var pageString = $(this).text().replace('...', '').trim();
                  if (/^\d*$/g.test(pageString)) {
                    pages.push(pageString);
                  }
                });
                console.log(Math.max.apply(Math, pages));
                return {
                  v: Math.max.apply(Math, pages)
                };
                //let lastPage = Math.max(...pages);
                //console.log(lastPage);
              }();

              if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            }
          }));

        case 3:
          req = _context.sent;

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};

var loadBook = function _callee2(serial, source) {
  var page;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(getPage(serial, source));

        case 2:
          page = _context2.sent;

          console.log(page);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};

loadBook(serial, source);

var content = "";
