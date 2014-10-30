
// POLVO :: AUTORELOAD
/*! Socket.IO.js build:0.9.16, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

var io = ('undefined' === typeof module ? {} : module.exports);
(function() {

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * IO namespace.
   *
   * @namespace
   */

  var io = exports;

  /**
   * Socket.IO version
   *
   * @api public
   */

  io.version = '0.9.16';

  /**
   * Protocol implemented.
   *
   * @api public
   */

  io.protocol = 1;

  /**
   * Available transports, these will be populated with the available transports
   *
   * @api public
   */

  io.transports = [];

  /**
   * Keep track of jsonp callbacks.
   *
   * @api private
   */

  io.j = [];

  /**
   * Keep track of our io.Sockets
   *
   * @api private
   */
  io.sockets = {};


  /**
   * Manages connections to hosts.
   *
   * @param {String} uri
   * @Param {Boolean} force creation of new socket (defaults to false)
   * @api public
   */

  io.connect = function (host, details) {
    var uri = io.util.parseUri(host)
      , uuri
      , socket;

    if (global && global.location) {
      uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
      uri.host = uri.host || (global.document
        ? global.document.domain : global.location.hostname);
      uri.port = uri.port || global.location.port;
    }

    uuri = io.util.uniqueUri(uri);

    var options = {
        host: uri.host
      , secure: 'https' == uri.protocol
      , port: uri.port || ('https' == uri.protocol ? 443 : 80)
      , query: uri.query || ''
    };

    io.util.merge(options, details);

    if (options['force new connection'] || !io.sockets[uuri]) {
      socket = new io.Socket(options);
    }

    if (!options['force new connection'] && socket) {
      io.sockets[uuri] = socket;
    }

    socket = socket || io.sockets[uuri];

    // if path is different from '' or /
    return socket.of(uri.path.length > 1 ? uri.path : '');
  };

})('object' === typeof module ? module.exports : (this.io = {}), this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * Utilities namespace.
   *
   * @namespace
   */

  var util = exports.util = {};

  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api public
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
               'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
               'anchor'];

  util.parseUri = function (str) {
    var m = re.exec(str || '')
      , uri = {}
      , i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    return uri;
  };

  /**
   * Produces a unique url that identifies a Socket.IO connection.
   *
   * @param {Object} uri
   * @api public
   */

  util.uniqueUri = function (uri) {
    var protocol = uri.protocol
      , host = uri.host
      , port = uri.port;

    if ('document' in global) {
      host = host || document.domain;
      port = port || (protocol == 'https'
        && document.location.protocol !== 'https:' ? 443 : document.location.port);
    } else {
      host = host || 'localhost';

      if (!port && protocol == 'https') {
        port = 443;
      }
    }

    return (protocol || 'http') + '://' + host + ':' + (port || 80);
  };

  /**
   * Mergest 2 query strings in to once unique query string
   *
   * @param {String} base
   * @param {String} addition
   * @api public
   */

  util.query = function (base, addition) {
    var query = util.chunkQuery(base || '')
      , components = [];

    util.merge(query, util.chunkQuery(addition || ''));
    for (var part in query) {
      if (query.hasOwnProperty(part)) {
        components.push(part + '=' + query[part]);
      }
    }

    return components.length ? '?' + components.join('&') : '';
  };

  /**
   * Transforms a querystring in to an object
   *
   * @param {String} qs
   * @api public
   */

  util.chunkQuery = function (qs) {
    var query = {}
      , params = qs.split('&')
      , i = 0
      , l = params.length
      , kv;

    for (; i < l; ++i) {
      kv = params[i].split('=');
      if (kv[0]) {
        query[kv[0]] = kv[1];
      }
    }

    return query;
  };

  /**
   * Executes the given function when the page is loaded.
   *
   *     io.util.load(function () { console.log('page loaded'); });
   *
   * @param {Function} fn
   * @api public
   */

  var pageLoaded = false;

  util.load = function (fn) {
    if ('document' in global && document.readyState === 'complete' || pageLoaded) {
      return fn();
    }

    util.on(global, 'load', fn, false);
  };

  /**
   * Adds an event.
   *
   * @api private
   */

  util.on = function (element, event, fn, capture) {
    if (element.attachEvent) {
      element.attachEvent('on' + event, fn);
    } else if (element.addEventListener) {
      element.addEventListener(event, fn, capture);
    }
  };

  /**
   * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
   *
   * @param {Boolean} [xdomain] Create a request that can be used cross domain.
   * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
   * @api private
   */

  util.request = function (xdomain) {

    if (xdomain && 'undefined' != typeof XDomainRequest && !util.ua.hasCORS) {
      return new XDomainRequest();
    }

    if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
      return new XMLHttpRequest();
    }

    if (!xdomain) {
      try {
        return new window[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
      } catch(e) { }
    }

    return null;
  };

  /**
   * XHR based transport constructor.
   *
   * @constructor
   * @api public
   */

  /**
   * Change the internal pageLoaded value.
   */

  if ('undefined' != typeof window) {
    util.load(function () {
      pageLoaded = true;
    });
  }

  /**
   * Defers a function to ensure a spinner is not displayed by the browser
   *
   * @param {Function} fn
   * @api public
   */

  util.defer = function (fn) {
    if (!util.ua.webkit || 'undefined' != typeof importScripts) {
      return fn();
    }

    util.load(function () {
      setTimeout(fn, 100);
    });
  };

  /**
   * Merges two objects.
   *
   * @api public
   */

  util.merge = function merge (target, additional, deep, lastseen) {
    var seen = lastseen || []
      , depth = typeof deep == 'undefined' ? 2 : deep
      , prop;

    for (prop in additional) {
      if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
        if (typeof target[prop] !== 'object' || !depth) {
          target[prop] = additional[prop];
          seen.push(additional[prop]);
        } else {
          util.merge(target[prop], additional[prop], depth - 1, seen);
        }
      }
    }

    return target;
  };

  /**
   * Merges prototypes from objects
   *
   * @api public
   */

  util.mixin = function (ctor, ctor2) {
    util.merge(ctor.prototype, ctor2.prototype);
  };

  /**
   * Shortcut for prototypical and static inheritance.
   *
   * @api private
   */

  util.inherit = function (ctor, ctor2) {
    function f() {};
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  };

  /**
   * Checks if the given object is an Array.
   *
   *     io.util.isArray([]); // true
   *     io.util.isArray({}); // false
   *
   * @param Object obj
   * @api public
   */

  util.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  /**
   * Intersects values of two arrays into a third
   *
   * @api public
   */

  util.intersect = function (arr, arr2) {
    var ret = []
      , longest = arr.length > arr2.length ? arr : arr2
      , shortest = arr.length > arr2.length ? arr2 : arr;

    for (var i = 0, l = shortest.length; i < l; i++) {
      if (~util.indexOf(longest, shortest[i]))
        ret.push(shortest[i]);
    }

    return ret;
  };

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  util.indexOf = function (arr, o, i) {

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
         i < j && arr[i] !== o; i++) {}

    return j <= i ? -1 : i;
  };

  /**
   * Converts enumerables to array.
   *
   * @api public
   */

  util.toArray = function (enu) {
    var arr = [];

    for (var i = 0, l = enu.length; i < l; i++)
      arr.push(enu[i]);

    return arr;
  };

  /**
   * UA / engines detection namespace.
   *
   * @namespace
   */

  util.ua = {};

  /**
   * Whether the UA supports CORS for XHR.
   *
   * @api public
   */

  util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
    try {
      var a = new XMLHttpRequest();
    } catch (e) {
      return false;
    }

    return a.withCredentials != undefined;
  })();

  /**
   * Detect webkit.
   *
   * @api public
   */

  util.ua.webkit = 'undefined' != typeof navigator
    && /webkit/i.test(navigator.userAgent);

   /**
   * Detect iPad/iPhone/iPod.
   *
   * @api public
   */

  util.ua.iDevice = 'undefined' != typeof navigator
      && /iPad|iPhone|iPod/i.test(navigator.userAgent);

})('undefined' != typeof io ? io : module.exports, this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.EventEmitter = EventEmitter;

  /**
   * Event emitter constructor.
   *
   * @api public.
   */

  function EventEmitter () {};

  /**
   * Adds a listener
   *
   * @api public
   */

  EventEmitter.prototype.on = function (name, fn) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = fn;
    } else if (io.util.isArray(this.$events[name])) {
      this.$events[name].push(fn);
    } else {
      this.$events[name] = [this.$events[name], fn];
    }

    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  /**
   * Adds a volatile listener.
   *
   * @api public
   */

  EventEmitter.prototype.once = function (name, fn) {
    var self = this;

    function on () {
      self.removeListener(name, on);
      fn.apply(this, arguments);
    };

    on.listener = fn;
    this.on(name, on);

    return this;
  };

  /**
   * Removes a listener.
   *
   * @api public
   */

  EventEmitter.prototype.removeListener = function (name, fn) {
    if (this.$events && this.$events[name]) {
      var list = this.$events[name];

      if (io.util.isArray(list)) {
        var pos = -1;

        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
            pos = i;
            break;
          }
        }

        if (pos < 0) {
          return this;
        }

        list.splice(pos, 1);

        if (!list.length) {
          delete this.$events[name];
        }
      } else if (list === fn || (list.listener && list.listener === fn)) {
        delete this.$events[name];
      }
    }

    return this;
  };

  /**
   * Removes all listeners for an event.
   *
   * @api public
   */

  EventEmitter.prototype.removeAllListeners = function (name) {
    if (name === undefined) {
      this.$events = {};
      return this;
    }

    if (this.$events && this.$events[name]) {
      this.$events[name] = null;
    }

    return this;
  };

  /**
   * Gets all listeners for a certain event.
   *
   * @api publci
   */

  EventEmitter.prototype.listeners = function (name) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = [];
    }

    if (!io.util.isArray(this.$events[name])) {
      this.$events[name] = [this.$events[name]];
    }

    return this.$events[name];
  };

  /**
   * Emits an event.
   *
   * @api public
   */

  EventEmitter.prototype.emit = function (name) {
    if (!this.$events) {
      return false;
    }

    var handler = this.$events[name];

    if (!handler) {
      return false;
    }

    var args = Array.prototype.slice.call(arguments, 1);

    if ('function' == typeof handler) {
      handler.apply(this, args);
    } else if (io.util.isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
    } else {
      return false;
    }

    return true;
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Based on JSON2 (http://www.JSON.org/js.html).
 */

(function (exports, nativeJSON) {
  "use strict";

  // use native JSON if it's available
  if (nativeJSON && nativeJSON.parse){
    return exports.JSON = {
      parse: nativeJSON.parse
    , stringify: nativeJSON.stringify
    };
  }

  var JSON = exports.JSON = {};

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  function date(d, key) {
    return isFinite(d.valueOf()) ?
        d.getUTCFullYear()     + '-' +
        f(d.getUTCMonth() + 1) + '-' +
        f(d.getUTCDate())      + 'T' +
        f(d.getUTCHours())     + ':' +
        f(d.getUTCMinutes())   + ':' +
        f(d.getUTCSeconds())   + 'Z' : null;
  };

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

      if (value instanceof Date) {
          value = date(key);
      }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

// What happens next depends on the value's type.

      switch (typeof value) {
      case 'string':
          return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

          return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

          if (!value) {
              return 'null';
          }

// Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

// Is the value an array?

          if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                  partial[i] = str(i, value) || 'null';
              }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

              v = partial.length === 0 ? '[]' : gap ?
                  '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                  '[' + partial.join(',') + ']';
              gap = mind;
              return v;
          }

// If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                  if (typeof rep[i] === 'string') {
                      k = rep[i];
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          } else {

// Otherwise, iterate through all of the keys in the object.

              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

// If the JSON object does not yet have a stringify method, give it one.

  JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
              (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
  };

// If the JSON object does not yet have a parse method, give it one.

  JSON.parse = function (text, reviver) {
  // The parse method takes a text and an optional reviver function, and returns
  // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

  // The walk method is used to recursively walk the resulting structure so
  // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }


  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with '()' and 'new'
  // because they can cause invocation, and '=' because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

  // In the third stage we use the eval function to compile the text into a
  // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
  // in JavaScript: it can begin a block or an object literal. We wrap the text
  // in parens to eliminate the ambiguity.

          j = eval('(' + text + ')');

  // In the optional fourth stage, we recursively walk the new structure, passing
  // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === 'function' ?
              walk({'': j}, '') : j;
      }

  // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
  };

})(
    'undefined' != typeof io ? io : module.exports
  , typeof JSON !== 'undefined' ? JSON : undefined
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Parser namespace.
   *
   * @namespace
   */

  var parser = exports.parser = {};

  /**
   * Packet types.
   */

  var packets = parser.packets = [
      'disconnect'
    , 'connect'
    , 'heartbeat'
    , 'message'
    , 'json'
    , 'event'
    , 'ack'
    , 'error'
    , 'noop'
  ];

  /**
   * Errors reasons.
   */

  var reasons = parser.reasons = [
      'transport not supported'
    , 'client not handshaken'
    , 'unauthorized'
  ];

  /**
   * Errors advice.
   */

  var advice = parser.advice = [
      'reconnect'
  ];

  /**
   * Shortcuts.
   */

  var JSON = io.JSON
    , indexOf = io.util.indexOf;

  /**
   * Encodes a packet.
   *
   * @api private
   */

  parser.encodePacket = function (packet) {
    var type = indexOf(packets, packet.type)
      , id = packet.id || ''
      , endpoint = packet.endpoint || ''
      , ack = packet.ack
      , data = null;

    switch (packet.type) {
      case 'error':
        var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
          , adv = packet.advice ? indexOf(advice, packet.advice) : '';

        if (reason !== '' || adv !== '')
          data = reason + (adv !== '' ? ('+' + adv) : '');

        break;

      case 'message':
        if (packet.data !== '')
          data = packet.data;
        break;

      case 'event':
        var ev = { name: packet.name };

        if (packet.args && packet.args.length) {
          ev.args = packet.args;
        }

        data = JSON.stringify(ev);
        break;

      case 'json':
        data = JSON.stringify(packet.data);
        break;

      case 'connect':
        if (packet.qs)
          data = packet.qs;
        break;

      case 'ack':
        data = packet.ackId
          + (packet.args && packet.args.length
              ? '+' + JSON.stringify(packet.args) : '');
        break;
    }

    // construct packet with required fragments
    var encoded = [
        type
      , id + (ack == 'data' ? '+' : '')
      , endpoint
    ];

    // data fragment is optional
    if (data !== null && data !== undefined)
      encoded.push(data);

    return encoded.join(':');
  };

  /**
   * Encodes multiple messages (payload).
   *
   * @param {Array} messages
   * @api private
   */

  parser.encodePayload = function (packets) {
    var decoded = '';

    if (packets.length == 1)
      return packets[0];

    for (var i = 0, l = packets.length; i < l; i++) {
      var packet = packets[i];
      decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
    }

    return decoded;
  };

  /**
   * Decodes a packet
   *
   * @api private
   */

  var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

  parser.decodePacket = function (data) {
    var pieces = data.match(regexp);

    if (!pieces) return {};

    var id = pieces[2] || ''
      , data = pieces[5] || ''
      , packet = {
            type: packets[pieces[1]]
          , endpoint: pieces[4] || ''
        };

    // whether we need to acknowledge the packet
    if (id) {
      packet.id = id;
      if (pieces[3])
        packet.ack = 'data';
      else
        packet.ack = true;
    }

    // handle different packet types
    switch (packet.type) {
      case 'error':
        var pieces = data.split('+');
        packet.reason = reasons[pieces[0]] || '';
        packet.advice = advice[pieces[1]] || '';
        break;

      case 'message':
        packet.data = data || '';
        break;

      case 'event':
        try {
          var opts = JSON.parse(data);
          packet.name = opts.name;
          packet.args = opts.args;
        } catch (e) { }

        packet.args = packet.args || [];
        break;

      case 'json':
        try {
          packet.data = JSON.parse(data);
        } catch (e) { }
        break;

      case 'connect':
        packet.qs = data || '';
        break;

      case 'ack':
        var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
        if (pieces) {
          packet.ackId = pieces[1];
          packet.args = [];

          if (pieces[3]) {
            try {
              packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
            } catch (e) { }
          }
        }
        break;

      case 'disconnect':
      case 'heartbeat':
        break;
    };

    return packet;
  };

  /**
   * Decodes data payload. Detects multiple messages
   *
   * @return {Array} messages
   * @api public
   */

  parser.decodePayload = function (data) {
    // IE doesn't like data[i] for unicode chars, charAt works fine
    if (data.charAt(0) == '\ufffd') {
      var ret = [];

      for (var i = 1, length = ''; i < data.length; i++) {
        if (data.charAt(i) == '\ufffd') {
          ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
          i += Number(length) + 1;
          length = '';
        } else {
          length += data.charAt(i);
        }
      }

      return ret;
    } else {
      return [parser.decodePacket(data)];
    }
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.Transport = Transport;

  /**
   * This is the transport template for all supported transport methods.
   *
   * @constructor
   * @api public
   */

  function Transport (socket, sessid) {
    this.socket = socket;
    this.sessid = sessid;
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Transport, io.EventEmitter);


  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  Transport.prototype.heartbeats = function () {
    return true;
  };

  /**
   * Handles the response from the server. When a new response is received
   * it will automatically update the timeout, decode the message and
   * forwards the response to the onMessage function for further processing.
   *
   * @param {String} data Response from the server.
   * @api private
   */

  Transport.prototype.onData = function (data) {
    this.clearCloseTimeout();

    // If the connection in currently open (or in a reopening state) reset the close
    // timeout since we have just received data. This check is necessary so
    // that we don't reset the timeout on an explicitly disconnected connection.
    if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
      this.setCloseTimeout();
    }

    if (data !== '') {
      // todo: we should only do decodePayload for xhr transports
      var msgs = io.parser.decodePayload(data);

      if (msgs && msgs.length) {
        for (var i = 0, l = msgs.length; i < l; i++) {
          this.onPacket(msgs[i]);
        }
      }
    }

    return this;
  };

  /**
   * Handles packets.
   *
   * @api private
   */

  Transport.prototype.onPacket = function (packet) {
    this.socket.setHeartbeatTimeout();

    if (packet.type == 'heartbeat') {
      return this.onHeartbeat();
    }

    if (packet.type == 'connect' && packet.endpoint == '') {
      this.onConnect();
    }

    if (packet.type == 'error' && packet.advice == 'reconnect') {
      this.isOpen = false;
    }

    this.socket.onPacket(packet);

    return this;
  };

  /**
   * Sets close timeout
   *
   * @api private
   */

  Transport.prototype.setCloseTimeout = function () {
    if (!this.closeTimeout) {
      var self = this;

      this.closeTimeout = setTimeout(function () {
        self.onDisconnect();
      }, this.socket.closeTimeout);
    }
  };

  /**
   * Called when transport disconnects.
   *
   * @api private
   */

  Transport.prototype.onDisconnect = function () {
    if (this.isOpen) this.close();
    this.clearTimeouts();
    this.socket.onDisconnect();
    return this;
  };

  /**
   * Called when transport connects
   *
   * @api private
   */

  Transport.prototype.onConnect = function () {
    this.socket.onConnect();
    return this;
  };

  /**
   * Clears close timeout
   *
   * @api private
   */

  Transport.prototype.clearCloseTimeout = function () {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  };

  /**
   * Clear timeouts
   *
   * @api private
   */

  Transport.prototype.clearTimeouts = function () {
    this.clearCloseTimeout();

    if (this.reopenTimeout) {
      clearTimeout(this.reopenTimeout);
    }
  };

  /**
   * Sends a packet
   *
   * @param {Object} packet object.
   * @api private
   */

  Transport.prototype.packet = function (packet) {
    this.send(io.parser.encodePacket(packet));
  };

  /**
   * Send the received heartbeat message back to server. So the server
   * knows we are still connected.
   *
   * @param {String} heartbeat Heartbeat response from the server.
   * @api private
   */

  Transport.prototype.onHeartbeat = function (heartbeat) {
    this.packet({ type: 'heartbeat' });
  };

  /**
   * Called when the transport opens.
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.isOpen = true;
    this.clearCloseTimeout();
    this.socket.onOpen();
  };

  /**
   * Notifies the base when the connection with the Socket.IO server
   * has been disconnected.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    var self = this;

    /* FIXME: reopen delay causing a infinit loop
    this.reopenTimeout = setTimeout(function () {
      self.open();
    }, this.socket.options['reopen delay']);*/

    this.isOpen = false;
    this.socket.onClose();
    this.onDisconnect();
  };

  /**
   * Generates a connection url based on the Socket.IO URL Protocol.
   * See <https://github.com/learnboost/socket.io-node/> for more details.
   *
   * @returns {String} Connection url
   * @api private
   */

  Transport.prototype.prepareUrl = function () {
    var options = this.socket.options;

    return this.scheme() + '://'
      + options.host + ':' + options.port + '/'
      + options.resource + '/' + io.protocol
      + '/' + this.name + '/' + this.sessid;
  };

  /**
   * Checks if the transport is ready to start a connection.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Transport.prototype.ready = function (socket, fn) {
    fn.call(this);
  };
})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.Socket = Socket;

  /**
   * Create a new `Socket.IO client` which can establish a persistent
   * connection with a Socket.IO enabled server.
   *
   * @api public
   */

  function Socket (options) {
    this.options = {
        port: 80
      , secure: false
      , document: 'document' in global ? document : false
      , resource: 'socket.io'
      , transports: io.transports
      , 'connect timeout': 10000
      , 'try multiple transports': true
      , 'reconnect': true
      , 'reconnection delay': 500
      , 'reconnection limit': Infinity
      , 'reopen delay': 3000
      , 'max reconnection attempts': 10
      , 'sync disconnect on unload': false
      , 'auto connect': true
      , 'flash policy port': 10843
      , 'manualFlush': false
    };

    io.util.merge(this.options, options);

    this.connected = false;
    this.open = false;
    this.connecting = false;
    this.reconnecting = false;
    this.namespaces = {};
    this.buffer = [];
    this.doBuffer = false;

    if (this.options['sync disconnect on unload'] &&
        (!this.isXDomain() || io.util.ua.hasCORS)) {
      var self = this;
      io.util.on(global, 'beforeunload', function () {
        self.disconnectSync();
      }, false);
    }

    if (this.options['auto connect']) {
      this.connect();
    }
};

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Socket, io.EventEmitter);

  /**
   * Returns a namespace listener/emitter for this socket
   *
   * @api public
   */

  Socket.prototype.of = function (name) {
    if (!this.namespaces[name]) {
      this.namespaces[name] = new io.SocketNamespace(this, name);

      if (name !== '') {
        this.namespaces[name].packet({ type: 'connect' });
      }
    }

    return this.namespaces[name];
  };

  /**
   * Emits the given event to the Socket and all namespaces
   *
   * @api private
   */

  Socket.prototype.publish = function () {
    this.emit.apply(this, arguments);

    var nsp;

    for (var i in this.namespaces) {
      if (this.namespaces.hasOwnProperty(i)) {
        nsp = this.of(i);
        nsp.$emit.apply(nsp, arguments);
      }
    }
  };

  /**
   * Performs the handshake
   *
   * @api private
   */

  function empty () { };

  Socket.prototype.handshake = function (fn) {
    var self = this
      , options = this.options;

    function complete (data) {
      if (data instanceof Error) {
        self.connecting = false;
        self.onError(data.message);
      } else {
        fn.apply(null, data.split(':'));
      }
    };

    var url = [
          'http' + (options.secure ? 's' : '') + ':/'
        , options.host + ':' + options.port
        , options.resource
        , io.protocol
        , io.util.query(this.options.query, 't=' + +new Date)
      ].join('/');

    if (this.isXDomain() && !io.util.ua.hasCORS) {
      var insertAt = document.getElementsByTagName('script')[0]
        , script = document.createElement('script');

      script.src = url + '&jsonp=' + io.j.length;
      insertAt.parentNode.insertBefore(script, insertAt);

      io.j.push(function (data) {
        complete(data);
        script.parentNode.removeChild(script);
      });
    } else {
      var xhr = io.util.request();

      xhr.open('GET', url, true);
      if (this.isXDomain()) {
        xhr.withCredentials = true;
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty;

          if (xhr.status == 200) {
            complete(xhr.responseText);
          } else if (xhr.status == 403) {
            self.onError(xhr.responseText);
          } else {
            self.connecting = false;            
            !self.reconnecting && self.onError(xhr.responseText);
          }
        }
      };
      xhr.send(null);
    }
  };

  /**
   * Find an available transport based on the options supplied in the constructor.
   *
   * @api private
   */

  Socket.prototype.getTransport = function (override) {
    var transports = override || this.transports, match;

    for (var i = 0, transport; transport = transports[i]; i++) {
      if (io.Transport[transport]
        && io.Transport[transport].check(this)
        && (!this.isXDomain() || io.Transport[transport].xdomainCheck(this))) {
        return new io.Transport[transport](this, this.sessionid);
      }
    }

    return null;
  };

  /**
   * Connects to the server.
   *
   * @param {Function} [fn] Callback.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.connect = function (fn) {
    if (this.connecting) {
      return this;
    }

    var self = this;
    self.connecting = true;
    
    this.handshake(function (sid, heartbeat, close, transports) {
      self.sessionid = sid;
      self.closeTimeout = close * 1000;
      self.heartbeatTimeout = heartbeat * 1000;
      if(!self.transports)
          self.transports = self.origTransports = (transports ? io.util.intersect(
              transports.split(',')
            , self.options.transports
          ) : self.options.transports);

      self.setHeartbeatTimeout();

      function connect (transports){
        if (self.transport) self.transport.clearTimeouts();

        self.transport = self.getTransport(transports);
        if (!self.transport) return self.publish('connect_failed');

        // once the transport is ready
        self.transport.ready(self, function () {
          self.connecting = true;
          self.publish('connecting', self.transport.name);
          self.transport.open();

          if (self.options['connect timeout']) {
            self.connectTimeoutTimer = setTimeout(function () {
              if (!self.connected) {
                self.connecting = false;

                if (self.options['try multiple transports']) {
                  var remaining = self.transports;

                  while (remaining.length > 0 && remaining.splice(0,1)[0] !=
                         self.transport.name) {}

                    if (remaining.length){
                      connect(remaining);
                    } else {
                      self.publish('connect_failed');
                    }
                }
              }
            }, self.options['connect timeout']);
          }
        });
      }

      connect(self.transports);

      self.once('connect', function (){
        clearTimeout(self.connectTimeoutTimer);

        fn && typeof fn == 'function' && fn();
      });
    });

    return this;
  };

  /**
   * Clears and sets a new heartbeat timeout using the value given by the
   * server during the handshake.
   *
   * @api private
   */

  Socket.prototype.setHeartbeatTimeout = function () {
    clearTimeout(this.heartbeatTimeoutTimer);
    if(this.transport && !this.transport.heartbeats()) return;

    var self = this;
    this.heartbeatTimeoutTimer = setTimeout(function () {
      self.transport.onClose();
    }, this.heartbeatTimeout);
  };

  /**
   * Sends a message.
   *
   * @param {Object} data packet.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.packet = function (data) {
    if (this.connected && !this.doBuffer) {
      this.transport.packet(data);
    } else {
      this.buffer.push(data);
    }

    return this;
  };

  /**
   * Sets buffer state
   *
   * @api private
   */

  Socket.prototype.setBuffer = function (v) {
    this.doBuffer = v;

    if (!v && this.connected && this.buffer.length) {
      if (!this.options['manualFlush']) {
        this.flushBuffer();
      }
    }
  };

  /**
   * Flushes the buffer data over the wire.
   * To be invoked manually when 'manualFlush' is set to true.
   *
   * @api public
   */

  Socket.prototype.flushBuffer = function() {
    this.transport.payload(this.buffer);
    this.buffer = [];
  };
  

  /**
   * Disconnect the established connect.
   *
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.disconnect = function () {
    if (this.connected || this.connecting) {
      if (this.open) {
        this.of('').packet({ type: 'disconnect' });
      }

      // handle disconnection immediately
      this.onDisconnect('booted');
    }

    return this;
  };

  /**
   * Disconnects the socket with a sync XHR.
   *
   * @api private
   */

  Socket.prototype.disconnectSync = function () {
    // ensure disconnection
    var xhr = io.util.request();
    var uri = [
        'http' + (this.options.secure ? 's' : '') + ':/'
      , this.options.host + ':' + this.options.port
      , this.options.resource
      , io.protocol
      , ''
      , this.sessionid
    ].join('/') + '/?disconnect=1';

    xhr.open('GET', uri, false);
    xhr.send(null);

    // handle disconnection immediately
    this.onDisconnect('booted');
  };

  /**
   * Check if we need to use cross domain enabled transports. Cross domain would
   * be a different port or different domain name.
   *
   * @returns {Boolean}
   * @api private
   */

  Socket.prototype.isXDomain = function () {

    var port = global.location.port ||
      ('https:' == global.location.protocol ? 443 : 80);

    return this.options.host !== global.location.hostname 
      || this.options.port != port;
  };

  /**
   * Called upon handshake.
   *
   * @api private
   */

  Socket.prototype.onConnect = function () {
    if (!this.connected) {
      this.connected = true;
      this.connecting = false;
      if (!this.doBuffer) {
        // make sure to flush the buffer
        this.setBuffer(false);
      }
      this.emit('connect');
    }
  };

  /**
   * Called when the transport opens
   *
   * @api private
   */

  Socket.prototype.onOpen = function () {
    this.open = true;
  };

  /**
   * Called when the transport closes.
   *
   * @api private
   */

  Socket.prototype.onClose = function () {
    this.open = false;
    clearTimeout(this.heartbeatTimeoutTimer);
  };

  /**
   * Called when the transport first opens a connection
   *
   * @param text
   */

  Socket.prototype.onPacket = function (packet) {
    this.of(packet.endpoint).onPacket(packet);
  };

  /**
   * Handles an error.
   *
   * @api private
   */

  Socket.prototype.onError = function (err) {
    if (err && err.advice) {
      if (err.advice === 'reconnect' && (this.connected || this.connecting)) {
        this.disconnect();
        if (this.options.reconnect) {
          this.reconnect();
        }
      }
    }

    this.publish('error', err && err.reason ? err.reason : err);
  };

  /**
   * Called when the transport disconnects.
   *
   * @api private
   */

  Socket.prototype.onDisconnect = function (reason) {
    var wasConnected = this.connected
      , wasConnecting = this.connecting;

    this.connected = false;
    this.connecting = false;
    this.open = false;

    if (wasConnected || wasConnecting) {
      this.transport.close();
      this.transport.clearTimeouts();
      if (wasConnected) {
        this.publish('disconnect', reason);

        if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
          this.reconnect();
        }
      }
    }
  };

  /**
   * Called upon reconnection.
   *
   * @api private
   */

  Socket.prototype.reconnect = function () {
    this.reconnecting = true;
    this.reconnectionAttempts = 0;
    this.reconnectionDelay = this.options['reconnection delay'];

    var self = this
      , maxAttempts = this.options['max reconnection attempts']
      , tryMultiple = this.options['try multiple transports']
      , limit = this.options['reconnection limit'];

    function reset () {
      if (self.connected) {
        for (var i in self.namespaces) {
          if (self.namespaces.hasOwnProperty(i) && '' !== i) {
              self.namespaces[i].packet({ type: 'connect' });
          }
        }
        self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
      }

      clearTimeout(self.reconnectionTimer);

      self.removeListener('connect_failed', maybeReconnect);
      self.removeListener('connect', maybeReconnect);

      self.reconnecting = false;

      delete self.reconnectionAttempts;
      delete self.reconnectionDelay;
      delete self.reconnectionTimer;
      delete self.redoTransports;

      self.options['try multiple transports'] = tryMultiple;
    };

    function maybeReconnect () {
      if (!self.reconnecting) {
        return;
      }

      if (self.connected) {
        return reset();
      };

      if (self.connecting && self.reconnecting) {
        return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
      }

      if (self.reconnectionAttempts++ >= maxAttempts) {
        if (!self.redoTransports) {
          self.on('connect_failed', maybeReconnect);
          self.options['try multiple transports'] = true;
          self.transports = self.origTransports;
          self.transport = self.getTransport();
          self.redoTransports = true;
          self.connect();
        } else {
          self.publish('reconnect_failed');
          reset();
        }
      } else {
        if (self.reconnectionDelay < limit) {
          self.reconnectionDelay *= 2; // exponential back off
        }

        self.connect();
        self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
        self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
      }
    };

    this.options['try multiple transports'] = false;
    this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);

    this.on('connect', maybeReconnect);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.SocketNamespace = SocketNamespace;

  /**
   * Socket namespace constructor.
   *
   * @constructor
   * @api public
   */

  function SocketNamespace (socket, name) {
    this.socket = socket;
    this.name = name || '';
    this.flags = {};
    this.json = new Flag(this, 'json');
    this.ackPackets = 0;
    this.acks = {};
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(SocketNamespace, io.EventEmitter);

  /**
   * Copies emit since we override it
   *
   * @api private
   */

  SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;

  /**
   * Creates a new namespace, by proxying the request to the socket. This
   * allows us to use the synax as we do on the server.
   *
   * @api public
   */

  SocketNamespace.prototype.of = function () {
    return this.socket.of.apply(this.socket, arguments);
  };

  /**
   * Sends a packet.
   *
   * @api private
   */

  SocketNamespace.prototype.packet = function (packet) {
    packet.endpoint = this.name;
    this.socket.packet(packet);
    this.flags = {};
    return this;
  };

  /**
   * Sends a message
   *
   * @api public
   */

  SocketNamespace.prototype.send = function (data, fn) {
    var packet = {
        type: this.flags.json ? 'json' : 'message'
      , data: data
    };

    if ('function' == typeof fn) {
      packet.id = ++this.ackPackets;
      packet.ack = true;
      this.acks[packet.id] = fn;
    }

    return this.packet(packet);
  };

  /**
   * Emits an event
   *
   * @api public
   */
  
  SocketNamespace.prototype.emit = function (name) {
    var args = Array.prototype.slice.call(arguments, 1)
      , lastArg = args[args.length - 1]
      , packet = {
            type: 'event'
          , name: name
        };

    if ('function' == typeof lastArg) {
      packet.id = ++this.ackPackets;
      packet.ack = 'data';
      this.acks[packet.id] = lastArg;
      args = args.slice(0, args.length - 1);
    }

    packet.args = args;

    return this.packet(packet);
  };

  /**
   * Disconnects the namespace
   *
   * @api private
   */

  SocketNamespace.prototype.disconnect = function () {
    if (this.name === '') {
      this.socket.disconnect();
    } else {
      this.packet({ type: 'disconnect' });
      this.$emit('disconnect');
    }

    return this;
  };

  /**
   * Handles a packet
   *
   * @api private
   */

  SocketNamespace.prototype.onPacket = function (packet) {
    var self = this;

    function ack () {
      self.packet({
          type: 'ack'
        , args: io.util.toArray(arguments)
        , ackId: packet.id
      });
    };

    switch (packet.type) {
      case 'connect':
        this.$emit('connect');
        break;

      case 'disconnect':
        if (this.name === '') {
          this.socket.onDisconnect(packet.reason || 'booted');
        } else {
          this.$emit('disconnect', packet.reason);
        }
        break;

      case 'message':
      case 'json':
        var params = ['message', packet.data];

        if (packet.ack == 'data') {
          params.push(ack);
        } else if (packet.ack) {
          this.packet({ type: 'ack', ackId: packet.id });
        }

        this.$emit.apply(this, params);
        break;

      case 'event':
        var params = [packet.name].concat(packet.args);

        if (packet.ack == 'data')
          params.push(ack);

        this.$emit.apply(this, params);
        break;

      case 'ack':
        if (this.acks[packet.ackId]) {
          this.acks[packet.ackId].apply(this, packet.args);
          delete this.acks[packet.ackId];
        }
        break;

      case 'error':
        if (packet.advice){
          this.socket.onError(packet);
        } else {
          if (packet.reason == 'unauthorized') {
            this.$emit('connect_failed', packet.reason);
          } else {
            this.$emit('error', packet.reason);
          }
        }
        break;
    }
  };

  /**
   * Flag interface.
   *
   * @api private
   */

  function Flag (nsp, name) {
    this.namespace = nsp;
    this.name = name;
  };

  /**
   * Send a message
   *
   * @api public
   */

  Flag.prototype.send = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.send.apply(this.namespace, arguments);
  };

  /**
   * Emit an event
   *
   * @api public
   */

  Flag.prototype.emit = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.emit.apply(this.namespace, arguments);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.websocket = WS;

  /**
   * The WebSocket transport uses the HTML5 WebSocket API to establish an
   * persistent connection with the Socket.IO server. This transport will also
   * be inherited by the FlashSocket fallback as it provides a API compatible
   * polyfill for the WebSockets.
   *
   * @constructor
   * @extends {io.Transport}
   * @api public
   */

  function WS (socket) {
    io.Transport.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(WS, io.Transport);

  /**
   * Transport name
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /**
   * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
   * all the appropriate listeners to handle the responses from the server.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.open = function () {
    var query = io.util.query(this.socket.options.query)
      , self = this
      , Socket


    if (!Socket) {
      Socket = global.MozWebSocket || global.WebSocket;
    }

    this.websocket = new Socket(this.prepareUrl() + query);

    this.websocket.onopen = function () {
      self.onOpen();
      self.socket.setBuffer(false);
    };
    this.websocket.onmessage = function (ev) {
      self.onData(ev.data);
    };
    this.websocket.onclose = function () {
      self.onClose();
      self.socket.setBuffer(true);
    };
    this.websocket.onerror = function (e) {
      self.onError(e);
    };

    return this;
  };

  /**
   * Send a message to the Socket.IO server. The message will automatically be
   * encoded in the correct message format.
   *
   * @returns {Transport}
   * @api public
   */

  // Do to a bug in the current IDevices browser, we need to wrap the send in a 
  // setTimeout, when they resume from sleeping the browser will crash if 
  // we don't allow the browser time to detect the socket has been closed
  if (io.util.ua.iDevice) {
    WS.prototype.send = function (data) {
      var self = this;
      setTimeout(function() {
         self.websocket.send(data);
      },0);
      return this;
    };
  } else {
    WS.prototype.send = function (data) {
      this.websocket.send(data);
      return this;
    };
  }

  /**
   * Payload
   *
   * @api private
   */

  WS.prototype.payload = function (arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      this.packet(arr[i]);
    }
    return this;
  };

  /**
   * Disconnect the established `WebSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.close = function () {
    this.websocket.close();
    return this;
  };

  /**
   * Handle the errors that `WebSocket` might be giving when we
   * are attempting to connect or send messages.
   *
   * @param {Error} e The error.
   * @api private
   */

  WS.prototype.onError = function (e) {
    this.socket.onError(e);
  };

  /**
   * Returns the appropriate scheme for the URI generation.
   *
   * @api private
   */
  WS.prototype.scheme = function () {
    return this.socket.options.secure ? 'wss' : 'ws';
  };

  /**
   * Checks if the browser has support for native `WebSockets` and that
   * it's not the polyfill created for the FlashSocket transport.
   *
   * @return {Boolean}
   * @api public
   */

  WS.check = function () {
    return ('WebSocket' in global && !('__addTask' in WebSocket))
          || 'MozWebSocket' in global;
  };

  /**
   * Check if the `WebSocket` transport support cross domain communications.
   *
   * @returns {Boolean}
   * @api public
   */

  WS.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('websocket');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.flashsocket = Flashsocket;

  /**
   * The FlashSocket transport. This is a API wrapper for the HTML5 WebSocket
   * specification. It uses a .swf file to communicate with the server. If you want
   * to serve the .swf file from a other server than where the Socket.IO script is
   * coming from you need to use the insecure version of the .swf. More information
   * about this can be found on the github page.
   *
   * @constructor
   * @extends {io.Transport.websocket}
   * @api public
   */

  function Flashsocket () {
    io.Transport.websocket.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(Flashsocket, io.Transport.websocket);

  /**
   * Transport name
   *
   * @api public
   */

  Flashsocket.prototype.name = 'flashsocket';

  /**
   * Disconnect the established `FlashSocket` connection. This is done by adding a 
   * new task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.open = function () {
    var self = this
      , args = arguments;

    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.open.apply(self, args);
    });
    return this;
  };
  
  /**
   * Sends a message to the Socket.IO server. This is done by adding a new
   * task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.send = function () {
    var self = this, args = arguments;
    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.send.apply(self, args);
    });
    return this;
  };

  /**
   * Disconnects the established `FlashSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.close = function () {
    WebSocket.__tasks.length = 0;
    io.Transport.websocket.prototype.close.call(this);
    return this;
  };

  /**
   * The WebSocket fall back needs to append the flash container to the body
   * element, so we need to make sure we have access to it. Or defer the call
   * until we are sure there is a body element.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Flashsocket.prototype.ready = function (socket, fn) {
    function init () {
      var options = socket.options
        , port = options['flash policy port']
        , path = [
              'http' + (options.secure ? 's' : '') + ':/'
            , options.host + ':' + options.port
            , options.resource
            , 'static/flashsocket'
            , 'WebSocketMain' + (socket.isXDomain() ? 'Insecure' : '') + '.swf'
          ];

      // Only start downloading the swf file when the checked that this browser
      // actually supports it
      if (!Flashsocket.loaded) {
        if (typeof WEB_SOCKET_SWF_LOCATION === 'undefined') {
          // Set the correct file based on the XDomain settings
          WEB_SOCKET_SWF_LOCATION = path.join('/');
        }

        if (port !== 843) {
          WebSocket.loadFlashPolicyFile('xmlsocket://' + options.host + ':' + port);
        }

        WebSocket.__initialize();
        Flashsocket.loaded = true;
      }

      fn.call(self);
    }

    var self = this;
    if (document.body) return init();

    io.util.load(init);
  };

  /**
   * Check if the FlashSocket transport is supported as it requires that the Adobe
   * Flash Player plug-in version `10.0.0` or greater is installed. And also check if
   * the polyfill is correctly loaded.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.check = function () {
    if (
        typeof WebSocket == 'undefined'
      || !('__initialize' in WebSocket) || !swfobject
    ) return false;

    return swfobject.getFlashPlayerVersion().major >= 10;
  };

  /**
   * Check if the FlashSocket transport can be used as cross domain / cross origin 
   * transport. Because we can't see which type (secure or insecure) of .swf is used
   * we will just return true.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.xdomainCheck = function () {
    return true;
  };

  /**
   * Disable AUTO_INITIALIZATION
   */

  if (typeof window != 'undefined') {
    WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
  }

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('flashsocket');
})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
if ('undefined' != typeof window) {
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O[(['Active'].concat('Object').join('X'))]!=D){try{var ad=new window[(['Active'].concat('Object').join('X'))](W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?(['Active'].concat('').join('X')):"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
}
// Copyright: Hiroshi Ichikawa <http://gimite.net/en/>
// License: New BSD License
// Reference: http://dev.w3.org/html5/websockets/
// Reference: http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol

(function() {
  
  if ('undefined' == typeof window || window.WebSocket) return;

  var console = window.console;
  if (!console || !console.log || !console.error) {
    console = {log: function(){ }, error: function(){ }};
  }
  
  if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
    console.error("Flash Player >= 10.0.0 is required.");
    return;
  }
  if (location.protocol == "file:") {
    console.error(
      "WARNING: web-socket-js doesn't work in file:///... URL " +
      "unless you set Flash Security Settings properly. " +
      "Open the page via Web server i.e. http://...");
  }

  /**
   * This class represents a faux web socket.
   * @param {string} url
   * @param {array or string} protocols
   * @param {string} proxyHost
   * @param {int} proxyPort
   * @param {string} headers
   */
  WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
    var self = this;
    self.__id = WebSocket.__nextId++;
    WebSocket.__instances[self.__id] = self;
    self.readyState = WebSocket.CONNECTING;
    self.bufferedAmount = 0;
    self.__events = {};
    if (!protocols) {
      protocols = [];
    } else if (typeof protocols == "string") {
      protocols = [protocols];
    }
    // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
    // Otherwise, when onopen fires immediately, onopen is called before it is set.
    setTimeout(function() {
      WebSocket.__addTask(function() {
        WebSocket.__flash.create(
            self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
      });
    }, 0);
  };

  /**
   * Send data to the web socket.
   * @param {string} data  The data to send to the socket.
   * @return {boolean}  True for success, false for failure.
   */
  WebSocket.prototype.send = function(data) {
    if (this.readyState == WebSocket.CONNECTING) {
      throw "INVALID_STATE_ERR: Web Socket connection has not been established";
    }
    // We use encodeURIComponent() here, because FABridge doesn't work if
    // the argument includes some characters. We don't use escape() here
    // because of this:
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
    // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
    // preserve all Unicode characters either e.g. "\uffff" in Firefox.
    // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
    // additional testing.
    var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
    if (result < 0) { // success
      return true;
    } else {
      this.bufferedAmount += result;
      return false;
    }
  };

  /**
   * Close this web socket gracefully.
   */
  WebSocket.prototype.close = function() {
    if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
      return;
    }
    this.readyState = WebSocket.CLOSING;
    WebSocket.__flash.close(this.__id);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) {
      this.__events[type] = [];
    }
    this.__events[type].push(listener);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.removeEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) return;
    var events = this.__events[type];
    for (var i = events.length - 1; i >= 0; --i) {
      if (events[i] === listener) {
        events.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {Event} event
   * @return void
   */
  WebSocket.prototype.dispatchEvent = function(event) {
    var events = this.__events[event.type] || [];
    for (var i = 0; i < events.length; ++i) {
      events[i](event);
    }
    var handler = this["on" + event.type];
    if (handler) handler(event);
  };

  /**
   * Handles an event from Flash.
   * @param {Object} flashEvent
   */
  WebSocket.prototype.__handleEvent = function(flashEvent) {
    if ("readyState" in flashEvent) {
      this.readyState = flashEvent.readyState;
    }
    if ("protocol" in flashEvent) {
      this.protocol = flashEvent.protocol;
    }
    
    var jsEvent;
    if (flashEvent.type == "open" || flashEvent.type == "error") {
      jsEvent = this.__createSimpleEvent(flashEvent.type);
    } else if (flashEvent.type == "close") {
      // TODO implement jsEvent.wasClean
      jsEvent = this.__createSimpleEvent("close");
    } else if (flashEvent.type == "message") {
      var data = decodeURIComponent(flashEvent.message);
      jsEvent = this.__createMessageEvent("message", data);
    } else {
      throw "unknown event type: " + flashEvent.type;
    }
    
    this.dispatchEvent(jsEvent);
  };
  
  WebSocket.prototype.__createSimpleEvent = function(type) {
    if (document.createEvent && window.Event) {
      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      return event;
    } else {
      return {type: type, bubbles: false, cancelable: false};
    }
  };
  
  WebSocket.prototype.__createMessageEvent = function(type, data) {
    if (document.createEvent && window.MessageEvent && !window.opera) {
      var event = document.createEvent("MessageEvent");
      event.initMessageEvent("message", false, false, data, null, null, window, null);
      return event;
    } else {
      // IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
      return {type: type, data: data, bubbles: false, cancelable: false};
    }
  };
  
  /**
   * Define the WebSocket readyState enumeration.
   */
  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;

  WebSocket.__flash = null;
  WebSocket.__instances = {};
  WebSocket.__tasks = [];
  WebSocket.__nextId = 0;
  
  /**
   * Load a new flash security policy file.
   * @param {string} url
   */
  WebSocket.loadFlashPolicyFile = function(url){
    WebSocket.__addTask(function() {
      WebSocket.__flash.loadManualPolicyFile(url);
    });
  };

  /**
   * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
   */
  WebSocket.__initialize = function() {
    if (WebSocket.__flash) return;
    
    if (WebSocket.__swfLocation) {
      // For backword compatibility.
      window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
    }
    if (!window.WEB_SOCKET_SWF_LOCATION) {
      console.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
      return;
    }
    var container = document.createElement("div");
    container.id = "webSocketContainer";
    // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
    // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
    // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
    // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
    // the best we can do as far as we know now.
    container.style.position = "absolute";
    if (WebSocket.__isFlashLite()) {
      container.style.left = "0px";
      container.style.top = "0px";
    } else {
      container.style.left = "-100px";
      container.style.top = "-100px";
    }
    var holder = document.createElement("div");
    holder.id = "webSocketFlash";
    container.appendChild(holder);
    document.body.appendChild(container);
    // See this article for hasPriority:
    // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
    swfobject.embedSWF(
      WEB_SOCKET_SWF_LOCATION,
      "webSocketFlash",
      "1" /* width */,
      "1" /* height */,
      "10.0.0" /* SWF version */,
      null,
      null,
      {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
      null,
      function(e) {
        if (!e.success) {
          console.error("[WebSocket] swfobject.embedSWF failed");
        }
      });
  };
  
  /**
   * Called by Flash to notify JS that it's fully loaded and ready
   * for communication.
   */
  WebSocket.__onFlashInitialized = function() {
    // We need to set a timeout here to avoid round-trip calls
    // to flash during the initialization process.
    setTimeout(function() {
      WebSocket.__flash = document.getElementById("webSocketFlash");
      WebSocket.__flash.setCallerUrl(location.href);
      WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
      for (var i = 0; i < WebSocket.__tasks.length; ++i) {
        WebSocket.__tasks[i]();
      }
      WebSocket.__tasks = [];
    }, 0);
  };
  
  /**
   * Called by Flash to notify WebSockets events are fired.
   */
  WebSocket.__onFlashEvent = function() {
    setTimeout(function() {
      try {
        // Gets events using receiveEvents() instead of getting it from event object
        // of Flash event. This is to make sure to keep message order.
        // It seems sometimes Flash events don't arrive in the same order as they are sent.
        var events = WebSocket.__flash.receiveEvents();
        for (var i = 0; i < events.length; ++i) {
          WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
    return true;
  };
  
  // Called by Flash.
  WebSocket.__log = function(message) {
    console.log(decodeURIComponent(message));
  };
  
  // Called by Flash.
  WebSocket.__error = function(message) {
    console.error(decodeURIComponent(message));
  };
  
  WebSocket.__addTask = function(task) {
    if (WebSocket.__flash) {
      task();
    } else {
      WebSocket.__tasks.push(task);
    }
  };
  
  /**
   * Test if the browser is running flash lite.
   * @return {boolean} True if flash lite is running, false otherwise.
   */
  WebSocket.__isFlashLite = function() {
    if (!window.navigator || !window.navigator.mimeTypes) {
      return false;
    }
    var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
    if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
      return false;
    }
    return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
  };
  
  if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
    if (window.addEventListener) {
      window.addEventListener("load", function(){
        WebSocket.__initialize();
      }, false);
    } else {
      window.attachEvent("onload", function(){
        WebSocket.__initialize();
      });
    }
  }
  
})();

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   *
   * @api public
   */

  exports.XHR = XHR;

  /**
   * XHR constructor
   *
   * @costructor
   * @api public
   */

  function XHR (socket) {
    if (!socket) return;

    io.Transport.apply(this, arguments);
    this.sendBuffer = [];
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(XHR, io.Transport);

  /**
   * Establish a connection
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.open = function () {
    this.socket.setBuffer(false);
    this.onOpen();
    this.get();

    // we need to make sure the request succeeds since we have no indication
    // whether the request opened or not until it succeeded.
    this.setCloseTimeout();

    return this;
  };

  /**
   * Check if we need to send data to the Socket.IO server, if we have data in our
   * buffer we encode it and forward it to the `post` method.
   *
   * @api private
   */

  XHR.prototype.payload = function (payload) {
    var msgs = [];

    for (var i = 0, l = payload.length; i < l; i++) {
      msgs.push(io.parser.encodePacket(payload[i]));
    }

    this.send(io.parser.encodePayload(msgs));
  };

  /**
   * Send data to the Socket.IO server.
   *
   * @param data The message
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.send = function (data) {
    this.post(data);
    return this;
  };

  /**
   * Posts a encoded message to the Socket.IO server.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  function empty () { };

  XHR.prototype.post = function (data) {
    var self = this;
    this.socket.setBuffer(true);

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;
        self.posting = false;

        if (this.status == 200){
          self.socket.setBuffer(false);
        } else {
          self.onClose();
        }
      }
    }

    function onload () {
      this.onload = empty;
      self.socket.setBuffer(false);
    };

    this.sendXHR = this.request('POST');

    if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
      this.sendXHR.onload = this.sendXHR.onerror = onload;
    } else {
      this.sendXHR.onreadystatechange = stateChange;
    }

    this.sendXHR.send(data);
  };

  /**
   * Disconnects the established `XHR` connection.
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.close = function () {
    this.onClose();
    return this;
  };

  /**
   * Generates a configured XHR request
   *
   * @param {String} url The url that needs to be requested.
   * @param {String} method The method the request should use.
   * @returns {XMLHttpRequest}
   * @api private
   */

  XHR.prototype.request = function (method) {
    var req = io.util.request(this.socket.isXDomain())
      , query = io.util.query(this.socket.options.query, 't=' + +new Date);

    req.open(method || 'GET', this.prepareUrl() + query, true);

    if (method == 'POST') {
      try {
        if (req.setRequestHeader) {
          req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        } else {
          // XDomainRequest
          req.contentType = 'text/plain';
        }
      } catch (e) {}
    }

    return req;
  };

  /**
   * Returns the scheme to use for the transport URLs.
   *
   * @api private
   */

  XHR.prototype.scheme = function () {
    return this.socket.options.secure ? 'https' : 'http';
  };

  /**
   * Check if the XHR transports are supported
   *
   * @param {Boolean} xdomain Check if we support cross domain requests.
   * @returns {Boolean}
   * @api public
   */

  XHR.check = function (socket, xdomain) {
    try {
      var request = io.util.request(xdomain),
          usesXDomReq = (global.XDomainRequest && request instanceof XDomainRequest),
          socketProtocol = (socket && socket.options && socket.options.secure ? 'https:' : 'http:'),
          isXProtocol = (global.location && socketProtocol != global.location.protocol);
      if (request && !(usesXDomReq && isXProtocol)) {
        return true;
      }
    } catch(e) {}

    return false;
  };

  /**
   * Check if the XHR transport supports cross domain requests.
   *
   * @returns {Boolean}
   * @api public
   */

  XHR.xdomainCheck = function (socket) {
    return XHR.check(socket, true);
  };

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.htmlfile = HTMLFile;

  /**
   * The HTMLFile transport creates a `forever iframe` based transport
   * for Internet Explorer. Regular forever iframe implementations will 
   * continuously trigger the browsers buzy indicators. If the forever iframe
   * is created inside a `htmlfile` these indicators will not be trigged.
   *
   * @constructor
   * @extends {io.Transport.XHR}
   * @api public
   */

  function HTMLFile (socket) {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(HTMLFile, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  HTMLFile.prototype.name = 'htmlfile';

  /**
   * Creates a new Ac...eX `htmlfile` with a forever loading iframe
   * that can be used to listen to messages. Inside the generated
   * `htmlfile` a reference will be made to the HTMLFile transport.
   *
   * @api private
   */

  HTMLFile.prototype.get = function () {
    this.doc = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
    this.doc.open();
    this.doc.write('<html></html>');
    this.doc.close();
    this.doc.parentWindow.s = this;

    var iframeC = this.doc.createElement('div');
    iframeC.className = 'socketio';

    this.doc.body.appendChild(iframeC);
    this.iframe = this.doc.createElement('iframe');

    iframeC.appendChild(this.iframe);

    var self = this
      , query = io.util.query(this.socket.options.query, 't='+ +new Date);

    this.iframe.src = this.prepareUrl() + query;

    io.util.on(window, 'unload', function () {
      self.destroy();
    });
  };

  /**
   * The Socket.IO server will write script tags inside the forever
   * iframe, this function will be used as callback for the incoming
   * information.
   *
   * @param {String} data The message
   * @param {document} doc Reference to the context
   * @api private
   */

  HTMLFile.prototype._ = function (data, doc) {
    // unescape all forward slashes. see GH-1251
    data = data.replace(/\\\//g, '/');
    this.onData(data);
    try {
      var script = doc.getElementsByTagName('script')[0];
      script.parentNode.removeChild(script);
    } catch (e) { }
  };

  /**
   * Destroy the established connection, iframe and `htmlfile`.
   * And calls the `CollectGarbage` function of Internet Explorer
   * to release the memory.
   *
   * @api private
   */

  HTMLFile.prototype.destroy = function () {
    if (this.iframe){
      try {
        this.iframe.src = 'about:blank';
      } catch(e){}

      this.doc = null;
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;

      CollectGarbage();
    }
  };

  /**
   * Disconnects the established connection.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  HTMLFile.prototype.close = function () {
    this.destroy();
    return io.Transport.XHR.prototype.close.call(this);
  };

  /**
   * Checks if the browser supports this transport. The browser
   * must have an `Ac...eXObject` implementation.
   *
   * @return {Boolean}
   * @api public
   */

  HTMLFile.check = function (socket) {
    if (typeof window != "undefined" && (['Active'].concat('Object').join('X')) in window){
      try {
        var a = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
        return a && io.Transport.XHR.check(socket);
      } catch(e){}
    }
    return false;
  };

  /**
   * Check if cross domain requests are supported.
   *
   * @returns {Boolean}
   * @api public
   */

  HTMLFile.xdomainCheck = function () {
    // we can probably do handling for sub-domains, we should
    // test that it's cross domain but a subdomain here
    return false;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('htmlfile');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports['xhr-polling'] = XHRPolling;

  /**
   * The XHR-polling transport uses long polling XHR requests to create a
   * "persistent" connection with the server.
   *
   * @constructor
   * @api public
   */

  function XHRPolling () {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(XHRPolling, io.Transport.XHR);

  /**
   * Merge the properties from XHR transport
   */

  io.util.merge(XHRPolling, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  XHRPolling.prototype.name = 'xhr-polling';

  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  XHRPolling.prototype.heartbeats = function () {
    return false;
  };

  /** 
   * Establish a connection, for iPhone and Android this will be done once the page
   * is loaded.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  XHRPolling.prototype.open = function () {
    var self = this;

    io.Transport.XHR.prototype.open.call(self);
    return false;
  };

  /**
   * Starts a XHR request to wait for incoming messages.
   *
   * @api private
   */

  function empty () {};

  XHRPolling.prototype.get = function () {
    if (!this.isOpen) return;

    var self = this;

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;

        if (this.status == 200) {
          self.onData(this.responseText);
          self.get();
        } else {
          self.onClose();
        }
      }
    };

    function onload () {
      this.onload = empty;
      this.onerror = empty;
      self.retryCounter = 1;
      self.onData(this.responseText);
      self.get();
    };

    function onerror () {
      self.retryCounter ++;
      if(!self.retryCounter || self.retryCounter > 3) {
        self.onClose();  
      } else {
        self.get();
      }
    };

    this.xhr = this.request();

    if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
      this.xhr.onload = onload;
      this.xhr.onerror = onerror;
    } else {
      this.xhr.onreadystatechange = stateChange;
    }

    this.xhr.send(null);
  };

  /**
   * Handle the unclean close behavior.
   *
   * @api private
   */

  XHRPolling.prototype.onClose = function () {
    io.Transport.XHR.prototype.onClose.call(this);

    if (this.xhr) {
      this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = empty;
      try {
        this.xhr.abort();
      } catch(e){}
      this.xhr = null;
    }
  };

  /**
   * Webkit based browsers show a infinit spinner when you start a XHR request
   * before the browsers onload event is called so we need to defer opening of
   * the transport until the onload event is called. Wrapping the cb in our
   * defer method solve this.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  XHRPolling.prototype.ready = function (socket, fn) {
    var self = this;

    io.util.defer(function () {
      fn.call(self);
    });
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('xhr-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {
  /**
   * There is a way to hide the loading indicator in Firefox. If you create and
   * remove a iframe it will stop showing the current loading indicator.
   * Unfortunately we can't feature detect that and UA sniffing is evil.
   *
   * @api private
   */

  var indicator = global.document && "MozAppearance" in
    global.document.documentElement.style;

  /**
   * Expose constructor.
   */

  exports['jsonp-polling'] = JSONPPolling;

  /**
   * The JSONP transport creates an persistent connection by dynamically
   * inserting a script tag in the page. This script tag will receive the
   * information of the Socket.IO server. When new information is received
   * it creates a new script tag for the new data stream.
   *
   * @constructor
   * @extends {io.Transport.xhr-polling}
   * @api public
   */

  function JSONPPolling (socket) {
    io.Transport['xhr-polling'].apply(this, arguments);

    this.index = io.j.length;

    var self = this;

    io.j.push(function (msg) {
      self._(msg);
    });
  };

  /**
   * Inherits from XHR polling transport.
   */

  io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);

  /**
   * Transport name
   *
   * @api public
   */

  JSONPPolling.prototype.name = 'jsonp-polling';

  /**
   * Posts a encoded message to the Socket.IO server using an iframe.
   * The iframe is used because script tags can create POST based requests.
   * The iframe is positioned outside of the view so the user does not
   * notice it's existence.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  JSONPPolling.prototype.post = function (data) {
    var self = this
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (!this.form) {
      var form = document.createElement('form')
        , area = document.createElement('textarea')
        , id = this.iframeId = 'socketio_iframe_' + this.index
        , iframe;

      form.className = 'socketio';
      form.style.position = 'absolute';
      form.style.top = '0px';
      form.style.left = '0px';
      form.style.display = 'none';
      form.target = id;
      form.method = 'POST';
      form.setAttribute('accept-charset', 'utf-8');
      area.name = 'd';
      form.appendChild(area);
      document.body.appendChild(form);

      this.form = form;
      this.area = area;
    }

    this.form.action = this.prepareUrl() + query;

    function complete () {
      initIframe();
      self.socket.setBuffer(false);
    };

    function initIframe () {
      if (self.iframe) {
        self.form.removeChild(self.iframe);
      }

      try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        iframe = document.createElement('<iframe name="'+ self.iframeId +'">');
      } catch (e) {
        iframe = document.createElement('iframe');
        iframe.name = self.iframeId;
      }

      iframe.id = self.iframeId;

      self.form.appendChild(iframe);
      self.iframe = iframe;
    };

    initIframe();

    // we temporarily stringify until we figure out how to prevent
    // browsers from turning `\n` into `\r\n` in form inputs
    this.area.value = io.JSON.stringify(data);

    try {
      this.form.submit();
    } catch(e) {}

    if (this.iframe.attachEvent) {
      iframe.onreadystatechange = function () {
        if (self.iframe.readyState == 'complete') {
          complete();
        }
      };
    } else {
      this.iframe.onload = complete;
    }

    this.socket.setBuffer(true);
  };

  /**
   * Creates a new JSONP poll that can be used to listen
   * for messages from the Socket.IO server.
   *
   * @api private
   */

  JSONPPolling.prototype.get = function () {
    var self = this
      , script = document.createElement('script')
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    script.async = true;
    script.src = this.prepareUrl() + query;
    script.onerror = function () {
      self.onClose();
    };

    var insertAt = document.getElementsByTagName('script')[0];
    insertAt.parentNode.insertBefore(script, insertAt);
    this.script = script;

    if (indicator) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
      }, 100);
    }
  };

  /**
   * Callback function for the incoming message stream from the Socket.IO server.
   *
   * @param {String} data The message
   * @api private
   */

  JSONPPolling.prototype._ = function (msg) {
    this.onData(msg);
    if (this.isOpen) {
      this.get();
    }
    return this;
  };

  /**
   * The indicator hack only works after onload
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  JSONPPolling.prototype.ready = function (socket, fn) {
    var self = this;
    if (!indicator) return fn.call(this);

    io.util.load(function () {
      fn.call(self);
    });
  };

  /**
   * Checks if browser supports this transport.
   *
   * @return {Boolean}
   * @api public
   */

  JSONPPolling.check = function () {
    return 'document' in global;
  };

  /**
   * Check if cross domain requests are supported
   *
   * @returns {Boolean}
   * @api public
   */

  JSONPPolling.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('jsonp-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

if (typeof define === "function" && define.amd) {
  define([], function () { return io; });
}
})();;(function(){
  var host = window.location.protocol + '//' + window.location.hostname;
  var reloader = io.connect( host, {port: 53211} );
  reloader.on("refresh", function(data)
  {
    var i, suspects, suspect, newlink, href, newhref, nocache;

    // javascript = reload
    if(data.type == 'js')
      return location.reload();

    // css = add new + remove old
    if(data.type == 'css') {
      newlink = document.createElement('link');
      newlink.setAttribute('rel', 'stylesheet');
      newlink.setAttribute('type', 'text/css');

      suspects = document.getElementsByTagName('link');
      for( i=suspects.length; i>= 0; --i)
      {
        suspect = suspects[i];
        if( suspect == null) continue;

        href = suspect.getAttribute('href');

        if( href.indexOf( data.css_output ) < 0 )
          continue;

        newhref = href.replace(/(\.css).+/g, "$1");
        nocache = '?nocache=' + new Date().getTime();
        newhref += nocache;

        newlink.setAttribute('href', newhref);
        suspect.parentNode.appendChild(newlink);

        setTimeout(function(){
          suspect.parentNode.removeChild(suspect);
        }, 100);

        break;
      }
    }
  });
})();;(function(){
// POLVO :: HELPERS

// POLVO :: LOADER
function require(path, parent){
  var realpath = require.resolve(path, parent),
      m = require.mods[realpath];

  if(!m.init){
    m.factory.call(this, require.local(realpath), m.module, m.module.exports);
    m.init = true;
  }

  return m.module.exports;
}

require.mods = {}

require.local = function( path ){
  var r = function( id ){ return require( id, path ); }
  r.resolve = function( id ){ return require.resolve( id, path ); }
  return r;
}

require.register = function(path, mod, aliases){
  require.mods[path] = {
    factory: mod,
    aliases: aliases,
    module: {exports:{}}
  };
}

require.aliases = {"app":"src/app","lib":"src/lib"};
require.alias = function(path){
  for(var alias in require.aliases)
    if(path.indexOf(alias) == 0)
      return require.aliases[alias] + path.match(/\/(.+)/)[0];
  return null;
}


require.resolve = function(path, parent){
  var realpath;

  if(parent)
    if(!(realpath = require.mods[parent].aliases[path]))
      realpath = require.alias( path );

  if(!require.mods[realpath || path])
      throw new Error('Module not found: ' + path);

  return realpath || path;
}

window.require = require;
// POLVO :: MERGED FILES
require.register('src/app/app', function(require, module, exports){
var GL, Metronome;

GL = require('app/gl');

Metronome = require('app/metronome');

document.addEventListener("DOMContentLoaded", function() {
  var cube, cubeData, fragmentShaderSource, gl, metronome, startGL, vertexShaderSource, waitForAssets;
  fragmentShaderSource = vertexShaderSource = cubeData = void 0;
  console.log('Starting to load shaders.');
  new microAjax('./fShader.frag', function(resource) {
    console.log('Fragment shader loaded.');
    return fragmentShaderSource = resource;
  });
  new microAjax('./vShader.vert', function(resource) {
    console.log('Vertex shader loaded.');
    return vertexShaderSource = resource;
  });
  new microAjax('./capsule.obj', function(resource) {
    console.log('Cube data loaded.');
    return cubeData = resource;
  });
  waitForAssets = function() {
    return setTimeout(function() {
      if ((fragmentShaderSource != null) && (vertexShaderSource != null) && (cubeData != null)) {
        return startGL('lesson01-canvas', fragmentShaderSource, vertexShaderSource);
      } else {
        return waitForAssets();
      }
    }, 1000);
  };
  waitForAssets();
  gl = null;
  cube = null;
  metronome = new Metronome(60);
  metronome.on("Tick", function() {
    gl.tick();
    gl.drawScene([cube]);
  });
  return startGL = function(canvasElementId, fragmentShaderSource, vertexShaderSource) {
    var shader;
    gl = new GL(canvasElementId);
    shader = gl.createShaderProgram(fragmentShaderSource, vertexShaderSource);
    gl.setShader(shader);
    cube = gl.createMeshFromObj(cubeData);
    return metronome.start();
  };
}, false);

}, {"app/gl":"src/app/gl","app/metronome":"src/app/metronome"});
require.register('src/app/camera', function(require, module, exports){
var Camera;

module.exports = Camera = (function() {
  function Camera(position, target) {
    this.position = position;
    this.target = target;
    this._viewMatrix = mat4.create();
  }

  Camera.prototype.getViewMatrix = function() {
    return mat4.lookAt(this._viewMatrix, this.position, this.target, [0, 1, 0]);
  };

  return Camera;

})();

}, {});
require.register('src/app/gl', function(require, module, exports){
var Camera, GL, Mesh, ObjParser;

Mesh = require('app/mesh');

ObjParser = require('app/objparser');

Camera = require('app/camera');

module.exports = GL = (function() {
  function GL(canvasElementId) {
    var canvasElement, error;
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.create();
    this._mvMatrixStack = [];
    this._cubeRotation = 0.0;
    this._camera = new Camera([0, 0, -10], [0, 0, 0]);
    canvasElement = document.getElementById(canvasElementId);
    try {
      this._gl = canvasElement.getContext('webgl' || canvasElement.getContext('experimental-webgl'));
    } catch (_error) {
      error = _error;
      console.log('Failed to initialize WebGL using the element ' + canvas + '. Error:\n' + error);
      throw error;
    }
    this._gl.viewportWidth = canvasElement.width;
    this._gl.viewportHeight = canvasElement.height;
    mat4.perspective(this._pMatrix, 45, canvasElement.width / canvasElement.height, 0.1, 100.0, this._pMatrix);
    this._gl.viewport(0, 0, canvasElement.width, canvasElement.height);
    this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.CULL_FACE);
  }

  GL.prototype.fetchShaderFromElement = function(shaderElementId) {
    var currentScriptNode, shaderCode, shaderElement;
    shaderElement = document.getElementById(shaderElementId);
    if (!shaderElement) {
      throw new Error('No shader with id: ' + shaderElementId);
    }
    if (!(shaderElement.type === 'x-shader/x-fragment' || shaderScript.type === 'x-shader/x-vertex')) {
      throw new Error('Not a shader element: ' + shaderElement);
    }
    shaderCode = "";
    currentScriptNode = shaderElement.firstChild;
    while (currentScriptNode) {
      if (currentScriptNode.nodeType === 3) {
        shaderCode += currentScriptNode.textContent;
      }
      currentScriptNode = currentScriptNode.nextSibling;
    }
    return shaderCode;
  };

  GL.prototype.compileShader = function(shaderCode, shaderType) {
    var shader;
    shader = this._gl.createShader(shaderType);
    this._gl.shaderSource(shader, shaderCode);
    this._gl.compileShader(shader);
    if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
      throw new Error(this._gl.getShaderInfoLog);
    }
    return shader;
  };

  GL.prototype.initShaders = function(fragmentShaderElementId, vertexShaderElementId) {
    this._fragmentShader = this.compileShader(this.fetchShaderFromElement(fragmentShaderElementId), this._gl.FRAGMENT_SHADER);
    return this._vertexShader = this.compileShader(this.fetchShaderFromElement(vertexShaderElementId), this._gl.VERTEX_SHADER);
  };

  GL.prototype.createShaderProgram = function(fragmentShaderSource, vertexShaderSource) {
    var shaderProgram;
    shaderProgram = this._gl.createProgram();
    this._gl.attachShader(shaderProgram, this.compileShader(fragmentShaderSource, this._gl.FRAGMENT_SHADER));
    this._gl.attachShader(shaderProgram, this.compileShader(vertexShaderSource, this._gl.VERTEX_SHADER));
    this._gl.linkProgram(shaderProgram);
    if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
      throw new Error('Could not initialize shaders.');
    }
    return shaderProgram;
  };

  GL.prototype.setShader = function(_shaderProgram) {
    this._shaderProgram = _shaderProgram;
    this._gl.useProgram(this._shaderProgram);
    this._shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, 'aVertexPosition');
    if (this._shaderProgram.vertexPositionAttribute == null) {
      throw Error('Failed to get reference to "aVertexPosition" in shader program.');
    }
    this._gl.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);
    this._shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, 'uMVMatrix');
    if (this._shaderProgram.mvMatrixUniform == null) {
      throw Error('Failed to get reference to "uMVMatrix" in shader program.');
    }
  };

  GL.prototype.createMesh = function(settings) {
    var indexBuffer, vertexBuffer;
    vertexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(settings.vertices), this._gl.STATIC_DRAW);
    indexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(settings.indices), this._gl.STATIC_DRAW);
    return new Mesh({
      vertexBuffer: vertexBuffer,
      vertexSize: settings.vertexSize,
      numVertices: settings.vertices.length / settings.vertexSize,
      indexBuffer: indexBuffer,
      numIndices: settings.indices.length,
      position: settings.position
    });
  };

  GL.prototype.createMeshFromObj = function(objData, position) {
    var parser;
    parser = new ObjParser;
    parser.parse(objData);
    return this.createMesh({
      vertices: parser.out[0],
      vertexSize: 3,
      indices: parser.indices,
      numIndices: parser.indices.length,
      position: [0, 0, 0]
    });
  };

  GL.prototype.setMvMatrix = function(modelMatrix, viewMatrix, projectionMatrix) {
    var mvMatrix;
    mvMatrix = mat4.create();
    mat4.multiply(mvMatrix, modelMatrix, viewMatrix);
    mat4.multiply(mvMatrix, mvMatrix, projectionMatrix);
    return this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, mvMatrix);
  };

  GL.prototype.pushMatrix = function() {
    return this._mvMatrixStack.push(mat4.clone(this._mvMatrix));
  };

  GL.prototype.popMatrix = function() {
    if (this._mvMatrixStack.length < 1) {
      throw Error('Invalid popMatrix');
    }
    return this._mvMatrix = this._mvMatrixStack.pop();
  };

  GL.prototype.deg2Rad = function(degrees) {
    return degrees * Math.PI / 180;
  };

  GL.prototype.drawScene = function(meshes) {
    var cameraMatrix, cameraPosition, cameraRotation, cameraTarget, cameraTranslation, mesh, modelMatrix, viewMatrix, _i, _len, _results;
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    viewMatrix = mat4.create();
    cameraPosition = [0, 0, -10];
    cameraTarget = [0, 0, 0];
    cameraRotation = mat4.create();
    mat4.rotateY(cameraRotation, cameraRotation, this.deg2Rad(this._cubeRotation));
    cameraTranslation = mat4.create();
    mat4.translate(cameraTranslation, cameraTranslation, cameraPosition);
    cameraMatrix = mat4.create();
    mat4.multiply(cameraMatrix, cameraTranslation, cameraMatrix);
    mat4.multiply(cameraMatrix, cameraRotation, cameraMatrix);
    cameraPosition = cameraMatrix.subarray(12, 15);
    mat4.lookAt(viewMatrix, cameraPosition, cameraTarget, [0, 1, 0]);
    _results = [];
    for (_i = 0, _len = meshes.length; _i < _len; _i++) {
      mesh = meshes[_i];
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, mesh.vertexBuffer);
      this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, mesh.vertexSize, this._gl.FLOAT, false, 0, 0);
      this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      modelMatrix = mat4.create();
      mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
      mat4.multiply(modelMatrix, viewMatrix, modelMatrix);
      mat4.multiply(modelMatrix, this._pMatrix, modelMatrix);
      this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, modelMatrix);
      _results.push(this._gl.drawElements(this._gl.TRIANGLES, mesh.numIndices, this._gl.UNSIGNED_SHORT, 0));
    }
    return _results;
  };

  GL.prototype.tick = function() {
    return this._cubeRotation += 1.5;
  };

  return GL;

})();

}, {"app/mesh":"src/app/mesh","app/objparser":"src/app/objparser","app/camera":"src/app/camera"});
require.register('src/app/glmath', function(require, module, exports){


}, {});
require.register('src/app/loader', function(require, module, exports){


}, {});
require.register('src/app/mesh', function(require, module, exports){
var Mesh,
  __hasProp = {}.hasOwnProperty;

module.exports = Mesh = (function() {
  function Mesh(settings) {
    var key, value;
    for (key in settings) {
      if (!__hasProp.call(settings, key)) continue;
      value = settings[key];
      this[key] = value;
    }
  }

  return Mesh;

})();

}, {});
require.register('src/app/metronome', function(require, module, exports){
var Metronome, MicroEvent, time,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MicroEvent = require('app/microevent');

time = require('app/time');

module.exports = Metronome = (function() {
  function Metronome(FPS) {
    this.tick = __bind(this.tick, this);
    this.timeBetweenTicks = 1 / FPS;
    this.lastT = null;
    this.timeAccumulator = 0;
  }

  Metronome.prototype.start = function() {
    this.lastT = Date.now();
    this.tick();
    this.emit("Start");
  };

  Metronome.prototype.stop = function() {
    var t;
    time.cancelAnimationFrame(this.tick);
    t = Date.now();
    this.timeAccumulator += (t - this.lastT) / 1000;
    this.emit("Stop");
  };

  Metronome.prototype.tick = function() {
    var t;
    time.requestAnimationFrame(this.tick);
    t = Date.now();
    this.timeAccumulator += (t - this.lastT) / 1000;
    while (this.timeAccumulator > this.timeBetweenTicks) {
      this.timeAccumulator -= this.timeBetweenTicks;
      this.emit("Tick");
    }
    this.lastT = t;
  };

  return Metronome;

})();

MicroEvent.Mixin(Metronome);

}, {"app/microevent":"src/app/microevent","app/time":"src/app/time"});
require.register('src/app/microevent', function(require, module, exports){
var MicroEvent,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty;

module.exports = MicroEvent = (function() {
  function MicroEvent() {}

  MicroEvent.prototype.on = function(e, handler) {
    var _base;
    this._events || (this._events = {});
    (_base = this._events)[e] || (_base[e] = []);
    this._events[e].push(handler);
    return this;
  };

  MicroEvent.prototype.once = function(e, handler) {
    this.on(e, (function(_this) {
      return function() {
        handler.apply(_this, arguments);
        return _this.off(e, handler);
      };
    })(this));
    return this;
  };

  MicroEvent.prototype.off = function(e, handler) {
    if (!this._events) {
      return;
    }
    if (this._events[e]) {
      this._events[e].splice(this._events[e].indexOf(handler), 1);
    }
    return this;
  };

  MicroEvent.prototype.emit = function() {
    var data, e, handler, _i, _len, _ref;
    e = arguments[0], data = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!this._events) {
      return;
    }
    if (this._events[e]) {
      _ref = this._events[e];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        handler.apply(this, arguments);
      }
    }
    return this;
  };

  MicroEvent.Mixin = function(target) {
    var name, property, _ref;
    _ref = MicroEvent.prototype;
    for (name in _ref) {
      if (!__hasProp.call(_ref, name)) continue;
      property = _ref[name];
      target.prototype[name] = property;
    }
    return target;
  };

  return MicroEvent;

})();

}, {});
require.register('src/app/objparser', function(require, module, exports){
var ObjParser,
  __slice = [].slice;

module.exports = ObjParser = (function() {
  function ObjParser() {
    this.parsed = [[], [], []];
    this.out = [[], [], []];
    this.indices = [];
  }

  ObjParser.prototype.parse = function(objData) {
    var line, tokens, _i, _len, _ref;
    _ref = objData.split('\n');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      if ((line.charAt(0)) === '#' || line.length < 1) {
        continue;
      }
      tokens = line.trim().split(/\s+/);
      if (this[tokens[0]]) {
        this[tokens[0]].apply(this, tokens.slice(1));
      }
    }
  };

  ObjParser.prototype.v = function(x, y, z) {
    this.parsed[0].push([parseFloat(x), parseFloat(y), parseFloat(z)]);
  };

  ObjParser.prototype.vn = function(i, j, k) {
    this.parsed[1].push([parseFloat(i), parseFloat(j), parseFloat(k)]);
  };

  ObjParser.prototype.vt = function(u, v) {
    this.parsed[2].push([parseFloat(u), parseFloat(v)]);
  };

  ObjParser.prototype.f = function() {
    var components, currentComponentIndex, currentIndex, index, indices, parsedIndex, _i, _j, _ref, _ref1;
    indices = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (currentIndex = _i = 0, _ref = indices.length; 0 <= _ref ? _i < _ref : _i > _ref; currentIndex = 0 <= _ref ? ++_i : --_i) {
      components = indices[currentIndex].split('/');
      for (currentComponentIndex = _j = 0, _ref1 = components.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; currentComponentIndex = 0 <= _ref1 ? ++_j : --_j) {
        if (currentComponentIndex > 0) {
          continue;
        }
        index = parseInt(components[currentComponentIndex]);
        if (index > 0) {
          parsedIndex = index - 1;
        } else {
          parsedIndex = this.parsed[currentComponentIndex].length - index;
        }
        this.out[currentComponentIndex].push.apply(this.out[currentComponentIndex], this.parsed[currentComponentIndex][parsedIndex]);
      }
      this.indices.push(this.indices.length);
    }
  };

  return ObjParser;

})();

}, {});
require.register('src/app/time', function(require, module, exports){
var cancelAnimationFrame, requestAnimationFrame, targetTime, vendor, _i, _len, _ref;

requestAnimationFrame = window["requestAnimationFrame"];

_ref = ['ms', 'moz', 'webkit', 'o'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  vendor = _ref[_i];
  if (requestAnimationFrame) {
    break;
  }
  requestAnimationFrame = window["" + vendor + "RequestAnimationFrame"];
  cancelAnimationFrame = window["" + vendor + "CancelAnimationFrame"] || window["" + vendor + "CancelRequestAnimationFrame"];
}

targetTime = 0;

requestAnimationFrame || (requestAnimationFrame = function(callback) {
  var currentTime;
  targetTime = Math.max(targetTime + 16, currentTime = Date.now());
  return setTimeout((function() {
    return callback(Date.now());
  }), targetTime - currentTime);
});

cancelAnimationFrame || (cancelAnimationFrame = function(id) {
  return clearTimeout(id);
});

exports.requestAnimationFrame = function(callback) {
  return requestAnimationFrame.apply(window, [callback]);
};

exports.cancelAnimationFrame = function(id) {
  return cancelAnimationFrame.apply(window, [id]);
};

}, {});
// POLVO :: INITIALIZER
require('src/app/app');
/*
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjozOTc0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9hcHAubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkFwcFxuPT09XG5cblRoaXMgYXBwIGlzIG15IHBsYXlncm91bmQgZm9yIGxlYXJuaW5nIGJvdGggW0NvZmZlZVNjcmlwdF0oaHR0cDovL3d3dy5jb2ZmZWVzY3JpcHQub3JnKSBhbmRcbltXZWJHTF0oaHR0cDovL2tocm9ub3Mub3JnL3dlYmdsKS4gQW55dGhpbmcgeW91IGZpbmQgaGVyZSBpcyB1c2VkIGF0IHlvdXIgb3duIHJpc2suIEFzIHlvdSBjYW4gc2VlIGFsbCB0aGUgY29kZSBpc1xuYXZhaWxhYmxlIHJpZ2h0IGhlcmUgb24gdGhlIHNpdGUgeW91IGFyZSByZWFkaW5nIHNvIGZlZWwgZnJlZSB0byBoYXZlIGEgbG9vayBhcm91bmQuXG5cbkRlcGVuZGVuY2llc1xuLS0tLS0tLS0tLS0tXG5XZSBoYXZlIGEgY291cGxlIG9mIGV4dGVybmFsIGNsYXNzZXMgdG8gZ2V0IHRoZSBhcHAgcnVubmluZy4gV2UgbmVlZCBbR0xdKGdsLmh0bWwgXCJVdGlsaXR5IGNsYXNzIGZvciBXZWJHTFwiKSB0byBoYW5kbGVcbnRoZSBXZWJHTCByZWxhdGVkIHRhc2tzLiBBbmQgd2Ugd2lsbCBuZWVkIFt0aW1lXSh0aW1lLmh0bWwgXCJIaWdoIHBlcmZvcm1hbmNlIHRpbWVyIGZ1bmN0aW9uc1wiKSBmb3IgdGhlIGdhbWUgbG9vcCB0aW1lci5cblxuXHRHTCA9IHJlcXVpcmUgJ2FwcC9nbCdcblx0TWV0cm9ub21lID0gcmVxdWlyZSAnYXBwL21ldHJvbm9tZSdcblxuU3RhcnQgdGhlIGFwcGxpY2F0aW9uXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblRoZSBhcHAgbXVzdCB3YWl0IGZvciBldmVyeXRoaW5nIHRvIGJlIHByb3Blcmx5IGxvYWRlZCBiZWZvcmUgaXQgY2FuIHN0YXJ0LiBUaGlzIGlzIGRvbmUgd2l0aCBhIHNpbXBsZSBldmVudCBsaXN0ZW5lclxud2FpdGluZyBmb3IgdGhlIGBET01Db250ZW50TG9hZGVkYCBldmVudC4gVGhlcmUgaXMgYSBsb3Qgb2YgSlMtZnJhbWV3b3JrcyB0aGF0IGNvdWxkIGhlbHAgd2l0aCB0aGlzIGJ1dCBhdCB0aGUgbW9tZW50XG50aGlzIG1ldGhvZCB3aWxsIGJlIHN1ZmZpY2llbnQuXG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcIkRPTUNvbnRlbnRMb2FkZWRcIiwgLT5cblxuVGhlIHNoYWRlcnMgYXJlIGxvYWRlZCBhc3luY2hyb25vdXNseSBhcyB0ZXh0LiBQcmUtY29tcGlsZWQgc2hhZGVycyBkb24ndCBleGlzdCBpbiBXZWJHTCB5ZXQgYW5kIGl0J3MgcHJvYmFibHkgbm90IGhpZ2hcbm9uIHRoZSBsaXN0IGFzIGl0IHdvdWxkIGJlIGEgc2VjdXJpdHkgY29uY2VybiBhcyBmYXIgYXMgSSB1bmRlcnN0YW5kIGl0LiBTbyBsZXQncyBjcmVhdGUgYSBjb3VwbGUgb2YgdmFyaWFibGVzIHN0b3JlXG50aGUgc2hhZGVyIGNvZGUgaW4gdW50aWwgd2UgYXJlIHJlYWR5IGluaXQgR0wuXG5cblx0XHRmcmFnbWVudFNoYWRlclNvdXJjZVx0PVxuXHRcdHZlcnRleFNoYWRlclNvdXJjZVx0XHQ9XG5cdFx0Y3ViZURhdGFcdFx0XHRcdD0gdW5kZWZpbmVkO1xuXG5Ob3cgaXQncyB0aW1lIHRvIHN0YXJ0IHRoZSBhc3luY2hyb25vdXMgbG9hZGluZyBvZiB0aGUgc2hhZGVycy4gU3RvcmUgdGhlIHNoYWRlciBjb2RlIHdoZW4gdGhlIGFqYXggcmVxdWVzdCBpcyBkb25lLlxuQXMgdGhlcmUgaXMgdHdvIHNoYWRlcnMgdGhhdCBhcmUgYm90aCBsb2FkZWQgYXN5bmMgdGhlIGFwcCBtdXN0IHdhaXQgdW50aWwgYm90aCBhcmUgbG9hZGVkIGJlZm9yZSBjb250aW51aW5nIGV4ZWN1dGlvblxub2YgdGhlIGFwcC5cblxuXHRcdGNvbnNvbGUubG9nICdTdGFydGluZyB0byBsb2FkIHNoYWRlcnMuJ1xuXHRcdG5ldyBtaWNyb0FqYXggJy4vZlNoYWRlci5mcmFnJywgKCByZXNvdXJjZSApIC0+XG5cdFx0XHRjb25zb2xlLmxvZyAnRnJhZ21lbnQgc2hhZGVyIGxvYWRlZC4nXG5cdFx0XHRmcmFnbWVudFNoYWRlclNvdXJjZSA9IHJlc291cmNlXG5cblx0XHRuZXcgbWljcm9BamF4ICcuL3ZTaGFkZXIudmVydCcsICggcmVzb3VyY2UgKSAtPlxuXHRcdFx0Y29uc29sZS5sb2cgJ1ZlcnRleCBzaGFkZXIgbG9hZGVkLidcblx0XHRcdHZlcnRleFNoYWRlclNvdXJjZSA9IHJlc291cmNlXG5cblx0XHRuZXcgbWljcm9BamF4ICcuL2NhcHN1bGUub2JqJywgKCByZXNvdXJjZSApIC0+XG5cdFx0XHRjb25zb2xlLmxvZyAnQ3ViZSBkYXRhIGxvYWRlZC4nXG5cdFx0XHRjdWJlRGF0YSA9IHJlc291cmNlXG5cbiMjIyMgd2FpdEZvckFzc2V0c1xuVGhpcyBtZXRob2QgZG9lcyBleGFjdGx5IHdoYXQgaXMgc2F5cy4gSXQgd2FpdHMgZm9yIHRoZSBhc3NldHMgdG8gbG9hZCBpbiBvbmUgc2Vjb25kIGxvb3BzIGFuZCB3aGVuIGFsbCBhc3NldHMgYXJlIGRvbmVcbmxvYWRpbmcgaXQgd2lsbCBjYWxsIFtgc3RhcnRHTGBdKCNzdGFydGdsKS5cblxuXHRcdHdhaXRGb3JBc3NldHMgPSAtPlxuXHRcdFx0c2V0VGltZW91dCAtPlxuXHRcdFx0XHRpZiBmcmFnbWVudFNoYWRlclNvdXJjZT8gYW5kIHZlcnRleFNoYWRlclNvdXJjZT8gYW5kIGN1YmVEYXRhP1xuXHRcdFx0XHRcdHN0YXJ0R0wgJ2xlc3NvbjAxLWNhbnZhcycsIGZyYWdtZW50U2hhZGVyU291cmNlLCB2ZXJ0ZXhTaGFkZXJTb3VyY2Vcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHdhaXRGb3JBc3NldHMoKVxuXHRcdFx0LCAxMDAwXG5cblx0XHR3YWl0Rm9yQXNzZXRzKClcblxuV2UgbmVlZCBhbm90aGVyIGNvdXBsZSBvZiBnbG9iYWxzIHRvIHN0b3JlIHRoZSBtZXNoIHdlIGFyZSBnb2luZyB0byBkcmF3LCBhbmQgdG8gc3RvcmUgdGhlIGdsIG9iamVjdCB0aGF0IHdpbGwgdGFrZVxuY2FyZSBvZiB0aGUgM0QgcmVuZGVyaW5nLlxuXG5cdFx0Z2wgPSBudWxsXG5cdFx0Y3ViZSA9IG51bGxcblx0XHRtZXRyb25vbWUgPSBuZXcgTWV0cm9ub21lIDYwXG5cdFx0bWV0cm9ub21lLm9uIFwiVGlja1wiLCAtPlxuXHRcdFx0Z2wudGljaygpXG5cdFx0XHRnbC5kcmF3U2NlbmUgW2N1YmVdXG5cdFx0XHRyZXR1cm5cblxuIyMjIHN0YXJ0R0xcblxuXHRcdHN0YXJ0R0wgPSAoIGNhbnZhc0VsZW1lbnRJZCwgZnJhZ21lbnRTaGFkZXJTb3VyY2UsIHZlcnRleFNoYWRlclNvdXJjZSApIC0+XG5cdFx0XHRnbCA9IG5ldyBHTCBjYW52YXNFbGVtZW50SWRcblxuQWZ0ZXIgR0wgaXMgaW5pdGlhbGl6ZWQgdGhlIHNoYWRlciBwcm9ncmFtIGhhdmUgdG8gYmUgY29tcGlsZWQgYW5kIGxpbmtlZC5cblxuXHRcdFx0c2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyUHJvZ3JhbSBmcmFnbWVudFNoYWRlclNvdXJjZSwgdmVydGV4U2hhZGVyU291cmNlXG5cdFx0XHRnbC5zZXRTaGFkZXIgc2hhZGVyXG5cblx0XHRcdGN1YmUgPSBnbC5jcmVhdGVNZXNoRnJvbU9iaiBjdWJlRGF0YVxuXG5cdFx0XHRtZXRyb25vbWUuc3RhcnQoKVxuXHQsIGZhbHNlXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBWUMsSUFBQSxhQUFBOztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsUUFBUixDQUFMLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSxlQUFSLENBRFosQ0FBQTs7QUFBQSxRQVNRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFNBQUEsR0FBQTtBQU03QyxNQUFBLCtGQUFBO0FBQUEsRUFBQSxvQkFBQSxHQUNBLGtCQUFBLEdBQ0EsUUFBQSxHQUFjLE1BRmQsQ0FBQTtBQUFBLEVBUUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwyQkFBWixDQVJBLENBQUE7QUFBQSxFQVNJLElBQUEsU0FBQSxDQUFVLGdCQUFWLEVBQTRCLFNBQUUsUUFBRixHQUFBO0FBQy9CLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSx5QkFBWixDQUFBLENBQUE7V0FDQSxvQkFBQSxHQUF1QixTQUZRO0VBQUEsQ0FBNUIsQ0FUSixDQUFBO0FBQUEsRUFhSSxJQUFBLFNBQUEsQ0FBVSxnQkFBVixFQUE0QixTQUFFLFFBQUYsR0FBQTtBQUMvQixJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVosQ0FBQSxDQUFBO1dBQ0Esa0JBQUEsR0FBcUIsU0FGVTtFQUFBLENBQTVCLENBYkosQ0FBQTtBQUFBLEVBaUJJLElBQUEsU0FBQSxDQUFVLGVBQVYsRUFBMkIsU0FBRSxRQUFGLEdBQUE7QUFDOUIsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG1CQUFaLENBQUEsQ0FBQTtXQUNBLFFBQUEsR0FBVyxTQUZtQjtFQUFBLENBQTNCLENBakJKLENBQUE7QUFBQSxFQXlCQSxhQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNmLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUcsOEJBQUEsSUFBMEIsNEJBQTFCLElBQWtELGtCQUFyRDtlQUNDLE9BQUEsQ0FBUSxpQkFBUixFQUEyQixvQkFBM0IsRUFBaUQsa0JBQWpELEVBREQ7T0FBQSxNQUFBO2VBR0MsYUFBQSxDQUFBLEVBSEQ7T0FEVTtJQUFBLENBQVgsRUFLRSxJQUxGLEVBRGU7RUFBQSxDQXpCaEIsQ0FBQTtBQUFBLEVBaUNBLGFBQUEsQ0FBQSxDQWpDQSxDQUFBO0FBQUEsRUFzQ0EsRUFBQSxHQUFLLElBdENMLENBQUE7QUFBQSxFQXVDQSxJQUFBLEdBQU8sSUF2Q1AsQ0FBQTtBQUFBLEVBd0NBLFNBQUEsR0FBZ0IsSUFBQSxTQUFBLENBQVUsRUFBVixDQXhDaEIsQ0FBQTtBQUFBLEVBeUNBLFNBQVMsQ0FBQyxFQUFWLENBQWEsTUFBYixFQUFxQixTQUFBLEdBQUE7QUFDcEIsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsRUFBRSxDQUFDLFNBQUgsQ0FBYSxDQUFDLElBQUQsQ0FBYixDQURBLENBRG9CO0VBQUEsQ0FBckIsQ0F6Q0EsQ0FBQTtTQWdEQSxPQUFBLEdBQVUsU0FBRSxlQUFGLEVBQW1CLG9CQUFuQixFQUF5QyxrQkFBekMsR0FBQTtBQUNULFFBQUEsTUFBQTtBQUFBLElBQUEsRUFBQSxHQUFTLElBQUEsRUFBQSxDQUFHLGVBQUgsQ0FBVCxDQUFBO0FBQUEsSUFJQSxNQUFBLEdBQVMsRUFBRSxDQUFDLG1CQUFILENBQXVCLG9CQUF2QixFQUE2QyxrQkFBN0MsQ0FKVCxDQUFBO0FBQUEsSUFLQSxFQUFFLENBQUMsU0FBSCxDQUFhLE1BQWIsQ0FMQSxDQUFBO0FBQUEsSUFPQSxJQUFBLEdBQU8sRUFBRSxDQUFDLGlCQUFILENBQXFCLFFBQXJCLENBUFAsQ0FBQTtXQVNBLFNBQVMsQ0FBQyxLQUFWLENBQUEsRUFWUztFQUFBLEVBdERtQztBQUFBLENBQTlDLEVBaUVFLEtBakVGLENBVEEsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo0MDI1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9jYW1lcmEubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkNhbWVyYVxuPT09PT09XG5cbkEgY2FtZXJhIGlzIGJhc2ljYWxseSBhIHBvc2l0aW9uIGFuZCBhIHRhcmdldCBwb3NpdGlvbiB0byBsb29rIGF0LlxuXG5cdG1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ2FtZXJhXG5cdFx0Y29uc3RydWN0b3I6ICggQHBvc2l0aW9uLCBAdGFyZ2V0ICkgLT5cblx0XHRcdEBfdmlld01hdHJpeCA9IG1hdDQuY3JlYXRlKClcblxuXG5cdFx0Z2V0Vmlld01hdHJpeDogLT5cblx0XHRcdG1hdDQubG9va0F0IEBfdmlld01hdHJpeCwgQHBvc2l0aW9uLCBAdGFyZ2V0LCBbMCwgMSwgMF1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQyxJQUFBLE1BQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDVCxFQUFBLGdCQUFHLFFBQUgsRUFBYyxNQUFkLEdBQUE7QUFDWixJQURjLElBQUMsQ0FBQSxXQUFBLFFBQ2YsQ0FBQTtBQUFBLElBRHlCLElBQUMsQ0FBQSxTQUFBLE1BQzFCLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFmLENBRFk7RUFBQSxDQUFiOztBQUFBLG1CQUlBLGFBQUEsR0FBZSxTQUFBLEdBQUE7V0FDZCxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxXQUFiLEVBQTBCLElBQUMsQ0FBQSxRQUEzQixFQUFxQyxJQUFDLENBQUEsTUFBdEMsRUFBOEMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBOUMsRUFEYztFQUFBLENBSmYsQ0FBQTs7Z0JBQUE7O0lBREQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo0MDQ0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9nbC5saXRjb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiR0xcbj09XG5cbkdMIGlzIHRoZSBjZW50cmFsIG9iamVjdCBoYW5kbGluZyBXZWJHTCBjYWxscy4gQ3VycmVudGx5IGl0J3MgdGFraW5nIGNhcmUgb2YgZXZlcnkgZnVuY3Rpb24gdGhhdCBuZWVkcyB0aGUgZ2wgb2JqZWN0LlxuXG5EZXBlbmRlbmNpZXNcbi0tLS0tLS0tLS0tLVxuVG8gd3JhcCB0aGUgZGF0YSBuZWVkZWQgZm9yIGRyYXdpbmcgbWVzaGVzIHdlIGltcG9ydCB0aGUgZXh0cmVtZWx5IHNpbXBsZSBNZXNoIGNsYXNzLiBGb3IgcGFyc2luZyAub2JqIGZpbGUgZGF0YSBpbnRvXG5zdHJ1Y3R1cmVzIGNvbnZlbmllbnQgZm9yIGNyZWF0aW5nIG1lc2hlcyB3ZSB1c2UgdGhlIE9ialBhcnNlciB3aGljaCBjYW4gcGFyc2Ugc2ltcGxlIC5vYmogZmlsZXMuXG5cblx0TWVzaFx0XHQ9IHJlcXVpcmUgJ2FwcC9tZXNoJ1xuXHRPYmpQYXJzZXIgXHQ9IHJlcXVpcmUgJ2FwcC9vYmpwYXJzZXInXG5cdENhbWVyYVx0XHQ9IHJlcXVpcmUgJ2FwcC9jYW1lcmEnXG5cbkdMXG4tLVxuRmlyc3Qgd2UgbmVlZCB0aGUgY2xhc3MgaXRzZWxmLiBJIHdpbGwgY2FsbCBpdCBHTCBhdCB0aGUgbW9tZW50IGFuZCBzZWUgaWYgdGhhdCBzdGlja3MuXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBHTFxuXG5jb25zdHJ1Y3RvclxuLS0tLS0tLS0tLS1cblxuVGhlIGNvbnN0cnVjdG9yIG5lZWQgdGhlIGVsZW1lbnQgaWQgb2YgdGhlIGNhbnZhcyBlbGVtZW50IHdoZXJlIHdlIHdpbGwgaW5pdGlhbGl6ZSB0aGUgV2ViR0wgY29udGV4dC4gVGhlIHZpZXcgbWF0cml4XG50aGUgcHJvamVjdGlvbiBtYXRyaXggYW5kIHRoZSBtYXRyaXggc3RhY2sgYXJlIGFsc28gaW5pdGlhbGl6ZWQgaGVyZS5cblxuXHRcdGNvbnN0cnVjdG9yOiAoIGNhbnZhc0VsZW1lbnRJZCApIC0+XG5cdFx0XHRAX3BNYXRyaXhcdFx0PSBtYXQ0LmNyZWF0ZSgpXG5cdFx0XHRAX212TWF0cml4XHRcdD0gbWF0NC5jcmVhdGUoKVxuXHRcdFx0QF9tdk1hdHJpeFN0YWNrXHQ9IFtdXG5cdFx0XHRAX2N1YmVSb3RhdGlvblx0PSAwLjBcblx0XHRcdEBfY2FtZXJhXHRcdD0gbmV3IENhbWVyYSBbMCwgMCwgLTEwXSwgWzAsIDAsIDBdXG5cbkZldGNoIHRoZSBlbGVtZW50IGFuZCB0aGVuIGdldCB0aGUgYHdlYmdsYCBjb250ZXh0IGZyb20gaXQuIElmIHRoaXMgZmFpbHMgdHJ5IGBleHBlcmltZW50YWwtd2ViZ2xgLiBUaGlzIG1pZ2h0IHRocm93IGFuXG5leGNlcHRpb24gYW5kIHdlIGhhdmUgdG8gY2F0Y2ggdGhhdC4gSXQgbWlnaHQgYmUgYmV0dGVyIHRvIGp1c3QgbGV0IHRoZSBleGNlcHRpb24gZmFsbCB0aHJvdWdoIGJ1dCB0aGlzIHdheSBhIGJldHRlclxuZXJyb3IgbWVzc2FnZSBjYW4gYmUgc2hvd24uIEkgd2lsbCBzdGlsbCB0aHJvdyB0aGUgZXhjZXB0aW9uIGJ1dCBub3cgSSBjYW4gY291cGxlIGl0IHdpdGggYSBjb25zb2xlIGxpbmUgdG8gbWFrZSBzdXJlIElcbmtub3cgd2h5IHRoZSBwcm9ncmFtIGhhbHRlZC5cblxuXHRcdFx0Y2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkIGNhbnZhc0VsZW1lbnRJZFxuXG5cdFx0XHR0cnlcblx0XHRcdFx0QF9nbCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dCAnd2ViZ2wnIHx8IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dCAnZXhwZXJpbWVudGFsLXdlYmdsJ1xuXHRcdFx0Y2F0Y2ggZXJyb3Jcblx0XHRcdFx0Y29uc29sZS5sb2cgJ0ZhaWxlZCB0byBpbml0aWFsaXplIFdlYkdMIHVzaW5nIHRoZSBlbGVtZW50ICcgKyBjYW52YXMgKyAnLiBFcnJvcjpcXG4nICsgZXJyb3Jcblx0XHRcdFx0dGhyb3cgZXJyb3JcblxuVGFjayB0aGUgcGh5c2ljYWwgZGltZW5zaW9ucyBvZiB0aGUgZWxlbWVudCBvbnRvIHRoZSBnbCBjb250ZXh0LiBXZSBuZWVkIHRoZW0gdG8gYmUgYWJsZSB0byBzcGVjaWZ5IHRoZSB2aWV3cG9ydCBsYXRlci5cblxuXHRcdFx0QF9nbC52aWV3cG9ydFdpZHRoID0gY2FudmFzRWxlbWVudC53aWR0aFxuXHRcdFx0QF9nbC52aWV3cG9ydEhlaWdodCA9IGNhbnZhc0VsZW1lbnQuaGVpZ2h0XG5cdFx0XHRtYXQ0LnBlcnNwZWN0aXZlIEBfcE1hdHJpeCwgNDUsIGNhbnZhc0VsZW1lbnQud2lkdGggLyBjYW52YXNFbGVtZW50LmhlaWdodCwgMC4xLCAxMDAuMCwgQF9wTWF0cml4XG5cdFx0XHRAX2dsLnZpZXdwb3J0IDAsIDAsIGNhbnZhc0VsZW1lbnQud2lkdGgsIGNhbnZhc0VsZW1lbnQuaGVpZ2h0XG5cbkNsZWFyIHRoZSBidWZmZXIsIGVuYWJsZSBkZXB0aCB0ZXN0aW5nIGFuZCBlbmFibGUgYmFja2ZhY2UgY3VsbGluZy5cblxuXHRcdFx0QF9nbC5jbGVhckNvbG9yIDAuMCwgMC4wLCAwLjAsIDEuMFxuXHRcdFx0QF9nbC5lbmFibGUgQF9nbC5ERVBUSF9URVNUXG5cdFx0XHRAX2dsLmVuYWJsZSBAX2dsLkNVTExfRkFDRVxuXG5cbmZldGNoU2hhZGVyRnJvbUVsZW1lbnRcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuU2hhZGVycyBjYW4gYmUgbG9jYXRlZCBpbnNpZGUgYSBgPHNjcmlwdD5gIHRhZyBpbiB0aGUgSFRNTC4gVGhpcyBtZXRob2QgcGFyc2VzIGFuIGVsZW1lbnQgc3BlY2lmaWVkIGJ5IGl0cyBpZC5cblxuXHRcdGZldGNoU2hhZGVyRnJvbUVsZW1lbnQ6ICggc2hhZGVyRWxlbWVudElkICkgLT5cblx0XHRcdHNoYWRlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCBzaGFkZXJFbGVtZW50SWRcblxuSWYgdGhlIGdpdmVuIGVsZW1lbnQgZG9lc24ndCBleGlzdCB3ZSBzdG9wIHRoZSBleGVjdXRpb24gc3RyYWlnaHQgYXdheS4gU2FtZSB0aGluZyBpZiBpdCdzIG5vdCBhIHNoYWRlciBlbGVtZW50LiBJdFxuc2hvdWxkIGJlIGEgc2NyaXB0IHRhZyB3aXRoIHRoZSB0eXBlIGF0dHJpYnV0ZSBzZXQgdG8gZWl0aGVyIGB4LXNoYWRlci94LWZyYWdtZW50YCBvciBgeC1zaGFkZXIveC12ZXJ0ZXhgLlxuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IgJ05vIHNoYWRlciB3aXRoIGlkOiAnICsgc2hhZGVyRWxlbWVudElkIHVubGVzcyBzaGFkZXJFbGVtZW50XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IgJ05vdCBhIHNoYWRlciBlbGVtZW50OiAnICsgc2hhZGVyRWxlbWVudCB1bmxlc3Mgc2hhZGVyRWxlbWVudC50eXBlID09ICd4LXNoYWRlci94LWZyYWdtZW50JyBvciBzaGFkZXJTY3JpcHQudHlwZSA9PSAneC1zaGFkZXIveC12ZXJ0ZXgnXG5cblRoZSBzaGFkZXIgY29kZSBpcyBqdXN0IHRleHQgc28gd2UgY2FuIGp1c3QgdHJhdmVyc2UgdGhyb3VnaCB0aGUgZWxlbWVudCBhbmQgZ2x1ZSB0b2dldGhlciBhbGwgbm9kZXMgd2l0aCBub2RlVHlwZSAzXG4odGV4dCBub2RlcykgdG8gYSBjb21iaW5lZCBzdHJpbmcgd2l0aCB0aGUgc2hhZGVyIGNvZGUgaW4gaXQuXG4qTk9URToqIFRoaXMgbWlnaHQgbm90IGJlIHRoZSBiZXN0IHdheSB0byBkbyB0aGlzLiBJIHRoaW5rIEkgY2FuIGFjdHVhbGx5IHVzZSB0aGUgaW5uZXJIVE1MIHByb3BlcnR5LiBJJ2xsIHRyeSB0aGF0XG5sYXRlci5cblxuXHRcdFx0c2hhZGVyQ29kZSA9IFwiXCJcblx0XHRcdGN1cnJlbnRTY3JpcHROb2RlID0gc2hhZGVyRWxlbWVudC5maXJzdENoaWxkXG5cblx0XHRcdHdoaWxlIGN1cnJlbnRTY3JpcHROb2RlXG5cdFx0XHRcdHNoYWRlckNvZGUgKz0gY3VycmVudFNjcmlwdE5vZGUudGV4dENvbnRlbnQgaWYgY3VycmVudFNjcmlwdE5vZGUubm9kZVR5cGUgPT0gM1xuXHRcdFx0XHRjdXJyZW50U2NyaXB0Tm9kZSA9IGN1cnJlbnRTY3JpcHROb2RlLm5leHRTaWJsaW5nXG5cblx0XHRcdHJldHVybiBzaGFkZXJDb2RlO1xuXG5jb21waWxlU2hhZGVyXG4tLS0tLS0tLS0tLS0tXG5cblRvIHVzZSB0aGUgc2hhZGVycyB0aGV5IHdpbGwgaGF2ZSB0byBiZSBjb21waWxlZC4gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBhIHN0cmluZyBjb250YWluaW5nIHRoZSBHTFNMIGNvZGUgYW5kIHRoZVxuc2Vjb25kIHBhcmFtZXRlciB3aWxsIGdpdmUgdGhlIHR5cGUgb2Ygc2hhZGVyIHRvIGNyZWF0ZS4gQ3VycmVudGx5IHRoZXJlIGlzIG5vIG1lY2hhbmlzbSB0byBtYXRjaCB0aGUgc2hhZGVyIGNvZGUgdG9cbnRoZSBzaGFkZXIgdHlwZS4gRXh0cmFjdGluZyBhIHNoYWRlciBjbGFzcyBmcm9tIHRoaXMgaXMgcHJvYmFibHkgdGhlIHdheSB0byBnby4gTGF0ZXIuLi5cblxuXHRcdGNvbXBpbGVTaGFkZXI6ICggc2hhZGVyQ29kZSwgc2hhZGVyVHlwZSApIC0+XG5cdFx0XHRzaGFkZXIgPSBAX2dsLmNyZWF0ZVNoYWRlciBzaGFkZXJUeXBlXG5cblx0XHRcdEBfZ2wuc2hhZGVyU291cmNlIHNoYWRlciwgc2hhZGVyQ29kZVxuXHRcdFx0QF9nbC5jb21waWxlU2hhZGVyIHNoYWRlclxuXG5BZnRlciBjb21waWxhdGlvbiB3ZSBjYW4gY2hlY2sgdGhlIGNvbXBpbGUgc3RhdHVzIHBhcmFtZXRlciBvZiB0aGUgc2hhZGVyIHRvIG1ha2Ugc3VyZSBldmVyeXRoaW5nIHdlbnQgYWxsIHJpZ2h0LlxuT3RoZXJ3aXNlIHdlIHRocm93IGFuIGV4Y2VwdGlvbiBhcyB0aGVyZSBpcyBjdXJyZW50bHkgbm8gcmVhbCBwb2ludCBpbiBjb250aW51aW5nIGV4ZWN1dGlvbiBpZiBhIHNoYWRlciBjb21waWxhdGlvblxuZmFpbHMuXG5cblx0XHRcdHVubGVzcyBAX2dsLmdldFNoYWRlclBhcmFtZXRlciBzaGFkZXIsIEBfZ2wuQ09NUElMRV9TVEFUVVNcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yIEBfZ2wuZ2V0U2hhZGVySW5mb0xvZ1xuXG5cdFx0XHRyZXR1cm4gc2hhZGVyXG5cbmluaXRTaGFkZXJzXG4tLS0tLS0tLS0tLVxuXG5UaGlzIG1ldGhvZCB0YWtlcyBjYXJlIG9mIGxvYWRpbmcgYW5kIGNvbXBpbGluZyB0aGUgZnJhZ21lbnQgYW5kIHZlcnRleCBzaGFkZXJzLlxuXG5cdFx0aW5pdFNoYWRlcnM6ICggZnJhZ21lbnRTaGFkZXJFbGVtZW50SWQsIHZlcnRleFNoYWRlckVsZW1lbnRJZCApIC0+XG5cdFx0XHRAX2ZyYWdtZW50U2hhZGVyID0gQGNvbXBpbGVTaGFkZXIgKCBAZmV0Y2hTaGFkZXJGcm9tRWxlbWVudCBmcmFnbWVudFNoYWRlckVsZW1lbnRJZCApLCBAX2dsLkZSQUdNRU5UX1NIQURFUlxuXHRcdFx0QF92ZXJ0ZXhTaGFkZXIgPSBAY29tcGlsZVNoYWRlciAoIEBmZXRjaFNoYWRlckZyb21FbGVtZW50IHZlcnRleFNoYWRlckVsZW1lbnRJZCApLCBAX2dsLlZFUlRFWF9TSEFERVJcblxuY3JlYXRlU2hhZGVyUHJvZ3JhbVxuLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5IZXJlIHdlIGNvbWJpbmUgdGhlIGZyYWdtZW50IGFuZCB2ZXJ0ZXggc2hhZGVyIGludG8gYSBzaGFkZXIgcHJvZ3JhbS4gVGhpcyBpcyBkb25lIGJ5IGZpcnN0IGNyZWF0aW5nIHRoZSBzaGFkZXIgcHJvZ3JhbVxuaXRzZWxmLCBhdHRhY2hpbmcgdGhlIHNoYWRlcnMgdG8gaXQgYW5kIGxhc3QgbGlua2luZyB0aGUgcHJvZ3JhbS4gRmFpbHVyZSB0byBsaW5rIHdpbGwgcmVzdWx0IGluIGFuIGV4Y2VwdGlvbi5cblxuXHRcdGNyZWF0ZVNoYWRlclByb2dyYW06ICggZnJhZ21lbnRTaGFkZXJTb3VyY2UsIHZlcnRleFNoYWRlclNvdXJjZSApIC0+XG5cdFx0XHRzaGFkZXJQcm9ncmFtID0gQF9nbC5jcmVhdGVQcm9ncmFtKClcblx0XHRcdEBfZ2wuYXR0YWNoU2hhZGVyIHNoYWRlclByb2dyYW0sIEBjb21waWxlU2hhZGVyIGZyYWdtZW50U2hhZGVyU291cmNlLCBAX2dsLkZSQUdNRU5UX1NIQURFUlxuXHRcdFx0QF9nbC5hdHRhY2hTaGFkZXIgc2hhZGVyUHJvZ3JhbSwgQGNvbXBpbGVTaGFkZXIgdmVydGV4U2hhZGVyU291cmNlLCBAX2dsLlZFUlRFWF9TSEFERVJcblxuXHRcdFx0QF9nbC5saW5rUHJvZ3JhbSBzaGFkZXJQcm9ncmFtXG5cdFx0XHR1bmxlc3MgQF9nbC5nZXRQcm9ncmFtUGFyYW1ldGVyIHNoYWRlclByb2dyYW0sIEBfZ2wuTElOS19TVEFUVVNcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yICdDb3VsZCBub3QgaW5pdGlhbGl6ZSBzaGFkZXJzLidcblxuXHRcdFx0cmV0dXJuIHNoYWRlclByb2dyYW1cblxuc2V0U2hhZGVyXG4tLS0tLS0tLS1cblxuU2V0IHRoZSBzaGFkZXIgcHJvZ3JhbSB0byB1c2UgZm9yIHJlbmRlcmluZyBhbmQgZ2V0IHJlZmVyZW5jZXMgdG8gdGhlIHZhcmlhYmxlcyB0aGF0J3MgbmVlZGVkIHRvIGludGVyYWN0IHdpdGggdGhlXG5zaGFkZXIuIFRoZSByZWZlcmVuY2VzIGFyZSBzdG9yZWQgaW4gdGhlIHNoYWRlciBwcm9ncmFtIG9iamVjdC5cblxuXHRcdHNldFNoYWRlcjogKCBAX3NoYWRlclByb2dyYW0gKSAtPlxuXHRcdFx0QF9nbC51c2VQcm9ncmFtIEBfc2hhZGVyUHJvZ3JhbVxuXG5cdFx0XHRAX3NoYWRlclByb2dyYW0udmVydGV4UG9zaXRpb25BdHRyaWJ1dGUgPSBAX2dsLmdldEF0dHJpYkxvY2F0aW9uIEBfc2hhZGVyUHJvZ3JhbSwgJ2FWZXJ0ZXhQb3NpdGlvbidcblx0XHRcdHRocm93IEVycm9yICdGYWlsZWQgdG8gZ2V0IHJlZmVyZW5jZSB0byBcImFWZXJ0ZXhQb3NpdGlvblwiIGluIHNoYWRlciBwcm9ncmFtLicgdW5sZXNzIEBfc2hhZGVyUHJvZ3JhbS52ZXJ0ZXhQb3NpdGlvbkF0dHJpYnV0ZT9cblx0XHRcdEBfZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgQF9zaGFkZXJQcm9ncmFtLnZlcnRleFBvc2l0aW9uQXR0cmlidXRlXG5cblx0XHRcdCNAX3NoYWRlclByb2dyYW0ucE1hdHJpeFVuaWZvcm0gPSBAX2dsLmdldFVuaWZvcm1Mb2NhdGlvbiBAX3NoYWRlclByb2dyYW0sICd1UE1hdHJpeCdcblx0XHRcdCN0aHJvdyBFcnJvciAnRmFpbGVkIHRvIGdldCByZWZlcmVuY2UgdG8gXCJ1UE1hdHJpeFwiIGluIHNoYWRlciBwcm9ncmFtLicgdW5sZXNzIEBfc2hhZGVyUHJvZ3JhbS5wTWF0cml4VW5pZm9ybT9cblxuXHRcdFx0QF9zaGFkZXJQcm9ncmFtLm12TWF0cml4VW5pZm9ybSA9IEBfZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uIEBfc2hhZGVyUHJvZ3JhbSwgJ3VNVk1hdHJpeCdcblx0XHRcdHRocm93IEVycm9yICdGYWlsZWQgdG8gZ2V0IHJlZmVyZW5jZSB0byBcInVNVk1hdHJpeFwiIGluIHNoYWRlciBwcm9ncmFtLicgdW5sZXNzIEBfc2hhZGVyUHJvZ3JhbS5tdk1hdHJpeFVuaWZvcm0/XG5cbmNyZWF0ZU1lc2hcbi0tLS0tLS0tLS1cblxuVXRpbGl0eSB0byBjcmVhdGUgYSBtZXNoLlxuXG5cdFx0Y3JlYXRlTWVzaDogKCBzZXR0aW5ncyApIC0+XG5cdFx0XHR2ZXJ0ZXhCdWZmZXIgPSBAX2dsLmNyZWF0ZUJ1ZmZlcigpXG5cdFx0XHRAX2dsLmJpbmRCdWZmZXIgQF9nbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlclxuXHRcdFx0QF9nbC5idWZmZXJEYXRhIEBfZ2wuQVJSQVlfQlVGRkVSLCAoIG5ldyBGbG9hdDMyQXJyYXkgc2V0dGluZ3MudmVydGljZXMgKSwgQF9nbC5TVEFUSUNfRFJBV1xuXG5cdFx0XHRpbmRleEJ1ZmZlciA9IEBfZ2wuY3JlYXRlQnVmZmVyKClcblx0XHRcdEBfZ2wuYmluZEJ1ZmZlciBAX2dsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlclxuXHRcdFx0QF9nbC5idWZmZXJEYXRhIEBfZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsICggbmV3IFVpbnQxNkFycmF5IHNldHRpbmdzLmluZGljZXMgKSwgQF9nbC5TVEFUSUNfRFJBV1xuXG5cdFx0XHRyZXR1cm4gbmV3IE1lc2hcblx0XHRcdFx0dmVydGV4QnVmZmVyOlx0dmVydGV4QnVmZmVyXG5cdFx0XHRcdHZlcnRleFNpemU6XHRcdHNldHRpbmdzLnZlcnRleFNpemVcblx0XHRcdFx0bnVtVmVydGljZXM6XHRzZXR0aW5ncy52ZXJ0aWNlcy5sZW5ndGggLyBzZXR0aW5ncy52ZXJ0ZXhTaXplXG5cdFx0XHRcdGluZGV4QnVmZmVyOlx0aW5kZXhCdWZmZXJcblx0XHRcdFx0bnVtSW5kaWNlczpcdFx0c2V0dGluZ3MuaW5kaWNlcy5sZW5ndGhcblx0XHRcdFx0cG9zaXRpb246XHRcdHNldHRpbmdzLnBvc2l0aW9uXG5cbmNyZWF0ZU1lc2hGcm9tT2JqXG4tLS0tLS0tLS0tLS0tLS0tLVxuXG5DcmVhdGVzIGEgbWVzaCBmcm9tIGEgV2F2ZUZyb250IC5vYmogZmlsZS5cblxuXHRcdGNyZWF0ZU1lc2hGcm9tT2JqOiAoIG9iakRhdGEsIHBvc2l0aW9uICkgLT5cblx0XHRcdHBhcnNlciA9IG5ldyBPYmpQYXJzZXJcblx0XHRcdHBhcnNlci5wYXJzZSBvYmpEYXRhXG5cdFx0XHRAY3JlYXRlTWVzaFxuXHRcdFx0XHR2ZXJ0aWNlczpcdFx0cGFyc2VyLm91dFswXVxuXHRcdFx0XHR2ZXJ0ZXhTaXplOlx0XHQzXG5cdFx0XHRcdGluZGljZXM6XHRcdHBhcnNlci5pbmRpY2VzXG5cdFx0XHRcdG51bUluZGljZXM6XHRcdHBhcnNlci5pbmRpY2VzLmxlbmd0aFxuXHRcdFx0XHRwb3NpdGlvbjpcdFx0WzAsIDAsIDBdXG5cbnNldE12TWF0cml4XG4tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0c2V0TXZNYXRyaXg6ICggbW9kZWxNYXRyaXgsIHZpZXdNYXRyaXgsIHByb2plY3Rpb25NYXRyaXggKSAtPlxuXHRcdFx0bXZNYXRyaXggPSBtYXQ0LmNyZWF0ZSgpXG5cdFx0XHRtYXQ0Lm11bHRpcGx5IG12TWF0cml4LCBtb2RlbE1hdHJpeCwgdmlld01hdHJpeFxuXHRcdFx0bWF0NC5tdWx0aXBseSBtdk1hdHJpeCwgbXZNYXRyaXgsIHByb2plY3Rpb25NYXRyaXhcblx0XHRcdEBfZ2wudW5pZm9ybU1hdHJpeDRmdiBAX3NoYWRlclByb2dyYW0ubXZNYXRyaXhVbmlmb3JtLCBmYWxzZSwgbXZNYXRyaXhcblxucHVzaE1hdHJpeFxuLS0tLS0tLS0tLVxuXG5JJ20gdXNpbmcgdGhlIG1hdHJpeCBzdGFjayBmcm9tIHRoZSB0dXRvcmlhbCBoZXJlLiBBbm90aGVyIG1ldGhvZCBtaWdodCBiZSB1c2VkIGxhdGVyLlxuXG5cdFx0cHVzaE1hdHJpeDogLT5cblx0XHRcdEBfbXZNYXRyaXhTdGFjay5wdXNoIG1hdDQuY2xvbmUgQF9tdk1hdHJpeFxuXG5wb3BNYXRyaXhcbi0tLS0tLS0tLVxuXG5cdFx0cG9wTWF0cml4OiAtPlxuXHRcdFx0dGhyb3cgRXJyb3IgJ0ludmFsaWQgcG9wTWF0cml4JyBpZiBAX212TWF0cml4U3RhY2subGVuZ3RoIDwgMVxuXHRcdFx0QF9tdk1hdHJpeCA9IEBfbXZNYXRyaXhTdGFjay5wb3AoKVxuXG5kZWcyUmFkXG4tLS0tLS0tXG5cbkEgY29udmVyc2lvbiBvZiBkZWdyZWVzIHRvIHJhZGlhbnMgaXMgbmVlZGVkXG5cblx0XHRkZWcyUmFkOiAoIGRlZ3JlZXMgKSAtPlxuXHRcdFx0ZGVncmVlcyAqIE1hdGguUEkgLyAxODBcblxuZHJhd1NjZW5lXG4tLS0tLS0tLS1cblxuVG8gZHJhdyB0aGUgc2NlbmUgd2Ugc3RhcnQgYnkgY2xlYXJpbmcgdGhlIHZpZXdwb3J0IGFuZCBnZXR0aW5nIHRoZSB2aWV3IG1hdHJpeCBmcm9tIHRoZSBjYW1lcmEuXG5cblx0XHRkcmF3U2NlbmU6ICggbWVzaGVzICkgLT5cblx0XHRcdEBfZ2wuY2xlYXIgQF9nbC5DT0xPUl9CVUZGRVJfQklUIHwgQF9nbC5ERVBUSF9CVUZGRVJfQklUXG5cdFx0XHR2aWV3TWF0cml4ID0gbWF0NC5jcmVhdGUoKVxuXHRcdFx0Y2FtZXJhUG9zaXRpb25cdD0gWzAsIDAsIC0xMF1cblx0XHRcdGNhbWVyYVRhcmdldFx0PSBbMCwgMCwgMF1cblx0XHRcdGNhbWVyYVJvdGF0aW9uID0gbWF0NC5jcmVhdGUoKVxuXHRcdFx0bWF0NC5yb3RhdGVZIGNhbWVyYVJvdGF0aW9uLCBjYW1lcmFSb3RhdGlvbiwgKCBAZGVnMlJhZCBAX2N1YmVSb3RhdGlvbiApXG5cdFx0XHRjYW1lcmFUcmFuc2xhdGlvbiA9IG1hdDQuY3JlYXRlKClcblx0XHRcdG1hdDQudHJhbnNsYXRlIGNhbWVyYVRyYW5zbGF0aW9uLCBjYW1lcmFUcmFuc2xhdGlvbiwgY2FtZXJhUG9zaXRpb25cblx0XHRcdGNhbWVyYU1hdHJpeCA9IG1hdDQuY3JlYXRlKClcblx0XHRcdG1hdDQubXVsdGlwbHkgY2FtZXJhTWF0cml4LCBjYW1lcmFUcmFuc2xhdGlvbiwgY2FtZXJhTWF0cml4XG5cdFx0XHRtYXQ0Lm11bHRpcGx5IGNhbWVyYU1hdHJpeCwgY2FtZXJhUm90YXRpb24sIGNhbWVyYU1hdHJpeFxuXHRcdFx0Y2FtZXJhUG9zaXRpb24gPSBjYW1lcmFNYXRyaXguc3ViYXJyYXkgMTIsIDE1XG5cdFx0XHRtYXQ0Lmxvb2tBdCB2aWV3TWF0cml4LCBjYW1lcmFQb3NpdGlvbiwgY2FtZXJhVGFyZ2V0LCBbMCwgMSwgMF1cblxuVGhlbiBmb3IgZWFjaCBtZXNoLCBwdXNoIHRoZSBjb3JyZWN0IGJ1ZmZlcnMgdG8gR0wuXG5cblx0XHRcdGZvciBtZXNoIGluIG1lc2hlc1xuXHRcdFx0XHRAX2dsLmJpbmRCdWZmZXIgQF9nbC5BUlJBWV9CVUZGRVIsIG1lc2gudmVydGV4QnVmZmVyXG5cdFx0XHRcdEBfZ2wudmVydGV4QXR0cmliUG9pbnRlciBAX3NoYWRlclByb2dyYW0udmVydGV4UG9zaXRpb25BdHRyaWJ1dGUsIG1lc2gudmVydGV4U2l6ZSwgQF9nbC5GTE9BVCwgZmFsc2UsIDAsIDBcblx0XHRcdFx0QF9nbC5iaW5kQnVmZmVyIEBfZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG1lc2guaW5kZXhCdWZmZXJcblxuQ3JlYXRlIGEgbW9kZWwgbWF0cml4IHJlcHJlc2VudGluZyB0aGUgdHJhbnNsYXRpb24gYW5kIHJvdGF0aW9uIG9mIHRoZSBvYmplY3QuIE11bHRpcGx5IHRoZSBtb2RlbCBtYXRyaXggd2l0aCB0aGUgdmlld1xubWF0cml4LiBNdWx0aXBseSB0aGF0IG1hdHJpeCB3aXRoIHRoZSBwcm9qZWN0aW9uTWF0cml4IGFuZCBwYXNzIGl0IGluIHRvIHRoZSBzaGFkZXIuXG5cblx0XHRcdFx0bW9kZWxNYXRyaXggPSBtYXQ0LmNyZWF0ZSgpXG5cdFx0XHRcdG1hdDQudHJhbnNsYXRlIG1vZGVsTWF0cml4LCBtb2RlbE1hdHJpeCwgWzAsIDAsIDBdXG5cdFx0XHRcdCNtYXQ0LnJvdGF0ZSBtb2RlbE1hdHJpeCwgbW9kZWxNYXRyaXgsICggQGRlZzJSYWQgQF9jdWJlUm90YXRpb24gKiAyICksIFsxLCAwLCAwXVxuXHRcdFx0XHRtYXQ0Lm11bHRpcGx5IG1vZGVsTWF0cml4LCB2aWV3TWF0cml4LCBtb2RlbE1hdHJpeFxuXHRcdFx0XHRtYXQ0Lm11bHRpcGx5IG1vZGVsTWF0cml4LCBAX3BNYXRyaXgsIG1vZGVsTWF0cml4XG5cdFx0XHRcdEBfZ2wudW5pZm9ybU1hdHJpeDRmdiBAX3NoYWRlclByb2dyYW0ubXZNYXRyaXhVbmlmb3JtLCBmYWxzZSwgbW9kZWxNYXRyaXhcblxuRmluYWxseSBkcmF3IHRoZSBtZXNoIGFzIGEgdHJpYW5nbGUgZmFuLlxuXG5cdFx0XHRcdEBfZ2wuZHJhd0VsZW1lbnRzIEBfZ2wuVFJJQU5HTEVTLCBtZXNoLm51bUluZGljZXMsIEBfZ2wuVU5TSUdORURfU0hPUlQsIDBcblxudGlja1xuLS0tLVxuXG5MZXRzIHNwaWNlIHRpbmdzIHVwIHdpdGggc29tZSBhbmltYXRpb25cblxuXHRcdHRpY2s6IC0+XG5cdFx0XHRAX2N1YmVSb3RhdGlvbiArPSAxLjVcblx0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVVDLElBQUEsMkJBQUE7O0FBQUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBQVIsQ0FBQTs7QUFBQSxTQUNBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FEYixDQUFBOztBQUFBLE1BRUEsR0FBVSxPQUFBLENBQVEsWUFBUixDQUZWLENBQUE7O0FBQUEsTUFRTSxD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OztBQUFBLGVBb1BBLElBQUEsR0FBTSxTQUFBLEdBQUE7V0FDTCxJQUFDLENBQUEsYUFBRCxJQUFrQixJQURiO0VBQUEsQ0FwUE4sQ0FBQTs7WUFBQTs7SUFoQkQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo0MjM0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9nbG1hdGgubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFvQnlDIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQyMzgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2xvYWRlci5saXRjb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW9CeUMifX0seyJvZmZzZXQiOnsibGluZSI6NDI0MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9hcHAvbWVzaC5saXRjb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiTWVzaFxuPT09PVxuXG5cdG1vZHVsZS5leHBvcnRzID0gY2xhc3MgTWVzaFxuXHRcdGNvbnN0cnVjdG9yOiAoIHNldHRpbmdzICkgLT5cblx0XHRcdGZvciBvd24ga2V5LCB2YWx1ZSBvZiBzZXR0aW5nc1xuXHRcdFx0XHRAW2tleV0gPSB2YWx1ZVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdDLElBQUEsSUFBQTtFQUFBLDZCQUFBOztBQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ1QsRUFBQSxjQUFFLFFBQUYsR0FBQTtBQUNaLFFBQUEsVUFBQTtBQUFBLFNBQUEsZUFBQTs7NEJBQUE7QUFDQyxNQUFBLElBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUyxLQUFULENBREQ7QUFBQSxLQURZO0VBQUEsQ0FBYjs7Y0FBQTs7SUFERCxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQyNjEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL21ldHJvbm9tZS5saXRjb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiTWV0cm9ub21lXG49PT09PT09PT1cblxuRGVwZW5kZW5jaWVzXG4tLS0tLS0tLS0tLS1cbk1ldHJvbm9tZSB3aWxsIGVtaXQgYSBcIlRpY2tcIiBhdCBjb25zdGFudCBpbnRlcnZhbHMuIFtNaWNyb0V2ZW50XShtaWNyb2V2ZW50Lmh0bWwpIHdpbGwgaGVscCB3aXRoIGhhbmRsaW5nIG9mIHRoZSBldmVudFxubGlzdGVuZXJzIGFuZCBkaXN0cmlidXRpb24uIFdlIHdpbGwgYWxzbyBtYWtlIHVzZSBvZiB0aGUgZnVuY3Rpb25zIGluIFt0aW1lXSh0aW1lLmh0bWwpIHRvIG1ha2Ugc3VyZSB0aGF0IHdlIGhhdmVcbmFjY2VzcyB0byBzb21lIGtpbmQgb2YgdGltZWtlZXBlciB3aXRoIGEgZ29vZCBlbm91Z2ggcmVzb2x1dGlvbi5cblxuXHRNaWNyb0V2ZW50XHQ9IHJlcXVpcmUgJ2FwcC9taWNyb2V2ZW50J1xuXHR0aW1lXHRcdD0gcmVxdWlyZSAnYXBwL3RpbWUnXG5cbk1ldHJvbm9tZVxuLS0tLS0tLS0tXG5UaGUgTWV0cm9ub21lIGlzIHRoZSBwYWNla2VlcGVyIG9mIHRoZSBhcHAuIEl0IHdpbGwga2VlcCB0aWNraW5nIGF0IGEgc2V0IHNwZWVkIGFuZCBlbWl0IHRpY2tzIGF0IGdpdmVuIGludGVydmFscy5cblxuXHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1ldHJvbm9tZVxuXG5jb25zdHJ1Y3RvclxuLS0tLS0tLS0tLS1cblRvIGNyZWF0ZSBhIG1ldHJvbm9tZSB3ZSBuZWVkIHRoZSBwYWNlIG9mIHRoZSB0aWNrcy4gYEZQU2AgZ2l2ZSB1cyB0aGlzIGFzIEZyYW1lcyBQZXIgU2Vjb25kIHdoaWNoIHNob3VsZCBiZSBmYW1pbGlhclxudG8gbW9zdCBnYW1lcnMuIFRoaXMgd2lsbCBiZSBzdG9yZWQgYXMgYHRpbWVCZXR3ZWVuVGlja3NgLiBBIGNvdXBsZSBvZiBvdGhlciBtZW1iZXJzIHdpbGwgYmUgbmVlZGVkIGxhdGVyIHNvIHdlIG1ha2VcbnN1cmUgdG8gZGVmaW5lIHRoZW0gaW4gdGhlIGNvbnN0cnVjdG9yLlxuXG5cdFx0Y29uc3RydWN0b3I6ICggRlBTICkgLT5cblx0XHRcdEB0aW1lQmV0d2VlblRpY2tzID0gMSAvIEZQU1xuXHRcdFx0QGxhc3RUID0gbnVsbFxuXHRcdFx0QHRpbWVBY2N1bXVsYXRvciA9IDBcblxuc3RhcnRcbi0tLS0tXG5XaGVuIGl0J3MgdGltZSB0byBzdGFydCB0aGUgbWV0cm9ub21lIHdlIGRvIHNvIHNpbXBseSBieSBjYWxsaW5nIGl0J3Mgc3RhcnQgbWV0aG9kLiBIZXJlIHdlIHNldCBgbGFzdFRgIHRvIHRoZSBjdXJyZW50XG50aW1lc3RhbXAgdG8gbWFrZSBzdXJlIHdlIGRvbid0IGdldCBhIGh1Z2UganVtcCBpbiB0aGUgZmlyc3QgdXBkYXRlLiBUaGVuIHdlIGNhbGwgYHRpY2tgIGFuZCBlbWl0IGEgYFN0YXJ0YCBldmVudCB0b1xuZXZlbnR1YWwgbGlzdGVuZXJzLlxuXG5cdFx0c3RhcnQ6IC0+XG5cdFx0XHRAbGFzdFQgPSBEYXRlLm5vdygpXG5cdFx0XHRAdGljaygpXG5cdFx0XHRAZW1pdCBcIlN0YXJ0XCJcblx0XHRcdHJldHVyblxuXG5zdG9wXG4tLS0tXG5JZiB3ZSBuZWVkIHRvIHN0b3AgdGhlIGBNZXRyb25vbWVgIGZvciBzb21lIHJlYXNvbiB3ZSBmaXJzdCBoYXZlIHRvIGNhbmNlbCB0aGUgYHRpY2tgIGxvb3AuIFRoZW4gd2UgaW5jcmVhc2UgdGhlXG5gdGltZUFjY3VtdWxhdG9yYCB3aXRoIHRoZSB0aW1lIHNpbmNlIHRoZSBsYXN0IGB0aWNrYCB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgbG9zZSBhbnkgdGltZS4gRmluYWxseSB3ZSBtYWtlIHN1cmUgdG8gc2VuZFxuYSBgU3RvcGAgZXZlbnQgdG8gYW55IGxpc3RlbmVycyB3aG8gY2FyZS5cblxuXHRcdHN0b3A6IC0+XG5cdFx0XHR0aW1lLmNhbmNlbEFuaW1hdGlvbkZyYW1lIEB0aWNrXG5cdFx0XHR0ID0gRGF0ZS5ub3coKVxuXHRcdFx0QHRpbWVBY2N1bXVsYXRvciArPSAoIHQgLSBAbGFzdFQgKSAvIDEwMDBcblx0XHRcdEBlbWl0IFwiU3RvcFwiXG5cdFx0XHRyZXR1cm5cblxudGlja1xuLS0tLVxuVGhlIHRpY2sgbWV0aG9kIHdpbGwgZW1pdCBhIGBUaWNrYCBldmVudCBldmVyeSB0aW1lIHRoZSB0aW1lIGdpdmVuIGJ5IGB0aW1lQmV0d2VlblRpY2tzYCBoYXMgcGFzc2VkLiBNdWx0aXBsZSBgVGlja2BcbmV2ZW50cyBtYXkgYmUgc2VudCBmcm9tIGEgc2luZ2xlIGNhbGwgdG8gYHRpY2tgIGlmIGVub3VnaCB0aW1lIGhhcyBwYXNzZWQuIElmIG5vdCBlbm91Z2ggdGltZSBoYXMgcGFzc2VkIG5vIGBUaWNrYFxuZXZlbnQgd2lsbCBiZSBzZW50LiBUaGlzIHdheSB0aGUgc2ltdWxhdGlvbiBkZXBlbmRlbnQgb24gdGhlIHRpY2tzIHdpbGwgc3RheSBjb25zaXN0ZW50LlxuXG5GaXJzdCB3ZSB3aWxsIG1ha2Ugc3VyZSB0byByZXF1ZXN0IGEgbmV3IGNhbGwgdG8gYHRpY2tgIGFzIHNvb24gYXMgdGhlIHN5c3RlbSBpcyByZWFkeS4gVGhlbiB3ZSBpbmNyZWFzZVxuYHRpbWVCZXR3ZWVuVGlja3NgIHdpdGggdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgaGFzIHBhc3NlZCBzaW5jZSB0aGUgbGFzdCBjYWxsIHRvIGB0aWNrYC4gV2UgZW1pdCBhIGBUaWNrYCBldmVudCBmb3JcbmV2ZXJ5IHRpbWUgcGVyaW9kIGB0aW1lQmV0d2VlblRpY2tzYCB0aGF0IGhhcyBwYXNzZWQgYW5kIGB0aW1lQWNjdW11bGF0b3JgIGlzIGRlY3JlYXNlZCBieSB0aGF0IGFtb3VudCBvZiB0aW1lLiBXZVxuZmluaXNoIGJ5IHN0b3JpbmcgdGhlIGxhc3QgdGltZXN0YW1wIGluIGBsYXN0VGAuXG5cblx0XHR0aWNrOiA9PlxuXHRcdFx0dGltZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQHRpY2tcblxuXHRcdFx0dCA9IERhdGUubm93KClcblx0XHRcdEB0aW1lQWNjdW11bGF0b3IgKz0gKCB0IC0gQGxhc3RUICkgLyAxMDAwXG5cblx0XHRcdHdoaWxlIEB0aW1lQWNjdW11bGF0b3IgPiBAdGltZUJldHdlZW5UaWNrc1xuXHRcdFx0XHRAdGltZUFjY3VtdWxhdG9yIC09IEB0aW1lQmV0d2VlblRpY2tzXG5cdFx0XHRcdEBlbWl0IFwiVGlja1wiXG5cblx0XHRcdEBsYXN0VCA9IHRcblx0XHRcdHJldHVyblxuXG5NaXhpbnNcbi0tLS0tLVxuVG8gYWRkIHN1cHBvcnQgZm9yIGV2ZW50IGVtaXNzaW9uIHdlIG1peCBbTWljcm9FdmVudF0obWljcm9ldmVudC5odG1sKSBpbnRvIHRoZSBNZXRyb25vbWUgcHJvdG90eXBlLlxuXG5cdE1pY3JvRXZlbnQuTWl4aW4gTWV0cm9ub21lXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0MsSUFBQSwyQkFBQTtFQUFBLGtGQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsZ0JBQVIsQ0FBYixDQUFBOztBQUFBLElBQ0EsR0FBUSxPQUFBLENBQVEsVUFBUixDQURSLENBQUE7O0FBQUEsTUFPTSxDQUFDLE9BQVAsR0FBdUI7QUFRVCxFQUFBLG1CQUFFLEdBQUYsR0FBQTtBQUNaLHVDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixDQUFBLEdBQUksR0FBeEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQURULENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxlQUFELEdBQW1CLENBRm5CLENBRFk7RUFBQSxDQUFiOztBQUFBLHNCQVdBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTixJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFULENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQU4sQ0FGQSxDQURNO0VBQUEsQ0FYUCxDQUFBOztBQUFBLHNCQXVCQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0wsUUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFJLENBQUMsb0JBQUwsQ0FBMEIsSUFBQyxDQUFBLElBQTNCLENBQUEsQ0FBQTtBQUFBLElBQ0EsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FESixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsZUFBRCxJQUFvQixDQUFFLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBUCxDQUFBLEdBQWlCLElBRnJDLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxJQUFELENBQU0sTUFBTixDQUhBLENBREs7RUFBQSxDQXZCTixDQUFBOztBQUFBLHNCQXlDQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0wsUUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFJLENBQUMscUJBQUwsQ0FBMkIsSUFBQyxDQUFBLElBQTVCLENBQUEsQ0FBQTtBQUFBLElBRUEsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FGSixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsZUFBRCxJQUFvQixDQUFFLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBUCxDQUFBLEdBQWlCLElBSHJDLENBQUE7QUFLQSxXQUFNLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxnQkFBMUIsR0FBQTtBQUNDLE1BQUEsSUFBQyxDQUFBLGVBQUQsSUFBb0IsSUFBQyxDQUFBLGdCQUFyQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sQ0FEQSxDQUREO0lBQUEsQ0FMQTtBQUFBLElBU0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQVRULENBREs7RUFBQSxDQXpDTixDQUFBOzttQkFBQTs7SUFmRCxDQUFBOztBQUFBLFVBeUVVLENBQUMsS0FBWCxDQUFpQixTQUFqQixDQXpFQSxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQzMTAsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL21pY3JvZXZlbnQubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk1pY3JvRXZlbnRcbj09PT09PT09PT1cblxuX1RoaXMgaXMgbXkgY29mZmVlc2NyaXB0IHZlcnNpb24gb2YgSmVyb21lIEV0aWVubmVzXG5bbWljcm9ldmVudC5qc10oaHR0cHM6Ly9naXRodWIuY29tL2plcm9tZWV0aWVubmUvbWljcm9ldmVudC5qcyBcIm1pY3JvZXZlbnQuanNcIikuIEl0J3MgMjIgbGluZXMgb2YgY29kZSAoc2xvYykgYW5kIGl0IGlzXG50aHVzIGFjdHVhbGx5IGEgYml0IGxvbmdlciB0aGVuIGl0J3MgSmF2YVNjcmlwdCBjb3VudGVycGFydC4gQnV0IEkgaGF2ZSBtYWRlIHNvbWUgdHdlYWtzIHRvIHRoZSBvcmlnaW5hbCBhbmQgYWxzbyBhZGRlZFxudGhlIG9uZSB0aW1lIGhhbmRsZXIuX1xuXG5CYXNlZCBvbiB0aGUgd29yayBvZiBKZXJvbWUgRXRpZW5uZS4gQWxsIGNyZWRpdHMgd2hlcmUgZHVlXG5cblRPRE9cbi0tLS1cbiogPHN0cmlrZT5JJ20gdXNpbmcgYSBjbGFzcyBoZXJlLiBBIG1peGluIHdvdWxkIG1heWJlIGJlIG1vcmUgZml0dGluZy48L3N0cmlrZT5cbiogQSB1c2FnZSBleGFtcGxlIHdvdWxkIG1heWJlIGJlIGluIG9yZGVyLlxuXG5NaWNyb0V2ZW50XG4tLS0tLS0tLS0tXG5Jbmhlcml0IE1pY3JvRXZlbnQgZm9yIG5pY2UgYW5kIGNsZWFuIGV2ZW50IHN1cHBvcnRcblxuXHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1pY3JvRXZlbnRcblxuTm8gY29uc3RydWN0b3IgYWRkZWQgYXMgaXQgd291bGQgcmVxdWlyZSBhIGNhbGwgdG8gJ3N1cGVyJyB3aGljaCB3b3VsZCBiZSBvcGVuIHRvIGVycm9ycyBmcm9tIGZvcmdldHRpbmcgdG8gY2FsbCBpdC5cbjxzdHJpa2U+SWYgSSByZWNvZGUgYXMgYSBtaXhpbiBpbnN0ZWFkIG9mIGEgY2xhc3MgSSBjb3VsZCBkbyB0aGUgcmVxdWlyZWQgc2V0dXAgKGNyZWF0aW9uIG9mIGBAX2V2ZW50c2ApIGluIHRoZSBtaXhcbmZ1bmN0aW9uLjwvc3RyaWtlPiBfSSBkZWNpZGVkIHRvIGFkZCBgTWl4aW5gIGFzIGEgY2xhc3MgbWV0aG9kIGFuZCBhcyBpdCdzIHN0aWxsIHBvc3NpYmxlIHRvIGV4dGVuZCBmcm9tIGBNaWNyb0V2ZW50YCBJXG50aGluayBpdCdzIGJldHRlciB0byBkbyB0aGUgZXh0cmEgY2hlY2tzIGluIHRoZSBtZXRob2RzIHRoZW4gdG8gbWFrZSB0aGUgY2xhc3MgYmVoYXZlIGRpZmZlcmVudGx5IGlmIHVzZWQgYXMgYSBtaXhpblxuaW5zdGVhZCBvZiBhIHBhcmVudCBjbGFzcy5fXG5cbi0tLVxuXG4jIyNvblxuVGhlIG9uIG1ldGhvZCBiaW5kcyBhIGNhbGwgdG8gYW4gZXZlbnQuIGBlYCBpcyB0aGUgbmFtZSBvZiB0aGUgZXZlbnQgYW5kIGBoYW5kbGVyYCBpcyB0aGUgZnVuY3Rpb24gdGhhdCB3ZSB3YW50IHRvIGNhbGxcbndoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC4gVGhlIG1ldGhvZCByZXR1cm5zIGB0aGlzYCBmb3IgY2hhaW5pbmcgc3VwcG9ydCBhbmQgYmVjYXVzZSBpdCBpcyBtb3JlIGxvZ2ljYWwgdGhhbiB0aGVcbnJldHVybiB2YWx1ZSBmcm9tIGAucHVzaGAuXG5cbl9NYWtlIHN1cmUgdGhhdCBgQF9ldmVudHNgIHJlYWxseSBleGlzdHMgYmVmb3JlIHRyeWluZyB0byBhZGQgdG8gaXQuIEFsc28gaWYgYEBfZXZlbnRzW2VdYCBkb24ndCBleGlzdCwgY3JlYXRlIGFuXG5hcnJheSB0aGVyZS4gTmV4dCBwdXNoIGBoYW5kbGVyYCBpbnRvIHRoZSBhcnJheSBhbmQgcmV0dXJuIGB0aGlzYF9cblxuXHRcdG9uOiAoIGUsIGhhbmRsZXIgKSAtPlxuXHRcdFx0QF9ldmVudHMgb3I9IHt9XG5cdFx0XHRAX2V2ZW50c1tlXSBvcj0gW11cblx0XHRcdEBfZXZlbnRzW2VdLnB1c2ggaGFuZGxlclxuXHRcdFx0QFxuXG4jIyNvbmNlXG5UaGlzIG1ldGhvZCBpcyB0aGUgc2FtZSBhcyBgb25gIHdpdGggdGhlIGFkZGVkIGNhbGwgdG8gYG9mZmAgd2hlbiB0aGUgZXZlbnQgaGFzIGJlZW4gdHJpZ2dlcmVkLiBBcyBpbiBgb25gIHdlIGhhdmUgdGhlXG5hcmd1bWVudCBgZWAgd2hpY2ggZ2l2ZXMgdGhlIG5hbWUgb2YgdGhlIGV2ZW50IGFuZCBgaGFuZGxlcmAgd2hpY2ggaXMgdGhlIGZ1bmN0aW9uIHRvIGNhbGwuIGBvbmNlYCByZXR1cm5zIGB0aGlzYCBmb3JcbmNoYWluaW5nIHN1cHBvcnQuXG5cblx0XHRvbmNlOiAoIGUsIGhhbmRsZXIgKSAtPlxuXHRcdFx0QG9uIGUsID0+XG5cdFx0XHRcdGhhbmRsZXIuYXBwbHkgQCwgYXJndW1lbnRzXG5cdFx0XHRcdEBvZmYgZSwgaGFuZGxlclxuXHRcdFx0QFxuXG4jIyNvZmZcblRvIHVuYmluZCBhIGhhbmRsZXIgZnJvbSBhbiBldmVudCBgb2ZmYCBpcyB1c2VkLiBJdCB0YWtlcyB0aGUgbmFtZSBvZiB0aGUgZXZlbnQgaW4gYGVgIGFuZCB0aGUgaGFuZGxlciB0byByZW1vdmUgaW5cbmBoYW5kbGVyYC4gSXQgcmV0dXJucyBgdGhpc2AgdG8gc3VwcG9ydCBjaGFpbmluZy5cblxuXHRcdG9mZjogKCBlLCBoYW5kbGVyICkgLT5cblx0XHRcdHJldHVybiB1bmxlc3MgQF9ldmVudHNcblx0XHRcdEBfZXZlbnRzW2VdLnNwbGljZSAoIEBfZXZlbnRzW2VdLmluZGV4T2YgaGFuZGxlciApLCAxIGlmIEBfZXZlbnRzW2VdXG5cdFx0XHRAXG5cblxuIyMjZW1pdFxuVHJpZ2dlcnMgYW4gZXZlbnQgYW5kIGNhbGxzIGFsbCBoYW5kbGVycyBib3VuZCB0byB0aGUgZXZlbnQgd2l0aCBhbGxcbnRoZSBhcmd1bWVudHMgc2VudCB0byBlbWl0LlxuIyMjI2VcblRoZSBldmVudCB0byBlbWl0LlxuIyMjI2RhdGEuLi5cbkFueSBhZGRpdGlvbmFsIGRhdGEgcGFzcyBvbiB0byB0aGUgZXZlbnQgaGFuZGxlci4gVGhlIGV2ZW50IHdpbGwgYWxzbyBiZVxucGFzc2VkIHRvIHRoZSBoYW5kbGVyLlxuIyMjI3JldHVybnNcbkAgZm9yIGNoYWluaW5nIHN1cHBvcnQgYW5kIGl0J3MgYSBtb3JlIGxvZ2ljYWwgcmV0dXJuIHZhbHVlIHRoZW4gYW4gYXJyYXlcbndpdGggYWxsIHRoZSByZXR1cm4gdmFsdWVzIGZyb20gdGhlIGhhbmRsZXJzLlxuXG5cdFx0ZW1pdDogKCBlLCBkYXRhLi4uICkgLT5cblx0XHRcdHJldHVybiB1bmxlc3MgQF9ldmVudHNcblx0XHRcdGhhbmRsZXIuYXBwbHkgQCwgYXJndW1lbnRzIGZvciBoYW5kbGVyIGluIEBfZXZlbnRzW2VdIGlmIEBfZXZlbnRzW2VdXG5cdFx0XHRAXG5cbiMjI01peGluXG5NaXhlcyB0aGUgbWV0aG9kcyBvZiBNaWNyb0V2ZW50IGludG8gdGhlIGRlc3RpbmF0aW9uIGNsYXNzLlxuIyMjI3RhcmdldFxuVGhlIGNsYXNzIHRvIGJlIGVuaGFuY2VkXG4jIyMjcmV0dXJuc1xuUmV0dXJucyB1bmRlZmluZWRcblxuXHRcdEBNaXhpbjogKCB0YXJnZXQgKSAtPlxuXHRcdFx0dGFyZ2V0LnByb3RvdHlwZVtuYW1lXSA9IHByb3BlcnR5IGZvciBvd24gbmFtZSwgcHJvcGVydHkgb2YgTWljcm9FdmVudC5wcm90b3R5cGVcblx0XHRcdHJldHVybiB0YXJnZXRcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtQkMsSUFBQSxVQUFBO0VBQUE7K0JBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7MEJBa0J0Qjs7QUFBQSx1QkFBQSxFQUFBLEdBQUksU0FBRSxDQUFGLEVBQUssT0FBTCxHQUFBO0FBQ0gsUUFBQSxLQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsWUFBRCxJQUFDLENBQUEsVUFBWSxHQUFiLENBQUE7QUFBQSxhQUNBLElBQUMsQ0FBQSxRQUFRLENBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxJQUFPLEdBRGhCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBWixDQUFpQixPQUFqQixDQUZBLENBQUE7V0FHQSxLQUpHO0VBQUEsQ0FBSixDQUFBOztBQUFBLHVCQVdBLElBQUEsR0FBTSxTQUFFLENBQUYsRUFBSyxPQUFMLEdBQUE7QUFDTCxJQUFBLElBQUMsQ0FBQSxFQUFELENBQUksQ0FBSixFQUFPLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDTixRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxFQUFpQixTQUFqQixDQUFBLENBQUE7ZUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLENBQUwsRUFBUSxPQUFSLEVBRk07TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQLENBQUEsQ0FBQTtXQUdBLEtBSks7RUFBQSxDQVhOLENBQUE7O0FBQUEsdUJBcUJBLEdBQUEsR0FBSyxTQUFFLENBQUYsRUFBSyxPQUFMLEdBQUE7QUFDSixJQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsT0FBZjtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQ0EsSUFBQSxJQUF5RCxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBbEU7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBWixDQUFxQixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVosQ0FBb0IsT0FBcEIsQ0FBckIsRUFBb0QsQ0FBcEQsQ0FBQSxDQUFBO0tBREE7V0FFQSxLQUhJO0VBQUEsQ0FyQkwsQ0FBQTs7QUFBQSx1QkF1Q0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNMLFFBQUEsZ0NBQUE7QUFBQSxJQURPLGtCQUFHLDhEQUNWLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsT0FBZjtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQ0EsSUFBQSxJQUF5RCxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBbEU7QUFBQTtBQUFBLFdBQUEsMkNBQUE7MkJBQUE7QUFBQSxRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFpQixTQUFqQixDQUFBLENBQUE7QUFBQSxPQUFBO0tBREE7V0FFQSxLQUhLO0VBQUEsQ0F2Q04sQ0FBQTs7QUFBQSxFQW1EQSxVQUFDLENBQUEsS0FBRCxHQUFRLFNBQUUsTUFBRixHQUFBO0FBQ1AsUUFBQSxvQkFBQTtBQUFBO0FBQUEsU0FBQSxZQUFBOzs0QkFBQTtBQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVUsQ0FBQSxJQUFBLENBQWpCLEdBQXlCLFFBQXpCLENBQUE7QUFBQSxLQUFBO0FBQ0EsV0FBTyxNQUFQLENBRk87RUFBQSxDQW5EUixDQUFBOztvQkFBQTs7SUFsQkQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo0Mzc4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9vYmpwYXJzZXIubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk9ialBhcnNlclxuPT09PT09PT09XG5cbk9ialBhcnNlclxuLS0tLS0tLS0tXG5UaGUgT2JqUGFyc2VyIHRha2VzIGEgc3RyaW5nIGFuZCBwYXJzZXMgaXQgYXMgYSBXYXZlRnJvbnQgLm9iai1maWxlLiBJdCB3aWxsIGNyZWF0ZSBhIGxpc3Qgb2YgdmVydGljZXMsIGEgbGlzdCBvZlxubm9ybWFscywgYSBsaXN0IG9mIHRleGVscyBhbmQgYSBsaXN0IG9mIGZhY2VzLiBUaG9zZSBjYW4gdGhlbiBiZSB1c2VkIHRvIGNyZWF0ZSBhIG1lc2ggZm9yIFdlYkdMLlxuXG5fKipXQVJOSU5HKiogT25seSBhIHN1YnNldCBvZiB0aGUgc3BlY2lmaWNhdGlvbiBpcyBzdXBwb3J0ZWQgYXQgdGhlIG1vbWVudCBhbmQgdGhlcmUgaXMgbm8gcHJvcGVyIGhhbmRsaW5nIG9mXG51bnN1cHBvcnRlZCBsaW5lcy5fXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBPYmpQYXJzZXJcblxuXG5jb25zdHJ1Y3RvclxuLS0tLS0tLS0tLS1cblRoZSBjb25zdHJ1Y3RvciBzZXRzIHVwIGEgZmV3IHN0b3JhZ2VzIGZvciB0aGUgcGFyc2VkIGRhdGEuIGBwYXJzZWRgIGlzIGFuIGFycmF5IG9mIGFycmF5cy4gVGhlIGFycmF5cyB3aWxsIGNvbnRhaW4gdGhlXG52ZXJ0aWNlcywgdGhlIHRleGVscyBhbmQgdGhlIG5vcm1hbHMuIGBvdXRgIGlzIGFuIGFycmF5IG9mIGFycmF5cy4gVGhlIGFycmF5cyB3aWxsIGNvbnRhaW4gdGhlIHByb2Nlc3NlZCB2ZXJ0aWNlcyxcbnRleGVscyBhbmQgbm9ybWFscy4gYGluZGljZXNgIGlzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGluZGljZXMgZm9yIHRoZSBpbmRleCBsaXN0IHNlbnQgdG8gV2ViR0wuIEN1cnJlbnRseSB3ZSBkb24ndFxudHJ5IHRvIHJldXNlIGFueSB2ZXJ0aWNlcyBzbyB0aGUgaW5kaWNlcyB3aWxsIGVhY2ggcG9pbnQgdG8gaXRzIG93biB2ZXJ0ZXguXG5cblx0XHRjb25zdHJ1Y3RvcjogLT5cblx0XHRcdEBwYXJzZWRcdFx0XHQ9IFtbXSxbXSxbXV1cblx0XHRcdEBvdXRcdFx0XHQ9IFtbXSxbXSxbXV1cblx0XHRcdEBpbmRpY2VzXHRcdD0gW11cblxucGFyc2Vcbi0tLS0tXG5UaGUgcGFyc2UgbWV0aG9kIHRha2VzIHRoZSBjb250ZW50cyBvZiBhIC5vYmogZmlsZSBhcyBpdHMgb25seSBpbiBwYXJhbWV0ZXIuIFRoZSBwYXJzaW5nIGlzIGFzIHNpbXBsZSBhcyBzcGxpdHRpbmcgdGhlXG5maWxlIG9uIGV2ZXJ5IGxpbmVicmVhayBhbmQgdGhlbiBwYXJzZSB0aGUgbGluZXMgb25lIGJ5IG9uZS4gSWYgdGhlIGxpbmUgaXMgZW1wdHkgb3IgYmVnaW5zIHdpdGggYSAnIycgd2Ugc2tpcCB0aGF0XG5saW5lLiBBZnRlciB0cmltbWluZyB0aGUgd2hpdGVzcGFjZSBmcm9tIHRoZSBiZWdpbm5pbmcgYW5kIHRoZSBlbmQgb2YgdGhlIGxpbmUgaXQncyBzcGxpdCBvbiBldmVyeSB3aGl0ZXNwYWNlLiBUaGVcbmZpcnN0IHRva2VuIGNhbiB0aGVuIGJlIHVzZWQgYXMgdGhlIG1ldGhvZCBuYW1lIHRvIGNhbGwgYmVjYXVzZSBvZiBob3cgSmF2YVNjcmlwdCBvYmplY3RzIHdvcmtzLiBUaGUgcmVtYWluZGVyIG9mIHRoZVxuYXJyYXkgaXMgdGhlbiBwYXNzZWQgaW4gYXMgdGhlIG1ldGhvZHMgYXJndW1lbnRzLlxuXG5cdFx0cGFyc2U6ICggb2JqRGF0YSApIC0+XG5cdFx0XHRmb3IgbGluZSBpbiBvYmpEYXRhLnNwbGl0ICdcXG4nXG5cdFx0XHRcdGNvbnRpbnVlIGlmICggbGluZS5jaGFyQXQgMCApID09ICcjJyBvciBsaW5lLmxlbmd0aCA8IDFcblx0XHRcdFx0dG9rZW5zID0gbGluZS50cmltKCkuc3BsaXQgL1xccysvXG5cblx0XHRcdFx0QFt0b2tlbnNbMF1dLmFwcGx5IEAsIHRva2Vuc1sxLi5dIGlmIEBbdG9rZW5zWzBdXVxuXHRcdFx0cmV0dXJuXG5cbnYgPCEtLS0tPlxuLS0tLS0tLS0tXG5BIHZlcnRleCBpcyBjcmVhdGVkIGZyb20gdGhyZWUgY29tcG9uZW50cywgYHgsIHksIHpgLiBUaGUgLm9iaiBzcGVjaWZpY2F0aW9uIGFsbG93cyBmb3IgYSBmb3VydGggYHdgIGNvbXBvbmVudCB3aGljaCBpc1xuaWdub3JlZCBoZXJlLiBUaGUgYXJndW1lbnRzIGFyZSBwYXJzZWQgYXMgZmxvYXRzLCBwYWNrZWQgaW50byBhbiBhcnJheSBhbmQgcHVzaGVkIGludG8gdGhlIGZpcnN0IGBwYXJzZWRgIGFycmF5LlxuXG5cdFx0djogKCB4LCB5LCB6ICkgLT5cblx0XHRcdEBwYXJzZWRbMF0ucHVzaFx0W1xuXHRcdFx0XHRwYXJzZUZsb2F0IHhcblx0XHRcdFx0cGFyc2VGbG9hdCB5XG5cdFx0XHRcdHBhcnNlRmxvYXQgelxuXHRcdFx0XVxuXHRcdFx0cmV0dXJuXG5cbnZuIDwhLS0tLT5cbi0tLS0tLS0tLS1cbkEgbm9ybWFsIGlzIGNyZWF0ZWQgZnJvbSB0aHJlZSBjb21wb25lbnRzLCBgaSwgaiwga2AuIFRoZSBhcmd1bWVudHMgYXJlIHBhcnNlZCBhcyBmbG9hdHMsIHBhY2tlZCBpbnRvIGFuIGFycmF5IGFuZFxucHVzaGVkIGludG8gdGhlIHNlY29uZCBgcGFyc2VkYCBhcnJheS5cblxuXHRcdHZuOiAoIGksIGosIGsgKSAtPlxuXHRcdFx0QHBhcnNlZFsxXS5wdXNoIFtcblx0XHRcdFx0cGFyc2VGbG9hdCBpXG5cdFx0XHRcdHBhcnNlRmxvYXQgalxuXHRcdFx0XHRwYXJzZUZsb2F0IGtcblx0XHRcdF1cblx0XHRcdHJldHVyblxuXG52dCA8IS0tLS0+XG4tLS0tLS0tLS0tXG5BIHRleGVsLCB0ZXh0dXJlIGNvb3JkaW5hdGUsIGlzIGNyZWF0ZWQgZnJvbSB0d28gY29tcG9uZW50cywgYHUsIHZgLiBUaGUgLm9iaiBzcGVjaWZpY2F0aW9uIGFsbG93cyBmb3IgYSB0aGlyZCBgd2BcbmNvbXBvbmVudCB3aGljaCBpcyBpZ25vcmVkIGhlcmUuIFRoZSBhcmd1bWVudHMgYXJlIHBhcnNlZCBhcyBmbG9hdHMsIHBhY2tlZCBpbnRvIGFuIGFycmF5IGFuZCBwdXNoZWQgaW50byB0aGUgdGhpcmRcbmBwYXJzZWRgIGFycmF5LlxuXG5cdFx0dnQ6ICggdSwgdiApIC0+XG5cdFx0XHRAcGFyc2VkWzJdLnB1c2ggW1xuXHRcdFx0XHRwYXJzZUZsb2F0IHVcblx0XHRcdFx0cGFyc2VGbG9hdCB2XG5cdFx0XHRdXG5cdFx0XHRyZXR1cm5cblxuZiA8IS0tLS0+XG4tLS0tLS0tLS1cbl9UbyByZW5kZXIgYSBtZXNoIHdpdGggT3BlbkdMIHdlIHVzdWFsbHkgdXNlIGEgbGlzdCBvZiB2ZXJ0aWNlcyBhbmQgaW5kaWNlcy4gRWFjaCB2ZXJ0ZXggYXMgaXQgaXMgc2VudCB0byB0aGVcbnNoYWRlciBpcyB1c3VhbGx5IGEgY29tYmluYXRpb24gb2YgdGhlIHBvc2l0aW9uLCB0aGUgbm9ybWFsIGFuZCB0aGUgdGV4ZWwuIEV4OiBgW1gsIFksIFosIE54LCBOeSwgTnosIFR1LCBUdl1gLiBUaGlzIGlzXG5hIHZlcnRleCBvZiBzaXplIDggKGVpZ2h0IGNvbXBvbmVudHMgaW4gdG90YWwpLiBXaGVuIHdlIGxvb2sgYXQgYSAub2JqIGZpbGUgaXQgY2FuIGJlIHZlcnkgd2VsbCBvcHRpbWl6ZWQgYW5kIGEgbG90IG9mXG52ZXJ0aWNlcywgdGV4ZWxzLCBub3JtYWxzIGV0Yy4gbWlnaHQgYmUgc2hhcmVkIGJldHdlZW4gZGlmZmVyZW50IGZhY2VzIGV0Yy4gVGhlIHByb2JsZW0gaXMgdGhhdCB3aXRoIHRoZSB2ZXJ0aWNlc1xucGFja2VkIGFzIHNob3duIGFib3ZlIGVhY2ggdmVydGV4IG11c3QgaGF2ZSBhbGwgaW5mb3JtYXRpb24gdGhhdCBpcyBuZWVkZWQgZm9yIHRoYXQgdmVydGV4IHNvIHdlIGhhdmUgdG8gY29tYmluZSB0aGVcbmRpZmZlcmVudCBhc3BlY3RzIG9mIHRoZSB2ZXJ0ZXggc29tZSB3YXkuIFRoZSB3YXkgd2UgZG8gaXQgaGVyZSBpcyBieSBsZXR0aW5nIHRoZSBmKGFjZXMpIHRlbGwgdXMgd2hhdCBwYXJ0cyB0byBjb21iaW5lXG5pbnRvIGVhY2ggdmVydGV4LiBJZiB3ZSBlbmNvdW50ZXIgYW4gZiByb3cgd2Ugd2lsbCByZWNlaXZlIGFuIGFycmF5IG9mIGluZGljZXMgdGhhdCBpbiB0aGVpciB0dXJuIGdpdmVzIHRoZSBpbmRpY2VzIG9mXG50aGUgdihlcnRleCksIHRoZSB2KGVydGV4KW4ob3JtYWwpIGFuZCB0aGUgdihlcnRleCl0KGV4ZWwpLiBJZiB3ZSBqdXN0IHRha2UgdGhvc2UgYW5kIGNvbWJpbmUgaW50byBhbiBhcnJheSB3ZSBzaG91bGRcbmJlIGZpbmUuX1xuXG5fX1RPRE86IEN1cnJlbnRseSB3ZSBza2lwIGFsbCBjb21wb25lbnRzIGV4Y2VwdCB0aGUgdmVydGV4IGluZGV4Ll9fXG5cbi0tLVxuXG5BIGZhY2UgaXMgY3JlYXRlZCBmcm9tIGFuIGFycmF5IG9mIGluZGljZXMuIFdlIHVzZSBhIHNwbGF0IGAuLi5gIHRvIG1lcmdlIGFsbCBpbmNvbWluZyBpbmRpY2VzIGludG8gYSBzaW5nbGUgYXJyYXkuIFRvXG5wYXJzZSB0aGUgZmFjZXMgd2UgaXRlcmF0ZSB0aHJvdWdoIGFsbCBpbmRpY2VzLiBFYWNoIGluZGV4IGlzIHRoZW4gc3BsaXQgb24gYC9gIHRvIGdldCB0aGUgaW5kaWNlcyBmb3IgdGhlIHYoZXJ0ZXgpLFxudGhlIHYoZXJ0ZXgpdChleGVsKSBhbmQgdGhlIHYoZXJ0ZXgpbihvcm1hbCkuIFdlIHRoZW4gY29udGludWUgdG8gbG9vcCB0aHJvdWdoIHRoZSBjb21wb25lbnRzIG9mIHRoZSBpbmRleC4gVGhlXG5jb21wb25lbnQgaXMgcGFyc2VkIGFzIGFuIGludCBhbmQgaW5kaWNhdGVzIHdoaWNoIHYoZXJ0ZXgpLCB2KGVydGV4KXQoZXhlbCkgb3IgdihlcnRleCluKG9ybWFsKSB0aGF0IHRoZSBmYWNlIHBvaW50XG5zaG91bGQgdXNlLiBBbiBpbmRleCBpcyBlaXRoZXIgYWJzb2x1dGUgYW5kIHN0YXJ0cyB3aXRoIDEgYXMgdGhlIGZpcnN0IGRlZmluZWQgdi92bi92dCBvciByZWxhdGl2ZSB3aGVyZSAtMSBpcyB0aGUgbGFzdFxuZGVmaW5lZCB2L3ZuL3Z0LiBOb3cgd2UgcHVzaCB0aGUgaW5kaWNhdGVkIHYvdnQgb3Igdm4gdG8gdGhlIGBvdXRgIGFycmF5LiBXZSB1c2UgdGhlIHB1c2gtPmFwcGx5IG1ldGhvZCB0byB1bnBhY2sgdGhlXG52ZXJ0ZXggZGF0YS4gVGhlIGBvdXRgIGFycmF5IG5lZWRzIHRvIGJlIGEgZmxhdCBhcnJheSB0byBwbGF5IHdlbGwgd2l0aCB0aGUgV2ViR0wgY2FsbHMuIEF0IHRoZSBtb21lbnQgd2UganVzdCBjcmVhdGUgYVxubmV3IHZlcnRleCBmb3IgZXZlcnkgdmVydGV4IGFuZCB0aHVzIHRoZSBpbmRleCB3aWxsIGFsd2F5cyBwb2ludCB0byB0aGUgbGFzdCB2ZXJ0ZXguIElmIHdlIGFkZCBjb2RlIHRvIHJldXNlIHZlcnRpY2VzXG50aGVuIHRoaXMgd2lsbCBoYXZlIHRvIGJlIGNoYW5nZWQgdG8gaW5kaWNhdGUgdGhlIGluZGV4IG9mIHRoZSAncmV1c2VkJyB2ZXJ0ZXggaWYgb25lIGlzIGZvdW5kLlxuXG5cdFx0ZjogKCBpbmRpY2VzLi4uICkgLT5cblx0XHRcdGZvciBjdXJyZW50SW5kZXggaW4gWzAuLi5pbmRpY2VzLmxlbmd0aF1cblx0XHRcdFx0Y29tcG9uZW50cyA9IGluZGljZXNbY3VycmVudEluZGV4XS5zcGxpdCAnLydcblx0XHRcdFx0Zm9yIGN1cnJlbnRDb21wb25lbnRJbmRleCBpbiBbMC4uLmNvbXBvbmVudHMubGVuZ3RoXVxuXHRcdFx0XHRcdGNvbnRpbnVlIGlmIGN1cnJlbnRDb21wb25lbnRJbmRleCA+IDBcblx0XHRcdFx0XHRpbmRleCA9IHBhcnNlSW50IGNvbXBvbmVudHNbY3VycmVudENvbXBvbmVudEluZGV4XVxuXHRcdFx0XHRcdGlmIGluZGV4ID4gMFxuXHRcdFx0XHRcdFx0cGFyc2VkSW5kZXggPSBpbmRleCAtIDFcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRwYXJzZWRJbmRleCA9IEBwYXJzZWRbY3VycmVudENvbXBvbmVudEluZGV4XS5sZW5ndGggLSBpbmRleFxuXHRcdFx0XHRcdEBvdXRbY3VycmVudENvbXBvbmVudEluZGV4XS5wdXNoLmFwcGx5IEBvdXRbY3VycmVudENvbXBvbmVudEluZGV4XSwgQHBhcnNlZFtjdXJyZW50Q29tcG9uZW50SW5kZXhdW3BhcnNlZEluZGV4XVxuXHRcdFx0XHRAaW5kaWNlcy5wdXNoIEBpbmRpY2VzLmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cbjwhLS0gU29ycnkgZm9yIHRoZSBlbXB0eSBjb21tZW50cyBJIGhhdmUgYWRkZWQgdG8gc29tZSBvZiB0aGUgbWV0aG9kIGhlYWRlcnMuIFRoZXkgYXJlIHRoZXJlIGFzIHRoZSBtYXJrZG93biBwYXJzZXJcbnJlYWxseSBkb24ndCBsaWtlIG9uZSBjaGFyIGhlYWRlcnMgaWYgSSdtIHVzaW5nIHRoZSBoeXBoZW4gSDIgbWFya2Rvd24uIEJ1dCBJIHN0aWxsIHdhbnQgaXQgaW5zdGVhZCBvZiB0aGUgaGFzaCB2ZXJzaW9uXG5hcyBpdCdzIGEgbG90IGJldHRlciBmb3IgdGhlIHJlYWRhYmlsaXR5LiAtLT5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXQyxJQUFBLFNBQUE7RUFBQSxrQkFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQVVULEVBQUEsbUJBQUEsR0FBQTtBQUNaLElBQUEsSUFBQyxDQUFBLE1BQUQsR0FBWSxDQUFDLEVBQUQsRUFBSSxFQUFKLEVBQU8sRUFBUCxDQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxHQUFELEdBQVMsQ0FBQyxFQUFELEVBQUksRUFBSixFQUFPLEVBQVAsQ0FEVCxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsT0FBRCxHQUFZLEVBRlosQ0FEWTtFQUFBLENBQWI7O0FBQUEsc0JBYUEsS0FBQSxHQUFPLFNBQUUsT0FBRixHQUFBO0FBQ04sUUFBQSw0QkFBQTtBQUFBO0FBQUEsU0FBQSwyQ0FBQTtzQkFBQTtBQUNDLE1BQUEsSUFBWSxDQUFFLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBWixDQUFGLENBQUEsS0FBcUIsR0FBckIsSUFBNEIsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUF0RDtBQUFBLGlCQUFBO09BQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQVcsQ0FBQyxLQUFaLENBQWtCLEtBQWxCLENBRFQsQ0FBQTtBQUdBLE1BQUEsSUFBcUMsSUFBRSxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVAsQ0FBdkM7QUFBQSxRQUFBLElBQUUsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLENBQVUsQ0FBQyxLQUFiLENBQW1CLElBQW5CLEVBQXNCLE1BQU8sU0FBN0IsQ0FBQSxDQUFBO09BSkQ7QUFBQSxLQURNO0VBQUEsQ0FiUCxDQUFBOztBQUFBLHNCQTBCQSxDQUFBLEdBQUcsU0FBRSxDQUFGLEVBQUssQ0FBTCxFQUFRLENBQVIsR0FBQTtBQUNGLElBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFYLENBQWdCLENBQ2YsVUFBQSxDQUFXLENBQVgsQ0FEZSxFQUVmLFVBQUEsQ0FBVyxDQUFYLENBRmUsRUFHZixVQUFBLENBQVcsQ0FBWCxDQUhlLENBQWhCLENBQUEsQ0FERTtFQUFBLENBMUJILENBQUE7O0FBQUEsc0JBdUNBLEVBQUEsR0FBSSxTQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixHQUFBO0FBQ0gsSUFBQSxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVgsQ0FBZ0IsQ0FDZixVQUFBLENBQVcsQ0FBWCxDQURlLEVBRWYsVUFBQSxDQUFXLENBQVgsQ0FGZSxFQUdmLFVBQUEsQ0FBVyxDQUFYLENBSGUsQ0FBaEIsQ0FBQSxDQURHO0VBQUEsQ0F2Q0osQ0FBQTs7QUFBQSxzQkFxREEsRUFBQSxHQUFJLFNBQUUsQ0FBRixFQUFLLENBQUwsR0FBQTtBQUNILElBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFYLENBQWdCLENBQ2YsVUFBQSxDQUFXLENBQVgsQ0FEZSxFQUVmLFVBQUEsQ0FBVyxDQUFYLENBRmUsQ0FBaEIsQ0FBQSxDQURHO0VBQUEsQ0FyREosQ0FBQTs7QUFBQSxzQkFzRkEsQ0FBQSxHQUFHLFNBQUEsR0FBQTtBQUNGLFFBQUEsaUdBQUE7QUFBQSxJQURJLGlFQUNKLENBQUE7QUFBQSxTQUFvQix1SEFBcEIsR0FBQTtBQUNDLE1BQUEsVUFBQSxHQUFhLE9BQVEsQ0FBQSxZQUFBLENBQWEsQ0FBQyxLQUF0QixDQUE0QixHQUE1QixDQUFiLENBQUE7QUFDQSxXQUE2QixpSkFBN0IsR0FBQTtBQUNDLFFBQUEsSUFBWSxxQkFBQSxHQUF3QixDQUFwQztBQUFBLG1CQUFBO1NBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxRQUFBLENBQVMsVUFBVyxDQUFBLHFCQUFBLENBQXBCLENBRFIsQ0FBQTtBQUVBLFFBQUEsSUFBRyxLQUFBLEdBQVEsQ0FBWDtBQUNDLFVBQUEsV0FBQSxHQUFjLEtBQUEsR0FBUSxDQUF0QixDQUREO1NBQUEsTUFBQTtBQUdDLFVBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFPLENBQUEscUJBQUEsQ0FBc0IsQ0FBQyxNQUEvQixHQUF3QyxLQUF0RCxDQUhEO1NBRkE7QUFBQSxRQU1BLElBQUMsQ0FBQSxHQUFJLENBQUEscUJBQUEsQ0FBc0IsQ0FBQyxJQUFJLENBQUMsS0FBakMsQ0FBdUMsSUFBQyxDQUFBLEdBQUksQ0FBQSxxQkFBQSxDQUE1QyxFQUFvRSxJQUFDLENBQUEsTUFBTyxDQUFBLHFCQUFBLENBQXVCLENBQUEsV0FBQSxDQUFuRyxDQU5BLENBREQ7QUFBQSxPQURBO0FBQUEsTUFTQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQXZCLENBVEEsQ0FERDtBQUFBLEtBREU7RUFBQSxDQXRGSCxDQUFBOzttQkFBQTs7SUFWRCxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQ0NDIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL3RpbWUubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIlxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbXCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIl1cblx0XG5cdGZvciB2ZW5kb3IgaW4gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXVxuXHRcdFx0YnJlYWsgaWYgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbXCIje3ZlbmRvcn1SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIl1cblx0XHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1tcIiN7dmVuZG9yfUNhbmNlbEFuaW1hdGlvbkZyYW1lXCJdIG9yXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHdpbmRvd1tcIiN7dmVuZG9yfUNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVwiXSlcblx0XG5cdHRhcmdldFRpbWUgPSAwXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSBvcj0gKGNhbGxiYWNrKSAtPlxuXHRcdFx0dGFyZ2V0VGltZSA9IE1hdGgubWF4IHRhcmdldFRpbWUgKyAxNiwgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpXG5cdFx0XHRzZXRUaW1lb3V0ICggLT4gY2FsbGJhY2sgRGF0ZS5ub3coKSApLCB0YXJnZXRUaW1lIC0gY3VycmVudFRpbWVcblx0XG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lIG9yPSAoaWQpIC0+IGNsZWFyVGltZW91dCBpZFxuXG5cdGV4cG9ydHMucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGNhbGxiYWNrKSAtPlxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZS5hcHBseSB3aW5kb3csIFtjYWxsYmFja11cblx0XG5cdGV4cG9ydHMuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAoaWQpIC0+XG5cdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUuYXBwbHkgd2luZG93LCBbaWRdXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0MsSUFBQSwrRUFBQTs7QUFBQSxxQkFBQSxHQUF3QixNQUFPLENBQUEsdUJBQUEsQ0FBL0IsQ0FBQTs7QUFFQTtBQUFBLEtBQUEsMkNBQUE7b0JBQUE7QUFDRSxFQUFBLElBQVMscUJBQVQ7QUFBQSxVQUFBO0dBQUE7QUFBQSxFQUNBLHFCQUFBLEdBQXdCLE1BQU8sQ0FBQSxFQUFBLEdBQUUsTUFBRixHQUFVLHVCQUFWLENBRC9CLENBQUE7QUFBQSxFQUVBLG9CQUFBLEdBQXdCLE1BQU8sQ0FBQSxFQUFBLEdBQUUsTUFBRixHQUFVLHNCQUFWLENBQVAsSUFDWCxNQUFPLENBQUEsRUFBQSxHQUFFLE1BQUYsR0FBVSw2QkFBVixDQUhwQixDQURGO0FBQUEsQ0FGQTs7QUFBQSxVQVFBLEdBQWEsQ0FSYixDQUFBOztBQUFBLDBCQVNBLHdCQUEwQixTQUFDLFFBQUQsR0FBQTtBQUN4QixNQUFBLFdBQUE7QUFBQSxFQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLFVBQUEsR0FBYSxFQUF0QixFQUEwQixXQUFBLEdBQWMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUF4QyxDQUFiLENBQUE7U0FDQSxVQUFBLENBQVcsQ0FBRSxTQUFBLEdBQUE7V0FBRyxRQUFBLENBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFULEVBQUg7RUFBQSxDQUFGLENBQVgsRUFBdUMsVUFBQSxHQUFhLFdBQXBELEVBRndCO0FBQUEsRUFUMUIsQ0FBQTs7QUFBQSx5QkFhQSx1QkFBeUIsU0FBQyxFQUFELEdBQUE7U0FBUSxZQUFBLENBQWEsRUFBYixFQUFSO0FBQUEsRUFiekIsQ0FBQTs7QUFBQSxPQWVPLENBQUMscUJBQVIsR0FBZ0MsU0FBQyxRQUFELEdBQUE7U0FDL0IscUJBQXFCLENBQUMsS0FBdEIsQ0FBNEIsTUFBNUIsRUFBb0MsQ0FBQyxRQUFELENBQXBDLEVBRCtCO0FBQUEsQ0FmaEMsQ0FBQTs7QUFBQSxPQWtCTyxDQUFDLG9CQUFSLEdBQStCLFNBQUMsRUFBRCxHQUFBO1NBQzlCLG9CQUFvQixDQUFDLEtBQXJCLENBQTJCLE1BQTNCLEVBQW1DLENBQUMsRUFBRCxDQUFuQyxFQUQ4QjtBQUFBLENBbEIvQixDQUFBIn19XX0=
*/})()