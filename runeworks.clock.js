/*
  USE:

  let c = new runeworks.clock.make( yourCallback, options{fps} )
      c.prepare().loop()
      c.report( window.innerWidth - 360, 13 )
 */

runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.clock = (function() {
  let defaults = {
    fps : 60,
  }  

  class Clock {
    constructor( callback, options ) {
      this.stopped = false
      this.frame = 0
      this.freq  = typeof options != 'undefined' ? (options?.fps ? options?.fps : defaults.fps) : defaults.fps
      this.fpsi  = 0
      this.init  = 0
      this.now   = 0
      this.then  = 0
      this.gone  = 0

      this.ssize  = 60
      this.sindex = 0
      this.sample = []

      this.callback = callback

      this.reportID = 'runeworks-test-Clock'
      
      this.prepare()
    }
    setFPS( f ) {
      this.freq = f
      this.fpsi = 1000 / this.freq
      return this
    }
    prepare() {
      this.stopped = false
      this.fpsi  = 1000 / this.freq
      this.then  = performance.now()
      this.init  = this.then
      return this
    }
    pause() {
      this.stopped = true; return this;
    }
    unpause() {
      this.stopped = false; return this;
    }
    reset() {
      this.pause()
      this.frame = 0
    }
    fps() {
      let m = [].concat(this.sample)
          m.sort((a,b) => { return a < b ? -1 : 1 })
      let g = m[m.length-1] - m[0]
      let f = m.length - 1
      return f * 1000 / g
    }
    loop() {
      if (this.stopped) { /* do nothing */ } else {
        this.now  = performance.now()
        this.gone = this.now - this.then
        if (this.gone > this.fpsi) {
          this.then = this.now - (this.gone % this.fpsi)
          this.frame++
          this.callback()
          // fps sampling
          this.sample[this.sindex] = this.now
          this.sindex++
          if (this.sindex >= this.ssize) this.sindex = 0
        }
      }
      window.requestAnimationFrame( this.loop.bind(this) )
    }
    replaceCallback( newCallback ) {
      this.oldCallback = this.callback
      this.callback    = newCallback
    }
    report(left, top) {
      let canvas    = document.createElement('canvas')
        canvas.id = this.reportID
        canvas.width  = 344
        canvas.height = 311
        canvas.style.zIndex = 999
        canvas.style.position = 'absolute'
        canvas.style.border   = '1px solid rgba( 144, 201, 233, 1.00 )'
        canvas.style.borderRadius = '6px'

      document.body.appendChild( canvas )

      canvas.style.top  = top ? top : 0
      canvas.style.left = left ? left : 0

      let context = canvas.getContext('2d')
      // FPS Buttons
      let fpsOptions = [30, 60, 90, 120]
      let fod = {
        left   : 13,
        top    : 13,
        between: 6,
        width  : 74,
        height : 42,
        radius : 6,
        font   : '18px serif',
      }
      let fpsDims = fpsOptions.map(function(ea, i) {
        return {
         x: fod.left + i * (fod.width + fod.between), 
         y: fod.top,
         w: fod.width,
         h: fod.height
        }
      })
      // Start and Stop buttons
      let sb = {
        left  : fod.left,
        top   : fod.top + fod.height + 16,
        width : fod.width + fod.between + fod.width,
        height: fod.height,
        radius: fod.radius,
        font  : '18px serif',
      }
      let xb = {
        left  : fod.left + sb.width + fod.between,
        top   : sb.top,
        width : sb.width,
        height: sb.height,
        radius: sb.radius,
        font  : sb.font,
      }
      let an = {
        left  : fod.left,
        top   : xb.top + xb.height + 14,
        width : xb.left + xb.width,
        height: xb.height,
        font  : '10px serif',
        lineHeight: 13,
      }
      let fs = {
        left  : fod.left,
        top   : xb.top + xb.height + 98,
        width : xb.left + xb.width,
        height: xb.height,
        font  : '46px serif',
      }

      let refresh = function() {
        // wipe the canvas
        context.clearRect( 0, 0, canvas.width, canvas.height )
        context.closePath()
        // create a selection of FPS options to test
        context.font = fod.font
        context.textAlign    = 'center'
        context.textBaseline = 'middle'
        for (var i = 0; i < fpsOptions.length; i++) {
          context.beginPath()
          context.roundRect( fod.left + i * (fod.width + fod.between), fod.top, fod.width, fod.height, fod.radius )
          context.stroke()
 
          let mp = fod.left + i * (fod.width + fod.between) + fod.width/2
          context.fillText( fpsOptions[i] + ' fps', mp, fod.top + fod.height/2 )

          context.closePath()
        }
        // draw a start / continue button
        context.beginPath()
        context.roundRect( sb.left, sb.top, sb.width, sb.height, sb.radius )
        context.stroke()
        context.font = sb.font
        context.fillText( 'Start/Unpause', sb.left + sb.width/2, sb.top + sb.height/2 )
        // draw a pause button
        context.beginPath()
        context.roundRect( xb.left, xb.top, xb.width, xb.height, xb.radius )
        context.stroke()
        context.font = xb.font
        context.fillText( 'Pause', xb.left + xb.width/2, xb.top + xb.height/2 )

        // annotate with advice re: separating game engine logic frequency
        context.font = an.font
        context.fillText( `Please remember that your engine calculations should occur`, an.left + an.width/2, an.top + an.height/2  + an.lineHeight * 0)  
        context.fillText( `at an independent rate to your renderer or your users may `, an.left + an.width/2, an.top + an.height/2  + an.lineHeight * 1)  
        context.fillText( `have a different experience if their framerates vary.`, an.left + an.width/2, an.top + an.height/2 + an.lineHeight * 2 ) 
      
        // write FPS
        context.font = fs.font
        context.fillText( this.fps().toFixed(1), fs.left + fs.width/2, fs.top + fs.height/2 ) 
      }

      // Listen for buttons
      canvas.addEventListener('click', function(e) {
        let r = canvas.getBoundingClientRect()
        let mp = {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
        }
        // test each button
        let hit = false
        for (var i = 0; i < fpsDims.length; i++) {
          let b = fpsDims[i]
          if (mp.x > b.x && mp.x < (b.x + b.w) &&
              mp.y > b.y && mp.y < (b.y + b.h)) {
            hit = fpsOptions[i]
            break
          }
        }
        if (!hit) {
          if (mp.x > sb.left && mp.x < (sb.left + sb.width) &&
              mp.y > sb.top  && mp.y < (sb.top  + sb.height)) {
             hit = 'start'
          } else if (mp.x > xb.left && mp.x < (xb.left + xb.width) && 
              mp.y > xb.top  && mp.y < (xb.top  + xb.height)) {
             hit = 'pause'
          }
        }

        if (!hit) return
        switch(hit) {
          case 30:
            this.setFPS( 30 )
            break;
          case 60:
            this.setFPS( 60 )
            break;
          case 90:
            this.setFPS( 90 )
            break;
          case 120:
            this.setFPS( 120 )
            break;
          case 'start':
            this.unpause()
            break;
          case 'pause':
            this.pause()
            break;
        }
      }.bind(this))

      // Inject refresh() into our callback, but allow us to retrieve original callback
      let g = this.callback
      let r = refresh.bind(this)
      let f = function() { 
        g()
        r()
      }
      this.replaceCallback( f )
    }
    unreport() {
      this.callback = this.oldCallback
      document.querySelector('#' + this.reportID)?.remove()
    }
  }

  return {
    make: Clock,
  }
})()
