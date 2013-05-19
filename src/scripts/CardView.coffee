(((root, factory) ->

  root.CardView = factory(jQuery)

))(this, (($)->


  fracToPerc = (frac) ->
    return (frac  * 100) + '%'


  percToFrac = (perc) ->
    perc = perc.substr(0, perc.length - 1)
    return parseFloat(perc) / 100


  (class CardView

    constructor: (options = {}) ->
      that = @

      defaults =
        $element: null
        cardWidthSlice: 0.10
        cardWidthFocus: 'auto'
        cardWidthActive: 0.10
        speed: 0.0005 # fraction per millisecond
        easing: 'easeOutQuart'
        zIndex: 10
        resizeTime: 250
        fullscreen: true
        initialize: false
        debounceCardMouseEnter: 100
        activeIndex: 0
        peekIndex: 0

      # safe copy and cleanup
      settings = $.extend {}, defaults, options
      for key, value of settings
        if key of defaults and (not(key of @))
          @[key] = value
      @settings = settings

      @$cards = []
      @animationTargets = []

      if settings.initialize
        @initialize()

      if settings.start is 'peek'
        @peek()
      else if settings.activate isnt false
        settings.activate ?= 0
        defaults =
          animate: false
        if $.type(settings.activate) is 'number'
          index = settings.activate
          options = $.extend {}, defaults
        else
          index = settings.activate.index
          options = $.extend {}, defaults, settings.activate
          delete options.index
        @activate(index, options)


    listenWindowResize: ->
      $window = $(window)
      resizer = $.throttle @resizeTime, (e) ->
        #width = $window.width()
        #that.$element.width(width)

      $window.on 'resize', resizer


    initialize: ->

      @listenWindowResize()

      classes = ['card-view']
      if @fullscreen
        classes.push('card-view-fullscreen') 
      else
        classes.push('card-view-not-fullscreen')
      console.log classes
      @$element.addClass(classes.join(' '))
      @$element.css({
        'position': 'relative'
        'overflow-x': 'hidden'
      })

      @$cards = @$element.children()

      @$cards
        .addClass('card')
        .css({
          'top': 0
          'left': '0%'
          'position': 'absolute'
        })
      @$cards
        .each (i, el) ->
          $el = $(el)
          $el.data('card-index', i)
          $el.addClass('card-' + i)

      @$element.trigger('cards.initialize', [@$cards])

      @listenWindowResize()


    getActiveCard: ->
      return @getCard(@activeIndex)

    getCard: (index) ->
      return @$cards.eq(index)

    getCards: ->
      return @$cards

    cardWidth: ->
      return '100%'


    setAnimationTargets: (targets) ->
      that = @
      for to, i in targets
        @animationTargets[i] ?= {}

        #if @animationTargets[i].to isnt to

        $card = @getCard(i)
        # absolute / page coordinates, since fixed
        #position = $card.offset()
        #from = if position then position.left else 0
        #from = if position then position.left else 0
        percFrom = $card.get(0).style.left
        percTo = fracToPerc(to)

        from = percToFrac(percFrom)
        if isNaN(from)
          console.warn 'from is NaN'
          from = 0
        console.log percFrom, from

        difference = to - from
        distance = Math.abs(difference)

        duration = distance / @speed

        animTarget = {
          index: i
          to: to
          from: from
          duration: duration
        }

        @animationTargets[i] = animTarget


    onActivateComplete: (options = {}) ->
      that = @
      console.log 'act comp call'

      if that.fullscreen
        $('html, body').css({
          height: ''
          overflow: ''
        })
        that.$element.css({
          height: ''
        })

      that.$element.css({
        overflow: ''
        'overflow-x': 'hidden'
        'overflow-y': 'visible'
      })

      that.$cards.each(((i, el) ->
        $el = $(el)
        if i is that.activeIndex
          # use absolute, not fixed
          that.$element.trigger 'cards.beforestatic', [$el]
          beforeInfo = {
            position: $el.position()
            offset: $el.offset()
          }
          $el.css('position', 'static')
          console.log 'fooo', that
          if that.fullscreen
            $(window).scrollTop(beforeInfo.position.top * -1)
          else
            that.$element.scrollTop(beforeInfo.position.top * -1)
        else
          $el.css('position', 'absolute')
          $el.css('display', 'none')
      ))

      @$cards.off 'click.cards'

      #if options.complete?
      #  options.complete()
      console.log 'cards.activate.complete'
      @$element.trigger('cards.activate.complete')


    getGoalForIndex: (index) ->
      that = @
      that.activeIndex = index
      goal = []
      @$cards.each(((i, el) ->
        $el = $(el)
        # wall left
        if i <= index
          left = 0
        else # wall right
          left = 1.0
        goal[i] = left
      ))
      return goal

    activate: (index, options = {}) ->
      that = @

      @state = 'activating'
      @$element.trigger 'cards.changestate', ['activating']

      options.animate ?= true

      that.$cards.off 'mouseenter.cards'

      goal = @getGoalForIndex(index)
      that.setAnimationTargets(goal)

      if options.animate
        @$element.one 'cards.animation.complete', ->
          that.onActivateComplete(options)
        @animate()
      else
        that.$cards.each(((i,el) ->
          $el = $(el)
          $el.css('left', fracToPerc(goal[i]))
        ))
        that.activeIndex = index
        @onActivateComplete(options)


    onCardClick: (e, card) ->
      that = @
      $card = $(card)
      index = $card.data('card-index')
      @activate index


    onCardMouseEnter: (e, card) ->
      that = @
      $card = $(card)
      index = $card.data('card-index')
      if that.debounceCardMouseEnter
        $.doTimeout 'cards.peek', that.debounceCardMouseEnter, (e) ->
          that.peek(index)
        $card.one 'mouseleave.cards', ->
          $.doTimeout 'cards.peek'
      else
        cardView.peek(index)


    ###
    * Careful: this is called for each mouseover on a card.
    * Don't do any one-time logic or attach event listeners unless "wasPeeking" is false.
    ###
    peek: (index) ->
      that = @

      index ?= @activeIndex

      @peekIndex = index

      wasPeeking = @state is 'peeking'

      unless wasPeeking
        @$element.trigger 'cards.changestate', ['peeking']

        # set event listeners on cards
        @$cards.on 'click.cards', (e) ->
          that.onCardClick(e, @)

        @$cards.on 'mouseenter.cards', (e) ->
          that.onCardMouseEnter(e, @)

      @state = 'peeking'

      # disable any completing animation (cancel their callbacks)
      #TODO is this needed anymore?
      that.$element.off 'cards.animation.complete'

      that = @
      if index > (@$cards.length - 1)
        console.error('invalid index')
        return

      @$cards.each(((i, el) ->
        $card = $(el)

        if that.fullscreen
          unless i is that.activeIndex
            $card.css('top', 0)
          else
            unless wasPeeking
              that.$element.trigger 'cards.beforeunstatic', [$card]
              top = -1 * ($(window).scrollTop())
              $card.css({
                'top': top
              })
          $card.css('position', 'absolute')

        else
          unless i is that.activeIndex
            $el.css('top', 0)
          else
            unless wasPeeking
              top = -1 * that.$element.scrollTop()
              $card.css('top', top)
          $card.css('position', 'absolute')
      ))
      
      @$element.scrollTop(0)

      position = 0
      num = @$cards.length - 1

      totalWidth = 1

      widthSlice = @cardWidthSlice
      widthFocus = @cardWidthFocus
      widthActive = @cardWidthActive

      if widthActive is 'auto'
        fixedWidth = (widthSlice * (num - 1)) + widthFocus
        widthActive = totalWidth - fixedWidth
      else if widthFocus is 'auto'
        fixedWidth = (widthSlice * (num - 1)) + widthActive
        widthFocus = totalWidth - fixedWidth

      # scaling these during the math makes it more precise
      #widthSlice *= 100
      #widthFocus *= 100
      #widthActive *= 100

      goal = []

      for i in [0...@$cards.length]
        #goal.push(position / 100)
        goal.push(position)
        if i is that.activeIndex
          position += widthActive
          if i is index
            position += widthFocus - widthSlice
        else if i is index
          position += widthFocus
        else
          position += widthSlice

      that.setAnimationTargets(goal)

      @animate()


    onAnimationDone: ->
      that = @
      console.log 'cards.animation.complete'
      that.$element.trigger('cards.animation.complete')
      that.animating = false


    animate: ->
      that = @
      @animating = true

      if that.fullscreen
        $('html, body').css({
          height: '100%'
          'overflow-x': 'hidden'
        })
        $('body').css({
          'overflow-y': 'hidden'
        })
        that.$element.css({
          'height': '100%'
        })

      that.$element.css({
        'overflow': 'hidden'
      })

      that.$cards.each(((i, el) ->
        $el = $(el)
        css = {
          'z-index': that.zIndex + i
          'width': that.cardWidth()
          'display': 'block'
        }
        $el.css(css)
      ))


      done = 0
      for i in [0...that.$cards.length]
        $card = that.getCard(i)

        animTarget = that.animationTargets[i]
        {
          to
          from
          duration
        } = animTarget

        if to is from
          ++done
          that.onAnimationDone() if done is that.$cards.length
          continue

        if $card.is(':animated')
          $card.stop()

        left = fracToPerc(to)

        props = {
          left: left
        }
        opts = {
          easing: @easing
          duration: duration
          done: ->
            ++done
            that.onAnimationDone() if done is that.$cards.length
          # fail: ->
          #    console.log 'canceled'
          # progress: (animation, progress, remainingMs) ->
          #   console.log('pg')
        }
        $card.animate(props, opts)
  )
  
  ###
  * The jQuery plugin
  ###
  $.fn.cardView = ((action, args...) ->
    $this = $(@)

    unless typeof action is 'string'
      options = action
      action = 'create'
    else
      options = args[0]

    switch action
      when 'create'
        options ?= {}
        options.initialize ?= true
        console.log 'OPTIONS', options
        eachOptions = $.extend {}, options
        eachOptions.$element = $this
        console.log 'eachOptions', eachOptions
        cardView = new CardView(eachOptions)
        $this.data('cards.cardView', cardView)
      when 'instance'
        cardView = $this.data('cards.cardView')
        return cardView
      else
        cardView = $this.data('cards.cardView')
        return cardView[action].apply(cardView, args)

    return @
  )

  return CardView

))
