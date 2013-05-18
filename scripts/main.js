(function() {
  var color, colors, i, number;

  number = {
    random: function(options) {
      var diff, offset, ret, _ref, _ref1;

      if (options == null) {
        options = {};
      }
      if ((_ref = options.min) == null) {
        options.min = 0;
      }
      if ((_ref1 = options.max) == null) {
        options.max = 1;
      }
      diff = options.max - options.min;
      offset = Math.random() * diff;
      ret = options.min + offset;
      return ret;
    }
  };

  i = 0;

  colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

  color = {
    random: function() {
      return colors[i++];
    }
  };

  $(function() {
    var $cards, $element, $menu, $peekBtn, $topbar, cv, swipe, version;

    $menu = $('#menu');
    $topbar = $('#topbar');
    $peekBtn = $('button#peek');
    $element = $('#my-card-view');
    $element.cardView({
      start: 'peek'
    });
    /*
    * CUSTOMIZATIONS
    */

    $cards = $element.cardView('getCards');
    $cards.each(function(i, el) {
      var $el;

      $el = $(el);
      $el.css({
        'background-color': color.random()
      });
      return $el.append(lorem.ipsum('p10'));
    });
    $element.on('cards.activate.complete', function(e) {
      return $peekBtn.css('visibility', 'visible');
    });
    $element.on('cards.chnagestate', function(e, state) {
      if (state === 'peeking') {
        return $peekBtn.css('visibility', 'hidden');
      }
    });
    $peekBtn.css('visibility', 'hidden');
    $element.show();
    /*
    * UI
    */

    $topbar.find('.item').each((function(i, el) {
      var $el;

      $el = $(el);
      $el.on('mouseenter', function(e) {
        return $element.cardView('peek', i);
      });
      return $el.on('click', function(e) {
        return $element.cardView('activate', i);
      });
    }));
    $peekBtn.on('click', function() {
      return $element.cardView('peek');
    });
    cv = $element.cardView('instance');
    swipe = false;
    if (swipe) {
      cv.getCards().swipe({
        swipe: function(e, dir, dist, dur, fingers) {
          var peekIndex;

          console.log(arguments);
          if (cv.state === 'peeking') {
            alert(dir + ' ' + dist + ' ' + dur);
            peekIndex = cv.peekIndex;
            if (dir === 'right' && peekIndex > 0) {
              $element.cardView('peek', peekIndex - 1);
            }
            if (dir === 'left' && peekIndex < cv.$cards.length - 1) {
              return $element.cardView('peek', peekIndex + 1);
            }
          } else {
            e.preventDefault();
            return false;
          }
        }
      });
    }
    window.$e = $element;
    window.cv = $e.cardView('instance');
    version = '18:18:16';
    return $('.version').text(version);
  });

}).call(this);
