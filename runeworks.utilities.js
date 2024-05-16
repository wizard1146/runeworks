runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.utilities = (function() {
  /* Adds CSS */
  let addCSS = function(rule, ruleIdentifier, container, clean) {
    let rc = ruleIdentifier ? ruleIdentifier : 'customCSS'
    if (clean) {
      document.querySelectorAll(container)?.forEach(item => item.remove())
    }
    let output = '<span class="' + rc + '">&shy;<style>' + rule + '</style></span>'
    if (container) {
      document.querySelector(container).insertAdjacentHTML('beforeend', output)
    } else {
      document.body.insertAdjacentHTML('beforeend', output)
    }
  }
  
  /* Adjust DPI */
  let adjustDPI = function( canvas, targetDPI ) {
    // CSS Size
    canvas.style.width  = canvas.style.width  || canvas.width  + 'px'
    canvas.style.height = canvas.style.height || canvas.height + 'px'

    // Scale
    let isf = (targetDPI ? targetDPI : 96) / 96

    var w  = parseFloat( canvas.style.width )
    var h  = parseFloat( canvas.style.height )

    var os = canvas.width / w 
    var bs = isf / os
    var b  = canvas.cloneNode(false)
    b.getContext('2d').drawImage(canvas, 0, 0)

    canvas.width  = Math.ceil( w * isf )
    canvas.height = Math.ceil( h * isf )

    ctx.setTransform( bs, 0, 0, bs, 0, 0 ) 
    ctx.drawImage( b, 0, 0 )
    ctx.setTransform( isf, 0, 0, isf, 0, 0 )
    
    return [isf, canvas.width, canvas.height]
  }
    
  /* Extracts numbers provided in an alphanumeric string in a contiguous fashion */
  let clean = function(n) { if (typeof n !== 'string') { return n }; return Number(n.replace(/[^-\d\.]/g,'')) }
  
  /* Copies any object deeply: think this will be replaced with native functions in future */
  let clone = function(obj) {
      let copy
      if (null == obj || 'object' != typeof obj) { return obj }
      if (obj instanceof String) { return (' ' + obj).slice(1) }  /* https://stackoverflow.com/a/31733628 */
      if (obj instanceof Date) { return new Date().setTime(obj.getTime()) }
      if (obj instanceof Array) {
         copy = []
         for (let i = 0; i < obj.length; i++) { copy[i] = clone(obj[i]) }
         return copy
      }
      if (obj instanceof Object) {
         copy = {}
         for (let attr in obj) { if (obj.hasOwnProperty(attr)) { copy[attr] = clone(obj[attr]) } }
         return copy
      }
      throw new Error('Unable to copy obj! Type not supported.')
  }
  
  /* https://stackoverflow.com/a/2901298 */
  /* Inserts commas per 3 digits */
  let commaThis = function(n) { 
      let parts = n.toString().split('.')
      parts[0]  = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,',')
      return parts.join('.') }
      
  let degreesToRadians = function(degrees) { return Math.PI * degrees / 180 }

  let getDistance = function(a,b) { 
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) 
  }

  let getAngleFromPoint = function(p, cp) {
    let a = ((Math.atan2(p.y - cp.y, p.x - cp.x) * 180) / Math.PI) % 360
    return a = a < 0 ? 360 + a : a
  }
  
  /* Calculate time between two Date() objects */
  let interval = function(a, b) {
      if (!a) { return false }
      var a = a
      var b = b || new Date()
      if (b > a) { b = [a, a = b][0] } // swap variable contents
      let diff  = a.getTime() - b.getTime()
      let msecs = diff % 1000
      let secs  = Math.floor(diff / 1000)
      let mins  = Math.floor(secs / 60)
          secs  = secs % 60
      let hrs   = Math.floor(mins / 60)
          mins  = mins % 60
      let days  = Math.floor(hrs  / 24)
           hrs  =  hrs % 24
      return {milliseconds: msecs, seconds: secs, minutes: mins, hours: hrs, days: days}
  }

  /* Retrieve the key that maps to a provided value */
  let key = function(obj, v) { for (var prop in obj) { if (obj.hasOwnProperty(prop)) { if (obj[prop] === v) { return prop } } } }

  let properCase = function(str) { return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}); }

  let qselect    = function(selector) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }

  let raiseEvent = function(target, event, datum, bubble) { return target.dispatchEvent(new CustomEvent(event, {detail: datum, bubbles: bubble ? bubble : false})) };

  /* Random */
  let random = function(ceiling, min) {
     if (min && min > ceiling) { [ceiling, min] = [min, ceiling] }
     let c = ceiling || 1
     let m = min     || 0
     return (c - m) * Math.random() + m 
  }

  let randomNormal = function() {
     let u = 0;
     let v = 0;
     while(u === 0) { u = Math.random() } // Converting [0,1) to (0,1)
     while(v === 0) { v = Math.random() }
     return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }
  
  /* https://stackoverflow.com/a/49434653 */
  let randomRange = function(min, max, skew) {
     if (min && min > max) { [max, min] = [min, max] }
     var skew = skew || 1;
     let u = 0, v = 0;
     while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
     while(v === 0) v = Math.random()
     let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
  
     num = num / 10.0 + 0.5 // Translate to 0 -> 1
     if (num > 1 || num < 0) 
       num = randomRange(min, max, skew) // resample between 0 and 1 if out of range
     else{
       num  = Math.pow(num, skew) // Skew
       num *= max - min // Stretch to fill range
       num += min // offset to min
     }
     return num
  }
  
  let randomFromObject = function(obj) {
    let keys = Object.keys(obj)
    let key  = keys[Math.floor(Math.random() * keys.length)]
    return [obj[key], key]
  }

  /* Rounds numbers */
  let round = function(num, scale) {
      if (!('' + num).includes('e')) { 
        return + (Math.round(num + 'e+' + scale) + 'e-' + scale)
      } else {
        let arr = ('' + num).split('e')
        return + (Math.round(+arr[0] + 'e' + ((+arr[1] + scale > 0) ? '+' : '') + (+arr[1] + scale)) + 'e-' + scale)
      }
  }
  
  /* https://stackoverflow.com/a/2450976 */
  let shuffleArray = function(arr) {
    let ci = arr.length, ri;
    while(ci > 0) {
      ri = Math.floor(Math.random() * ci)
      ci--
      [arr[ci], arr[ri]] = [arr[ri], arr[ci]]
    }
    return arr
  }

  /* https://stackoverflow.com/a/1584377 */
  /* Compresses array by dropping sequential repeats */
  let uniqueArray = function(arr) { 
      let a = arr.concat()
      for (let i = 0; i < a.length; ++i) {
        for (let j = i+1; j < a.length; ++j) {
          if (a[i] === a[j]) { a.splice(j--, 1) }
        }
      }
      return a
  }

  /* UUID: https://stackoverflow.com/a/2117523 */
  let uuid = function() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }
  
  /* Special sorting functions */
  let chainsort = function(arr) {
    return function(a, b) {
      for (var i = 0; i < arr.length; i++) {
        var r = arr[i](a, b)
        if (r != 0) { return r }
      }
      return 0
    }
  }
  let sort_by = function(field, reverse, primer) {
    var key = primer ? function(x) { return primer(x[field]) } : function(x) { return x[field] }
    reverse = [-1, 1][+!!reverse]
    return function(a, b) {
      a = key(a)
      b = key(b)
      return a == b ? 0 : reverse * ((a > b) - (b > a))
    }
  }
  
  return {
    addCSS            :  addCSS,
    adjustDPI         :  adjustDPI,
    clean             :  clean,
    clone             :  clone,
    commaThis         :  commaThis,
    degreesToRadians  :  degreesToRadians,
    getDistance       :  getDistance,
    getAngleFromPoint :  getAngleFromPoint,
    interval          :  interval,
    key               :  key,
    properCase        :  properCase,
    qselect           :  qselect,
    raiseEvent        :  raiseEvent,
    random            :  random,
    randomNormal      :  randomNormal,
    randomRange       :  randomRange,
    randomFromObject  :  randomFromObject,
    round             :  round,
    shuffleArray      :  shuffleArray,
    uniqueArray       :  uniqueArray,
    uuid              :  uuid,
    // sorting functions
    chainsort         :  chainsort,
    sort_by           :  sort_by,
  }
})()
