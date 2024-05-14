/*
   This is a weird one.

   Preloader removes any scripts from your prefixed modules, as long as you respond to the destruct signal you provide.
   It will then sequentially load a series of files given by
     prefix + separator + parentName + module + .js
   The load process is creating a script classed to "moduleName" to allow for destruction and removal

   This allows you to load and sequence and reset every file - the major issue is dealing with untagged or variant eventListeners as we don't yet have a global registry of these in JS

   EXAMPLE:
   await runeworks.preloader.initialise( // list, parentName, moduleName, prefix, separator, initialiseEvent, destructEvent
    [ // insert any modules in here.
      'preloader',
      'clock',
    ],
    'runeworks',
    'runeworks-script',
    '',
    null,
    'started',
    'self-destruct',
   )
 */

runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.preloader = (function() {
  /* Meta variables */

  let defaults = {
    parent: 'runeworks',
    events: {
      ready   : 'runeworks-preloader-Ready',
      destruct: 'runeworks-preloader-Destruct',
    },
    settings: {
      modules   : [],
      moduleName: 'runeworks-preloader-Script',
      prefix    : 'js',
      separator : '\\',
    },
  }

  /* Memory */
  let parent, events, settings;
  
  /* Computational variables */
  let loadState = 0, loadLength = 0, loadStartTime = 0;

  let clear = function() {
    // send a self-destruct signal to all modules
    raiseEvent( events.destruct )
    // delete all module object
    settings.modules.forEach(module => {
      if ( typeof window[parent] != 'undefined' && window[parent][module] ) { delete window[parent][module] }
    })
    // empty "head"
    let m = qselect( `.${settings?.moduleName}` )
    if (m.length > 1) {
      m?.forEach(s => s.remove())
    } else {
      m.remove()
    }
  }
  
  let completeInitialisation = function() {
    let delta = new Date().getTime() - loadStartTime
    report( `Loading ${loadLength} files complete. Processing time: ${delta}ms` )
    report( window[parent] )
    
    // Post initialisation
    raiseEvent( events.ready )
  }
  
  let initialise = async function( list, parentName, moduleName, prefix, separator, readyEvent, destructEvent ) {
    // save some data
    if (typeof parent == 'undefined') {
       parent = parentName ? parentName : defaults.parent
       if (typeof window[parent] == 'undefined') window[parent] = {}
    }
    if (typeof settings == 'undefined') {
       settings = {}
       settings.modules    = list
       settings.moduleName = moduleName ? moduleName : defaults.settings.moduleName
       settings.prefix     = typeof prefix != 'undefined'    ? prefix     : defaults.settings.prefix
       settings.separator  = separator === null ? '' : typeof separator != 'undefined' ? separator  : defaults.settings.separator
    }
    if (typeof events == 'undefined') {
       events = {}
       events.ready    = readyEvent    ? readyEvent    : defaults.events.ready
       events.destruct = destructEvent ? destructEvent : defaults.events.destruct
    }

    // clone our loadList
    let loadList = list ? list : [].concat( settings.modules )
    
    // clear old scripts
    if (loadState === 0) clear(); loadStartTime = new Date().getTime();
    
    // perform some precomputations
    if (loadLength === 0 && loadList.length > 0) loadLength = loadList.length
    
    let h = qselect( `head` )
    let f = function(e) {
      if (loadList.length > 0) { initialise( loadList ) } else { completeInitialisation() }
    }
    let g = function(uri) { 
      loadState++; 
      report(`Loading ${uri}...`); 
      let s = document.createElement('script'); 
          s.src = uri; 
          s.type = 'text/javascript'; 
          s.className = settings.moduleName; 
          s.addEventListener('load', f); 
      h.appendChild(s) 
      }
    
    // begin
    g( `${settings.prefix}${settings.separator}${parent}.${loadList.shift()}.js` )
  }

  /* Helper functions */
  let raiseEvent = function( e, datum, bubble ) { return document.body.dispatchEvent( new CustomEvent( e, {detail: datum, bubbles: bubble ? bubble : false} ) ) }
  let qselect    = function( selector ) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  let report     = function( str ) { console.log( `[Preloader - ${parent}]:`, str ) }

  return {
    events    : function() { return events },
    list      : function() { return settings.modules },
    initialise: initialise,
  }
})()
