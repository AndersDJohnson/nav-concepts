(function() {
  var __slice = [].slice;

  (function(root, factory) {
    return root.CardView = factory(jQuery);
  })(this, (function($) {
    var CardView, fracToPerc, percToFrac;

    fracToPerc = function(frac) {
      return (frac * 100) + '%';
    };
    percToFrac = function(perc) {
      perc = perc.substr(0, perc.length - 1);
      return parseFloat(perc) / 100;
    };
    CardView = (function() {
      function CardView(options) {
        var defaults, index, key, settings, that, value, _ref;

        if (options == null) {
          options = {};
        }
        that = this;
        defaults = {
          $element: null,
          cardWidthSlice: 0.10,
          cardWidthFocus: 'auto',
          cardWidthActive: 0.10,
          speed: 0.0005,
          easing: 'easeOutQuart',
          zIndex: 10,
          resizeTime: 250,
          fullscreen: true,
          initialize: false,
          debounceCardMouseEnter: 100,
          activeIndex: 0,
          peekIndex: 0
        };
        settings = $.extend({}, defaults, options);
        for (key in settings) {
          value = settings[key];
          if (key in defaults && (!(key in this))) {
            this[key] = value;
          }
        }
        this.settings = settings;
        this.$cards = [];
        this.animationTargets = [];
        if (settings.initialize) {
          this.initialize();
        }
        if (settings.start === 'peek') {
          this.peek();
        } else if (settings.activate !== false) {
          if ((_ref = settings.activate) == null) {
            settings.activate = 0;
          }
          defaults = {
            animate: false
          };
          if ($.type(settings.activate) === 'number') {
            index = settings.activate;
            options = $.extend({}, defaults);
          } else {
            index = settings.activate.index;
            options = $.extend({}, defaults, settings.activate);
            delete options.index;
          }
          this.activate(index, options);
        }
      }

      CardView.prototype.listenWindowResize = function() {
        var $window, resizer;

        $window = $(window);
        resizer = $.throttle(this.resizeTime, function(e) {});
        return $window.on('resize', resizer);
      };

      CardView.prototype.initialize = function() {
        var classes;

        this.listenWindowResize();
        classes = ['card-view'];
        if (this.fullscreen) {
          classes.push('card-view-fullscreen');
        } else {
          classes.push('card-view-not-fullscreen');
        }
        console.log(classes);
        this.$element.addClass(classes.join(' '));
        this.$element.css({
          'position': 'relative',
          'overflow-x': 'hidden'
        });
        this.$cards = this.$element.children();
        this.$cards.addClass('card').css({
          'top': 0,
          'left': '0%',
          'position': 'absolute'
        });
        this.$cards.each(function(i, el) {
          var $el;

          $el = $(el);
          $el.data('card-index', i);
          return $el.addClass('card-' + i);
        });
        this.$element.trigger('cards.initialize', [this.$cards]);
        return this.listenWindowResize();
      };

      CardView.prototype.getActiveCard = function() {
        return this.getCard(this.activeIndex);
      };

      CardView.prototype.getCard = function(index) {
        return this.$cards.eq(index);
      };

      CardView.prototype.getCards = function() {
        return this.$cards;
      };

      CardView.prototype.cardWidth = function() {
        return '100%';
      };

      CardView.prototype.setAnimationTargets = function(targets) {
        var $card, animTarget, difference, distance, duration, from, i, percFrom, percTo, that, to, _base, _i, _len, _ref, _results;

        that = this;
        _results = [];
        for (i = _i = 0, _len = targets.length; _i < _len; i = ++_i) {
          to = targets[i];
          if ((_ref = (_base = this.animationTargets)[i]) == null) {
            _base[i] = {};
          }
          $card = this.getCard(i);
          percFrom = $card.get(0).style.left;
          percTo = fracToPerc(to);
          from = percToFrac(percFrom);
          if (isNaN(from)) {
            console.warn('from is NaN');
            from = 0;
          }
          console.log(percFrom, from);
          difference = to - from;
          distance = Math.abs(difference);
          duration = distance / this.speed;
          animTarget = {
            index: i,
            to: to,
            from: from,
            duration: duration
          };
          _results.push(this.animationTargets[i] = animTarget);
        }
        return _results;
      };

      CardView.prototype.onActivateComplete = function(options) {
        var that;

        if (options == null) {
          options = {};
        }
        that = this;
        console.log('act comp call');
        if (that.fullscreen) {
          $('html, body').css({
            height: '',
            overflow: ''
          });
          that.$element.css({
            height: ''
          });
        }
        that.$element.css({
          overflow: '',
          'overflow-x': 'hidden',
          'overflow-y': 'visible'
        });
        that.$cards.each((function(i, el) {
          var $el, beforeInfo;

          $el = $(el);
          if (i === that.activeIndex) {
            that.$element.trigger('cards.beforestatic', [$el]);
            beforeInfo = {
              position: $el.position(),
              offset: $el.offset()
            };
            $el.css('position', 'static');
            console.log('fooo', that);
            if (that.fullscreen) {
              return $(window).scrollTop(beforeInfo.position.top * -1);
            } else {
              return that.$element.scrollTop(beforeInfo.position.top * -1);
            }
          } else {
            $el.css('position', 'absolute');
            return $el.css('display', 'none');
          }
        }));
        this.$cards.off('click.cards');
        console.log('cards.activate.complete');
        return this.$element.trigger('cards.activate.complete');
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
        this.state = 'activating';
        this.$element.trigger('cards.changestate', ['activating']);
        if ((_ref = options.animate) == null) {
          options.animate = true;
        }
        that.$cards.off('mouseenter.cards');
        goal = this.getGoalForIndex(index);
        that.setAnimationTargets(goal);
        if (options.animate) {
          this.$element.one('cards.animation.complete', function() {
            return that.onActivateComplete(options);
          });
          return this.animate();
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

      CardView.prototype.onCardClick = function(e, card) {
        var $card, index, that;

        that = this;
        $card = $(card);
        index = $card.data('card-index');
        return this.activate(index);
      };

      CardView.prototype.onCardMouseEnter = function(e, card) {
        var $card, index, that;

        that = this;
        $card = $(card);
        index = $card.data('card-index');
        if (that.debounceCardMouseEnter) {
          $.doTimeout('cards.peek', that.debounceCardMouseEnter, function(e) {
            return that.peek(index);
          });
          return $card.one('mouseleave.cards', function() {
            return $.doTimeout('cards.peek');
          });
        } else {
          return cardView.peek(index);
        }
      };

      /*
      * Careful: this is called for each mouseover on a card.
      * Don't do any one-time logic or attach event listeners unless "wasPeeking" is false.
      */


      CardView.prototype.peek = function(index) {
        var fixedWidth, goal, i, num, position, that, totalWidth, wasPeeking, widthActive, widthFocus, widthSlice, _i, _ref;

        that = this;
        if (index == null) {
          index = this.activeIndex;
        }
        this.peekIndex = index;
        wasPeeking = this.state === 'peeking';
        if (!wasPeeking) {
          this.$element.trigger('cards.changestate', ['peeking']);
          this.$cards.on('click.cards', function(e) {
            return that.onCardClick(e, this);
          });
          this.$cards.on('mouseenter.cards', function(e) {
            return that.onCardMouseEnter(e, this);
          });
        }
        this.state = 'peeking';
        that.$element.off('cards.animation.complete');
        that = this;
        if (index > (this.$cards.length - 1)) {
          console.error('invalid index');
          return;
        }
        this.$cards.each((function(i, el) {
          var $card, top;

          $card = $(el);
          if (that.fullscreen) {
            if (i !== that.activeIndex) {
              $card.css('top', 0);
            } else {
              if (!wasPeeking) {
                that.$element.trigger('cards.beforeunstatic', [$card]);
                top = -1 * ($(window).scrollTop());
                $card.css({
                  'top': top
                });
              }
            }
            return $card.css('position', 'absolute');
          } else {
            if (i !== that.activeIndex) {
              $el.css('top', 0);
            } else {
              if (!wasPeeking) {
                top = -1 * that.$element.scrollTop();
                $card.css('top', top);
              }
            }
            return $card.css('position', 'absolute');
          }
        }));
        this.$element.scrollTop(0);
        position = 0;
        num = this.$cards.length - 1;
        totalWidth = 1;
        widthSlice = this.cardWidthSlice;
        widthFocus = this.cardWidthFocus;
        widthActive = this.cardWidthActive;
        if (widthActive === 'auto') {
          fixedWidth = (widthSlice * (num - 1)) + widthFocus;
          widthActive = totalWidth - fixedWidth;
        } else if (widthFocus === 'auto') {
          fixedWidth = (widthSlice * (num - 1)) + widthActive;
          widthFocus = totalWidth - fixedWidth;
        }
        goal = [];
        for (i = _i = 0, _ref = this.$cards.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          goal.push(position);
          if (i === that.activeIndex) {
            position += widthActive;
            if (i === index) {
              position += widthFocus - widthSlice;
            }
          } else if (i === index) {
            position += widthFocus;
          } else {
            position += widthSlice;
          }
        }
        that.setAnimationTargets(goal);
        return this.animate();
      };

      CardView.prototype.onAnimationDone = function() {
        var that;

        that = this;
        console.log('cards.animation.complete');
        that.$element.trigger('cards.animation.complete');
        return that.animating = false;
      };

      CardView.prototype.animate = function() {
        var $card, animTarget, done, duration, from, i, left, opts, props, that, to, _i, _ref, _results;

        that = this;
        this.animating = true;
        if (that.fullscreen) {
          $('html, body').css({
            height: '100%',
            'overflow-x': 'hidden'
          });
          $('body').css({
            'overflow-y': 'hidden'
          });
          that.$element.css({
            'height': '100%'
          });
        }
        that.$element.css({
          'overflow': 'hidden'
        });
        that.$cards.each((function(i, el) {
          var $el, css;

          $el = $(el);
          css = {
            'z-index': that.zIndex + i,
            'width': that.cardWidth(),
            'display': 'block'
          };
          return $el.css(css);
        }));
        done = 0;
        _results = [];
        for (i = _i = 0, _ref = that.$cards.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          $card = that.getCard(i);
          animTarget = that.animationTargets[i];
          to = animTarget.to, from = animTarget.from, duration = animTarget.duration;
          if (to === from) {
            ++done;
            if (done === that.$cards.length) {
              that.onAnimationDone();
            }
            continue;
          }
          if ($card.is(':animated')) {
            $card.stop();
          }
          left = fracToPerc(to);
          props = {
            left: left
          };
          opts = {
            easing: this.easing,
            duration: duration,
            done: function() {
              ++done;
              if (done === that.$cards.length) {
                return that.onAnimationDone();
              }
            }
          };
          _results.push($card.animate(props, opts));
        }
        return _results;
      };

      return CardView;

    })();
    /*
    * The jQuery plugin
    */

    $.fn.cardView = (function() {
      var $this, action, args, cardView, eachOptions, options, _ref;

      action = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      $this = $(this);
      if (typeof action !== 'string') {
        options = action;
        action = 'create';
      } else {
        options = args[0];
      }
      switch (action) {
        case 'create':
          if (options == null) {
            options = {};
          }
          if ((_ref = options.initialize) == null) {
            options.initialize = true;
          }
          console.log('OPTIONS', options);
          eachOptions = $.extend({}, options);
          eachOptions.$element = $this;
          console.log('eachOptions', eachOptions);
          cardView = new CardView(eachOptions);
          $this.data('cards.cardView', cardView);
          break;
        case 'instance':
          cardView = $this.data('cards.cardView');
          return cardView;
        default:
          cardView = $this.data('cards.cardView');
          return cardView[action].apply(cardView, args);
      }
      return this;
    });
    return CardView;
  }));

}).call(this);
