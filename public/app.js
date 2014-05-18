
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
var GL;

GL = require('app/gl');

document.addEventListener("DOMContentLoaded", function() {
  var loadShaders, startGL;
  document.removeEventListener("DOMContentLoaded", this);
  loadShaders = function() {
    var fragmentShaderSource, shaderLoadingLoop, vertexShaderSource;
    console.log('Starting to load shaders.');
    fragmentShaderSource = vertexShaderSource = void 0;
    new microAjax('./fShader.c', function(resource) {
      console.log('Fragment shader loaded.');
      return fragmentShaderSource = resource;
    });
    new microAjax('./vShader.c', function(resource) {
      console.log('Vertex shader loaded.');
      return vertexShaderSource = resource;
    });
    shaderLoadingLoop = function() {
      var shaderLoadingTimer;
      return shaderLoadingTimer = setInterval(function() {
        if (fragmentShaderSource && vertexShaderSource) {
          clearTimeout(shaderLoadingTimer);
          return startGL(fragmentShaderSource, vertexShaderSource);
        } else {
          shaderLoadingLoop();
          return console.log('Still no shaders loaded...');
        }
      }, 1000);
    };
    return shaderLoadingLoop();
  };
  startGL = function(fragmentShaderSource, vertexShaderSource) {
    var gl, square, triangle;
    gl = new GL('lesson01-canvas');
    gl.createShaderProgram(fragmentShaderSource, vertexShaderSource);
    triangle = gl.createMesh([0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0], 3, 3, [1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], 4, 3, [-1.5, 0.0, -7.0]);
    square = gl.createMesh([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0], 3, 6, [1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], 4, 6, [1.5, 0.0, -7.0]);
    return gl.drawScene([triangle, square]);
  };
  return loadShaders();
}, false);

}, {"app/gl":"src/app/gl"});
require.register('src/app/gl', function(require, module, exports){
var GL, Mesh;

Mesh = require('app/mesh');

module.exports = GL = (function() {
  function GL(canvasElementId) {
    var error;
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
    this._shaderProgram.vertexColorAttribute = this._gl.getAttribLocation(this._shaderProgram, 'aVertexColor');
    this._gl.enableVertexAttribArray(this._shaderProgram.vertexColorAttribute);
    this._shaderProgram.pMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, 'uPMatrix');
    return this._shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, 'uMVMatrix');
  };

  GL.prototype.setMatrixUniforms = function(mvMatrix, pMatrix) {
    this._gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, pMatrix);
    return this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, mvMatrix);
  };

  GL.prototype.createMesh = function(vertices, vertexSize, numVertices, colors, colorSize, numColors, position) {
    var colorBuffer, vertexBuffer;
    vertexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
    colorBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, colorBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(colors), this._gl.STATIC_DRAW);
    return new Mesh(vertexBuffer, vertexSize, numVertices, colorBuffer, colorSize, numColors, position);
  };

  GL.prototype.drawScene = function(meshes) {
    var mesh, _i, _len, _results;
    this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    this._pMatrix = mat4.create();
    mat4.perspective(this._pMatrix, 45, this._gl.viewportWidth / this._gl.viewportHeight, 0.1, 100.0, this._pMatrix);
    this._mvMatrix = mat4.create();
    _results = [];
    for (_i = 0, _len = meshes.length; _i < _len; _i++) {
      mesh = meshes[_i];
      mat4.translate(this._mvMatrix, mat4.create(), mesh.position);
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, mesh.vertexBuffer);
      this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, mesh.vertexSize, this._gl.FLOAT, false, 0, 0);
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, mesh.colorBuffer);
      this._gl.vertexAttribPointer(this._shaderProgram.vertexColorAttribute, mesh.colorSize, this._gl.FLOAT, false, 0, 0);
      this.setMatrixUniforms(this._mvMatrix, this._pMatrix);
      _results.push(this._gl.drawArrays(this._gl.TRIANGLES, 0, mesh.numVertices));
    }
    return _results;
  };

  return GL;

})();

}, {"app/mesh":"src/app/mesh"});
require.register('src/app/mesh', function(require, module, exports){
var Mesh;

module.exports = Mesh = (function() {
  function Mesh(vertexBuffer, vertexSize, numVertices, colorBuffer, colorSize, numColors, position) {
    this.vertexBuffer = vertexBuffer;
    this.vertexSize = vertexSize;
    this.numVertices = numVertices;
    this.colorBuffer = colorBuffer;
    this.colorSize = colorSize;
    this.numColors = numColors;
    this.position = position;
  }

  return Mesh;

})();

}, {});
require.register('src/app/user', function(require, module, exports){
var User;

module.exports = User = (function() {
  function User(name) {
    this.name = name;
  }

  User.prototype.hello = function() {
    return alert("Hello from " + this.name);
  };

  return User;

})();

}, {});
// POLVO :: INITIALIZER
require('src/app/app');
/*
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjozOTc0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC9hcHAubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjIFBvbHZvIHRlc3QgYXBwIDFcblxuIyMjIFdoYXQgaXMgdGhpcz9cblxuVGhpcyBpcyBhIGZpcnN0IGF0dGVtcHQgYXR0IGNyZWF0aW5nIGFuIGFwcCB1c2luZyBQb2x2by4gSSdtIG5vdCBzdXJlIGl0J3MgdGhlIHJvYWQgdG8gZ28gYnV0IGl0IGxvb2tzIG5lYXQgYXMgaGVsbC5cblxuIyMjIERlcGVuZGVuY2llc1xuXHRHTCA9IHJlcXVpcmUgJ2FwcC9nbCdcblxuIyMjIFN0YXJ0IHRoZSBhcHBsaWNhdGlvblxuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJET01Db250ZW50TG9hZGVkXCIsIC0+XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciBcIkRPTUNvbnRlbnRMb2FkZWRcIiwgdGhpc1xuXG5cdFx0bG9hZFNoYWRlcnMgPSAtPlxuXHRcdFx0Y29uc29sZS5sb2cgJ1N0YXJ0aW5nIHRvIGxvYWQgc2hhZGVycy4nXG5cdFx0XHRmcmFnbWVudFNoYWRlclNvdXJjZVx0PVxuXHRcdFx0dmVydGV4U2hhZGVyU291cmNlXHRcdD0gdW5kZWZpbmVkO1xuXG5cdFx0XHRuZXcgbWljcm9BamF4ICcuL2ZTaGFkZXIuYycsICggcmVzb3VyY2UgKSAtPlxuXHRcdFx0XHRjb25zb2xlLmxvZyAnRnJhZ21lbnQgc2hhZGVyIGxvYWRlZC4nXG5cdFx0XHRcdGZyYWdtZW50U2hhZGVyU291cmNlID0gcmVzb3VyY2VcblxuXHRcdFx0bmV3IG1pY3JvQWpheCAnLi92U2hhZGVyLmMnLCAoIHJlc291cmNlICkgLT5cblx0XHRcdFx0Y29uc29sZS5sb2cgJ1ZlcnRleCBzaGFkZXIgbG9hZGVkLidcblx0XHRcdFx0dmVydGV4U2hhZGVyU291cmNlID0gcmVzb3VyY2VcblxuXHRcdFx0c2hhZGVyTG9hZGluZ0xvb3AgPSAtPlxuXHRcdFx0XHRzaGFkZXJMb2FkaW5nVGltZXIgPSBzZXRJbnRlcnZhbCAtPlxuXHRcdFx0XHRcdGlmIGZyYWdtZW50U2hhZGVyU291cmNlIGFuZCB2ZXJ0ZXhTaGFkZXJTb3VyY2Vcblx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCBzaGFkZXJMb2FkaW5nVGltZXJcblx0XHRcdFx0XHRcdHN0YXJ0R0wgZnJhZ21lbnRTaGFkZXJTb3VyY2UsIHZlcnRleFNoYWRlclNvdXJjZVxuXHRcdFx0XHRcdFx0IyggZ2wuZmV0Y2hTaGFkZXJGcm9tRWxlbWVudCAnc2hhZGVyLWZzJyApLCAoIGdsLmZldGNoU2hhZGVyRnJvbUVsZW1lbnQgJ3NoYWRlci12cycgKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHNoYWRlckxvYWRpbmdMb29wKClcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nICdTdGlsbCBubyBzaGFkZXJzIGxvYWRlZC4uLidcblx0XHRcdFx0LCAxMDAwXG5cblx0XHRcdHNoYWRlckxvYWRpbmdMb29wKClcblxuXHRcdHN0YXJ0R0wgPSAoIGZyYWdtZW50U2hhZGVyU291cmNlLCB2ZXJ0ZXhTaGFkZXJTb3VyY2UgKSAtPlxuXHRcdFx0Z2wgPSBuZXcgR0wgJ2xlc3NvbjAxLWNhbnZhcydcblx0XHRcdGdsLmNyZWF0ZVNoYWRlclByb2dyYW0gZnJhZ21lbnRTaGFkZXJTb3VyY2UsIHZlcnRleFNoYWRlclNvdXJjZVxuXHRcdFx0dHJpYW5nbGUgPSBnbC5jcmVhdGVNZXNoIFtcblx0XHRcdFx0XHQgMC4wLCAgMS4wLFx0IDAuMFxuXHRcdFx0XHRcdC0xLjAsIC0xLjAsICAwLjBcblx0XHRcdFx0XHQgMS4wLCAtMS4wLCAgMC4wXG5cdFx0XHRcdF0sIDMsIDMsIFtcblx0ICAgICAgICBcdFx0MS4wLCAwLjAsIDAuMCwgMS4wLFxuXHQgICAgICAgIFx0XHQwLjAsIDEuMCwgMC4wLCAxLjAsXG5cdCAgICAgICAgXHRcdDAuMCwgMC4wLCAxLjAsIDEuMFxuXHQgICAgXHRcdF0sIDQsIDMsIFstMS41LDAuMCwtNy4wXVxuXHRcdFx0c3F1YXJlID0gZ2wuY3JlYXRlTWVzaCBbXG5cdFx0XHRcdFx0IDEuMCwgIDEuMCxcdCAwLjBcblx0XHRcdFx0XHQtMS4wLCAgMS4wLCAgMC4wXG5cdFx0XHRcdFx0IDEuMCwgLTEuMCwgIDAuMFxuXHRcdFx0XHRcdC0xLjAsICAxLjAsICAwLjBcblx0XHRcdFx0XHQtMS4wLCAtMS4wLCAgMC4wXG5cdFx0XHRcdFx0IDEuMCwgLTEuMCwgIDAuMFxuXHRcdFx0XHRdLCAzLCA2LCBbXG5cdCAgICAgICAgXHRcdDEuMCwgMC4wLCAwLjAsIDEuMCxcblx0ICAgICAgICBcdFx0MC4wLCAxLjAsIDAuMCwgMS4wLFxuXHQgICAgICAgIFx0XHQwLjAsIDAuMCwgMS4wLCAxLjBcblx0ICAgICAgICBcdFx0MC4wLCAxLjAsIDAuMCwgMS4wLFxuXHQgICAgICAgIFx0XHQxLjAsIDEuMCwgMC4wLCAxLjAsXG5cdCAgICAgICAgXHRcdDAuMCwgMC4wLCAxLjAsIDEuMFxuXHQgICAgXHRcdF0sIDQsIDYsIFsxLjUsIDAuMCwtNy4wXVxuXHRcdFx0Z2wuZHJhd1NjZW5lIFt0cmlhbmdsZSwgc3F1YXJlXVxuXG5cdFx0bG9hZFNoYWRlcnMoKVxuXG5cdCwgZmFsc2VcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQyxJQUFBLEVBQUE7O0FBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxRQUFSLENBQUwsQ0FBQTs7QUFBQSxRQUlRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFNBQUEsR0FBQTtBQUM3QyxNQUFBLG9CQUFBO0FBQUEsRUFBQSxRQUFRLENBQUMsbUJBQVQsQ0FBNkIsa0JBQTdCLEVBQWlELElBQWpELENBQUEsQ0FBQTtBQUFBLEVBRUEsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNiLFFBQUEsMkRBQUE7QUFBQSxJQUFBLE9BQU8sQ0FBQyxH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LEdBTlIsRUFNYSxHQU5iLENBUEQsRUFjRixDQWRFLEVBY0MsQ0FkRCxFQWNJLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVSxDQUFBLEdBQVYsQ0FkSixDQVhULENBQUE7V0EwQkEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxDQUFDLFFBQUQsRUFBVyxNQUFYLENBQWIsRUEzQlM7RUFBQSxDQTVCVixDQUFBO1NBeURBLFdBQUEsQ0FBQSxFQTFENkM7QUFBQSxDQUE5QyxFQTRERSxLQTVERixDQUpBLENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6NDAyMCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9hcHAvZ2wubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkEgVHJpYW5nbGUgYW5kIGEgU3F1YXJlXG49PT09PT09PT09PT09PT09PT09PT09PVxuXG5XaGF0IGlzIHRoaXM/XG4tLS0tLS0tLS0tLS0tXG5cblRoaXMgaXMgeWV0IGFub3RoZXIgYXR0ZW1wdCB0byBnZXQgc3RhcnRlZCB3aXRoIFdlYkdMIHByb2dyYW1taW5nIHVzaW5nIENvZmZlZVNjcmlwdC4gVGhlIGNob2ljZSBvZiB1c2luZ1xubGl0ZXJhdGUgQ29mZmVlU2NyaXB0IGlzIGJlY2F1c2UgSSBoYXZlIGJlZW4gY3VyaW91cyBhYm91dCBob3cgZWZmZWN0aXZlIGl0IGNhbiBhY3R1YWxseSBiZSB0byB1c2UgcHJvc2VcbndoaWxlIGZvcm11bGF0aW5nIHRoZSBzb2Z0d2FyZS4gQWZ0ZXIgYWxsIHRoZSBsYXJnZXIgcGFydCBvZiB0aGUgdGltZSBjb2RpbmcgaXMgdXN1YWxseSB0YWtlbiBieSBoYW1tZXJpbmdcbm91dCB0aGUgbWV0aG9kIHJhdGhlciB0aGVuIGFjdHVhbGx5IGNvZGluZyBpdC5cblxuVGhlIHByb2dyYW1cbi0tLS0tLS0tLS0tXG5cblRoaXMgaXMgYW4gT09QIGFwcHJvYWNoIHRvIHRoZSBUcmlhbmdsZSBhbmQgU3F1YXJlIHR1dG9yaWFsLiBUaGlzIHdheSBsZXNzIHN0dWZmIHdpbGwgaGF2ZSB0byBiZSBtb3ZlZCBhcm91bmQgYmV0d2VlblxudGhlIG1ldGhvZHMgYW5kIGhvcGVmdWxseSBpdCB3aWxsIGFsc28gaGVscCBpbiB0aGUgdGFzayBvZiBwdXR0aW5nIHN0dWZmIHdoZXJlIGl0IGJlbG9uZ3MuXG5cbiMjIyBEZXBlbmRlbmNpZXNcblxuXHRNZXNoID0gcmVxdWlyZSAnYXBwL21lc2gnXG5cblxuIyMjIDxhIG5hbWU9XCJ0aGUtY2xhc3NcIj48L2E+R0xcbkZpcnN0IHdlIG5lZWQgdGhlIGNsYXNzIGl0c2VsZi4gSSB3aWxsIGNhbGwgaXQgR0wgYXQgdGhlIG1vbWVudCBhbmQgc2VlIGlmIHRoYXQgc3RpY2tzLlxuXG5cdG1vZHVsZS5leHBvcnRzID0gY2xhc3MgR0xcblxuIyMjIyA8YSBuYW1lPVwiY29uc3RydWN0b3JcIj48L2E+Q29uc3RydWN0b3JcblRoZSBjb25zdHJ1Y3RvciBuZWVkIHRoZSBlbGVtZW50IGlkIG9mIHRoZSBjYW52YXMgdGFnIHdoZXJlIHdlIHNob3VsZCByZW5kZXIgb3VyIE9wZW5HTFxuc2NlbmUuXG5cblx0XHRjb25zdHJ1Y3RvcjogKCBjYW52YXNFbGVtZW50SWQgKSAtPlxuXG5HZXQgdGhlIGVsZW1lbnQgYW5kIGtlZXAgYSByZWZlcmVuY2UgdG8gaXQgYXMgYSBtZW1iZXIuIEl0IHdpbGwgY29tZSBpbiBoYW5keSBmcm9tIHRpbWUgdG8gdGltZS5cblxuXHRcdFx0QF9jYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgY2FudmFzRWxlbWVudElkXG5cbkdldCB0aGUgY29udGV4dCBvZiB0aGUgY2FudmFzIHVzaW5nIHRoZSBgZXhwZXJpbWVudGFsLXdlYmdsYCBhcmd1bWVudC4gVGhlcmUgbWlnaHQgYmUgc29tZXRoaW5nIGxpa2UgYHdlYmdsYCB0aGF0IGNvdWxkXG53b3JrIGJ1dCB0aGlzIHdvcmtzIGFuZCB3aWxsIGhhdmUgdG8gZG8gZm9yIG5vdy4gVGhpcyBtaWdodCB0aHJvdyBhbiBleGNlcHRpb24gYW5kIHdlIGhhdmUgdG8gY2F0Y2ggdGhhdC4gSXQgbWlnaHQgYmVcbmJldHRlciB0byBqdXN0IGxldCB0aGUgZXhjZXB0aW9uIGZhbGwgdGhyb3VnaCBidXQgdGhpcyB3YXkgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSBjYW4gYmUgc2hvd24uIEkgd2lsbCBzdGlsbCB0aHJvdyB0aGVcbmV4Y2VwdGlvbiBidXQgbm93IEkgY2FuIGNvdXBsZSBpdCB3aXRoIGEgY29uc29sZSBsaW5lIHRvIG1ha2Ugc3VyZSBJIGtub3cgd2h5IHRoZSBwcm9ncmFtIGhhbHRlZC5cblxuXHRcdFx0dHJ5XG5cdFx0XHRcdEBfZ2wgPSBAX2NhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dCAnZXhwZXJpbWVudGFsLXdlYmdsJ1xuXHRcdFx0Y2F0Y2ggZXJyb3Jcblx0XHRcdFx0Y29uc29sZS5sb2cgJ0ZhaWxlZCB0byBpbml0aWFsaXplIFdlYkdMIHVzaW5nIHRoZSBlbGVtZW50ICcgKyBjYW52YXMgKyAnLiBFcnJvcjpcXG4nICsgZXJyb3Jcblx0XHRcdFx0dGhyb3cgZXJyb3JcblxuSSBzdGljayB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgY2FudmFzIGVsZW1lbnQgdG8gdGhlIGNvbnRleHQgb2JqZWN0LlxuXG5cdFx0XHRAX2dsLnZpZXdwb3J0V2lkdGggPSBAX2NhbnZhc0VsZW1lbnQud2lkdGhcblx0XHRcdEBfZ2wudmlld3BvcnRIZWlnaHQgPSBAX2NhbnZhc0VsZW1lbnQuaGVpZ2h0XG5cbkNsZWFyIHRoZSBidWZmZXIgYW5kIGVuYWJsZSBkZXB0aCB0ZXN0aW5nXG5cblx0XHRcdEBfZ2wuY2xlYXJDb2xvciAwLjAsIDAuMCwgMC4wLCAxLjBcblx0XHRcdEBfZ2wuZW5hYmxlIEBfZ2wuREVQVEhfVEVTVFxuXG5cbiMjIyMgPGEgbmFtZT1cImZldGNoU2hhZGVyRnJvbUVsZW1lbnRcIj48L2E+ZmV0Y2hTaGFkZXJGcm9tRWxlbWVudFxuVGhlIHNoYWRlcnMgYXJlIGN1cnJlbnRseSBsb2NhdGVkIGluIHRoZWlyIG93biBgPHNjcmlwdD5gIHRhZ3MgaW4gdGhlIEhUTUwuIFRvIGZhY2lsaXRhdGUgdGhlIHN3YXAgdG8gZXh0ZXJuYWwgZmlsZXMgb3JcbmFueSBvdGhlciBtZXRob2Qgb2YgcmV0cmVpdmluZyB0aGVzZSBJIGNyZWF0ZSBhIG1ldGhvZCBmb3IgZmV0Y2hpbmcgdGhlIHNoYWRlcnMuIFRoaXMgY2FuIGxhdGVyIGJlIHJlcGxhY2VkIGJ5IGFueVxub3RoZXIgbWVhbnMgb2YgbG9hZGluZyB0aGUgc2hhZGVyIGNvZGUuXG5cblx0XHRmZXRjaFNoYWRlckZyb21FbGVtZW50OiAoIHNoYWRlckVsZW1lbnRJZCApIC0+XG5cdFx0XHRzaGFkZXJTY3JpcHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCBzaGFkZXJFbGVtZW50SWRcblxuSWYgdGhlIGdpdmVuIGVsZW1lbnQgZG9lc24ndCBleGlzdCB3ZSBzdG9wIHRoZSBleGVjdXRpb24gc3RyYWlnaHQgYXdheS4gU2FtZSB0aGluZyBpZiBpdCdzIG5vdCBhIHNoYWRlciBlbGVtZW50LiAoSXRcbnNob3VsZCBiZSBhIHNjcmlwdCB0YWcgd2l0aCB0aGUgcHJvcGVyIHR5cGUuKVxuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IgJ05vIHNoYWRlciB3aXRoIGlkOiAnICsgc2hhZGVyRWxlbWVudElkIHVubGVzcyBzaGFkZXJTY3JpcHRcblx0XHRcdHRocm93IG5ldyBFcnJvciAnTm90IGEgc2hhZGVyIGVsZW1lbnQ6ICcgKyBzaGFkZXJFbGVtZW50IHVubGVzcyBzaGFkZXJTY3JpcHQudHlwZSA9PSAneC1zaGFkZXIveC1mcmFnbWVudCcgb3Igc2hhZGVyU2NyaXB0LnR5cGUgPT0gJ3gtc2hhZGVyL3gtdmVydGV4J1xuXG5UaGUgc2hhZGVyIGNvZGUgaXMganVzdCB0ZXh0IHNvIHdlIGNhbiBqdXN0IHRyYXZlcnNlIHRocm91Z2ggdGhlIGVsZW1lbnQgYW5kIGdsdWUgdG9nZXRoZXIgYWxsIG5vZGVzIHdpdGggbm9kZVR5cGUgM1xuKHRleHQgbm9kZXMpIHRvIGEgY29tYmluZWQgc3RyaW5nIHdpdGggdGhlIHNoYWRlciBjb2RlIGluIGl0LlxuX05PVEU6XyBUaGlzIG1pZ2h0IG5vdCBiZSB0aGUgYmVzdCB3YXkgdG8gZG8gdGhpcy4gSSB0aGluayBJIGNhbiBhY3R1YWxseSB1c2UgZWl0aGVyIHRoZVxudGV4dENvbnRlbnQgb3IgdGhlIGlubmVySFRNTCBwcm9wZXJ0aWVzLiBJJ2xsIHRyeSB0aGF0IGxhdGVyLlxuXG5cdFx0XHRzaGFkZXJDb2RlID0gXCJcIlxuXHRcdFx0Y3VycmVudFNjcmlwdE5vZGUgPSBzaGFkZXJTY3JpcHQuZmlyc3RDaGlsZFxuXG5cdFx0XHR3aGlsZSBjdXJyZW50U2NyaXB0Tm9kZVxuXHRcdFx0XHRzaGFkZXJDb2RlICs9IGN1cnJlbnRTY3JpcHROb2RlLnRleHRDb250ZW50IGlmIGN1cnJlbnRTY3JpcHROb2RlLm5vZGVUeXBlID09IDNcblx0XHRcdFx0Y3VycmVudFNjcmlwdE5vZGUgPSBjdXJyZW50U2NyaXB0Tm9kZS5uZXh0U2libGluZ1xuXG5cdFx0XHRyZXR1cm4gc2hhZGVyQ29kZTtcblxuIyMjIyA8YSBuYW1lPVwiY29tcGlsZVNoYWRlclwiPjwvYT5jb21waWxlU2hhZGVyXG5UbyB1c2UgdGhlIHNoYWRlcnMgdGhleSB3aWxsIGhhdmUgdG8gYmUgY29tcGlsZWQuIFRoaXMgdXRpbGl0eSBtZXRob2QgZG9lcyBqdXN0IHRoYXQuIFRoZSBzZWNvbmQgcGFyYW1ldGVyIHdpbGwgZ2l2ZVxudGhlIHR5cGUgb2Ygc2hhZGVyIHRvIGNyZWF0ZS4gQ3VycmVudGx5IHRoZXJlIGlzIG5vIG1lY2hhbmlzbSB0byBtYXRjaCB0aGUgc2hhZGVyIGNvZGUgdG8gdGhlIHNoYWRlciB0eXBlLiBFeHRyYWN0aW5nXG5hIHNoYWRlciBjbGFzcyBmcm9tIHRoaXMgaXMgcHJvYmFibHkgdGhlIHdheSB0byBnby4gTGF0ZXIuLi5cblxuXHRcdGNvbXBpbGVTaGFkZXI6ICggc2hhZGVyQ29kZSwgc2hhZGVyVHlwZSApIC0+XG5cdFx0XHRzaGFkZXIgPSBAX2dsLmNyZWF0ZVNoYWRlciBzaGFkZXJUeXBlXG5cblx0XHRcdEBfZ2wuc2hhZGVyU291cmNlIHNoYWRlciwgc2hhZGVyQ29kZVxuXHRcdFx0QF9nbC5jb21waWxlU2hhZGVyIHNoYWRlclxuXG5BZnRlciBjb21waWxhdGlvbiB3ZSBjYW4gY2hlY2sgdGhlIGNvbXBpbGUgc3RhdHVzIHBhcmFtZXRlciBvZiB0aGUgc2hhZGVyIHRvIG1ha2Ugc3VyZSBldmVyeXRoaW5nIHdlbnQgYWxsIHJpZ2h0LlxuT3RoZXJ3aXNlIHdlIHRocm93IGFuIGV4Y2VwdGlvbiBhcyB0aGVyZSBpcyBjdXJyZW50bHkgbm8gcmVhbCBwb2ludCBpbiBjb250aW51aW5nIGV4ZWN1dGlvbiBpZiBhIHNoYWRlciBjb21waWxhdGlvblxuZmFpbHMuXG5cblx0XHRcdHVubGVzcyBAX2dsLmdldFNoYWRlclBhcmFtZXRlciBzaGFkZXIsIEBfZ2wuQ09NUElMRV9TVEFUVVNcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yIEBfZ2wuZ2V0U2hhZGVySW5mb0xvZ1xuXG5cdFx0XHRyZXR1cm4gc2hhZGVyXG5cbiMjIyMgPGEgbmFtZT1cImluaXRTaGFkZXJzXCI+PC9hPmluaXRTaGFkZXJzXG5UaGlzIG1ldGhvZCB0YWtlcyBjYXJlIG9mIGxvYWRpbmcgYW5kIGNvbXBpbGluZyB0aGUgZnJhZ21lbnQgYW5kIHZlcnRleCBzaGFkZXJzLlxuXG5cdFx0aW5pdFNoYWRlcnM6ICggZnJhZ21lbnRTaGFkZXJFbGVtZW50SWQsIHZlcnRleFNoYWRlckVsZW1lbnRJZCApIC0+XG5cdFx0XHRAX2ZyYWdtZW50U2hhZGVyID0gQGNvbXBpbGVTaGFkZXIgKCBAZmV0Y2hTaGFkZXJGcm9tRWxlbWVudCBmcmFnbWVudFNoYWRlckVsZW1lbnRJZCApLCBAX2dsLkZSQUdNRU5UX1NIQURFUlxuXHRcdFx0QF92ZXJ0ZXhTaGFkZXIgPSBAY29tcGlsZVNoYWRlciAoIEBmZXRjaFNoYWRlckZyb21FbGVtZW50IHZlcnRleFNoYWRlckVsZW1lbnRJZCApLCBAX2dsLlZFUlRFWF9TSEFERVJcblxuIyMjIyA8YSBuYW1lPVwiY3JlYXRlU2hhZGVyUHJvZ3JhbVwiPjwvYT5jcmVhdGVTaGFkZXJQcm9ncmFtXG5IZXJlIHdlIGNvbWJpbmUgdGhlIGZyYWdtZW50IGFuZCB2ZXJ0ZXggc2hhZGVyIHRvIGEgc2hhZGVyIHByb2dyYW0uIFRoaXMgaXMgZG9uZSBieSBmaXJzdCBjcmVhdGluZyB0aGUgc2hhZGVyIHByb2dyYW1cbml0c2VsZiBhbmQgYXR0YWNoaW5nIHRoZSBzaGFkZXJzIHRvIGl0LlxuXG5cdFx0Y3JlYXRlU2hhZGVyUHJvZ3JhbTogKCBmcmFnbWVudFNoYWRlclNvdXJjZSwgdmVydGV4U2hhZGVyU291cmNlICkgLT5cblx0XHRcdEBfc2hhZGVyUHJvZ3JhbSA9IEBfZ2wuY3JlYXRlUHJvZ3JhbSgpXG5cdFx0XHRAX2dsLmF0dGFjaFNoYWRlciBAX3NoYWRlclByb2dyYW0sIEBjb21waWxlU2hhZGVyIGZyYWdtZW50U2hhZGVyU291cmNlLCBAX2dsLkZSQUdNRU5UX1NIQURFUlxuXHRcdFx0QF9nbC5hdHRhY2hTaGFkZXIgQF9zaGFkZXJQcm9ncmFtLCBAY29tcGlsZVNoYWRlciB2ZXJ0ZXhTaGFkZXJTb3VyY2UsIEBfZ2wuVkVSVEVYX1NIQURFUlxuXG5UaGVuIHdlIGxpbmsgdGhlIHNoYWRlciBwcm9ncmFtLiBJZiBhbnl0aGluZyBnb2VzIHdyb25nIHdoaWxlIGxpbmtpbmcgd2UgdGhyb3cgYW4gZXhjZXB0aW9uLlxuXG5cdFx0XHRAX2dsLmxpbmtQcm9ncmFtIEBfc2hhZGVyUHJvZ3JhbVxuXHRcdFx0dW5sZXNzIEBfZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlciBAX3NoYWRlclByb2dyYW0sIEBfZ2wuTElOS19TVEFUVVNcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yICdDb3VsZCBub3QgaW5pdGlhbGl6ZSBzaGFkZXJzLidcblxuSW5zdHJ1Y3QgdGhlIEdMIGNvbnRleHQgdG8gdXNlIHRoZSBzaGFkZXIgcHJvZ3JhbS5cblxuXHRcdFx0QF9nbC51c2VQcm9ncmFtIEBfc2hhZGVyUHJvZ3JhbVxuXG5TdG9yZSByZWZlcmVuY2VzIHRvIHRoZSB2YXJpYWJsZXMgaW4gdGhlIHNoYWRlcnMgdGhhdCBzaG91bGQgYmUgYXZhaWxhYmxlIGZvciB1cyB0byBtYW5pcHVsYXRlIGxhdGVyLlxuXG5cdFx0XHRAX3NoYWRlclByb2dyYW0udmVydGV4UG9zaXRpb25BdHRyaWJ1dGUgPSBAX2dsLmdldEF0dHJpYkxvY2F0aW9uIEBfc2hhZGVyUHJvZ3JhbSwgJ2FWZXJ0ZXhQb3NpdGlvbidcblx0XHRcdEBfZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgQF9zaGFkZXJQcm9ncmFtLnZlcnRleFBvc2l0aW9uQXR0cmlidXRlXG5cblx0XHRcdEBfc2hhZGVyUHJvZ3JhbS52ZXJ0ZXhDb2xvckF0dHJpYnV0ZSA9IEBfZ2wuZ2V0QXR0cmliTG9jYXRpb24gQF9zaGFkZXJQcm9ncmFtLCAnYVZlcnRleENvbG9yJ1xuXHRcdFx0QF9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSBAX3NoYWRlclByb2dyYW0udmVydGV4Q29sb3JBdHRyaWJ1dGVcblxuXHRcdFx0QF9zaGFkZXJQcm9ncmFtLnBNYXRyaXhVbmlmb3JtID0gQF9nbC5nZXRVbmlmb3JtTG9jYXRpb24gQF9zaGFkZXJQcm9ncmFtLCAndVBNYXRyaXgnXG5cdFx0XHRAX3NoYWRlclByb2dyYW0ubXZNYXRyaXhVbmlmb3JtID0gQF9nbC5nZXRVbmlmb3JtTG9jYXRpb24gQF9zaGFkZXJQcm9ncmFtLCAndU1WTWF0cml4J1xuXG4jIyMjIDxhIG5hbWU9XCJzZXRNYXRyaXhVbmlmb3Jtc1wiPjwvYT5zZXRNYXRyaXhVbmlmb3Jtc1xuVXRpbGl0eSB0byBzZXQgdGhlIG1hdHJpeCB1bmlmb3Jtcy5cbl9OT1RFOl8gTm90IHN1cmUgdGhhdCB3ZSBuZWVkIHRvIHNldCB0aGUgcHJvamVjdGlvbiBtYXRyaXggZXZlcnkgdGltZSB0aGF0IHdlIHVwZGF0ZSB0aGUgdmlldyBtYXRyaXguXG5cblx0XHRzZXRNYXRyaXhVbmlmb3JtczogKCBtdk1hdHJpeCwgcE1hdHJpeCApIC0+XG5cdFx0XHRAX2dsLnVuaWZvcm1NYXRyaXg0ZnYgQF9zaGFkZXJQcm9ncmFtLnBNYXRyaXhVbmlmb3JtLCBmYWxzZSwgcE1hdHJpeFxuXHRcdFx0QF9nbC51bmlmb3JtTWF0cml4NGZ2IEBfc2hhZGVyUHJvZ3JhbS5tdk1hdHJpeFVuaWZvcm0sIGZhbHNlLCBtdk1hdHJpeFxuXG4jIyMjIDxhIG5hbWU9XCJjcmVhdGVNZXNoXCI+PC9hPmNyZWF0ZU1lc2hcblV0aWxpdHkgdG8gY3JlYXRlIGEgbWVzaC5cblxuXHRcdGNyZWF0ZU1lc2g6ICggdmVydGljZXMsIHZlcnRleFNpemUsIG51bVZlcnRpY2VzLCBjb2xvcnMsIGNvbG9yU2l6ZSwgbnVtQ29sb3JzLCBwb3NpdGlvbiApIC0+XG5cdFx0XHR2ZXJ0ZXhCdWZmZXIgPSBAX2dsLmNyZWF0ZUJ1ZmZlcigpXG5cdFx0XHRAX2dsLmJpbmRCdWZmZXIgQF9nbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlclxuXHRcdFx0QF9nbC5idWZmZXJEYXRhIEBfZ2wuQVJSQVlfQlVGRkVSLCAoIG5ldyBGbG9hdDMyQXJyYXkgdmVydGljZXMgKSwgQF9nbC5TVEFUSUNfRFJBV1xuXG5cdFx0XHRjb2xvckJ1ZmZlciA9IEBfZ2wuY3JlYXRlQnVmZmVyKClcblx0XHRcdEBfZ2wuYmluZEJ1ZmZlciBAX2dsLkFSUkFZX0JVRkZFUiwgY29sb3JCdWZmZXJcblx0XHRcdEBfZ2wuYnVmZmVyRGF0YSBAX2dsLkFSUkFZX0JVRkZFUiwgKCBuZXcgRmxvYXQzMkFycmF5IGNvbG9ycyApLCBAX2dsLlNUQVRJQ19EUkFXXG5cblx0XHRcdHJldHVybiBuZXcgTWVzaCB2ZXJ0ZXhCdWZmZXIsIHZlcnRleFNpemUsIG51bVZlcnRpY2VzLCBjb2xvckJ1ZmZlciwgY29sb3JTaXplLCBudW1Db2xvcnMsIHBvc2l0aW9uXG5cblxuIyMjIyA8YSBuYW1lPVwiZHJhd1NjZW5lXCI+PC9hPmRyYXdTY2VuZVxuRmluYWxseSBpdCdzIHRpbWUgZm9yIHJlbmRlcmluZyB0aGUgc2NlbmUuXG5cblx0XHRkcmF3U2NlbmU6ICggbWVzaGVzICkgLT5cblxuU2V0IHVwIHRoZSB2aWV3cG9ydCBhbmQgY2xlYXIgaXQuXG5cblx0XHRcdEBfZ2wudmlld3BvcnQgMCwgMCwgQF9nbC52aWV3cG9ydFdpZHRoLCBAX2dsLnZpZXdwb3J0SGVpZ2h0XG5cdFx0XHRAX2dsLmNsZWFyIEBfZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IEBfZ2wuREVQVEhfQlVGRkVSX0JJVFxuXG5Jbml0aWFsaXplIHRoZSBwZXJzcGVjdGl2ZSBtYXRyaXguXG5cblx0XHRcdEBfcE1hdHJpeCA9IG1hdDQuY3JlYXRlKClcblx0XHRcdG1hdDQucGVyc3BlY3RpdmUgQF9wTWF0cml4LCA0NSwgQF9nbC52aWV3cG9ydFdpZHRoIC8gQF9nbC52aWV3cG9ydEhlaWdodCwgMC4xLCAxMDAuMCwgQF9wTWF0cml4XG5cbkluaXRpYWxpemUgdGhlIHZpZXcgbWF0cml4LlxuXG5cdFx0XHRAX212TWF0cml4ID0gbWF0NC5jcmVhdGUoKVxuXG5cdFx0XHRmb3IgbWVzaCBpbiBtZXNoZXNcblx0XHRcdFx0bWF0NC50cmFuc2xhdGUgQF9tdk1hdHJpeCwgbWF0NC5jcmVhdGUoKSwgbWVzaC5wb3NpdGlvblxuXHRcdFx0XHRAX2dsLmJpbmRCdWZmZXIgQF9nbC5BUlJBWV9CVUZGRVIsIG1lc2gudmVydGV4QnVmZmVyXG5cdFx0XHRcdEBfZ2wudmVydGV4QXR0cmliUG9pbnRlciBAX3NoYWRlclByb2dyYW0udmVydGV4UG9zaXRpb25BdHRyaWJ1dGUsIG1lc2gudmVydGV4U2l6ZSwgQF9nbC5GTE9BVCwgZmFsc2UsIDAsIDBcblx0XHRcdFx0QF9nbC5iaW5kQnVmZmVyIEBfZ2wuQVJSQVlfQlVGRkVSLCBtZXNoLmNvbG9yQnVmZmVyXG5cdFx0XHRcdEBfZ2wudmVydGV4QXR0cmliUG9pbnRlciBAX3NoYWRlclByb2dyYW0udmVydGV4Q29sb3JBdHRyaWJ1dGUsIG1lc2guY29sb3JTaXplLCBAX2dsLkZMT0FULCBmYWxzZSwgMCwgMFxuXHRcdFx0XHRAc2V0TWF0cml4VW5pZm9ybXMgQF9tdk1hdHJpeCwgQF9wTWF0cml4XG5cdFx0XHRcdEBfZ2wuZHJhd0FycmF5cyBAX2dsLlRSSUFOR0xFUywgMCwgbWVzaC5udW1WZXJ0aWNlc1xuXG5cbkhlcmUgaXMgYSBxdWljayBhbmQgZGlydHkgZnVuY3Rpb24gdG8gdGVzdCBvdXQgdGhlIGNsYXNzIGFib3ZlIGJ5IHNldHRpbmcgdXAgdGhlIEdMIG9iamVjdCBhbmQgcmVuZGVyIGEgc2luZ2xlIGZyYW1lXG5vZiB0aGUgc2NlbmUuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUJDLElBQUEsUUFBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFVBQVIsQ0FBUCxDQUFBOztBQUFBLE1BTU0sQ0FBQyxPQUFQLEdBQXVCO0FBTVQsRUFBQSxZQUFFLGVBQUYsR0FBQTtBQUlaLFFBQUEsS0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsZUFBeEIsQ0FBbEIsQ0FBQTtBQU9BO0FBQ0MsTUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUMsQ0FBQSxjQUFjLENBQUMsVUFBaEIsQ0FBMkIsb0JBQTNCLENBQVAsQ0FERDtLQUFBLGNBQUE7QUFHQyxNQURLLGNBQ0wsQ0FBQTtBQUFBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwrQ0FBQSxHQUFrRCxNQUFsRCxHQUEyRCxZQUEzRCxHQUEwRSxLQUF0RixDQUFBLENBQUE7QUFDQSxZQUFNLEtBQU4sQ0FKRDtLQVBBO0FBQUEsSUFlQSxJQUFDLENBQUEsR0FBRyxDQUFDLGFBQUwsR0FBcUIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxLQWZyQyxDQUFBO0FBQUEsSUFnQkEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLEdBQXNCLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFoQnRDLENBQUE7QUFBQSxJQW9CQSxJQUFDLENBQUEsR0FBRyxDQUFDLFVBQUwsQ0FBZ0Is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O0FBQUE7b0JBaEJVO0VBQUEsQ0EzSVgsQ0FBQTs7WUFBQTs7SUFaRCxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQxMzcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL21lc2gubGl0Y29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk1lc2hcbj09PT1cblxuXG5cdG1vZHVsZS5leHBvcnRzID0gY2xhc3MgTWVzaFxuXHRcdGNvbnN0cnVjdG9yOiAoIEB2ZXJ0ZXhCdWZmZXIsIEB2ZXJ0ZXhTaXplLCBAbnVtVmVydGljZXMsIEBjb2xvckJ1ZmZlciwgQGNvbG9yU2l6ZSwgQG51bUNvbG9ycywgQHBvc2l0aW9uICkgLT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUMsSUFBQSxJQUFBOztBQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ1QsRUFBQSxjQUFHLFlBQUgsRUFBa0IsVUFBbEIsRUFBK0IsV0FBL0IsRUFBNkMsV0FBN0MsRUFBMkQsU0FBM0QsRUFBdUUsU0FBdkUsRUFBbUYsUUFBbkYsR0FBQTtBQUErRixJQUE3RixJQUFDLENBQUEsZUFBQSxZQUE0RixDQUFBO0FBQUEsSUFBOUUsSUFBQyxDQUFBLGFBQUEsVUFBNkUsQ0FBQTtBQUFBLElBQWpFLElBQUMsQ0FBQSxjQUFBLFdBQWdFLENBQUE7QUFBQSxJQUFuRCxJQUFDLENBQUEsY0FBQSxXQUFrRCxDQUFBO0FBQUEsSUFBckMsSUFBQyxDQUFBLFlBQUEsU0FBb0MsQ0FBQTtBQUFBLElBQXpCLElBQUMsQ0FBQSxZQUFBLFNBQXdCLENBQUE7QUFBQSxJQUFiLElBQUMsQ0FBQSxXQUFBLFFBQVksQ0FBL0Y7RUFBQSxDQUFiOztjQUFBOztJQURELENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6NDE1NiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9hcHAvdXNlci5saXRjb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiVXNlclxuPT09PVxuXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBVc2VyXG5cdFx0Y29uc3RydWN0b3I6ICggQG5hbWUgKSAtPlxuXG5cdFx0aGVsbG86IC0+XG5cdFx0XHRhbGVydCBcIkhlbGxvIGZyb20gXCIgKyBAbmFtZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQyxJQUFBLElBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDVCxFQUFBLGNBQUcsSUFBSCxHQUFBO0FBQVcsSUFBVCxJQUFDLENBQUEsT0FBQSxJQUFRLENBQVg7RUFBQSxDQUFiOztBQUFBLGlCQUVBLEtBQUEsR0FBTyxTQUFBLEdBQUE7V0FDTixLQUFBLENBQU0sYUFBQSxHQUFnQixJQUFDLENBQUEsSUFBdkIsRUFETTtFQUFBLENBRlAsQ0FBQTs7Y0FBQTs7SUFERCxDQUFBIn19XX0=
*/})()