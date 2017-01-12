(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.MyLibrary = {});
})(this, function (exports) {
  'use strict';

  var loaded = false;
  var key = null;
  var injectedDoc = null;
  var context = getGlobalContext();

  /**
   * Set the Intercom API key
   *
   * @param newquay
   */
  function setKey(newquay) {
    key = newquay;
  }

  /**
   * Set the document, only used for passing
   * in a mock for testing.
   *
   * @param newDocument
   */
  function setDocument(newDocument) {
    injectedDoc = newDocument;
  }

  function setIntercomFunction(intercomfn) {
    context.Intercom = intercomfn;
  }

  /**
   * Get the document.  Allows us to inject a mock document
   * for testing outside a browser env.
   *
   * @returns {*|HTMLDocument}
   */
  function getDocument() {
    return injectedDoc || document;
  }

  /**
   * Intercom library requires an intercom function
   * on the window.  This function allows us to test this
   * module outside of a browser environment.
   *
   * @returns {*}
   */
  function getGlobalContext() {
    if (typeof window !== 'undefined') {
      return window;
    }
    if (typeof global !== 'undefined') {
      return global;
    }
    return {};
  }

  /**
   * Load Intercom scripts from their site.
   *
   * @param source
   */
  function loadExternalScript(source) {
    setTimeout(function () {
      var documentObj = getDocument();
      var firstScript = documentObj.getElementsByTagName('script')[0];
      var element = documentObj.createElement('script');
      element.type = 'text/javascript';
      element.async = true;
      element.src = source;
      firstScript.parentNode.insertBefore(element, firstScript);
    }, 1);
  }

  /**
   * Load intercom library as async file
   */
  function setup() {

    if (loaded) {
      return;
    }

    if (!key) {
      console.error('No key set for intercom, use setKey method to define it.');
      return;
    }

    if (typeof context.Intercom === 'function') {
      context.Intercom('reattach_activator');
      //context.Intercom('update', intercomSettings);
    } else {
        var l = function l() {
          loadExternalScript('https://widget.intercom.io/widget/' + key);
        };

        var i = function i() {
          i.c(arguments);
        };
        i.q = [];
        i.c = function (args) {
          i.q.push(args);
        };
        context.Intercom = i;

        if (context.attachEvent) {
          context.attachEvent('onload', l);
        } else {
          context.addEventListener('load', l, false);
        }
      }

    loaded = true;
  }

  /**
   * On event, fire to intercom
   */
  function trackEvent(name, meta) {
    if (typeof meta == 'object' && Object.keys(meta).length > 5) {
      console.error('Unable to track an event with more than 5 properties');
      return;
    }
    context.Intercom('trackEvent', name, meta);
  }

  /**
   * When user's data changes, set user props
   * @param meta
   */
  function update(meta) {
    context.Intercom('update', meta);
  }

  /**
   * When a user logs out, shutdown intercom
   * @param meta
   */
  function shutdown() {
    context.Intercom('shutdown');
  }

  /**
   * On login, fire event to Intercom
   */
  function boot(name, email, created_at, meta) {

    if (typeof meta !== 'object') {
      meta = {};
    }

    meta.app_id = key;
    meta.name = name;
    meta.email = email;
    meta.created_at = created_at;

    context.Intercom('boot', meta);
  }

  function showNewMessage(message) {
    context.Intercom('showNewMessage', message);
  }

  function hide() {
    context.Intercom('hide');
  }

  var index = {
    setup: setup, boot: boot, setKey: setKey, update: update, trackEvent: trackEvent, shutdown: shutdown, showNewMessage: showNewMessage, hide: hide
  };

  exports.setKey = setKey;
  exports.setDocument = setDocument;
  exports.setIntercomFunction = setIntercomFunction;
  exports.setup = setup;
  exports.trackEvent = trackEvent;
  exports.update = update;
  exports.shutdown = shutdown;
  exports.boot = boot;
  exports.showNewMessage = showNewMessage;
  exports.hide = hide;
  exports['default'] = index;
});