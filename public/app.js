
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
var GL, time;

console.log('app.litcoffee');

GL = require('app/gl');

time = require('app/time');

document.addEventListener("DOMContentLoaded", function() {
  var FPS, FRAME_TIME, cube, cubeData, fragmentShaderSource, gl, lastT, startGL, step, timeAccumulator, vertexShaderSource, waitForShaders;
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
  new microAjax('./cube.obj', function(resource) {
    console.log('Cube data loaded.');
    return cubeData = resource;
  });
  waitForShaders = function() {
    var shaderLoadingTimer;
    return shaderLoadingTimer = setTimeout(function() {
      if ((fragmentShaderSource != null) && (vertexShaderSource != null) && (cubeData != null)) {
        return startGL('lesson01-canvas', fragmentShaderSource, vertexShaderSource);
      } else {
        return waitForShaders();
      }
    }, 1000);
  };
  waitForShaders();
  gl = null;
  cube = null;
  FPS = 60;
  FRAME_TIME = 1 / FPS;
  lastT = null;
  timeAccumulator = 0;
  step = function() {
    var t;
    time.requestAnimationFrame(step);
    t = Date.now();
    timeAccumulator += (t - lastT) / 1000;
    while (timeAccumulator > FRAME_TIME) {
      timeAccumulator -= FRAME_TIME;
      gl.tick();
    }
    gl.drawScene([cube]);
    return lastT = t;
  };
  return startGL = function(canvasElementId, fragmentShaderSource, vertexShaderSource) {
    gl = new GL(canvasElementId);
    gl.createShaderProgram(fragmentShaderSource, vertexShaderSource);
    cube = gl.createMeshFromObj(cubeData);
    lastT = Date.now();
    return step();
  };
}, false);

}, {"app/gl":"src/app/gl","app/time":"src/app/time"});
require.register('src/app/gl', function(require, module, exports){
var GL, Mesh, ObjParser;

Mesh = require('app/mesh');

ObjParser = require('app/objparser');

module.exports = GL = (function() {
  function GL(canvasElementId) {
    var error;
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.create();
    this._mvMatrixStack = [];
    this._cubeRotation = 0.0;
    this._canvasElement = document.getElementById(canvasElementId);
    try {
      this._gl = this._canvasElement.getContext('experimental-webgl');
    } catch (_error) {
      error = _error;
      console.log('Failed to initialize WebGL using the element ' + canvas + '. Error:\n' + error);
      throw error;
    }
    this._gl.viewportWidth = this._canvasElement.width;
    this._gl.viewportHeight = this._canvasElement.height;
    this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this._gl.enable(this._gl.DEPTH_TEST);
  }

  GL.prototype.fetchShaderFromElement = function(shaderElementId) {
    var currentScriptNode, shaderCode, shaderScript;
    shaderScript = document.getElementById(shaderElementId);
    if (!shaderScript) {
      throw new Error('No shader with id: ' + shaderElementId);
    }
    if (!(shaderScript.type === 'x-shader/x-fragment' || shaderScript.type === 'x-shader/x-vertex')) {
      throw new Error('Not a shader element: ' + shaderElement);
    }
    shaderCode = "";
    currentScriptNode = shaderScript.firstChild;
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
    this._shaderProgram = this._gl.createProgram();
    this._gl.attachShader(this._shaderProgram, this.compileShader(fragmentShaderSource, this._gl.FRAGMENT_SHADER));
    this._gl.attachShader(this._shaderProgram, this.compileShader(vertexShaderSource, this._gl.VERTEX_SHADER));
    this._gl.linkProgram(this._shaderProgram);
    if (!this._gl.getProgramParameter(this._shaderProgram, this._gl.LINK_STATUS)) {
      throw new Error('Could not initialize shaders.');
    }
    this._gl.useProgram(this._shaderProgram);
    this._shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, 'aVertexPosition');
    this._gl.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);
    this._shaderProgram.pMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, 'uPMatrix');
    return this._shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, 'uMVMatrix');
  };

  GL.prototype.setMatrixUniforms = function() {
    this._gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, this._pMatrix);
    return this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, this._mvMatrix);
  };

  GL.prototype.createMesh = function(vertices, vertexSize, numVertices, indices, numIndices, position) {
    var indexBuffer, vertexBuffer;
    vertexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
    indexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this._gl.STATIC_DRAW);
    return new Mesh(vertexBuffer, vertexSize, numVertices, indexBuffer, numIndices, position);
  };

  GL.prototype.createMeshFromObj = function(objData, position) {
    var parser;
    parser = new ObjParser;
    parser.parse(objData);
    return this.createMesh(parser.vertices, 3, parser.vertices.length / 3, parser.faces, parser.faces.length, [0, 0, -7]);
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
    var debugString, mesh, _i, _len, _results;
    this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    mat4.perspective(this._pMatrix, 45, this._gl.viewportWidth / this._gl.viewportHeight, 0.1, 100.0, this._pMatrix);
    mat4.identity(this._mvMatrix);
    _results = [];
    for (_i = 0, _len = meshes.length; _i < _len; _i++) {
      mesh = meshes[_i];
      mat4.translate(this._mvMatrix, mat4.create(), mesh.position);
      this.pushMatrix();
      mat4.rotate(this._mvMatrix, this._mvMatrix, this.deg2Rad(this._cubeRotation), [-1, 1, 1]);
      debugString = this._cubeRotation.toFixed(2).toString();
      (document.getElementById('cubeRot')).value = mat4.str(this._mvMatrix);
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, mesh.vertexBuffer);
      this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, mesh.vertexSize, this._gl.FLOAT, false, 0, 0);
      this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      this.setMatrixUniforms();
      this._gl.drawElements(this._gl.TRIANGLE_FAN, mesh.numIndices, this._gl.UNSIGNED_SHORT, 0);
      _results.push(this.popMatrix());
    }
    return _results;
  };

  GL.prototype.tick = function() {
    return this._cubeRotation += 1.5;
  };

  return GL;

})();

}, {"app/mesh":"src/app/mesh","app/objparser":"src/app/objparser"});
require.register('src/app/mesh', function(require, module, exports){
var Mesh;

module.exports = Mesh = (function() {
  function Mesh(vertexBuffer, vertexSize, numVertices, indexBuffer, numIndices, position) {
    this.vertexBuffer = vertexBuffer;
    this.vertexSize = vertexSize;
    this.numVertices = numVertices;
    this.indexBuffer = indexBuffer;
    this.numIndices = numIndices;
    this.position = position;
  }

  return Mesh;

})();

}, {});
require.register('src/app/objparser', function(require, module, exports){
var ObjParser,
  __slice = [].slice;

module.exports = ObjParser = (function() {
  function ObjParser() {
    this.vertices = [];
    this.normals = [];
    this.texels = [];
    this.faces = [];
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
    return this;
  };

  ObjParser.prototype.v = function(x, y, z) {
    this.vertices.push.apply(this.vertices, [parseFloat(x), parseFloat(y), parseFloat(z)]);
  };

  ObjParser.prototype.vn = function(i, j, k) {
    this.normals.push.apply(this.normals, [parseFloat(i), parseFloat(j), parseFloat(k)]);
  };

  ObjParser.prototype.vt = function(u, v) {
    this.texels.push.apply(this.texels, [parseFloat(u), parseFloat(v)]);
  };

  ObjParser.prototype.f = function() {
    var components, currentIndex, indices, _i, _ref;
    indices = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (currentIndex = _i = 0, _ref = indices.length; 0 <= _ref ? _i < _ref : _i > _ref; currentIndex = 0 <= _ref ? ++_i : --_i) {
      components = indices[currentIndex].split('/');
      indices[currentIndex] = components[0];
      indices[currentIndex] = parseInt(indices[currentIndex] - 1);
    }
    this.faces.push.apply(this.faces, indices);
  };

  return ObjParser;

})();

}, {});
require.register('src/app/time', function(require, module, exports){
var cancelAnimationFrame, requestAnimationFrame, targetTime, vendor, _i, _len, _ref;

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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjozOTc0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9hcHAubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjIEFwcFxuXG5cdGNvbnNvbGUubG9nICdhcHAubGl0Y29mZmVlJ1xuXG4jIyMgRGVwZW5kZW5jaWVzXG5JbmNsdWRlIFtHTF0oZ2wuaHRtbCkgdG8gaGFuZGxlIGFsbCBXZWJHTCByZWxhdGVkIHRhc2tzLlxuXG5cdEdMID0gcmVxdWlyZSAnYXBwL2dsJ1xuXHR0aW1lID0gcmVxdWlyZSAnYXBwL3RpbWUnXG5cblxuIyMjIFN0YXJ0IHRoZSBhcHBsaWNhdGlvblxuVGhlIGFwcCBtdXN0IHdhaXQgZm9yIGV2ZXJ5dGhpbmcgdG8gYmUgcHJvcGVybHkgbG9hZGVkIGJlZm9yZSBpdCBjYW4gc3RhcnQuIFRoaXMgaXMgZG9uZSB3aXRoIGEgc2ltcGxlIGV2ZW50IGxpc3RlbmVyXG53YWl0aW5nIGZvciB0aGUgYE9uTG9hZGVkYCBldmVudC4gVGhlcmUgaXMgYSBsb3Qgb2YgSlMtZnJhbWV3b3JrcyB0aGF0IGNvdWxkIGhlbHAgd2l0aCB0aGlzIGJ1dCBhdCB0aGUgbW9tZW50XG50aGlzIG1ldGhvZCB3aWxsIGJlIHN1ZmZpY2llbnQuXG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcIkRPTUNvbnRlbnRMb2FkZWRcIiwgLT5cblxuVGhlIHNoYWRlcnMgYXJlIGxvYWRlZCBhc3luY2hyb25vdXNseSBhcyB0ZXh0LiBQcmUtY29tcGlsZWQgc2hhZGVycyBkb24ndCBleGlzdCBpbiBXZWJHTCB5ZXQgYW5kIGl0J3MgcHJvYmFibHkgbm90IGhpZ2hcbm9uIHRoZSBsaXN0IGFzIGl0IHdvdWxkIGJlIGEgc2VjdXJpdHkgY29uY2VybiBhcyBmYXIgYXMgSSB1bmRlcnN0YW5kIGl0LiBDcmVhdGUgYSBjb3VwbGUgb2YgdmFyaWFibGVzIHN0b3JlIHRoZSBzaGFkZXJcbmNvZGUgaW4gdW50aWwgd2UgYXJlIHJlYWR5IGluaXQgR0wuXG5cblx0XHRmcmFnbWVudFNoYWRlclNvdXJjZVx0PVxuXHRcdHZlcnRleFNoYWRlclNvdXJjZVx0XHQ9XG5cdFx0Y3ViZURhdGFcdFx0XHRcdD0gdW5kZWZpbmVkO1xuXG5TdGFydCBhc3VuY2hyb25vdXMgbG9hZGluZyBvZiB0aGUgc2hhZGVycy4gU3RvcmUgdGhlIHNoYWRlciBjb2RlIHdoZW4gdGhlIGFqYXggcmVxdWVzdCBpcyBkb25lLlxuQXMgdGhlcmUgaXMgdHdvIHNoYWRlcnMgdGhhdCBhcmUgYm90aCBsb2FkZWQgYXN5bmMgdGhlIGFwcCBtdXN0IHdhaXQgdW50aWwgYm90aCBhcmUgbG9hZGVkIGJlZm9yZSBjb250aW51aW5nIGV4ZWN1dGlvblxub2YgdGhlIGFwcC5cblRoZSAuYyBzdWZmaXggaXMgY2hvb3NlbiBqdXN0IHRvIHRyaWNrIFN1YmxpbWUgVGV4dCBpbnRvIGdpdmluZyBzb21lIHN5bnRheCBoaWdobGlnaHRpbmcuXG5cblx0XHRjb25zb2xlLmxvZyAnU3RhcnRpbmcgdG8gbG9hZCBzaGFkZXJzLidcblx0XHRuZXcgbWljcm9BamF4ICcuL2ZTaGFkZXIuZnJhZycsICggcmVzb3VyY2UgKSAtPlxuXHRcdFx0Y29uc29sZS5sb2cgJ0ZyYWdtZW50IHNoYWRlciBsb2FkZWQuJ1xuXHRcdFx0ZnJhZ21lbnRTaGFkZXJTb3VyY2UgPSByZXNvdXJjZVxuXG5cdFx0bmV3IG1pY3JvQWpheCAnLi92U2hhZGVyLnZlcnQnLCAoIHJlc291cmNlICkgLT5cblx0XHRcdGNvbnNvbGUubG9nICdWZXJ0ZXggc2hhZGVyIGxvYWRlZC4nXG5cdFx0XHR2ZXJ0ZXhTaGFkZXJTb3VyY2UgPSByZXNvdXJjZVxuXG5cdFx0bmV3IG1pY3JvQWpheCAnLi9jdWJlLm9iaicsICggcmVzb3VyY2UgKSAtPlxuXHRcdFx0Y29uc29sZS5sb2cgJ0N1YmUgZGF0YSBsb2FkZWQuJ1xuXHRcdFx0Y3ViZURhdGEgPSByZXNvdXJjZVxuXG53YWl0Rm9yU2hhZGVycyBkbyBqdXN0IHRoYXQuIEl0IHdhaXRzIGZvciB0aGUgc2hhZGVycyB0byBsb2FkIGluIG9uZSBzZWNvbmQgbG9vcHMgYW5kIHdoZW4gYm90aCBgZnJhZ21lbnRTaGFkZXJTb3VyY2VgXG5hbmQgYHZlcnRleFNoYWRlclNvdXJjZWAgYXJlIHBvcHVsYXRlZCBpdCB3aWxsIGNhbGwgYHN0YXJ0R0xgIHBhc3NpbmcgaW4gdGhlIGNvZGUgZm9yIGJvdGggc2hhZGVycy5cblxuXHRcdHdhaXRGb3JTaGFkZXJzID0gLT5cblx0XHRcdHNoYWRlckxvYWRpbmdUaW1lciA9IHNldFRpbWVvdXQgLT5cblx0XHRcdFx0aWYgZnJhZ21lbnRTaGFkZXJTb3VyY2U/IGFuZCB2ZXJ0ZXhTaGFkZXJTb3VyY2U/IGFuZCBjdWJlRGF0YT9cblx0XHRcdFx0XHRzdGFydEdMICdsZXNzb24wMS1jYW52YXMnLCBmcmFnbWVudFNoYWRlclNvdXJjZSwgdmVydGV4U2hhZGVyU291cmNlXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR3YWl0Rm9yU2hhZGVycygpXG5cdFx0XHQsIDEwMDBcblxuXHRcdHdhaXRGb3JTaGFkZXJzKClcblxuVG8gc3RhcnQgdGhlIEdMIHN0dWZmIHdlIG5lZWQgYW4gSFRNTCBjYW52YXMgZWxlbWVudCBhbmQgYm90aCBhIGZyYWdtZW50IHNoYWRlciBhbmQgYSB2ZXJ0ZXggc2hhZGVyIGlzIG5lZWRlZC4gVGhlXG5zaGFkZXJzIGFyZSBwYXNzZWQgYXMgc3RyaW5ncyBjb250YWluaW5nIHRoZSByYXcgR0xTTCBjb2RlLlxuXHRcdGdsID0gbnVsbFxuXHRcdGN1YmUgPSBudWxsXG5cblx0XHRGUFMgPSA2MFxuXHRcdEZSQU1FX1RJTUUgPSAxIC8gRlBTXG5cdFx0bGFzdFQgPSBudWxsXG5cdFx0dGltZUFjY3VtdWxhdG9yID0gMFxuXG5cdFx0c3RlcCA9IC0+XG5cdFx0XHQjIFRlbGwgdGhlIHN5c3RlbSB3ZSB3YW50IHRvIHVwZGF0ZSBhZ2FpbiB3aGVuIGNvbnZlbmllbnRcblx0XHRcdHRpbWUucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHN0ZXBcblxuXHRcdFx0dCA9IERhdGUubm93KClcblx0XHRcdHRpbWVBY2N1bXVsYXRvciArPSAodCAtIGxhc3RUKSAvIDEwMDBcblx0XHRcdFxuXHRcdFx0d2hpbGUgdGltZUFjY3VtdWxhdG9yID4gRlJBTUVfVElNRVxuXHRcdFx0XHR0aW1lQWNjdW11bGF0b3IgLT0gRlJBTUVfVElNRVxuXHRcdFx0XHRnbC50aWNrKClcblx0XHRcdFxuXHRcdFx0Z2wuZHJhd1NjZW5lIFtjdWJlXVxuXG5cdFx0XHQjIFN0b3JlIHRoZSBsYXN0IGZyYW1ldGltZVxuXHRcdFx0bGFzdFQgPSB0XG5cblx0XHRzdGFydEdMID0gKCBjYW52YXNFbGVtZW50SWQsIGZyYWdtZW50U2hhZGVyU291cmNlLCB2ZXJ0ZXhTaGFkZXJTb3VyY2UgKSAtPlxuXHRcdFx0Z2wgPSBuZXcgR0wgY2FudmFzRWxlbWVudElkXG5cbkFmdGVyIEdMIGlzIGluaXRpYWxpemVkIHRoZSBzaGFkZXIgcHJvZ3JhbSBoYXZlIHRvIGJlIGNvbXBpbGVkIGFuZCBsaW5rZWQuXG5cblx0XHRcdGdsLmNyZWF0ZVNoYWRlclByb2dyYW0gZnJhZ21lbnRTaGFkZXJTb3VyY2UsIHZlcnRleFNoYWRlclNvdXJjZVxuXG5cdFx0XHRjdWJlID0gZ2wuY3JlYXRlTWVzaEZyb21PYmogY3ViZURhdGFcblxuVGhlcmUgaXMgbm8gYW5pbWF0aW9uIG9yIGFueXRoaW5nIHNvIGEgc2luZ2xlIGRyYXduIGZyYW1lIGlzIGFsbCB0aGF0J3MgbmVlZGVkIHRvIHNob3cgdGhlIHJld2FyZHMgb2YgdGhpcyBoYXJkIGxhYm9yLlxuXG5cdFx0XHRsYXN0VCA9IERhdGUubm93KClcblx0XHRcdHN0ZXAoKVxuXHQsIGZhbHNlXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUMsSUFBQSxRQUFBOztBQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksZUFBWixDQUFBLENBQUE7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QUFyQixDQU5QLENBQUE7QUFBQSxJQVVBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFBLENBVlIsQ0FBQTtXQVdBLElBQUEsQ0FBQSxFQVpTO0VBQUEsRUFuRW1DO0FBQUEsQ0FBOUMsRUFnRkUsS0FoRkYsQ0FkQSxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQwMzgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2dsLmxpdGNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJBIFRyaWFuZ2xlIGFuZCBhIFNxdWFyZVxuPT09PT09PT09PT09PT09PT09PT09PT1cblxuV2hhdCBpcyB0aGlzP1xuLS0tLS0tLS0tLS0tLVxuXG5UaGlzIGlzIHlldCBhbm90aGVyIGF0dGVtcHQgdG8gZ2V0IHN0YXJ0ZWQgd2l0aCBXZWJHTCBwcm9ncmFtbWluZyB1c2luZyBDb2ZmZWVTY3JpcHQuIFRoZSBjaG9pY2Ugb2YgdXNpbmdcbmxpdGVyYXRlIENvZmZlZVNjcmlwdCBpcyBiZWNhdXNlIEkgaGF2ZSBiZWVuIGN1cmlvdXMgYWJvdXQgaG93IGVmZmVjdGl2ZSBpdCBjYW4gYWN0dWFsbHkgYmUgdG8gdXNlIHByb3NlXG53aGlsZSBmb3JtdWxhdGluZyB0aGUgc29mdHdhcmUuIEFmdGVyIGFsbCB0aGUgbGFyZ2VyIHBhcnQgb2YgdGhlIHRpbWUgY29kaW5nIGlzIHVzdWFsbHkgdGFrZW4gYnkgaGFtbWVyaW5nXG5vdXQgdGhlIG1ldGhvZCByYXRoZXIgdGhlbiBhY3R1YWxseSBjb2RpbmcgaXQuXG5cblRoZSBwcm9ncmFtXG4tLS0tLS0tLS0tLVxuXG5UaGlzIGlzIGFuIE9PUCBhcHByb2FjaCB0byB0aGUgVHJpYW5nbGUgYW5kIFNxdWFyZSB0dXRvcmlhbC4gVGhpcyB3YXkgbGVzcyBzdHVmZiB3aWxsIGhhdmUgdG8gYmUgbW92ZWQgYXJvdW5kIGJldHdlZW5cbnRoZSBtZXRob2RzIGFuZCBob3BlZnVsbHkgaXQgd2lsbCBhbHNvIGhlbHAgaW4gdGhlIHRhc2sgb2YgcHV0dGluZyBzdHVmZiB3aGVyZSBpdCBiZWxvbmdzLlxuXG4jIyMgRGVwZW5kZW5jaWVzXG5cblx0TWVzaCA9IHJlcXVpcmUgJ2FwcC9tZXNoJ1xuXHRPYmpQYXJzZXIgPSByZXF1aXJlICdhcHAvb2JqcGFyc2VyJ1xuXG4jIyMgPGEgbmFtZT1cInRoZS1jbGFzc1wiPjwvYT5HTFxuRmlyc3Qgd2UgbmVlZCB0aGUgY2xhc3MgaXRzZWxmLiBJIHdpbGwgY2FsbCBpdCBHTCBhdCB0aGUgbW9tZW50IGFuZCBzZWUgaWYgdGhhdCBzdGlja3MuXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBHTFxuXG4jIyMjIDxhIG5hbWU9XCJjb25zdHJ1Y3RvclwiPjwvYT5Db25zdHJ1Y3RvclxuVGhlIGNvbnN0cnVjdG9yIG5lZWQgdGhlIGVsZW1lbnQgaWQgb2YgdGhlIGNhbnZhcyB0YWcgd2hlcmUgd2Ugc2hvdWxkIHJlbmRlciBvdXIgT3BlbkdMXG5zY2VuZS5cblxuXHRcdGNvbnN0cnVjdG9yOiAoIGNhbnZhc0VsZW1lbnRJZCApIC0+XG5cdFx0XHRAX3BNYXRyaXggPSBtYXQ0LmNyZWF0ZSgpXG5cdFx0XHRAX212TWF0cml4ID0gbWF0NC5jcmVhdGUoKVxuXHRcdFx0QF9tdk1hdHJpeFN0YWNrID0gW11cblx0XHRcdEBfY3ViZVJvdGF0aW9uID0gMC4wXG5cbkdldCB0aGUgZWxlbWVudCBhbmQga2VlcCBhIHJlZmVyZW5jZSB0byBpdCBhcyBhIG1lbWJlci4gSXQgd2lsbCBjb21lIGluIGhhbmR5IGZyb20gdGltZSB0byB0aW1lLlxuXG5cdFx0XHRAX2NhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCBjYW52YXNFbGVtZW50SWRcblxuR2V0IHRoZSBjb250ZXh0IG9mIHRoZSBjYW52YXMgdXNpbmcgdGhlIGBleHBlcmltZW50YWwtd2ViZ2xgIGFyZ3VtZW50LiBUaGVyZSBtaWdodCBiZSBzb21ldGhpbmcgbGlrZSBgd2ViZ2xgIHRoYXQgY291bGRcbndvcmsgYnV0IHRoaXMgd29ya3MgYW5kIHdpbGwgaGF2ZSB0byBkbyBmb3Igbm93LiBUaGlzIG1pZ2h0IHRocm93IGFuIGV4Y2VwdGlvbiBhbmQgd2UgaGF2ZSB0byBjYXRjaCB0aGF0LiBJdCBtaWdodCBiZVxuYmV0dGVyIHRvIGp1c3QgbGV0IHRoZSBleGNlcHRpb24gZmFsbCB0aHJvdWdoIGJ1dCB0aGlzIHdheSBhIGJldHRlciBlcnJvciBtZXNzYWdlIGNhbiBiZSBzaG93bi4gSSB3aWxsIHN0aWxsIHRocm93IHRoZVxuZXhjZXB0aW9uIGJ1dCBub3cgSSBjYW4gY291cGxlIGl0IHdpdGggYSBjb25zb2xlIGxpbmUgdG8gbWFrZSBzdXJlIEkga25vdyB3aHkgdGhlIHByb2dyYW0gaGFsdGVkLlxuXG5cdFx0XHR0cnlcblx0XHRcdFx0QF9nbCA9IEBfY2FudmFzRWxlbWVudC5nZXRDb250ZXh0ICdleHBlcmltZW50YWwtd2ViZ2wnXG5cdFx0XHRjYXRjaCBlcnJvclxuXHRcdFx0XHRjb25zb2xlLmxvZyAnRmFpbGVkIHRvIGluaXRpYWxpemUgV2ViR0wgdXNpbmcgdGhlIGVsZW1lbnQgJyArIGNhbnZhcyArICcuIEVycm9yOlxcbicgKyBlcnJvclxuXHRcdFx0XHR0aHJvdyBlcnJvclxuXG5JIHN0aWNrIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBjYW52YXMgZWxlbWVudCB0byB0aGUgY29udGV4dCBvYmplY3QuXG5cblx0XHRcdEBfZ2wudmlld3BvcnRXaWR0aCA9IEBfY2FudmFzRWxlbWVudC53aWR0aFxuXHRcdFx0QF9nbC52aWV3cG9ydEhlaWdodCA9IEBfY2FudmFzRWxlbWVudC5oZWlnaHRcblxuQ2xlYXIgdGhlIGJ1ZmZlciBhbmQgZW5hYmxlIGRlcHRoIHRlc3RpbmdcblxuXHRcdFx0QF9nbC5jbGVhckNvbG9yIDAuMCwgMC4wLCAwLjAsIDEuMFxuXHRcdFx0QF9nbC5lbmFibGUgQF9nbC5ERVBUSF9URVNUXG5cblxuIyMjIyA8YSBuYW1lPVwiZmV0Y2hTaGFkZXJGcm9tRWxlbWVudFwiPjwvYT5mZXRjaFNoYWRlckZyb21FbGVtZW50XG5UaGUgc2hhZGVycyBhcmUgY3VycmVudGx5IGxvY2F0ZWQgaW4gdGhlaXIgb3duIGA8c2NyaXB0PmAgdGFncyBpbiB0aGUgSFRNTC4gVG8gZmFjaWxpdGF0ZSB0aGUgc3dhcCB0byBleHRlcm5hbCBmaWxlcyBvclxuYW55IG90aGVyIG1ldGhvZCBvZiByZXRyZWl2aW5nIHRoZXNlIEkgY3JlYXRlIGEgbWV0aG9kIGZvciBmZXRjaGluZyB0aGUgc2hhZGVycy4gVGhpcyBjYW4gbGF0ZXIgYmUgcmVwbGFjZWQgYnkgYW55XG5vdGhlciBtZWFucyBvZiBsb2FkaW5nIHRoZSBzaGFkZXIgY29kZS5cblxuXHRcdGZldGNoU2hhZGVyRnJvbUVsZW1lbnQ6ICggc2hhZGVyRWxlbWVudElkICkgLT5cblx0XHRcdHNoYWRlclNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkIHNoYWRlckVsZW1lbnRJZFxuXG5JZiB0aGUgZ2l2ZW4gZWxlbWVudCBkb2Vzbid0IGV4aXN0IHdlIHN0b3AgdGhlIGV4ZWN1dGlvbiBzdHJhaWdodCBhd2F5LiBTYW1lIHRoaW5nIGlmIGl0J3Mgbm90IGEgc2hhZGVyIGVsZW1lbnQuIChJdFxuc2hvdWxkIGJlIGEgc2NyaXB0IHRhZyB3aXRoIHRoZSBwcm9wZXIgdHlwZS4pXG5cblx0XHRcdHRocm93IG5ldyBFcnJvciAnTm8gc2hhZGVyIHdpdGggaWQ6ICcgKyBzaGFkZXJFbGVtZW50SWQgdW5sZXNzIHNoYWRlclNjcmlwdFxuXHRcdFx0dGhyb3cgbmV3IEVycm9yICdOb3QgYSBzaGFkZXIgZWxlbWVudDogJyArIHNoYWRlckVsZW1lbnQgdW5sZXNzIHNoYWRlclNjcmlwdC50eXBlID09ICd4LXNoYWRlci94LWZyYWdtZW50JyBvciBzaGFkZXJTY3JpcHQudHlwZSA9PSAneC1zaGFkZXIveC12ZXJ0ZXgnXG5cblRoZSBzaGFkZXIgY29kZSBpcyBqdXN0IHRleHQgc28gd2UgY2FuIGp1c3QgdHJhdmVyc2UgdGhyb3VnaCB0aGUgZWxlbWVudCBhbmQgZ2x1ZSB0b2dldGhlciBhbGwgbm9kZXMgd2l0aCBub2RlVHlwZSAzXG4odGV4dCBub2RlcykgdG8gYSBjb21iaW5lZCBzdHJpbmcgd2l0aCB0aGUgc2hhZGVyIGNvZGUgaW4gaXQuXG5fTk9URTpfIFRoaXMgbWlnaHQgbm90IGJlIHRoZSBiZXN0IHdheSB0byBkbyB0aGlzLiBJIHRoaW5rIEkgY2FuIGFjdHVhbGx5IHVzZSBlaXRoZXIgdGhlXG50ZXh0Q29udGVudCBvciB0aGUgaW5uZXJIVE1MIHByb3BlcnRpZXMuIEknbGwgdHJ5IHRoYXQgbGF0ZXIuXG5cblx0XHRcdHNoYWRlckNvZGUgPSBcIlwiXG5cdFx0XHRjdXJyZW50U2NyaXB0Tm9kZSA9IHNoYWRlclNjcmlwdC5maXJzdENoaWxkXG5cblx0XHRcdHdoaWxlIGN1cnJlbnRTY3JpcHROb2RlXG5cdFx0XHRcdHNoYWRlckNvZGUgKz0gY3VycmVudFNjcmlwdE5vZGUudGV4dENvbnRlbnQgaWYgY3VycmVudFNjcmlwdE5vZGUubm9kZVR5cGUgPT0gM1xuXHRcdFx0XHRjdXJyZW50U2NyaXB0Tm9kZSA9IGN1cnJlbnRTY3JpcHROb2RlLm5leHRTaWJsaW5nXG5cblx0XHRcdHJldHVybiBzaGFkZXJDb2RlO1xuXG4jIyMjIDxhIG5hbWU9XCJjb21waWxlU2hhZGVyXCI+PC9hPmNvbXBpbGVTaGFkZXJcblRvIHVzZSB0aGUgc2hhZGVycyB0aGV5IHdpbGwgaGF2ZSB0byBiZSBjb21waWxlZC4gVGhpcyB1dGlsaXR5IG1ldGhvZCBkb2VzIGp1c3QgdGhhdC4gVGhlIHNlY29uZCBwYXJhbWV0ZXIgd2lsbCBnaXZlXG50aGUgdHlwZSBvZiBzaGFkZXIgdG8gY3JlYXRlLiBDdXJyZW50bHkgdGhlcmUgaXMgbm8gbWVjaGFuaXNtIHRvIG1hdGNoIHRoZSBzaGFkZXIgY29kZSB0byB0aGUgc2hhZGVyIHR5cGUuIEV4dHJhY3RpbmdcbmEgc2hhZGVyIGNsYXNzIGZyb20gdGhpcyBpcyBwcm9iYWJseSB0aGUgd2F5IHRvIGdvLiBMYXRlci4uLlxuXG5cdFx0Y29tcGlsZVNoYWRlcjogKCBzaGFkZXJDb2RlLCBzaGFkZXJUeXBlICkgLT5cblx0XHRcdHNoYWRlciA9IEBfZ2wuY3JlYXRlU2hhZGVyIHNoYWRlclR5cGVcblxuXHRcdFx0QF9nbC5zaGFkZXJTb3VyY2Ugc2hhZGVyLCBzaGFkZXJDb2RlXG5cdFx0XHRAX2dsLmNvbXBpbGVTaGFkZXIgc2hhZGVyXG5cbkFmdGVyIGNvbXBpbGF0aW9uIHdlIGNhbiBjaGVjayB0aGUgY29tcGlsZSBzdGF0dXMgcGFyYW1ldGVyIG9mIHRoZSBzaGFkZXIgdG8gbWFrZSBzdXJlIGV2ZXJ5dGhpbmcgd2VudCBhbGwgcmlnaHQuXG5PdGhlcndpc2Ugd2UgdGhyb3cgYW4gZXhjZXB0aW9uIGFzIHRoZXJlIGlzIGN1cnJlbnRseSBubyByZWFsIHBvaW50IGluIGNvbnRpbnVpbmcgZXhlY3V0aW9uIGlmIGEgc2hhZGVyIGNvbXBpbGF0aW9uXG5mYWlscy5cblxuXHRcdFx0dW5sZXNzIEBfZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyIHNoYWRlciwgQF9nbC5DT01QSUxFX1NUQVRVU1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IgQF9nbC5nZXRTaGFkZXJJbmZvTG9nXG5cblx0XHRcdHJldHVybiBzaGFkZXJcblxuIyMjIyA8YSBuYW1lPVwiaW5pdFNoYWRlcnNcIj48L2E+aW5pdFNoYWRlcnNcblRoaXMgbWV0aG9kIHRha2VzIGNhcmUgb2YgbG9hZGluZyBhbmQgY29tcGlsaW5nIHRoZSBmcmFnbWVudCBhbmQgdmVydGV4IHNoYWRlcnMuXG5cblx0XHRpbml0U2hhZGVyczogKCBmcmFnbWVudFNoYWRlckVsZW1lbnRJZCwgdmVydGV4U2hhZGVyRWxlbWVudElkICkgLT5cblx0XHRcdEBfZnJhZ21lbnRTaGFkZXIgPSBAY29tcGlsZVNoYWRlciAoIEBmZXRjaFNoYWRlckZyb21FbGVtZW50IGZyYWdtZW50U2hhZGVyRWxlbWVudElkICksIEBfZ2wuRlJBR01FTlRfU0hBREVSXG5cdFx0XHRAX3ZlcnRleFNoYWRlciA9IEBjb21waWxlU2hhZGVyICggQGZldGNoU2hhZGVyRnJvbUVsZW1lbnQgdmVydGV4U2hhZGVyRWxlbWVudElkICksIEBfZ2wuVkVSVEVYX1NIQURFUlxuXG4jIyMjIDxhIG5hbWU9XCJjcmVhdGVTaGFkZXJQcm9ncmFtXCI+PC9hPmNyZWF0ZVNoYWRlclByb2dyYW1cbkhlcmUgd2UgY29tYmluZSB0aGUgZnJhZ21lbnQgYW5kIHZlcnRleCBzaGFkZXIgdG8gYSBzaGFkZXIgcHJvZ3JhbS4gVGhpcyBpcyBkb25lIGJ5IGZpcnN0IGNyZWF0aW5nIHRoZSBzaGFkZXIgcHJvZ3JhbVxuaXRzZWxmIGFuZCBhdHRhY2hpbmcgdGhlIHNoYWRlcnMgdG8gaXQuXG5cblx0XHRjcmVhdGVTaGFkZXJQcm9ncmFtOiAoIGZyYWdtZW50U2hhZGVyU291cmNlLCB2ZXJ0ZXhTaGFkZXJTb3VyY2UgKSAtPlxuXHRcdFx0QF9zaGFkZXJQcm9ncmFtID0gQF9nbC5jcmVhdGVQcm9ncmFtKClcblx0XHRcdEBfZ2wuYXR0YWNoU2hhZGVyIEBfc2hhZGVyUHJvZ3JhbSwgQGNvbXBpbGVTaGFkZXIgZnJhZ21lbnRTaGFkZXJTb3VyY2UsIEBfZ2wuRlJBR01FTlRfU0hBREVSXG5cdFx0XHRAX2dsLmF0dGFjaFNoYWRlciBAX3NoYWRlclByb2dyYW0sIEBjb21waWxlU2hhZGVyIHZlcnRleFNoYWRlclNvdXJjZSwgQF9nbC5WRVJURVhfU0hBREVSXG5cblRoZW4gd2UgbGluayB0aGUgc2hhZGVyIHByb2dyYW0uIElmIGFueXRoaW5nIGdvZXMgd3Jvbmcgd2hpbGUgbGlua2luZyB3ZSB0aHJvdyBhbiBleGNlcHRpb24uXG5cblx0XHRcdEBfZ2wubGlua1Byb2dyYW0gQF9zaGFkZXJQcm9ncmFtXG5cdFx0XHR1bmxlc3MgQF9nbC5nZXRQcm9ncmFtUGFyYW1ldGVyIEBfc2hhZGVyUHJvZ3JhbSwgQF9nbC5MSU5LX1NUQVRVU1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IgJ0NvdWxkIG5vdCBpbml0aWFsaXplIHNoYWRlcnMuJ1xuXG5JbnN0cnVjdCB0aGUgR0wgY29udGV4dCB0byB1c2UgdGhlIHNoYWRlciBwcm9ncmFtLlxuXG5cdFx0XHRAX2dsLnVzZVByb2dyYW0gQF9zaGFkZXJQcm9ncmFtXG5cblN0b3JlIHJlZmVyZW5jZXMgdG8gdGhlIHZhcmlhYmxlcyBpbiB0aGUgc2hhZGVycyB0aGF0IHNob3VsZCBiZSBhdmFpbGFibGUgZm9yIHVzIHRvIG1hbmlwdWxhdGUgbGF0ZXIuXG5cblx0XHRcdEBfc2hhZGVyUHJvZ3JhbS52ZXJ0ZXhQb3NpdGlvbkF0dHJpYnV0ZSA9IEBfZ2wuZ2V0QXR0cmliTG9jYXRpb24gQF9zaGFkZXJQcm9ncmFtLCAnYVZlcnRleFBvc2l0aW9uJ1xuXHRcdFx0QF9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSBAX3NoYWRlclByb2dyYW0udmVydGV4UG9zaXRpb25BdHRyaWJ1dGVcblxuXHRcdFx0QF9zaGFkZXJQcm9ncmFtLnBNYXRyaXhVbmlmb3JtID0gQF9nbC5nZXRVbmlmb3JtTG9jYXRpb24gQF9zaGFkZXJQcm9ncmFtLCAndVBNYXRyaXgnXG5cdFx0XHRAX3NoYWRlclByb2dyYW0ubXZNYXRyaXhVbmlmb3JtID0gQF9nbC5nZXRVbmlmb3JtTG9jYXRpb24gQF9zaGFkZXJQcm9ncmFtLCAndU1WTWF0cml4J1xuXG4jIyMjIDxhIG5hbWU9XCJzZXRNYXRyaXhVbmlmb3Jtc1wiPjwvYT5zZXRNYXRyaXhVbmlmb3Jtc1xuVXRpbGl0eSB0byBzZXQgdGhlIG1hdHJpeCB1bmlmb3Jtcy5cbl9OT1RFOl8gTm90IHN1cmUgdGhhdCB3ZSBuZWVkIHRvIHNldCB0aGUgcHJvamVjdGlvbiBtYXRyaXggZXZlcnkgdGltZSB0aGF0IHdlIHVwZGF0ZSB0aGUgdmlldyBtYXRyaXguXG5cblx0XHRzZXRNYXRyaXhVbmlmb3JtczogLT5cblx0XHRcdEBfZ2wudW5pZm9ybU1hdHJpeDRmdiBAX3NoYWRlclByb2dyYW0ucE1hdHJpeFVuaWZvcm0sIGZhbHNlLCBAX3BNYXRyaXhcblx0XHRcdEBfZ2wudW5pZm9ybU1hdHJpeDRmdiBAX3NoYWRlclByb2dyYW0ubXZNYXRyaXhVbmlmb3JtLCBmYWxzZSwgQF9tdk1hdHJpeFxuXG4jIyMjIDxhIG5hbWU9XCJjcmVhdGVNZXNoXCI+PC9hPmNyZWF0ZU1lc2hcblV0aWxpdHkgdG8gY3JlYXRlIGEgbWVzaC5cblxuXHRcdGNyZWF0ZU1lc2g6ICggdmVydGljZXMsIHZlcnRleFNpemUsIG51bVZlcnRpY2VzLCBpbmRpY2VzLCBudW1JbmRpY2VzLCBwb3NpdGlvbiApIC0+XG5cdFx0XHR2ZXJ0ZXhCdWZmZXIgPSBAX2dsLmNyZWF0ZUJ1ZmZlcigpXG5cdFx0XHRAX2dsLmJpbmRCdWZmZXIgQF9nbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlclxuXHRcdFx0QF9nbC5idWZmZXJEYXRhIEBfZ2wuQVJSQVlfQlVGRkVSLCAoIG5ldyBGbG9hdDMyQXJyYXkgdmVydGljZXMgKSwgQF9nbC5TVEFUSUNfRFJBV1xuXG5cdFx0XHRpbmRleEJ1ZmZlciA9IEBfZ2wuY3JlYXRlQnVmZmVyKClcblx0XHRcdEBfZ2wuYmluZEJ1ZmZlciBAX2dsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlclxuXHRcdFx0QF9nbC5idWZmZXJEYXRhIEBfZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsICggbmV3IFVpbnQxNkFycmF5IGluZGljZXMgKSwgQF9nbC5TVEFUSUNfRFJBV1xuXG5cdFx0XHRyZXR1cm4gbmV3IE1lc2ggdmVydGV4QnVmZmVyLCB2ZXJ0ZXhTaXplLCBudW1WZXJ0aWNlcywgaW5kZXhCdWZmZXIsIG51bUluZGljZXMsIHBvc2l0aW9uXG5cbiMjIyMgPGEgbmFtZT1cImNyZWF0ZU1lc2hGcm9tT2JqXCI+PC9hPmNyZWF0ZU1lc2hGcm9tT2JqXG5DcmVhdGVzIGEgbWVzaCBmcm9tIGEgV2F2ZUZyb250IC5vYmogZmlsZS5cblxuXHRcdGNyZWF0ZU1lc2hGcm9tT2JqOiAoIG9iakRhdGEsIHBvc2l0aW9uICkgLT5cblx0XHRcdHBhcnNlciA9IG5ldyBPYmpQYXJzZXJcblx0XHRcdHBhcnNlci5wYXJzZSBvYmpEYXRhXG5cdFx0XHRAY3JlYXRlTWVzaCBwYXJzZXIudmVydGljZXMsIDMsIHBhcnNlci52ZXJ0aWNlcy5sZW5ndGggLyAzLCBwYXJzZXIuZmFjZXMsIHBhcnNlci5mYWNlcy5sZW5ndGgsIFswLCAwLCAtN11cblxuIyMjIyA8YSBuYW1lPVwicHVzaE1hdHJpeFwiPjwvYT5wdXNoTWF0cml4XG5JJ20gdXNpbmcgdGhlIG1hdHJpeCBzdGFjayBmcm9tIHRoZSB0dXRvcmlhbCBoZXJlLiBBbm90aGVyIG1ldGhvZCBtaWdodCBiZSB1c2VkIGxhdGVyLlxuXG5cdFx0cHVzaE1hdHJpeDogLT5cblx0XHRcdEBfbXZNYXRyaXhTdGFjay5wdXNoIG1hdDQuY2xvbmUgQF9tdk1hdHJpeFxuXG5cdFx0cG9wTWF0cml4OiAtPlxuXHRcdFx0dGhyb3cgRXJyb3IgJ0ludmFsaWQgcG9wTWF0cml4JyBpZiBAX212TWF0cml4U3RhY2subGVuZ3RoIDwgMVxuXHRcdFx0QF9tdk1hdHJpeCA9IEBfbXZNYXRyaXhTdGFjay5wb3AoKVxuXG5BIGNvbnZlcnNpb24gb2YgZGVncmVlcyB0byByYWRpYW5zIGlzIG5lZWRlZFxuXG5cdFx0ZGVnMlJhZDogKCBkZWdyZWVzICkgLT5cblx0XHRcdGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwXG5cbiMjIyMgPGEgbmFtZT1cImRyYXdTY2VuZVwiPjwvYT5kcmF3U2NlbmVcbkZpbmFsbHkgaXQncyB0aW1lIGZvciByZW5kZXJpbmcgdGhlIHNjZW5lLlxuXG5cdFx0ZHJhd1NjZW5lOiAoIG1lc2hlcyApIC0+XG5cblNldCB1cCB0aGUgdmlld3BvcnQgYW5kIGNsZWFyIGl0LlxuXG5cdFx0XHRAX2dsLnZpZXdwb3J0IDAsIDAsIEBfZ2wudmlld3BvcnRXaWR0aCwgQF9nbC52aWV3cG9ydEhlaWdodFxuXHRcdFx0QF9nbC5jbGVhciBAX2dsLkNPTE9SX0JVRkZFUl9CSVQgfCBAX2dsLkRFUFRIX0JVRkZFUl9CSVRcblxuSW5pdGlhbGl6ZSB0aGUgcGVyc3BlY3RpdmUgbWF0cml4LlxuXG5cdFx0XHRtYXQ0LnBlcnNwZWN0aXZlIEBfcE1hdHJpeCwgNDUsIEBfZ2wudmlld3BvcnRXaWR0aCAvIEBfZ2wudmlld3BvcnRIZWlnaHQsIDAuMSwgMTAwLjAsIEBfcE1hdHJpeFxuXG5Jbml0aWFsaXplIHRoZSB2aWV3IG1hdHJpeC5cblxuXHRcdFx0bWF0NC5pZGVudGl0eSBAX212TWF0cml4XG5cblx0XHRcdGZvciBtZXNoIGluIG1lc2hlc1xuXHRcdFx0XHRtYXQ0LnRyYW5zbGF0ZSBAX212TWF0cml4LCBtYXQ0LmNyZWF0ZSgpLCBtZXNoLnBvc2l0aW9uXG5cdFx0XHRcdEBwdXNoTWF0cml4KClcblx0XHRcdFx0bWF0NC5yb3RhdGUgQF9tdk1hdHJpeCwgQF9tdk1hdHJpeCwgKCBAZGVnMlJhZCBAX2N1YmVSb3RhdGlvbiApLCBbLTEsIDEsIDFdXG5cdFx0XHRcdGRlYnVnU3RyaW5nID0gQF9jdWJlUm90YXRpb24udG9GaXhlZCggMiApLnRvU3RyaW5nKClcblx0XHRcdFx0KCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnY3ViZVJvdCcgKS52YWx1ZSA9IG1hdDQuc3RyIEBfbXZNYXRyaXhcblx0XHRcdFx0QF9nbC5iaW5kQnVmZmVyIEBfZ2wuQVJSQVlfQlVGRkVSLCBtZXNoLnZlcnRleEJ1ZmZlclxuXHRcdFx0XHRAX2dsLnZlcnRleEF0dHJpYlBvaW50ZXIgQF9zaGFkZXJQcm9ncmFtLnZlcnRleFBvc2l0aW9uQXR0cmlidXRlLCBtZXNoLnZlcnRleFNpemUsIEBfZ2wuRkxPQVQsIGZhbHNlLCAwLCAwXG5cblx0XHRcdFx0QF9nbC5iaW5kQnVmZmVyIEBfZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG1lc2guaW5kZXhCdWZmZXJcblxuXHRcdFx0XHRAc2V0TWF0cml4VW5pZm9ybXMoKVxuXHRcdFx0XHRAX2dsLmRyYXdFbGVtZW50cyBAX2dsLlRSSUFOR0xFX0ZBTiwgbWVzaC5udW1JbmRpY2VzLCBAX2dsLlVOU0lHTkVEX1NIT1JULCAwXG5cdFx0XHRcdEBwb3BNYXRyaXgoKVxuXG5MZXRzIHNwaWNlIHRpbmdzIHVwIHdpdGggc29tZSBhbmltYXRpb25cblxuXHRcdHRpY2s6IC0+XG5cdFx0XHRAX2N1YmVSb3RhdGlvbiArPSAxLjVcblx0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW1CQyxJQUFBLG1CQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsVUFBUixDQUFQLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSxlQUFSLENBRFosQ0FBQTs7QUFBQSxNQU1NLENBQUMsT0FBUCxHQUF1QjtBQU1ULEVBQUEsWUFBRSxlQUFGLEdBQUE7QUFDWixRQUFBLEtBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQURiLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxjQUFELEdBQWtCLEVBRmxCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBSGpCLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxjQUFELEdBQWtCLFFBQVEsQ0FBQyxjQUFULENBQXdCLGVBQXhCLENBUGxCLENBQUE7QUFjQTtBQUNDLE1BQUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFDLENBQUEsY0FBYyxDQUFDLFVBQWhCLENBQTJCLG9CQUEzQixDQUFQLENBREQ7S0FBQSxjQUFBO0FBR0MsTUFESyxjQUNMLENBQUE7QUFBQSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksK0NBQUEsR0FBa0QsTUFBbEQsR0FBMkQsWUFBM0QsR0FBMEUsS0FBdEYsQ0FBQSxDQUFBO0FBQ0EsWUFBTSxLQUFOLENBSkQ7S0FkQTtBQUFBLElBc0JBLElBQUMsQ0FBQSxHQUFHLENBQUMsYUFBTCxHQUFxQixJQUFDLENBQUEsY0FBYyxDQUFDLEtBdEJyQyxDQUFBO0FBQUEsSUF1QkEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLEdB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S1gsQ0FBQTs7QUFBQSxlQWtNQSxJQUFBLEdBQU0sU0FBQSxHQUFBO1dBQ0wsSUFBQyxDQUFBLGFBQUQsSUFBa0IsSUFEYjtFQUFBLENBbE1OLENBQUE7O1lBQUE7O0lBWkQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo0MTg4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9tZXNoLmxpdGNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJNZXNoXG49PT09XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNZXNoXG5cdFx0Y29uc3RydWN0b3I6ICggQHZlcnRleEJ1ZmZlciwgQHZlcnRleFNpemUsIEBudW1WZXJ0aWNlcywgQGluZGV4QnVmZmVyLCBAbnVtSW5kaWNlcywgQHBvc2l0aW9uICkgLT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0MsSUFBQSxJQUFBOztBQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ1QsRUFBQSxjQUFHLFlBQUgsRUFBa0IsVUFBbEIsRUFBK0IsV0FBL0IsRUFBNkMsV0FBN0MsRUFBMkQsVUFBM0QsRUFBd0UsUUFBeEUsR0FBQTtBQUFvRixJQUFsRixJQUFDLENBQUEsZUFBQSxZQUFpRixDQUFBO0FBQUEsSUFBbkUsSUFBQyxDQUFBLGFBQUEsVUFBa0UsQ0FBQTtBQUFBLElBQXRELElBQUMsQ0FBQSxjQUFBLFdBQXFELENBQUE7QUFBQSxJQUF4QyxJQUFDLENBQUEsY0FBQSxXQUF1QyxDQUFBO0FBQUEsSUFBMUIsSUFBQyxDQUFBLGFBQUEsVUFBeUIsQ0FBQTtBQUFBLElBQWIsSUFBQyxDQUFBLFdBQUEsUUFBWSxDQUFwRjtFQUFBLENBQWI7O2NBQUE7O0lBREQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo0MjA2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9vYmpwYXJzZXIubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk9ialBhcnNlclxuPT09PT09PT09XG5cbiMjIE9ialBhcnNlclxuVGhlIE9ialBhcnNlciB0YWtlcyBhIHN0cmluZyBhbmQgcGFyc2VzIGl0IGFzIGEgV2F2ZUZyb250IC5vYmotZmlsZS4gSXQgd2lsbCBjcmVhdGUgYSBsaXN0IG9mIHZlcnRpY2VzLCBhIGxpc3Qgb2Zcbm5vcm1hbHMsIGEgbGlzdCBvZiB0ZXhlbHMgYW5kIGEgbGlzdCBvZiBmYWNlcy4gVGhvc2UgY2FuIHRoZW4gYmUgdXNlZCB0byBjcmVhdGUgYSBtZXNoIGZvciBXZWJHTC5cblxuXHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE9ialBhcnNlclxuXG4jIyMgY29uc3RydWN0b3JcblRoZSBjb25zdHJ1Y3RvciB3aWxsIHN0YXJ0IHRoZSBwYXJzaW5nIGltbWVkaWF0ZWx5LiBTcGxpdHRpbmcgdGhpcyBpbnRvIGNvbnN0cnVjdG9yIGFuZCBwYXJzZXIgbWlnaHQgYmUgYmV0dGVyIGlmIHRoZVxubG9hZGVyIHNob3VsZCBsYXRlciBiZSBhYmxlIHRvIGJlIHVzZWQgYXN5bmNocm9ub3VzbHkgYnV0IHRoaXMgd29ya3MgZm9yIG5vdy4gIFxuKipXQVJOSU5HKiogT25seSBhIHN1YnNldCBvZiB0aGUgc3BlY2lmaWNhdGlvbiBpcyBzdXBwb3J0ZWQgYXQgdGhlIG1vbWVudCBhbmQgdGhlcmUgaXMgbm8gcHJvcGVyIGhhbmRsaW5nIG9mXG51bnN1cHBvcnRlZCBsaW5lcy5cblxuXHRcdGNvbnN0cnVjdG9yOiAtPlxuXHRcdFx0QHZlcnRpY2VzID0gW11cblx0XHRcdEBub3JtYWxzID0gW11cblx0XHRcdEB0ZXhlbHMgPSBbXVxuXHRcdFx0QGZhY2VzID0gW11cblxuIyMjIHBhcnNlXG5UaGUgcGFyc2luZyBpcyBhcyBzaW1wbGUgYXMgc3BsaXR0aW5nIHRoZSBmaWxlIGludG8gaXQncyBsaW5lcyBhbmQgYWZ0ZXIgdGhhdCBwYXJzZSB0aGVtIG9uZSBieSBvbmUuIElmIHRoZSBsaW5lIGJlZ2luc1xud2l0aCBhIGAjYCB0aGVuIGl0J3MgYSBjb21tZW50IGFuZCB3aWxsIGJlIGlnbm9yZWQuIFRoZSBsaW5lIGlzIHRoZW4gc3BsaXQgb24gZXZlcnkgd2hpdGVzcGFjZSBhbmQgYmVjYXVzZSBvZiB0aGUgd2F5XG5KYXZhU2NyaXB0IG9iamVjdHMgYXJlIGNvbXBvc2VkIHRoZSBmaXJzdCB0b2tlbiBjYW4gYmUgdXNlZCBhcyB0aGUgbWV0aG9kIG5hbWUgdG8gY2FsbCwgcGFzc2luZyBpbiB0aGUgcmVzdCBvZiB0aGVcbnRva2VucyBhcyBwYXJhbWV0ZXJzLlxuXG5cdFx0cGFyc2U6ICggb2JqRGF0YSApIC0+XG5cdFx0XHRmb3IgbGluZSBpbiBvYmpEYXRhLnNwbGl0ICdcXG4nXG5cdFx0XHRcdGNvbnRpbnVlIGlmICggbGluZS5jaGFyQXQgMCApID09ICcjJyBvciBsaW5lLmxlbmd0aCA8IDFcblx0XHRcdFx0dG9rZW5zID0gbGluZS50cmltKCkuc3BsaXQgL1xccysvXG5cdFx0XHRcdEBbdG9rZW5zWzBdXS5hcHBseSBALCB0b2tlbnNbMS4uXSBpZiBAW3Rva2Vuc1swXV1cblx0XHRcdEBcblxuIyMjIHZcbkEgdmVydGV4IGlzIGNyZWF0ZWQgZnJvbSB0aHJlZSBjb21wb25lbnRzLCBgeCwgeSwgemAuIFRoZSAub2JqIHNwZWNpZmljYXRpb24gYWxsb3dzIGZvciBhIGZvdXJ0aCBgd2AgY29tcG9uZW50IHdoaWNoIGlzXG5pZ25vcmVkIGhlcmUuIEFsbCBjb21wb25lbnRzIGFyZSBwYXJzZWQgYXMgZmxvYXRzLlxuXG5cdFx0djogKCB4LCB5LCB6ICkgLT5cblx0XHRcdEB2ZXJ0aWNlcy5wdXNoLmFwcGx5IEB2ZXJ0aWNlcyxcblx0XHRcdFtcblx0XHRcdFx0cGFyc2VGbG9hdCB4XG5cdFx0XHRcdHBhcnNlRmxvYXQgeVxuXHRcdFx0XHRwYXJzZUZsb2F0IHpcblx0XHRcdF1cblx0XHRcdHJldHVyblxuXG4jIyMgdm5cbkEgbm9ybWFsIGlzIGNyZWF0ZWQgZnJvbSB0aHJlZSBjb21wb25lbnRzLCBgaSwgaiwga2AuIEFsbCBjb21wb25lbnRzIGFyZSBwYXJzZWQgYXMgZmxvYXRzLlxuXG5cdFx0dm46ICggaSwgaiwgayApIC0+XG5cdFx0XHRAbm9ybWFscy5wdXNoLmFwcGx5IEBub3JtYWxzLFxuXHRcdFx0W1xuXHRcdFx0XHRwYXJzZUZsb2F0IGlcblx0XHRcdFx0cGFyc2VGbG9hdCBqXG5cdFx0XHRcdHBhcnNlRmxvYXQga1xuXHRcdFx0XVxuXHRcdFx0cmV0dXJuXG5cbiMjIyB2dFxuQSB0ZXhlbCwgdGV4dHVyZSBjb29yZGluYXRlLCBpcyBjcmVhdGVkIGZyb20gdHdvIGNvbXBvbmVudHMuIFRoZSAub2JqIHNwZWNpZmljYXRpb24gYWxsb3dzIGZvciBhIHRoaXJkIGB3YCBjb21wb25lbnRcbndoaWNoIGlzIGlnbm9yZWQgaGVyZS4gQWxsIGNvbXBvbmVudHMgYXJlIHBhcnNlZCBhcyBmbG9hdHMuXG5cblx0XHR2dDogKCB1LCB2ICkgLT5cblx0XHRcdEB0ZXhlbHMucHVzaC5hcHBseSBAdGV4ZWxzLFxuXHRcdFx0W1xuXHRcdFx0XHRwYXJzZUZsb2F0IHVcblx0XHRcdFx0cGFyc2VGbG9hdCB2XG5cdFx0XHRdXG5cdFx0XHRyZXR1cm5cblxuIyMjIGZcbkZhY2VzIGFyZSBncm91cHMgb2YgaW5kaWNlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSB2ZXJ0aWNlcy4gIFxuKipJTVBPUlRBTlQqKiBTdXBwb3J0IGZvciB2L3Z0L3ZuIG11c3QgYmUgYWRkZWQuIEkgaGF2ZSB0byBsb29rIGF0IGhvdyBpbmRleCBsaXN0cyBmb3IgdGV4ZWxzIGFuZCBub3JtYWxzIGxvb2tzIGxpa2UgaW5cbldlYkdMIHRvIGRvIHRoaXMgcHJvcGVybHkgYnV0IEkgdGhpbmsgSSByZW1lbWJlciB0aGF0IHVzdWFsbHkgdGhlIHZlcnRleCBpcyBleHBhbmRlZCB3aXRoIHRoZSBleHRyYSBkYXRhLiBTb21ldGhpbmdcbmxpa2UgW3gsIHksIHosIHUsIHZdIGZvciBhIHRleHR1cmVkIHZlcnRleC4gIFxuKipXQVJOSU5HKiogVGhlcmUgaXMgbm8gc3VwcG9ydCBmb3IgbmVnYXRpdmUgaW5kaWNlcyBhdCB0aGUgbW9tZW50LlxuXG5cdFx0ZjogKCBpbmRpY2VzLi4uICkgLT5cblx0XHRcdGZvciBjdXJyZW50SW5kZXggaW4gWzAuLi5pbmRpY2VzLmxlbmd0aF1cblx0XHRcdFx0Y29tcG9uZW50cyA9IGluZGljZXNbY3VycmVudEluZGV4XS5zcGxpdCAnLydcblx0XHRcdFx0aW5kaWNlc1tjdXJyZW50SW5kZXhdID0gY29tcG9uZW50c1swXVxuXHRcdFx0XHRpbmRpY2VzW2N1cnJlbnRJbmRleF0gPSBwYXJzZUludCAoIGluZGljZXNbY3VycmVudEluZGV4XSAtIDEgKVxuXHRcdFx0QGZhY2VzLnB1c2guYXBwbHkgQGZhY2VzLCBpbmRpY2VzXG5cdFx0XHRyZXR1cm5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQyxJQUFBLFNBQUE7RUFBQSxrQkFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQVFULEVBQUEsbUJBQUEsR0FBQTtBQUNaLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFEWCxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBRlYsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUhULENBRFk7RUFBQSxDQUFiOztBQUFBLHNCQVlBLEtBQUEsR0FBTyxTQUFFLE9BQUYsR0FBQTtBQUNOLFFBQUEsNEJBQUE7QUFBQTtBQUFBLFNBQUEsMkNBQUE7c0JBQUE7QUFDQyxNQUFBLElBQVksQ0FBRSxJQUFJLENBQUMsTUFBTCxDQUFZLENBQVosQ0FBRixDQUFBLEtBQXFCLEdBQXJCLElBQTRCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBdEQ7QUFBQSxpQkFBQTtPQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFXLENBQUMsS0FBWixDQUFrQixLQUFsQixDQURULENBQUE7QUFFQSxNQUFBLElBQXFDLElBQUUsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLENBQXZDO0FBQUEsUUFBQSxJQUFFLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxDQUFVLENBQUMsS0FBYixDQUFtQixJQUFuQixFQUFzQixNQUFPLFNBQTdCLENBQUEsQ0FBQTtPQUhEO0FBQUEsS0FBQTtXQUlBLEtBTE07RUFBQSxDQVpQLENBQUE7O0FBQUEsc0JBdUJBLENBQUEsR0FBRyxTQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixHQUFBO0FBQ0YsSUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFmLENBQXFCLElBQUMsQ0FBQSxRQUF0QixFQUNBLENBQ0MsVUFBQSxDQUFXLENBQVgsQ0FERCxFQUVDLFVBQUEsQ0FBVyxDQUFYLENBRkQsRUFHQyxVQUFBLENBQVcsQ0FBWCxDQUhELENBREEsQ0FBQSxDQURFO0VBQUEsQ0F2QkgsQ0FBQTs7QUFBQSxzQkFtQ0EsRUFBQSxHQUFJLFNBQUUsQ0FBRixFQUFLLENBQUwsRUFBUSxDQUFSLEdBQUE7QUFDSCxJQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQWQsQ0FBb0IsSUFBQyxDQUFBLE9BQXJCLEVBQ0EsQ0FDQyxVQUFBLENBQVcsQ0FBWCxDQURELEVBRUMsVUFBQSxDQUFXLENBQVgsQ0FGRCxFQUdDLFVBQUEsQ0FBVyxDQUFYLENBSEQsQ0FEQSxDQUFBLENBREc7RUFBQSxDQW5DSixDQUFBOztBQUFBLHNCQWdEQSxFQUFBLEdBQUksU0FBRSxDQUFGLEVBQUssQ0FBTCxHQUFBO0FBQ0gsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFiLENBQW1CLElBQUMsQ0FBQSxNQUFwQixFQUNBLENBQ0MsVUFBQSxDQUFXLENBQVgsQ0FERCxFQUVDLFVBQUEsQ0FBVyxDQUFYLENBRkQsQ0FEQSxDQUFBLENBREc7RUFBQSxDQWhESixDQUFBOztBQUFBLHNCQStEQSxDQUFBLEdBQUcsU0FBQSxHQUFBO0FBQ0YsUUFBQSwyQ0FBQTtBQUFBLElBREksaUVBQ0osQ0FBQTtBQUFBLFNBQW9CLHVIQUFwQixHQUFBO0FBQ0MsTUFBQSxVQUFBLEdBQWEsT0FBUSxDQUFBLFlBQUEsQ0FBYSxDQUFDLEtBQXRCLENBQTRCLEdBQTVCLENBQWIsQ0FBQTtBQUFBLE1BQ0EsT0FBUSxDQUFBLFlBQUEsQ0FBUixHQUF3QixVQUFXLENBQUEsQ0FBQSxDQURuQyxDQUFBO0FBQUEsTUFFQSxPQUFRLENBQUEsWUFBQSxDQUFSLEdBQXdCLFFBQUEsQ0FBVyxPQUFRLENBQUEsWUFBQSxDQUFSLEdBQXdCLENBQW5DLENBRnhCLENBREQ7QUFBQSxLQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFaLENBQWtCLElBQUMsQ0FBQSxLQUFuQixFQUEwQixPQUExQixDQUpBLENBREU7RUFBQSxDQS9ESCxDQUFBOzttQkFBQTs7SUFSRCxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQyNjIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL3RpbWUubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIlxuXHRmb3IgdmVuZG9yIGluIFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ11cblx0XHRcdGJyZWFrIGlmIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W1wiI3t2ZW5kb3J9UmVxdWVzdEFuaW1hdGlvbkZyYW1lXCJdXG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbXCIje3ZlbmRvcn1DYW5jZWxBbmltYXRpb25GcmFtZVwiXSBvclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aW5kb3dbXCIje3ZlbmRvcn1DYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIl0pXG5cdFxuXHR0YXJnZXRUaW1lID0gMFxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgb3I9IChjYWxsYmFjaykgLT5cblx0XHRcdHRhcmdldFRpbWUgPSBNYXRoLm1heCB0YXJnZXRUaW1lICsgMTYsIGN1cnJlbnRUaW1lID0gRGF0ZS5ub3coKVxuXHRcdFx0c2V0VGltZW91dCAoIC0+IGNhbGxiYWNrIERhdGUubm93KCkgKSwgdGFyZ2V0VGltZSAtIGN1cnJlbnRUaW1lXG5cdFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSBvcj0gKGlkKSAtPiBjbGVhclRpbWVvdXQgaWRcblxuXHRleHBvcnRzLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IChjYWxsYmFjaykgLT5cblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYXBwbHkgd2luZG93LCBbY2FsbGJhY2tdXG5cdFxuXHRleHBvcnRzLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKGlkKSAtPlxuXHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lLmFwcGx5IHdpbmRvdywgW2lkXVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNDLElBQUEsK0VBQUE7O0FBQUE7QUFBQSxLQUFBLDJDQUFBO29CQUFBO0FBQ0UsRUFBQSxJQUFTLHFCQUFUO0FBQUEsVUFBQTtHQUFBO0FBQUEsRUFDQSxxQkFBQSxHQUF3QixNQUFPLENBQUEsRUFBQSxHQUFFLE1BQUYsR0FBVSx1QkFBVixDQUQvQixDQUFBO0FBQUEsRUFFQSxvQkFBQSxHQUF3QixNQUFPLENBQUEsRUFBQSxHQUFFLE1BQUYsR0FBVSxzQkFBVixDQUFQLElBQ1gsTUFBTyxDQUFBLEVBQUEsR0FBRSxNQUFGLEdBQVUsNkJBQVYsQ0FIcEIsQ0FERjtBQUFBLENBQUE7O0FBQUEsVUFNQSxHQUFhLENBTmIsQ0FBQTs7QUFBQSwwQkFPQSx3QkFBMEIsU0FBQyxRQUFELEdBQUE7QUFDeEIsTUFBQSxXQUFBO0FBQUEsRUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxVQUFBLEdBQWEsRUFBdEIsRUFBMEIsV0FBQSxHQUFjLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBeEMsQ0FBYixDQUFBO1NBQ0EsVUFBQSxDQUFXLENBQUUsU0FBQSxHQUFBO1dBQUcsUUFBQSxDQUFTLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBVCxFQUFIO0VBQUEsQ0FBRixDQUFYLEVBQXVDLFVBQUEsR0FBYSxXQUFwRCxFQUZ3QjtBQUFBLEVBUDFCLENBQUE7O0FBQUEseUJBV0EsdUJBQXlCLFNBQUMsRUFBRCxHQUFBO1NBQVEsWUFBQSxDQUFhLEVBQWIsRUFBUjtBQUFBLEVBWHpCLENBQUE7O0FBQUEsT0FhTyxDQUFDLHFCQUFSLEdBQWdDLFNBQUMsUUFBRCxHQUFBO1NBQy9CLHFCQUFxQixDQUFDLEtBQXRCLENBQTRCLE1BQTVCLEVBQW9DLENBQUMsUUFBRCxDQUFwQyxFQUQrQjtBQUFBLENBYmhDLENBQUE7O0FBQUEsT0FnQk8sQ0FBQyxvQkFBUixHQUErQixTQUFDLEVBQUQsR0FBQTtTQUM5QixvQkFBb0IsQ0FBQyxLQUFyQixDQUEyQixNQUEzQixFQUFtQyxDQUFDLEVBQUQsQ0FBbkMsRUFEOEI7QUFBQSxDQWhCL0IsQ0FBQSJ9fV19
*/})()