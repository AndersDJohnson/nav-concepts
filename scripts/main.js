(function() {
  var fracToPerc, percToFrac, requestAnimationFrame;

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  window.requestAnimationFrame = requestAnimationFrame;

  window.pageStartTime = (new Date()).getTime();

  fracToPerc = function(frac) {
    return (frac * 100) + '%';
  };

  percToFrac = function(perc) {
    perc = perc.substr(0, perc.length - 1);
    return parseFloat(perc) / 100;
  };

  $(function() {
    var $arrowLeft, $menu, $topbar, CardView, activateCard, arrowLock, cardView, color, colors, doPeek, i, menuLock, number, onActivateCardComplete, onCardClick, onMouseEnter, peekPrepped, prepPeek;

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
        /*
        o = {min: 100, max: 200}
        r = Math.floor(number.random(o))
        g = Math.floor(number.random(o))
        b = Math.floor(number.random(o))
        return 'rgb(' + [r,g,b].join(',') + ')'
        */
        return colors[i++];
      }
    };
    CardView = (function() {
      function CardView() {
        var $window, resizer, that;

        that = this;
        this.$element = null;
        this.activeIndex = 0;
        this.intent = null;
        this.$cards = [];
        this._cardWidth = null;
        this.cardWidthSlice = 50;
        this.cardWidthFocus = 'auto';
        this.cardWidthActive = 50;
        this.speed = 0.001;
        this.easing = 'easeOutQuart';
        this.zIndex = 10;
        this.animationTargets = [];
        this.resizeTime = 250;
        this.growViewport = true;
        $window = $(window);
        resizer = $.throttle(this.resizeTime, function(e) {
          var width;

          width = $window.width();
          return that.$element.width(width);
        });
        $window.on('resize', resizer);
      }

      CardView.prototype.setBound = function(dir, num) {};

      CardView.prototype.initialize = function() {
        var width;

        width = $(window).width();
        this.$element.width(width);
        this.$element.addClass('card-view');
        this.$element.css({
          'position': 'relative'
        });
        this.$cards = this.$element.children();
        this.$cards.addClass('card').css({
          'top': 0,
          'left': '0%',
          'position': 'absolute'
        });
        return this.$cards.each(function(i, el) {
          var $el;

          $el = $(el);
          $el.data('card-index', i);
          $el.css({
            'background-color': color.random()
          });
          $el.append(lorem.ipsum('p10'));
          return $el.addClass('card-' + i);
        });
      };

      CardView.prototype.getActiveCard = function() {
        return this.getCard(this.activeIndex);
      };

      CardView.prototype.getCard = function(index) {
        return this.$cards.eq(index);
      };

      CardView.prototype.cardWidth = function() {
        return '100%';
        if (this._cardWidth != null) {
          return this._cardWidth;
        } else {
          return this.$element.width();
        }
      };

      CardView.prototype.setAnimationTargets = function(targets) {
        var $card, animTarget, difference, distance, duration, easing, from, that, to, _base, _i, _len, _ref, _results;

        that = this;
        _results = [];
        for (i = _i = 0, _len = targets.length; _i < _len; i = ++_i) {
          to = targets[i];
          if ((_ref = (_base = this.animationTargets)[i]) == null) {
            _base[i] = {};
          }
          if (this.animationTargets[i].to !== to) {
            $card = this.getCard(i);
            console.log($card);
            from = $card.get(0).style.left;
            from = percToFrac(from);
            if (isNaN(from)) {
              console.warn('from is NaN');
              from = 0;
            }
            difference = to - from;
            distance = Math.abs(difference);
            duration = distance / this.speed;
            easing = function(anim) {
              var pos;

              pos = $.easing[that.easing](null, anim.progress * anim.duration, anim.from, anim.difference, anim.duration);
              return pos;
            };
            animTarget = {
              index: i,
              to: to,
              from: from,
              position: null,
              distance: distance,
              difference: difference,
              duration: duration,
              easing: easing,
              startTimestamp: null,
              progress: 0,
              complete: false
            };
            console.log("" + i + ": " + to + " -> " + from);
            _results.push(this.animationTargets[i] = animTarget);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      CardView.prototype.onActivateComplete = function(options) {
        var that;

        if (options == null) {
          options = {};
        }
        that = this;
        console.log('ACTIVE COMPLETE' + (new Date()));
        if (that.growViewport) {
          $('html, body').css({
            height: '',
            overflow: ''
          });
        }
        that.$cards.each((function(i, el) {
          var $el, top;

          $el = $(el);
          if (i === that.activeIndex) {
            top = $el.offset().top;
            that.$element.trigger('beforestatic');
            $el.css('position', 'static');
            return $(window).scrollTop(top * -1);
          } else {
            $el.css('position', 'absolute');
            return $el.css('display', 'none');
          }
        }));
        if (options.complete != null) {
          return options.complete();
        }
      };

      CardView.prototype.getGoalForIndex = function(index) {
        var goal, that;

        that = this;
        that.activeIndex = index;
        goal = [];
        this.$cards.each((function(i, el) {
          var $el, left;

          $el = $(el);
          if (i <= index) {
            left = 0;
          } else {
            left = 1.0;
          }
          return goal[i] = left;
        }));
        return goal;
      };

      CardView.prototype.activate = function(index, options) {
        var goal, that, _ref;

        if (options == null) {
          options = {};
        }
        that = this;
        if ((_ref = options.animate) == null) {
          options.animate = true;
        }
        goal = this.getGoalForIndex(index);
        that.setAnimationTargets(goal);
        if (options.animate) {
          this.animate();
          return this.$element.one('cards.animation.complete', function() {
            return that.onActivateComplete(options);
          });
        } else {
          that.$cards.each((function(i, el) {
            var $el;

            $el = $(el);
            return $el.css('left', fracToPerc(goal[i]));
          }));
          that.activeIndex = index;
          return this.onActivateComplete(options);
        }
      };

      CardView.prototype.peek = function(index) {
        var fixedWidth, goal, num, position, progress, that, totalWidth, widthActive, widthFocus, widthSlice, _i, _ref;

        that = this;
        this.$element.off('cards.animation.complete');
        this.animate();
        that = this;
        if (index > (this.$cards.length - 1)) {
          console.error('invalid index');
          return;
        }
        this.$cards.each((function(i, el) {
          var $el;

          $el = $(el);
          if (i !== that.activeIndex) {
            $el.css('top', 0);
          }
          return $el.css('position', 'absolute');
        }));
        this.intended = index;
        position = 0;
        num = this.$cards.length - 1;
        totalWidth = 1;
        widthSlice = 0.10;
        widthFocus = 'auto';
        widthActive = 0.10;
        if (widthActive === 'auto') {
          fixedWidth = (widthSlice * (num - 1)) + widthFocus;
          widthActive = totalWidth - fixedWidth;
        } else if (widthFocus === 'auto') {
          fixedWidth = (widthSlice * (num - 1)) + widthActive;
          widthFocus = totalWidth - fixedWidth;
        }
        goal = [];
        for (i = _i = 0, _ref = this.$cards.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          progress = i / num;
          goal.push(position);
          if (i === that.activeIndex) {
            position += widthActive;
            if (i === that.intended) {
              position += widthFocus - widthSlice;
            }
          } else if (i === that.intended) {
            position += widthFocus;
          } else {
            position += widthSlice;
          }
        }
        return that.setAnimationTargets(goal);
      };

      CardView.prototype.beforeAnimate = function() {
        var that;

        that = this;
        if (that.growViewport) {
          $('html, body').css({
            height: '100%',
            'overflow-x': 'hidden'
          });
          $('body').css({
            'overflow-y': 'hidden'
          });
        }
        that.$element.css('height', '100%');
        return that.$cards.each((function(i, el) {
          var $el, css;

          $el = $(el);
          css = {
            'z-index': that.zIndex + i,
            'width': that.cardWidth(),
            'display': 'block'
          };
          return $el.css(css);
        }));
      };

      CardView.prototype.animate = function() {
        var cancelled, nextStep, speed, that;

        if (this.animation != null) {
          console.log('already animating');
          return;
        }
        that = this;
        speed = this.speed;
        cancelled = false;
        this.beforeAnimate();
        nextStep = function(timestamp) {
          var $card, animTarget, animationsComplete, css, difference, distance, duration, easing, from, now, progress, progressTime, to, _i, _ref;

          animationsComplete = true;
          for (i = _i = 0, _ref = that.$cards.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            animTarget = that.animationTargets[i];
            if (animTarget == null) {
              console.log('NO ANIM TARGET');
              continue;
            }
            if (animTarget['complete'] !== true) {
              css = {};
              to = animTarget.to, from = animTarget.from, distance = animTarget.distance, difference = animTarget.difference, duration = animTarget.duration, easing = animTarget.easing;
              if (animTarget.startTimestamp == null) {
                now = (new Date()).getTime();
                animTarget['startTimestamp'] = timestamp;
                progressTime = 0;
              } else {
                progressTime = timestamp - animTarget['startTimestamp'];
              }
              progress = progressTime / duration;
              animTarget.progressTime = progressTime;
              animTarget.progress = progress;
              if (progress >= 1) {
                animTarget['position'] = to;
                animTarget['complete'] = true;
              } else {
                animationsComplete = false;
                animTarget['position'] = easing(animTarget);
              }
              $card = that.$cards.eq(i);
              css.left = fracToPerc(animTarget['position']);
              $card.css(css);
            }
          }
          if (animationsComplete) {
            console.log('cards.animation.complete');
            that.$element.trigger('cards.animation.complete');
            if (that.animation != null) {
              that.animation.cancel();
            }
          }
          if (!cancelled) {
            return requestAnimationFrame(nextStep);
          }
        };
        requestAnimationFrame(nextStep);
        this.animation = {
          cancel: function() {
            cancelled = true;
            return that.animation = null;
          }
        };
        return this.animation;
      };

      return CardView;

    })();
    cardView = new CardView();
    cardView.$element = $('#my-card-view');
    cardView.initialize();
    cardView.setBound('right', -16);
    cardView.setBound('top', 48);
    $menu = $('#menu');
    $topbar = $('#topbar');
    $arrowLeft = $('.arrow-left');
    menuLock = false;
    arrowLock = false;
    peekPrepped = false;
    cardView._cardWidth = $(window).width();
    onMouseEnter = function(e) {
      var $el, index, that;

      console.log('ON MOUSE ENTER');
      that = cardView;
      that.animate();
      $el = $(this);
      index = $el.data('card-index');
      console.log('HOVER CARD ' + index);
      return cardView.peek(index);
    };
    onActivateCardComplete = function() {
      var that;

      that = cardView;
      $arrowLeft.fadeIn();
      menuLock = false;
      arrowLock = false;
      peekPrepped = false;
      return that.$cards.off('click', onCardClick);
    };
    activateCard = function(index) {
      var that;

      that = cardView;
      that.setBound('left', 0);
      that.activate(index, {
        complete: onActivateCardComplete
      });
      return that.$cards.off('mouseenter', onMouseEnter);
    };
    prepPeek = function() {
      var $card, that, top;

      if (peekPrepped) {
        return;
      }
      peekPrepped = true;
      that = cardView;
      top = -1 * ($(window).scrollTop());
      $card = that.getActiveCard();
      $card.css({
        'top': top
      });
      return that.$cards.on('click', onCardClick);
    };
    doPeek = function(index) {
      var that;

      that = cardView;
      that.peek(index);
      return that.$cards.on('mouseenter', onMouseEnter);
    };
    onCardClick = function(e) {
      var $el, index;

      menuLock = true;
      $el = $(this);
      index = $el.data('card-index');
      return activateCard(index);
    };
    $arrowLeft.on('mouseenter', function(e) {
      var $el, that;

      if (arrowLock) {
        return;
      }
      arrowLock = true;
      $el = $(this);
      $el.fadeOut();
      that = cardView;
      that.setBound('left', 200);
      that.animate();
      prepPeek();
      doPeek(that.activeIndex);
      return $menu.css('display', 'block');
    });
    cardView.$element.on('beforestatic', function() {
      return $menu.hide();
    });
    $menu.find('.item').each((function(i, el) {
      var $el;

      $el = $(el);
      $el.on('mouseenter', function(e) {
        if (menuLock) {
          return;
        }
        return doPeek(i);
      });
      return $el.on('click', function(e) {
        if (menuLock) {
          return;
        }
        return activateCard(i);
      });
    }));
    $topbar.find('.item').each((function(i, el) {
      var $el, that;

      that = cardView;
      $el = $(el);
      $el.on('mouseenter', function(e) {
        console.log('TOP HOVER');
        that.$cards.on('mouseenter', onMouseEnter);
        prepPeek();
        return doPeek(i);
      });
      return $el.on('click', function(e) {
        return activateCard(i);
      });
    }));
    $('button#peek').on('click', function() {
      prepPeek();
      return doPeek(0);
    });
    cardView.activate(0, {
      animate: false,
      complete: onActivateCardComplete
    });
    return window.cv = cardView;
  });

}).call(this);
