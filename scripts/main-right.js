(function() {
  $(function() {
    var closedWidth, colors, getClosedWidthTotal, getFrameWidth, getNumClosedPages, getOpenWidth, getPages, getSpreads, openPage;

    getFrameWidth = function() {
      var w;

      w = $(window).width();
      console.log('frameWidth=', w);
      return w;
    };
    getPages = function() {
      return $('.page');
    };
    getNumClosedPages = function() {
      return getPages().length - 1;
    };
    closedWidth = 75;
    getClosedWidthTotal = function() {
      return closedWidth * getNumClosedPages();
    };
    getOpenWidth = function() {
      var w;

      w = getFrameWidth() - getClosedWidthTotal();
      console.log('open width', w);
      return w;
    };
    getSpreads = function() {
      var spreads;

      console.log('# closed pages', getNumClosedPages());
      spreads = {
        closed: closedWidth,
        open: getOpenWidth()
      };
      console.log(spreads);
      return spreads;
    };
    openPage = function($page) {
      var $pages, right, spreads;

      $pages = getPages();
      spreads = getSpreads();
      right = 0;
      return $($pages.get().reverse()).each(function(i, el) {
        var $el, isOpenPage, spread;

        $el = $(el);
        isOpenPage = $el.get(0) === $page.get(0);
        spread = isOpenPage ? spreads.open : spreads.closed;
        $el.animate({
          right: right
        }, {
          duration: 750,
          easing: 'easeOutCirc',
          queue: false
        });
        return right += spread;
      });
    };
    colors = ['red', 'green', 'blue', 'yellow'];
    getPages().each((function(i, el) {
      var $el;

      $el = $(el);
      $el.css('z-index', (getPages().length - i) + 10);
      $el.css('background-color', colors[i]);
      $el.addClass('lorem_s');
      return $el.ipsum();
    }));
    getPages().each((function(i, el) {
      console.log('hey');
      return $(el).width(getOpenWidth());
    }));
    openPage(getPages().eq(0));
    return getPages().on('mouseover', function(e) {
      var $this;

      $this = $(this);
      return openPage($this);
    });
  });

}).call(this);
