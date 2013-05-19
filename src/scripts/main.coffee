
number =
    random: (options = {}) ->
      options.min ?= 0
      options.max ?= 1
      diff = options.max - options.min
      offset = Math.random() * diff
      ret = options.min + offset
      return ret

i = 0
colors = ['red','orange','yellow','green','blue','purple']
color =
  random: ->
    return colors[i++]

$ ->

  $menu = $('#menu')
  $topbar = $('#topbar')
  $peekBtn = $('button#peek')


  $element = $('#my-card-view')

  # create
  $element.cardView({
    #easing: 'linear'
    #fullscreen: false
    # activate: {
    #   index: 0
    #   animate: false
    # }
    #activate: 1
    start: 'peek'
  })

  ###
  * CUSTOMIZATIONS
  ###
  $cards = $element.cardView('getCards')
  $cards.each (i, el) ->
    $el = $(el)
    $el.css({
      'background-color': color.random()
    })
    $el.append(lorem.ipsum('p10'))

  $element.on 'cards.activate.complete', (e) ->
    $peekBtn.css('visibility', 'visible')

  $element.on 'cards.changestate', (e, state) ->
    if state is 'peeking'
      $peekBtn.css('visibility', 'hidden')

  $peekBtn.css('visibility', 'hidden')

  # FOUC
  $element.show()


  ###
  * UI
  ###

  $topbar.find('.item').each(((i, el) ->
    $el = $(el)
    $el.on 'mouseenter', (e) ->
      $element.cardView('peek', i)
    $el.on 'click', (e) ->
      $element.cardView('activate', i)
  ))

  $peekBtn.on 'click', ->
    $element.cardView('peek')

  
  cv = $element.cardView('instance')

  # swipe support disables click on chrome...
  swipe = false
  if swipe
    cv.getCards().swipe({
      swipe: (e, dir, dist, dur, fingers) ->
        console.log arguments
        if cv.state is 'peeking'
          alert dir + ' ' + dist + ' ' + dur
          peekIndex = cv.peekIndex
          if dir is 'right' and peekIndex > 0
            $element.cardView('peek', peekIndex - 1)
          if dir is 'left' and peekIndex < cv.$cards.length - 1
            $element.cardView('peek', peekIndex + 1)
        else
          e.preventDefault()
          return false
    })

  window.$e = $element
  window.cv = $e.cardView('instance')

  meta = $.parseJSON("!{META}")
  $('.timestamp').text(meta.timestamp)


