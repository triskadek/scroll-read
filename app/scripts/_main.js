/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
 (function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

 }(jQuery));

 var Utils = (function() {
  var
  getDocumentHeight = function() {
    return Math.max(
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
      Math.max(document.body.clientHeight, document.documentElement.clientHeight));
  },

  norm = function(value, min, max) {
    return (value - min) / (max - min);
  },

  lerp = function(norm, min, max) {
    return (max - min) * norm + min;
  },

  map = function(value, sourceMin, sourceMax, destMin, destMax) {
    return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
  },

  clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  throttle = function (fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
      var context = scope || this;

      var now = +new Date,
          args = arguments;
      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  };

  return {
    getDocumentHeight: getDocumentHeight,
    norm: norm,
    lerp: lerp,
    map: map,
    clamp : clamp,
    throttle : throttle
  };

 })();

 var ScrollModule = (function() {

  'use strict';

  var
  elements = {},
  lastScrollTop = 0,
  sourceMin,
  scrollDirection = '',
  classes = {
    'thumbActive' : 'o-sidebar__post--active',
    'progress' : 'o-read-bar'
  },

  templates = {
    'sidebar': 'sidebar-posts-tpl',
    'post': 'post-tpl'
  },

  blog = {},

  index,

  cache = function() {
    elements.sidebar = $('section.o-sidebar__container');
    elements.main = $('.o-main__inner');
  },

  onScroll = function() {

    var
      article = elements.main.children().eq(0),

      win = {
        top: $(window).scrollTop(),
        height: $(window).height(),
        offset: function() {
          return this.height + this.top
        }
      },

      rect = {
        height: article.height(),
        top: article.position().top,
        offset: function() {
          return this.height + this.top;
        }
      },

      ammout = 10,

      progressRead = Utils.map(
        win.top, 0, (rect.height - win.height),
        0, elements.sidebar.width());


    console.log(rect);

    elements.thumbnail.find( '.' + classes.progress ).width( progressRead );

    if (win.offset() > (rect.offset() - ammout)) {

      var scrollY = elements.thumbnail.position().top + elements.thumbnail.height();

      if (scrollDirection === 'DOWN') {
        renderNexPost();
      } else {

      }

      // elements.sidebar.stop().animate({
      //   scrollTop: elements.activePost.position().top + elements.activePost.height()
      // }, 500, function() {
      //   elements.activePost.removeClass(classes.postActive);
      //   elements.activePost.find('.o-read-bar__progress').width(0);

      //   index += 1;

      //   elements.activePost = elements.sidebar.find('article.o-sidebar__post').eq(index);
      //   elements.activePost.addClass(classes.postActive);
      //   renderNexPost();
      // });

      return;
    }

  },

  bindEvents = function() {

    $(document).on('scroll', function (event) {
      var
        win = {
          top: $(window).scrollTop(),
          height: $(window).height(),
          bottom: function() {
            return this.height  + this.top
          },

          offset : function () {
            return this.bottom() -  ((this.height / 3) * 2 )
          }
        },
        rect = {
          height: elements.article.height(),
          top: elements.article.position().top,
          bottom: function() {
            return this.height + this.top;
          }
        },

           progressRead = Utils.map(
            win.top, sourceMin, (rect.bottom() - win.height / 3),
            0, elements.sidebar.width());

           console.log(rect.bottom() - win.height / 3);

        elements.thumb.find('.' + classes.progress).width( progressRead );

        if (win.offset() > rect.bottom()) {

          index++;
          index = Utils.clamp(index, 0, elements.main.children().length -1 );

          elements.thumb = elements.sidebar.children().eq(index);
          elements.article = elements.main.children().eq(index);

          sourceMin = win.top + win.height / 3;
          console.log(sourceMin);

          console.log(elements.thumb);
          console.log(elements.article);
        }

    });

    // $(document).on('scroll', function() {

    //   var currentScroll = $(this).scrollTop();
    //   scrollDirection = currentScroll > lastScrollTop ? 'UP' : 'DOWN';
    //   lastScrollTop = currentScroll;

    //   onScroll();

    // });

  },

  fetchJSON = function() {
    var url = 'http://localhost:3000/posts';

    return $.getJSON(url, function(data) {
      blog.posts = data;
      $.publish('scroll/results');
    });
  },

  renderResults = function() {

    var thumbs = template(templates.sidebar)(blog),
    articles = template(templates.post)(blog);

    elements.sidebar.append(thumbs);
    elements.main.append(articles);

    // first post and t8humb
    // setTimeout(function () {
    //   $('html, body').scrollTop(0);
    // },500);

    index = 0;
    sourceMin = 0;
    elements.thumb = elements.sidebar.children().eq(index);
    elements.article = elements.main.children().eq(index);

  },

    renderNexPost = function () {
      index++;
      index = Utils.clamp(index, 0, blog.posts.length - 1);

      var post = template(templates.post)(blog.posts[index]);

      elements.thumbnail = elements.thumblist.eq(index);
      elements.main.empty().append(post);

      elements.thumbnail.addClass(classes.thumbActive);
      onScroll();

    },

    subscriptions = function() {
      $.subscribe('scroll/initialize', fetchJSON);
      $.subscribe('scroll/results', renderResults);
    },

    template = function(idTemplate) {
      var source = $('#' + idTemplate).html();
      return Handlebars.compile(source);
    },

    create = function() {

      cache();
      bindEvents();
      subscriptions();

      $.publish('scroll/initialize');
    };


    return {
      create: create
    };

  })();


  $(document).ready(function() {
    ScrollModule.create();
  });
