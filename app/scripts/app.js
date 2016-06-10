var app = window.app = {};
app.widgets = app.widgets || {};

function throttle(fn, threshhold, scope) {
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
}

app.widgets.scrollRead = {
  init: function() {
    var self = this;

    this.sidebar = $('.o-sidebar__container');
    this.main = $('.o-main__inner');
    this.didScroll = false;

    $(window).on('beforeunload', function(){
      $(window).scrollTop(0);
      console.log('pii');
    });

    setInterval(function () {
      if (self.didScroll) {
        self.didScroll = false;
        self.mainScroll();
      }
    },500);

    this.collectPosts();


  },

  isElementInViewport : function (el) {
   var r, html;
       if ( !el || 1 !== el.nodeType ) { return false; }
       html = document.documentElement;
       r = el.getBoundingClientRect();

       return ( !!r
         && r.bottom >= 0
         && r.right >= 0
         && r.top <= html.clientHeight
         && r.left <= html.clientWidth
       );
  },

  mainScroll: function() {
    var
          self = this,
          posts = this.main.find('.o-post');


        var coordinates = []
        for (var i = 0; i < posts.length; i++) {
          var coordinate = posts.eq(i).position();
          coordinates.push(parseInt(coordinate.top, 10));
        }

        var position = $('.o-header').offset();

        for (var i = 0; i < coordinates.length; i++) {
          if(position.top >= coordinates[i] && position.top < coordinates[i +1]) {
            self.updateProgress(posts.eq(i));
            posts.removeClass('o-post--active');
            posts.eq(i).addClass('o-post--active');

          }
        }
  },

  updateProgress: function(post) {
    var
      post = post,
      self = this,
      progress = self.sidebar.find('.o-sidebar__post').eq(post.index()).find('.o-read-bar'),
      max = post.scrollTop() + post.height(),
      value = $(window).scrollTop(),

    width = Math.round(value) / Math.round( max ) * 100) - 100 * post.index();
    console.log('width', width + '%', post.index());
    //progress.css('width', width + '%');
  },

  collectPosts: function() {
    var self = this;
    $.getJSON('http://localhost:3000/posts', function (articles) {

      var thumbList = self.renderTemplate('sidebar-posts-tpl')(articles);
      var postList = self.renderTemplate('post-tpl')(articles);

      self.sidebar.append(thumbList);
      self.main.append(postList);
      self.posts = self.main.find('.o-post');
      // scroll tracking
      $(window).on('scroll', function () {
        self.didScroll = true;
      });

    });
  },

  renderTemplate : function (idTemplate) {
    var source = $('#' + idTemplate).html();
    return Handlebars.compile(source);
  }
}

$(document).ready(function () {
  app.widgets.scrollRead.init();
});
