/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, indent:2, maxerr:50 */

/**
 * @namespace The CookieBin namespace holds the functionality to manage
 * cookies.
 *
 * <p>CookieBin is a small (2k minified) javascript library to store,
 * retrieve and delete cookies in the web browser. It is a stand alone
 * library, but can be used in conjunction with any javascript
 * framework.</p>
 *
 * <p>Where JSON support is available, it allows the user to store
 * and retrieve complex objects or arrays using cookies.</p>
 *
 * @author <a href="mailto:acornejo@gmail.com">Alex Cornejo</a>
 * @version 1.0
 * @export
 */
var CookieBin = (function () {
  'use strict';
  var defaultOptions = {
      expires: null,
      path: '/',
      domain: null,
      secure: false
    };

  var isnumber = /^([+\-]?(((\d+(\.)?)|(\d*\.\d+))([eE][+\-]?\d+)?))$/;
  var isstring = /^\"[^\"]*\"$/;
  var isjson = /^(?:\{.*\}|\[.*\])$/;

  /**
   * Stores a value inside a cookie.
   * 
   * <p>You can store strings, numbers, booleans, objects or arrays into
   * cookies. When storing objects or arrays, CookieBin will internally
   * use JSON support (where available).</p>
   *
   * @memberOf CookieBin
   * @param {String} cookieName The name of the cookie to store.
   * @param {String} cookieValue The value to be stored under cookieName.
   * @param {Object} [options] The options to use for cookie storage (optional).
   * @param {Date} options.expires The expiration date for the cookie.
   * @param {Number} options.maxage Store the cookie for 'maxage' seconds (overridden by 'expires').
   * @param {Boolean} options.persistent Store the cookie for a year (overridden by 'expires' and 'maxage').
   * @param {String} options.path The path scope of the cookie.
   * @param {String} options.domain The domain scope of the cookie.
   * @param {Boolean} options.secure Limit the cookie access to encrypted connections.
   *
   * @example
   * CookieBin.set('anumber',123);
   * CookieBin.set('alist',[1,2,3]);
   * CookieBin.set('user','alex',{path:'/login', persistent: true});
   */
  function set(cookieName, cookieValue, options) {
    var value = '';

    if (cookieValue !== null && typeof cookieValue !== 'undefined') {
      if (typeof cookieValue === 'boolean') {
        value = cookieValue === true ? 'true' : 'false';
      } else if (typeof cookieValue === 'number') {
        value = '' + cookieValue;
      } else if (typeof cookieValue === 'string') {
        value = '"' + cookieValue + '"';
      } else {
        value = JSON.stringify(cookieValue);
      }
    }

    document.cookie = cookieName + '=' + encodeURIComponent(value) + optionString(combineOptions(options));
  }

  /**
   * Retrieves the value associated with a cookie.
   *
   * <p>Depending on what was previously stored, the return value may be a
   * number, string, boolean, object or array.
   * If the 'cookieName' parameter is the boolean true, the return value
   * is a dictionary (aka object) that maps each cookie name with a
   * cookie value.
   * Similarly, if 'cookieName' is a regular expression, the return
   * value is a dictionary that maps each cookie name that matches the
   * expression with the corresponding stored cookie value.</p>
   *
   * @public
   * @memberOf CookieBin
   * @param cookieName The name of the cookie to retrieve. If this is
   * the boolean true all cookies are returned. Alternatively if
   * this is a regular expression, then all cookies matching the regular
   * expression are returned.
   *
   * @example
   * var singleCookie = CookieBin.get('singleCookie');
   * var filteredCookies = CookieBin.get(/foo[1-9]+/);
   * var allCookies = CookieBin.get(true);
   */
  function get(cookieName) {
    var cookies = {};
    var cookieArray = document.cookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
      var tokens = cookieArray[i].split('=');
      var name = tokens.shift().replace(/^s+|\s+$/g, '');
      var value = tokens.join('=');

      value = decodeURIComponent(value);
      value = value.replace(/^s+|\s+$/g, '');

      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (isnumber.test(value)) {
        value = parseFloat(value);
      } else if (isstring.test(value)) {
        value = value.substring(1, value.length - 1);
      } else if (isjson.test(value)) {
        value = JSON.parse(value);
      }

      cookies[name] = value;
    }

    if (typeof cookieName === 'boolean' && cookieName === true) {
      return cookies;
    } else if (cookieName instanceof RegExp) {
      var cookie;
      var filteredCookies = {};
      for (cookie in cookies) {
        if (cookieName.test(cookie)) {
          filteredCookies[cookie] = cookies[cookie];
        }
      }
      return filteredCookies;
    } else {
      return cookies[cookieName];
    }
  }

  /**
   * Deletes a (previously stored) cookie.
   *
   * <p>This function deletes a cookie with 'cookieName'. If 'cookieName'
   * is the boolean true, then all cookies are deleted. If 'cookieName'
   * is a regular expression, then all cookies matching the expression
   * are deleted.</p>
   *
   * @public
   * @memberOf CookieBin
   * @param {String} cookieName The name of the cookie to delete. If
   * this is the boolean true all cookies are deleted. If this is a
   * regular expression, all cookies matching the expression are
   * deleted.
   * @param {Object} [options] The options for the cookie.
   * @param {Object} options.path The path scope of the cookie.
   * @param {Object} options.domain The domain scope of the cookie.
   *
   * @example
   * CookieBin.del('singleCookie');
   * CookieBin.del(/foo[1-9]+/);
   * CookieBin.del('username',{path:'/login'});
   * CookieBin.del(true);
   */
  function del(cookieName, options) {
    var expires = new Date();
    expires.setFullYear(expires.getFullYear() - 1);

    if (options !== null && typeof options === 'object') {
      options.expires = expires;
    } else {
      options = {expires: expires};
    }

    var optString = optionString(combineOptions(options));

    if ((typeof cookieName === 'boolean' && cookieName === true) || cookieName instanceof RegExp) {
      var cookie;
      var cookies = get(cookieName);
      for (cookie in cookies) {
        if (cookies.hasOwnProperty(cookie)) {
          document.cookie = cookie + '=' + optString;
        }
      }
    } else {
      document.cookie = cookieName + '=' + optString;
    }
  }

  /**
   * Check if the browser accepts cookies or not.
   *
   * <p>This function is used to check if the browser accepts cookies. To
   * implement this check it stores a (randomly generated) cookie and
   * value, and then retrieves it. If successful, the cookie is deleted
   * and returns true, otherwise it returns false.</p>
   *
   * @memberOf CookieBin
   * @returns {Boolean} Returns true if the browser accepts cookies, false otherwise.
   *
   * @example
   * if (CookieBin.acceptCookies()) {
   *    // Do something nifty with cookies
   * }
   */
  function acceptCookies() {
    var cookieName = '__cookieTest' + Math.floor(Math.random() * 100);
    var cookieValue = Math.random();

    set(cookieName, cookieValue);
    if (get(cookieName) === cookieValue) {
      del(cookieName);
      return true;
    }
    return false;
  }

  /**
   * Converts a set of options to a string for storage.
   * @function
   * @param {Object} options The set of options.
   * @private
   */
  function optionString(options) {
    var string = '';
    if (typeof options === 'object') {
      if (options.expires instanceof Date) {
        string += '; expires=' + options.expires.toGMTString();
      }
      if (typeof options.expires === 'string') {
        string += '; path=' + options.path;
      }
      if (typeof options.domain === 'string') {
        string += '; domain=' + options.domain;
      }
      if (options.secure === true) {
        string += '; secure';
      }
    }
    return string;
  }

  /**
   * Combines a set of options with the default options.
   * @function
   * @param {Object} options The set of options.
   * @private
   */
  function combineOptions(options) {
    var newOptions = {
      expires: defaultOptions.expires,
      path: defaultOptions.path,
      domain: defaultOptions.domain,
      secure: defaultOptions.secure
    };

    if (typeof options === 'object') {
      if (options.expires instanceof Date) {
        newOptions.expires = options.expires;
      } else if (typeof options.maxage === 'number') {
        var expireAge = new Date();
        expireAge.setTime(expireAge.getTime() + options.maxage * 1000);
        newOptions.expires = expireAge;
      } else if ('persistent' in options) {
        var persistent = new Date();
        persistent.setFullYear(persistent.getFullYear() + 1);
        newOptions.expires = persistent;
      }
      if (options.path === null || (typeof options.path === 'string' && options.path !== '')) {
        newOptions.path = options.path;
      }
      if (options.domain === null || (typeof options.domain === 'string' && options.domain !== '')) {
        newOptions.domain = options.domain;
      }
      if (typeof options.secure === 'boolean') {
        newOptions.secure = options.secure;
      }
    }

    return newOptions;
  }

  /**
   * Sets the default options for cookie storage.
   * 
   * <p>Any option present will override the default value.</p>
   *
   * @public
   * @memberOf CookieBin
   * @param {Object} options The options to use for cookie storage.
   * @param {Date} options.expires The expiration date.
   * @param {Number} options.maxage Store the cookie for 'maxage' seconds (overridden by 'expires').
   * @param {Boolean} options.persistent Store the cookie for a year (overridden by 'expires' and 'maxage').
   * @param {String} options.path The path scope.
   * @param {String} options.domain The domain scope.
   * @param {Boolean} options.secure Limit the cookie access to encrypted connections.
   *
   * @example
   * CookieBin.setDefaultOptions({path: '/', domain: 'example.com', secure: true})
   * var expires = new Date();
   * expires.setFullYear(expires.getFullYear() - 1);
   * CookieBin.setDefaultOptions({expires: expires})
   */
  function setDefaultOptions(options) {
    defaultOptions = combineOptions(options);
  }

  /**
   * Returns the default options for cookie storage.
   *
   * <p>Specifically it returns a dictionary (aka object) that maps each
   * option with its default value.</p>
   *
   * @public
   * @memberOf CookieBin
   * @returns {Object} The default options for cookie storage.
   */
  function getDefaultOptions() {
    return {
      expires: defaultOptions.expires,
      path: defaultOptions.path,
      domain: defaultOptions.domain,
      secure: defaultOptions.secure
    };
  }

  return {
    set: set,
    get: get,
    del: del,
    acceptCookies: acceptCookies,
    setDefaultOptions: setDefaultOptions,
    getDefaultOptions: getDefaultOptions
  };
})();
