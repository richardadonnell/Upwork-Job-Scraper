/*! @sentry/browser 7.119.0 (f58bf69) | https://github.com/getsentry/sentry-javascript */
var Sentry = (function (exports) {

    exports = window.Sentry || {};

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    // eslint-disable-next-line @typescript-eslint/unbound-method
    var objectToString = Object.prototype.toString;
    /**
     * Checks whether given value's type is one of a few Error or Error-like
     * {@link isError}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isError(wat) {
        switch (objectToString.call(wat)) {
            case '[object Error]':
            case '[object Exception]':
            case '[object DOMException]':
                return true;
            default:
                return isInstanceOf(wat, Error);
        }
    }
    /**
     * Checks whether given value is an instance of the given built-in class.
     *
     * @param wat The value to be checked
     * @param className
     * @returns A boolean representing the result.
     */
    function isBuiltin(wat, className) {
        return objectToString.call(wat) === "[object ".concat(className, "]");
    }
    /**
     * Checks whether given value's type is ErrorEvent
     * {@link isErrorEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isErrorEvent$1(wat) {
        return isBuiltin(wat, 'ErrorEvent');
    }
    /**
     * Checks whether given value's type is DOMError
     * {@link isDOMError}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isDOMError(wat) {
        return isBuiltin(wat, 'DOMError');
    }
    /**
     * Checks whether given value's type is DOMException
     * {@link isDOMException}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isDOMException(wat) {
        return isBuiltin(wat, 'DOMException');
    }
    /**
     * Checks whether given value's type is a string
     * {@link isString}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isString(wat) {
        return isBuiltin(wat, 'String');
    }
    /**
     * Checks whether given string is parameterized
     * {@link isParameterizedString}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isParameterizedString(wat) {
        return (typeof wat === 'object' &&
            wat !== null &&
            '__sentry_template_string__' in wat &&
            '__sentry_template_values__' in wat);
    }
    /**
     * Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
     * {@link isPrimitive}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isPrimitive(wat) {
        return wat === null || isParameterizedString(wat) || (typeof wat !== 'object' && typeof wat !== 'function');
    }
    /**
     * Checks whether given value's type is an object literal, or a class instance.
     * {@link isPlainObject}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isPlainObject(wat) {
        return isBuiltin(wat, 'Object');
    }
    /**
     * Checks whether given value's type is an Event instance
     * {@link isEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isEvent(wat) {
        return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
    }
    /**
     * Checks whether given value's type is an Element instance
     * {@link isElement}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isElement(wat) {
        return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
    }
    /**
     * Checks whether given value's type is an regexp
     * {@link isRegExp}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isRegExp(wat) {
        return isBuiltin(wat, 'RegExp');
    }
    /**
     * Checks whether given value has a then function.
     * @param wat A value to be checked.
     */
    function isThenable(wat) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return Boolean(wat && wat.then && typeof wat.then === 'function');
    }
    /**
     * Checks whether given value's type is a SyntheticEvent
     * {@link isSyntheticEvent}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isSyntheticEvent(wat) {
        return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
    }
    /**
     * Checks whether given value is NaN
     * {@link isNaN}.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isNaN$1(wat) {
        return typeof wat === 'number' && wat !== wat;
    }
    /**
     * Checks whether given value's type is an instance of provided constructor.
     * {@link isInstanceOf}.
     *
     * @param wat A value to be checked.
     * @param base A constructor to be used in a check.
     * @returns A boolean representing the result.
     */
    function isInstanceOf(wat, base) {
        try {
            return wat instanceof base;
        }
        catch (_e) {
            return false;
        }
    }
    /**
     * Checks whether given value's type is a Vue ViewModel.
     *
     * @param wat A value to be checked.
     * @returns A boolean representing the result.
     */
    function isVueViewModel(wat) {
        // Not using Object.prototype.toString because in Vue 3 it would read the instance's Symbol(Symbol.toStringTag) property.
        return !!(typeof wat === 'object' && wat !== null && (wat.__isVue || wat._isVue));
    }

    /**
     * Truncates given string to the maximum characters count
     *
     * @param str An object that contains serializable values
     * @param max Maximum number of characters in truncated string (0 = unlimited)
     * @returns string Encoded
     */
    function truncate(str, max) {
        if (max === void 0) { max = 0; }
        if (typeof str !== 'string' || max === 0) {
            return str;
        }
        return str.length <= max ? str : "".concat(str.slice(0, max), "...");
    }
    /**
     * Join values in array
     * @param input array of values to be joined together
     * @param delimiter string to be placed in-between values
     * @returns Joined values
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function safeJoin(input, delimiter) {
        if (!Array.isArray(input)) {
            return '';
        }
        var output = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (var i = 0; i < input.length; i++) {
            var value = input[i];
            try {
                // This is a hack to fix a Vue3-specific bug that causes an infinite loop of
                // console warnings. This happens when a Vue template is rendered with
                // an undeclared variable, which we try to stringify, ultimately causing
                // Vue to issue another warning which repeats indefinitely.
                // see: https://github.com/getsentry/sentry-javascript/pull/8981
                if (isVueViewModel(value)) {
                    output.push('[VueViewModel]');
                }
                else {
                    output.push(String(value));
                }
            }
            catch (e) {
                output.push('[value cannot be serialized]');
            }
        }
        return output.join(delimiter);
    }
    /**
     * Checks if the given value matches a regex or string
     *
     * @param value The string to test
     * @param pattern Either a regex or a string against which `value` will be matched
     * @param requireExactStringMatch If true, `value` must match `pattern` exactly. If false, `value` will match
     * `pattern` if it contains `pattern`. Only applies to string-type patterns.
     */
    function isMatchingPattern(value, pattern, requireExactStringMatch) {
        if (requireExactStringMatch === void 0) { requireExactStringMatch = false; }
        if (!isString(value)) {
            return false;
        }
        if (isRegExp(pattern)) {
            return pattern.test(value);
        }
        if (isString(pattern)) {
            return requireExactStringMatch ? value === pattern : value.includes(pattern);
        }
        return false;
    }
    /**
     * Test the given string against an array of strings and regexes. By default, string matching is done on a
     * substring-inclusion basis rather than a strict equality basis
     *
     * @param testString The string to test
     * @param patterns The patterns against which to test the string
     * @param requireExactStringMatch If true, `testString` must match one of the given string patterns exactly in order to
     * count. If false, `testString` will match a string pattern if it contains that pattern.
     * @returns
     */
    function stringMatchesSomePattern(testString, patterns, requireExactStringMatch) {
        if (patterns === void 0) { patterns = []; }
        if (requireExactStringMatch === void 0) { requireExactStringMatch = false; }
        return patterns.some(function (pattern) { return isMatchingPattern(testString, pattern, requireExactStringMatch); });
    }

    /**
     * Creates exceptions inside `event.exception.values` for errors that are nested on properties based on the `key` parameter.
     */
    function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, maxValueLimit, key, limit, event, hint) {
        if (maxValueLimit === void 0) { maxValueLimit = 250; }
        if (!event.exception || !event.exception.values || !hint || !isInstanceOf(hint.originalException, Error)) {
            return;
        }
        // Generally speaking the last item in `event.exception.values` is the exception originating from the original Error
        var originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : undefined;
        // We only create exception grouping if there is an exception in the event.
        if (originalException) {
            event.exception.values = truncateAggregateExceptions(aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, hint.originalException, key, event.exception.values, originalException, 0), maxValueLimit);
        }
    }
    function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
        if (prevExceptions.length >= limit + 1) {
            return prevExceptions;
        }
        var newExceptions = __spreadArray([], __read(prevExceptions), false);
        // Recursively call this function in order to walk down a chain of errors
        if (isInstanceOf(error[key], Error)) {
            applyExceptionGroupFieldsForParentException(exception, exceptionId);
            var newException = exceptionFromErrorImplementation(parser, error[key]);
            var newExceptionId = newExceptions.length;
            applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
            newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error[key], key, __spreadArray([newException], __read(newExceptions), false), newException, newExceptionId);
        }
        // This will create exception grouping for AggregateErrors
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
        if (Array.isArray(error.errors)) {
            error.errors.forEach(function (childError, i) {
                if (isInstanceOf(childError, Error)) {
                    applyExceptionGroupFieldsForParentException(exception, exceptionId);
                    var newException = exceptionFromErrorImplementation(parser, childError);
                    var newExceptionId = newExceptions.length;
                    applyExceptionGroupFieldsForChildException(newException, "errors[".concat(i, "]"), newExceptionId, exceptionId);
                    newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, childError, key, __spreadArray([newException], __read(newExceptions), false), newException, newExceptionId);
                }
            });
        }
        return newExceptions;
    }
    function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
        // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
        exception.mechanism = exception.mechanism || { type: 'generic', handled: true };
        exception.mechanism = __assign(__assign(__assign({}, exception.mechanism), (exception.type === 'AggregateError' && { is_exception_group: true })), { exception_id: exceptionId });
    }
    function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
        // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
        exception.mechanism = exception.mechanism || { type: 'generic', handled: true };
        exception.mechanism = __assign(__assign({}, exception.mechanism), { type: 'chained', source: source, exception_id: exceptionId, parent_id: parentId });
    }
    /**
     * Truncate the message (exception.value) of all exceptions in the event.
     * Because this event processor is ran after `applyClientOptions`,
     * we need to truncate the message of the added exceptions here.
     */
    function truncateAggregateExceptions(exceptions, maxValueLength) {
        return exceptions.map(function (exception) {
            if (exception.value) {
                exception.value = truncate(exception.value, maxValueLength);
            }
            return exception;
        });
    }

    /**
     * NOTE: In order to avoid circular dependencies, if you add a function to this module and it needs to print something,
     * you must either a) use `console.log` rather than the logger, or b) put your function elsewhere.
     *
     * Note: This file was originally called `global.ts`, but was changed to unblock users which might be doing
     * string replaces with bundlers like Vite for `global` (would break imports that rely on importing from utils/src/global).
     *
     * Why worldwide?
     *
     * Why not?
     */
    // The code below for 'isGlobalObj' and 'GLOBAL_OBJ' was copied from core-js before modification
    // https://github.com/zloirock/core-js/blob/1b944df55282cdc99c90db5f49eb0b6eda2cc0a3/packages/core-js/internals/global.js
    // core-js has the following licence:
    //
    // Copyright (c) 2014-2022 Denis Pushkarev
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.
    /** Returns 'obj' if it's the global object, otherwise returns undefined */
    function isGlobalObj(obj) {
        return obj && obj.Math == Math ? obj : undefined;
    }
    /** Get's the global object for the current JavaScript runtime */
    var GLOBAL_OBJ = (typeof globalThis == 'object' && isGlobalObj(globalThis)) ||
        // eslint-disable-next-line no-restricted-globals
        (typeof window == 'object' && isGlobalObj(window)) ||
        (typeof self == 'object' && isGlobalObj(self)) ||
        (typeof global == 'object' && isGlobalObj(global)) ||
        (function () {
            return this;
        })() ||
        {};
    /**
     * @deprecated Use GLOBAL_OBJ instead or WINDOW from @sentry/browser. This will be removed in v8
     */
    function getGlobalObject() {
        return GLOBAL_OBJ;
    }
    /**
     * Returns a global singleton contained in the global `__SENTRY__` object.
     *
     * If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
     * function and added to the `__SENTRY__` object.
     *
     * @param name name of the global singleton on __SENTRY__
     * @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
     * @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
     * @returns the singleton
     */
    function getGlobalSingleton(name, creator, obj) {
        var gbl = (obj || GLOBAL_OBJ);
        var __SENTRY__ = (gbl.__SENTRY__ = gbl.__SENTRY__ || {});
        var singleton = __SENTRY__[name] || (__SENTRY__[name] = creator());
        return singleton;
    }

    // eslint-disable-next-line deprecation/deprecation
    var WINDOW$6 = getGlobalObject();
    var DEFAULT_MAX_STRING_LENGTH = 80;
    /**
     * Given a child DOM element, returns a query-selector statement describing that
     * and its ancestors
     * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
     * @returns generated DOM path
     */
    function htmlTreeAsString(elem, options) {
        if (options === void 0) { options = {}; }
        if (!elem) {
            return '<unknown>';
        }
        // try/catch both:
        // - accessing event.target (see getsentry/raven-js#838, #768)
        // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
        // - can throw an exception in some circumstances.
        try {
            var currentElem = elem;
            var MAX_TRAVERSE_HEIGHT = 5;
            var out = [];
            var height = 0;
            var len = 0;
            var separator = ' > ';
            var sepLength = separator.length;
            var nextStr = void 0;
            var keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
            var maxStringLength = (!Array.isArray(options) && options.maxStringLength) || DEFAULT_MAX_STRING_LENGTH;
            while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
                nextStr = _htmlElementAsString(currentElem, keyAttrs);
                // bail out if
                // - nextStr is the 'html' element
                // - the length of the string that would be created exceeds maxStringLength
                //   (ignore this limit if we are on the first iteration)
                if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength)) {
                    break;
                }
                out.push(nextStr);
                len += nextStr.length;
                currentElem = currentElem.parentNode;
            }
            return out.reverse().join(separator);
        }
        catch (_oO) {
            return '<unknown>';
        }
    }
    /**
     * Returns a simple, query-selector representation of a DOM element
     * e.g. [HTMLElement] => input#foo.btn[name=baz]
     * @returns generated DOM path
     */
    function _htmlElementAsString(el, keyAttrs) {
        var elem = el;
        var out = [];
        var className;
        var classes;
        var key;
        var attr;
        var i;
        if (!elem || !elem.tagName) {
            return '';
        }
        // @ts-expect-error WINDOW has HTMLElement
        if (WINDOW$6.HTMLElement) {
            // If using the component name annotation plugin, this value may be available on the DOM node
            if (elem instanceof HTMLElement && elem.dataset && elem.dataset['sentryComponent']) {
                return elem.dataset['sentryComponent'];
            }
        }
        out.push(elem.tagName.toLowerCase());
        // Pairs of attribute keys defined in `serializeAttribute` and their values on element.
        var keyAttrPairs = keyAttrs && keyAttrs.length
            ? keyAttrs.filter(function (keyAttr) { return elem.getAttribute(keyAttr); }).map(function (keyAttr) { return [keyAttr, elem.getAttribute(keyAttr)]; })
            : null;
        if (keyAttrPairs && keyAttrPairs.length) {
            keyAttrPairs.forEach(function (keyAttrPair) {
                out.push("[".concat(keyAttrPair[0], "=\"").concat(keyAttrPair[1], "\"]"));
            });
        }
        else {
            if (elem.id) {
                out.push("#".concat(elem.id));
            }
            // eslint-disable-next-line prefer-const
            className = elem.className;
            if (className && isString(className)) {
                classes = className.split(/\s+/);
                for (i = 0; i < classes.length; i++) {
                    out.push(".".concat(classes[i]));
                }
            }
        }
        var allowedAttrs = ['aria-label', 'type', 'name', 'title', 'alt'];
        for (i = 0; i < allowedAttrs.length; i++) {
            key = allowedAttrs[i];
            attr = elem.getAttribute(key);
            if (attr) {
                out.push("[".concat(key, "=\"").concat(attr, "\"]"));
            }
        }
        return out.join('');
    }
    /**
     * A safe form of location.href
     */
    function getLocationHref() {
        try {
            return WINDOW$6.document.location.href;
        }
        catch (oO) {
            return '';
        }
    }
    /**
     * Given a DOM element, traverses up the tree until it finds the first ancestor node
     * that has the `data-sentry-component` attribute. This attribute is added at build-time
     * by projects that have the component name annotation plugin installed.
     *
     * @returns a string representation of the component for the provided DOM element, or `null` if not found
     */
    function getComponentName(elem) {
        // @ts-expect-error WINDOW has HTMLElement
        if (!WINDOW$6.HTMLElement) {
            return null;
        }
        var currentElem = elem;
        var MAX_TRAVERSE_HEIGHT = 5;
        for (var i = 0; i < MAX_TRAVERSE_HEIGHT; i++) {
            if (!currentElem) {
                return null;
            }
            if (currentElem instanceof HTMLElement && currentElem.dataset['sentryComponent']) {
                return currentElem.dataset['sentryComponent'];
            }
            currentElem = currentElem.parentNode;
        }
        return null;
    }

    /**
     * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `true` in their generated code.
     *
     * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
     */
    var DEBUG_BUILD$2 = true;

    /** Prefix for logging strings */
    var PREFIX = 'Sentry Logger ';
    var CONSOLE_LEVELS = [
        'debug',
        'info',
        'warn',
        'error',
        'log',
        'assert',
        'trace',
    ];
    /** This may be mutated by the console instrumentation. */
    var originalConsoleMethods = {};
    /**
     * Temporarily disable sentry console instrumentations.
     *
     * @param callback The function to run against the original `console` messages
     * @returns The results of the callback
     */
    function consoleSandbox(callback) {
        if (!('console' in GLOBAL_OBJ)) {
            return callback();
        }
        var console = GLOBAL_OBJ.console;
        var wrappedFuncs = {};
        var wrappedLevels = Object.keys(originalConsoleMethods);
        // Restore all wrapped console methods
        wrappedLevels.forEach(function (level) {
            var originalConsoleMethod = originalConsoleMethods[level];
            wrappedFuncs[level] = console[level];
            console[level] = originalConsoleMethod;
        });
        try {
            return callback();
        }
        finally {
            // Revert restoration to wrapped state
            wrappedLevels.forEach(function (level) {
                console[level] = wrappedFuncs[level];
            });
        }
    }
    function makeLogger() {
        var enabled = false;
        var logger = {
            enable: function () {
                enabled = true;
            },
            disable: function () {
                enabled = false;
            },
            isEnabled: function () { return enabled; },
        };
        {
            CONSOLE_LEVELS.forEach(function (name) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                logger[name] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (enabled) {
                        consoleSandbox(function () {
                            var _a;
                            (_a = GLOBAL_OBJ.console)[name].apply(_a, __spreadArray(["".concat(PREFIX, "[").concat(name, "]:")], __read(args), false));
                        });
                    }
                };
            });
        }
        return logger;
    }
    var logger = makeLogger();

    /** Regular expression used to parse a Dsn. */
    var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
    function isValidProtocol(protocol) {
        return protocol === 'http' || protocol === 'https';
    }
    /**
     * Renders the string representation of this Dsn.
     *
     * By default, this will render the public representation without the password
     * component. To get the deprecated private representation, set `withPassword`
     * to true.
     *
     * @param withPassword When set to true, the password will be included.
     */
    function dsnToString(dsn, withPassword) {
        if (withPassword === void 0) { withPassword = false; }
        var host = dsn.host, path = dsn.path, pass = dsn.pass, port = dsn.port, projectId = dsn.projectId, protocol = dsn.protocol, publicKey = dsn.publicKey;
        return ("".concat(protocol, "://").concat(publicKey).concat(withPassword && pass ? ":".concat(pass) : '') +
            "@".concat(host).concat(port ? ":".concat(port) : '', "/").concat(path ? "".concat(path, "/") : path).concat(projectId));
    }
    /**
     * Parses a Dsn from a given string.
     *
     * @param str A Dsn as string
     * @returns Dsn as DsnComponents or undefined if @param str is not a valid DSN string
     */
    function dsnFromString(str) {
        var match = DSN_REGEX.exec(str);
        if (!match) {
            // This should be logged to the console
            consoleSandbox(function () {
                // eslint-disable-next-line no-console
                console.error("Invalid Sentry Dsn: ".concat(str));
            });
            return undefined;
        }
        var _a = __read(match.slice(1), 6), protocol = _a[0], publicKey = _a[1], _b = _a[2], pass = _b === void 0 ? '' : _b, host = _a[3], _c = _a[4], port = _c === void 0 ? '' : _c, lastPath = _a[5];
        var path = '';
        var projectId = lastPath;
        var split = projectId.split('/');
        if (split.length > 1) {
            path = split.slice(0, -1).join('/');
            projectId = split.pop();
        }
        if (projectId) {
            var projectMatch = projectId.match(/^\d+/);
            if (projectMatch) {
                projectId = projectMatch[0];
            }
        }
        return dsnFromComponents({ host: host, pass: pass, path: path, projectId: projectId, port: port, protocol: protocol, publicKey: publicKey });
    }
    function dsnFromComponents(components) {
        return {
            protocol: components.protocol,
            publicKey: components.publicKey || '',
            pass: components.pass || '',
            host: components.host,
            port: components.port || '',
            path: components.path || '',
            projectId: components.projectId,
        };
    }
    function validateDsn(dsn) {
        var port = dsn.port, projectId = dsn.projectId, protocol = dsn.protocol;
        var requiredComponents = ['protocol', 'publicKey', 'host', 'projectId'];
        var hasMissingRequiredComponent = requiredComponents.find(function (component) {
            if (!dsn[component]) {
                logger.error("Invalid Sentry Dsn: ".concat(component, " missing"));
                return true;
            }
            return false;
        });
        if (hasMissingRequiredComponent) {
            return false;
        }
        if (!projectId.match(/^\d+$/)) {
            logger.error("Invalid Sentry Dsn: Invalid projectId ".concat(projectId));
            return false;
        }
        if (!isValidProtocol(protocol)) {
            logger.error("Invalid Sentry Dsn: Invalid protocol ".concat(protocol));
            return false;
        }
        if (port && isNaN(parseInt(port, 10))) {
            logger.error("Invalid Sentry Dsn: Invalid port ".concat(port));
            return false;
        }
        return true;
    }
    /**
     * Creates a valid Sentry Dsn object, identifying a Sentry instance and project.
     * @returns a valid DsnComponents object or `undefined` if @param from is an invalid DSN source
     */
    function makeDsn(from) {
        var components = typeof from === 'string' ? dsnFromString(from) : dsnFromComponents(from);
        if (!components || !validateDsn(components)) {
            return undefined;
        }
        return components;
    }

    /** An error emitted by Sentry SDKs and related utilities. */
    var SentryError = /** @class */ (function (_super) {
        __extends(SentryError, _super);
        function SentryError(message, logLevel) {
            if (logLevel === void 0) { logLevel = 'warn'; }
            var _newTarget = this.constructor;
            var _this = _super.call(this, message) || this;
            _this.message = message;
            _this.name = _newTarget.prototype.constructor.name;
            // This sets the prototype to be `Error`, not `SentryError`. It's unclear why we do this, but commenting this line
            // out causes various (seemingly totally unrelated) playwright tests consistently time out. FYI, this makes
            // instances of `SentryError` fail `obj instanceof SentryError` checks.
            Object.setPrototypeOf(_this, _newTarget.prototype);
            _this.logLevel = logLevel;
            return _this;
        }
        return SentryError;
    }(Error));

    var STACKTRACE_FRAME_LIMIT = 50;
    // Used to sanitize webpack (error: *) wrapped stack errors
    var WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
    var STRIP_FRAME_REGEXP = /captureMessage|captureException/;
    /**
     * Creates a stack parser with the supplied line parsers
     *
     * StackFrames are returned in the correct order for Sentry Exception
     * frames and with Sentry SDK internal frames removed from the top and bottom
     *
     */
    function createStackParser() {
        var parsers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            parsers[_i] = arguments[_i];
        }
        var sortedParsers = parsers.sort(function (a, b) { return a[0] - b[0]; }).map(function (p) { return p[1]; });
        return function (stack, skipFirst) {
            var e_1, _a;
            if (skipFirst === void 0) { skipFirst = 0; }
            var frames = [];
            var lines = stack.split('\n');
            for (var i = skipFirst; i < lines.length; i++) {
                var line = lines[i];
                // Ignore lines over 1kb as they are unlikely to be stack frames.
                // Many of the regular expressions use backtracking which results in run time that increases exponentially with
                // input size. Huge strings can result in hangs/Denial of Service:
                // https://github.com/getsentry/sentry-javascript/issues/2286
                if (line.length > 1024) {
                    continue;
                }
                // https://github.com/getsentry/sentry-javascript/issues/5459
                // Remove webpack (error: *) wrappers
                var cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;
                // https://github.com/getsentry/sentry-javascript/issues/7813
                // Skip Error: lines
                if (cleanedLine.match(/\S*Error: /)) {
                    continue;
                }
                try {
                    for (var sortedParsers_1 = (e_1 = void 0, __values(sortedParsers)), sortedParsers_1_1 = sortedParsers_1.next(); !sortedParsers_1_1.done; sortedParsers_1_1 = sortedParsers_1.next()) {
                        var parser = sortedParsers_1_1.value;
                        var frame = parser(cleanedLine);
                        if (frame) {
                            frames.push(frame);
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (sortedParsers_1_1 && !sortedParsers_1_1.done && (_a = sortedParsers_1.return)) _a.call(sortedParsers_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (frames.length >= STACKTRACE_FRAME_LIMIT) {
                    break;
                }
            }
            return stripSentryFramesAndReverse(frames);
        };
    }
    /**
     * Gets a stack parser implementation from Options.stackParser
     * @see Options
     *
     * If options contains an array of line parsers, it is converted into a parser
     */
    function stackParserFromStackParserOptions(stackParser) {
        if (Array.isArray(stackParser)) {
            return createStackParser.apply(void 0, __spreadArray([], __read(stackParser), false));
        }
        return stackParser;
    }
    /**
     * Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
     * Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
     * function that caused the crash is the last frame in the array.
     * @hidden
     */
    function stripSentryFramesAndReverse(stack) {
        if (!stack.length) {
            return [];
        }
        var localStack = Array.from(stack);
        // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
        if (/sentryWrapped/.test(localStack[localStack.length - 1].function || '')) {
            localStack.pop();
        }
        // Reversing in the middle of the procedure allows us to just pop the values off the stack
        localStack.reverse();
        // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
        if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
            localStack.pop();
            // When using synthetic events, we will have a 2 levels deep stack, as `new Error('Sentry syntheticException')`
            // is produced within the hub itself, making it:
            //
            //   Sentry.captureException()
            //   getCurrentHub().captureException()
            //
            // instead of just the top `Sentry` call itself.
            // This forces us to possibly strip an additional frame in the exact same was as above.
            if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
                localStack.pop();
            }
        }
        return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map(function (frame) { return (__assign(__assign({}, frame), { filename: frame.filename || localStack[localStack.length - 1].filename, function: frame.function || '?' })); });
    }
    var defaultFunctionName = '<anonymous>';
    /**
     * Safely extract function name from itself
     */
    function getFunctionName(fn) {
        try {
            if (!fn || typeof fn !== 'function') {
                return defaultFunctionName;
            }
            return fn.name || defaultFunctionName;
        }
        catch (e) {
            // Just accessing custom props in some Selenium environments
            // can cause a "Permission denied" exception (see raven-js#495).
            return defaultFunctionName;
        }
    }

    // We keep the handlers globally
    var handlers = {};
    var instrumented = {};
    /** Add a handler function. */
    function addHandler(type, handler) {
        handlers[type] = handlers[type] || [];
        handlers[type].push(handler);
    }
    /** Maybe run an instrumentation function, unless it was already called. */
    function maybeInstrument(type, instrumentFn) {
        if (!instrumented[type]) {
            instrumentFn();
            instrumented[type] = true;
        }
    }
    /** Trigger handlers for a given instrumentation type. */
    function triggerHandlers(type, data) {
        var e_1, _a;
        var typeHandlers = type && handlers[type];
        if (!typeHandlers) {
            return;
        }
        try {
            for (var typeHandlers_1 = __values(typeHandlers), typeHandlers_1_1 = typeHandlers_1.next(); !typeHandlers_1_1.done; typeHandlers_1_1 = typeHandlers_1.next()) {
                var handler = typeHandlers_1_1.value;
                try {
                    handler(data);
                }
                catch (e) {
                    logger.error("Error while triggering instrumentation handler.\nType: ".concat(type, "\nName: ").concat(getFunctionName(handler), "\nError:"), e);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (typeHandlers_1_1 && !typeHandlers_1_1.done && (_a = typeHandlers_1.return)) _a.call(typeHandlers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }

    /**
     * Replace a method in an object with a wrapped version of itself.
     *
     * @param source An object that contains a method to be wrapped.
     * @param name The name of the method to be wrapped.
     * @param replacementFactory A higher-order function that takes the original version of the given method and returns a
     * wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
     * preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
     * args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
     * @returns void
     */
    function fill(source, name, replacementFactory) {
        if (!(name in source)) {
            return;
        }
        var original = source[name];
        var wrapped = replacementFactory(original);
        // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
        // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
        if (typeof wrapped === 'function') {
            markFunctionWrapped(wrapped, original);
        }
        source[name] = wrapped;
    }
    /**
     * Defines a non-enumerable property on the given object.
     *
     * @param obj The object on which to set the property
     * @param name The name of the property to be set
     * @param value The value to which to set the property
     */
    function addNonEnumerableProperty(obj, name, value) {
        try {
            Object.defineProperty(obj, name, {
                // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
                value: value,
                writable: true,
                configurable: true,
            });
        }
        catch (o_O) {
            DEBUG_BUILD$2 && logger.log("Failed to add non-enumerable property \"".concat(name, "\" to object"), obj);
        }
    }
    /**
     * Remembers the original function on the wrapped function and
     * patches up the prototype.
     *
     * @param wrapped the wrapper function
     * @param original the original function that gets wrapped
     */
    function markFunctionWrapped(wrapped, original) {
        try {
            var proto = original.prototype || {};
            wrapped.prototype = original.prototype = proto;
            addNonEnumerableProperty(wrapped, '__sentry_original__', original);
        }
        catch (o_O) { } // eslint-disable-line no-empty
    }
    /**
     * This extracts the original function if available.  See
     * `markFunctionWrapped` for more information.
     *
     * @param func the function to unwrap
     * @returns the unwrapped version of the function if available.
     */
    function getOriginalFunction(func) {
        return func.__sentry_original__;
    }
    /**
     * Encodes given object into url-friendly format
     *
     * @param object An object that contains serializable values
     * @returns string Encoded
     */
    function urlEncode(object) {
        return Object.keys(object)
            .map(function (key) { return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(object[key])); })
            .join('&');
    }
    /**
     * Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
     * non-enumerable properties attached.
     *
     * @param value Initial source that we have to transform in order for it to be usable by the serializer
     * @returns An Event or Error turned into an object - or the value argurment itself, when value is neither an Event nor
     *  an Error.
     */
    function convertToPlainObject(value) {
        if (isError(value)) {
            return __assign({ message: value.message, name: value.name, stack: value.stack }, getOwnProperties(value));
        }
        else if (isEvent(value)) {
            var newObj = __assign({ type: value.type, target: serializeEventTarget(value.target), currentTarget: serializeEventTarget(value.currentTarget) }, getOwnProperties(value));
            if (typeof CustomEvent !== 'undefined' && isInstanceOf(value, CustomEvent)) {
                newObj.detail = value.detail;
            }
            return newObj;
        }
        else {
            return value;
        }
    }
    /** Creates a string representation of the target of an `Event` object */
    function serializeEventTarget(target) {
        try {
            return isElement(target) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
        }
        catch (_oO) {
            return '<unknown>';
        }
    }
    /** Filters out all but an object's own properties */
    function getOwnProperties(obj) {
        if (typeof obj === 'object' && obj !== null) {
            var extractedProps = {};
            for (var property in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, property)) {
                    extractedProps[property] = obj[property];
                }
            }
            return extractedProps;
        }
        else {
            return {};
        }
    }
    /**
     * Given any captured exception, extract its keys and create a sorted
     * and truncated list that will be used inside the event message.
     * eg. `Non-error exception captured with keys: foo, bar, baz`
     */
    function extractExceptionKeysForMessage(exception, maxLength) {
        if (maxLength === void 0) { maxLength = 40; }
        var keys = Object.keys(convertToPlainObject(exception));
        keys.sort();
        if (!keys.length) {
            return '[object has no keys]';
        }
        if (keys[0].length >= maxLength) {
            return truncate(keys[0], maxLength);
        }
        for (var includedKeys = keys.length; includedKeys > 0; includedKeys--) {
            var serialized = keys.slice(0, includedKeys).join(', ');
            if (serialized.length > maxLength) {
                continue;
            }
            if (includedKeys === keys.length) {
                return serialized;
            }
            return truncate(serialized, maxLength);
        }
        return '';
    }
    /**
     * Given any object, return a new object having removed all fields whose value was `undefined`.
     * Works recursively on objects and arrays.
     *
     * Attention: This function keeps circular references in the returned object.
     */
    function dropUndefinedKeys(inputValue) {
        // This map keeps track of what already visited nodes map to.
        // Our Set - based memoBuilder doesn't work here because we want to the output object to have the same circular
        // references as the input object.
        var memoizationMap = new Map();
        // This function just proxies `_dropUndefinedKeys` to keep the `memoBuilder` out of this function's API
        return _dropUndefinedKeys(inputValue, memoizationMap);
    }
    function _dropUndefinedKeys(inputValue, memoizationMap) {
        var e_1, _a;
        if (isPojo(inputValue)) {
            // If this node has already been visited due to a circular reference, return the object it was mapped to in the new object
            var memoVal = memoizationMap.get(inputValue);
            if (memoVal !== undefined) {
                return memoVal;
            }
            var returnValue = {};
            // Store the mapping of this value in case we visit it again, in case of circular data
            memoizationMap.set(inputValue, returnValue);
            try {
                for (var _b = __values(Object.keys(inputValue)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (typeof inputValue[key] !== 'undefined') {
                        returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return returnValue;
        }
        if (Array.isArray(inputValue)) {
            // If this node has already been visited due to a circular reference, return the array it was mapped to in the new object
            var memoVal = memoizationMap.get(inputValue);
            if (memoVal !== undefined) {
                return memoVal;
            }
            var returnValue_1 = [];
            // Store the mapping of this value in case we visit it again, in case of circular data
            memoizationMap.set(inputValue, returnValue_1);
            inputValue.forEach(function (item) {
                returnValue_1.push(_dropUndefinedKeys(item, memoizationMap));
            });
            return returnValue_1;
        }
        return inputValue;
    }
    function isPojo(input) {
        if (!isPlainObject(input)) {
            return false;
        }
        try {
            var name_1 = Object.getPrototypeOf(input).constructor.name;
            return !name_1 || name_1 === 'Object';
        }
        catch (_a) {
            return true;
        }
    }

    /**
     * Add an instrumentation handler for when a console.xxx method is called.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addConsoleInstrumentationHandler(handler) {
        var type = 'console';
        addHandler(type, handler);
        maybeInstrument(type, instrumentConsole);
    }
    function instrumentConsole() {
        if (!('console' in GLOBAL_OBJ)) {
            return;
        }
        CONSOLE_LEVELS.forEach(function (level) {
            if (!(level in GLOBAL_OBJ.console)) {
                return;
            }
            fill(GLOBAL_OBJ.console, level, function (originalConsoleMethod) {
                originalConsoleMethods[level] = originalConsoleMethod;
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var handlerData = { args: args, level: level };
                    triggerHandlers('console', handlerData);
                    var log = originalConsoleMethods[level];
                    log && log.apply(GLOBAL_OBJ.console, args);
                };
            });
        });
    }

    /**
     * UUID4 generator
     *
     * @returns string Generated UUID4.
     */
    function uuid4() {
        var gbl = GLOBAL_OBJ;
        var crypto = gbl.crypto || gbl.msCrypto;
        var getRandomByte = function () { return Math.random() * 16; };
        try {
            if (crypto && crypto.randomUUID) {
                return crypto.randomUUID().replace(/-/g, '');
            }
            if (crypto && crypto.getRandomValues) {
                getRandomByte = function () {
                    // crypto.getRandomValues might return undefined instead of the typed array
                    // in old Chromium versions (e.g. 23.0.1235.0 (151422))
                    // However, `typedArray` is still filled in-place.
                    // @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#typedarray
                    var typedArray = new Uint8Array(1);
                    crypto.getRandomValues(typedArray);
                    return typedArray[0];
                };
            }
        }
        catch (_) {
            // some runtimes can crash invoking crypto
            // https://github.com/getsentry/sentry-javascript/issues/8935
        }
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
        // Concatenating the following numbers as strings results in '10000000100040008000100000000000'
        return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, function (c) {
            // eslint-disable-next-line no-bitwise
            return (c ^ ((getRandomByte() & 15) >> (c / 4))).toString(16);
        });
    }
    function getFirstException(event) {
        return event.exception && event.exception.values ? event.exception.values[0] : undefined;
    }
    /**
     * Extracts either message or type+value from an event that can be used for user-facing logs
     * @returns event's description
     */
    function getEventDescription(event) {
        var message = event.message, eventId = event.event_id;
        if (message) {
            return message;
        }
        var firstException = getFirstException(event);
        if (firstException) {
            if (firstException.type && firstException.value) {
                return "".concat(firstException.type, ": ").concat(firstException.value);
            }
            return firstException.type || firstException.value || eventId || '<unknown>';
        }
        return eventId || '<unknown>';
    }
    /**
     * Adds exception values, type and value to an synthetic Exception.
     * @param event The event to modify.
     * @param value Value of the exception.
     * @param type Type of the exception.
     * @hidden
     */
    function addExceptionTypeValue(event, value, type) {
        var exception = (event.exception = event.exception || {});
        var values = (exception.values = exception.values || []);
        var firstException = (values[0] = values[0] || {});
        if (!firstException.value) {
            firstException.value = value || '';
        }
        if (!firstException.type) {
            firstException.type = type || 'Error';
        }
    }
    /**
     * Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
     *
     * @param event The event to modify.
     * @param newMechanism Mechanism data to add to the event.
     * @hidden
     */
    function addExceptionMechanism(event, newMechanism) {
        var firstException = getFirstException(event);
        if (!firstException) {
            return;
        }
        var defaultMechanism = { type: 'generic', handled: true };
        var currentMechanism = firstException.mechanism;
        firstException.mechanism = __assign(__assign(__assign({}, defaultMechanism), currentMechanism), newMechanism);
        if (newMechanism && 'data' in newMechanism) {
            var mergedData = __assign(__assign({}, (currentMechanism && currentMechanism.data)), newMechanism.data);
            firstException.mechanism.data = mergedData;
        }
    }
    /**
     * Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
     * in question), and marks it captured if not.
     *
     * This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
     * record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
     * that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
     * the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
     * caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
     * function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
     * see it.
     *
     * Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
     * them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
     * object wrapper forms so that this check will always work. However, because we need to flag the exact object which
     * will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
     * must be done before the exception captured.
     *
     * @param A thrown exception to check or flag as having been seen
     * @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
     */
    function checkOrSetAlreadyCaught(exception) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (exception && exception.__sentry_captured__) {
            return true;
        }
        try {
            // set it this way rather than by assignment so that it's not ennumerable and therefore isn't recorded by the
            // `ExtraErrorData` integration
            addNonEnumerableProperty(exception, '__sentry_captured__', true);
        }
        catch (err) {
            // `exception` is a primitive, so we can't mark it seen
        }
        return false;
    }
    /**
     * Checks whether the given input is already an array, and if it isn't, wraps it in one.
     *
     * @param maybeArray Input to turn into an array, if necessary
     * @returns The input, if already an array, or an array with the input as the only element, if not
     */
    function arrayify(maybeArray) {
        return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
    }

    // TODO(v8): Move everything in this file into the browser package. Nothing here is generic and we run risk of leaking browser types into non-browser packages.
    var WINDOW$5 = GLOBAL_OBJ;
    var DEBOUNCE_DURATION = 1000;
    var debounceTimerID;
    var lastCapturedEventType;
    var lastCapturedEventTargetId;
    /**
     * Add an instrumentation handler for when a click or a keypress happens.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addClickKeypressInstrumentationHandler(handler) {
        var type = 'dom';
        addHandler(type, handler);
        maybeInstrument(type, instrumentDOM);
    }
    /** Exported for tests only. */
    function instrumentDOM() {
        if (!WINDOW$5.document) {
            return;
        }
        // Make it so that any click or keypress that is unhandled / bubbled up all the way to the document triggers our dom
        // handlers. (Normally we have only one, which captures a breadcrumb for each click or keypress.) Do this before
        // we instrument `addEventListener` so that we don't end up attaching this handler twice.
        var triggerDOMHandler = triggerHandlers.bind(null, 'dom');
        var globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
        WINDOW$5.document.addEventListener('click', globalDOMEventHandler, false);
        WINDOW$5.document.addEventListener('keypress', globalDOMEventHandler, false);
        // After hooking into click and keypress events bubbled up to `document`, we also hook into user-handled
        // clicks & keypresses, by adding an event listener of our own to any element to which they add a listener. That
        // way, whenever one of their handlers is triggered, ours will be, too. (This is needed because their handler
        // could potentially prevent the event from bubbling up to our global listeners. This way, our handler are still
        // guaranteed to fire at least once.)
        ['EventTarget', 'Node'].forEach(function (target) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            var proto = WINDOW$5[target] && WINDOW$5[target].prototype;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
            if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
                return;
            }
            fill(proto, 'addEventListener', function (originalAddEventListener) {
                return function (type, listener, options) {
                    if (type === 'click' || type == 'keypress') {
                        try {
                            var el = this;
                            var handlers = (el.__sentry_instrumentation_handlers__ = el.__sentry_instrumentation_handlers__ || {});
                            var handlerForType = (handlers[type] = handlers[type] || { refCount: 0 });
                            if (!handlerForType.handler) {
                                var handler = makeDOMEventHandler(triggerDOMHandler);
                                handlerForType.handler = handler;
                                originalAddEventListener.call(this, type, handler, options);
                            }
                            handlerForType.refCount++;
                        }
                        catch (e) {
                            // Accessing dom properties is always fragile.
                            // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
                        }
                    }
                    return originalAddEventListener.call(this, type, listener, options);
                };
            });
            fill(proto, 'removeEventListener', function (originalRemoveEventListener) {
                return function (type, listener, options) {
                    if (type === 'click' || type == 'keypress') {
                        try {
                            var el = this;
                            var handlers = el.__sentry_instrumentation_handlers__ || {};
                            var handlerForType = handlers[type];
                            if (handlerForType) {
                                handlerForType.refCount--;
                                // If there are no longer any custom handlers of the current type on this element, we can remove ours, too.
                                if (handlerForType.refCount <= 0) {
                                    originalRemoveEventListener.call(this, type, handlerForType.handler, options);
                                    handlerForType.handler = undefined;
                                    delete handlers[type]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
                                }
                                // If there are no longer any custom handlers of any type on this element, cleanup everything.
                                if (Object.keys(handlers).length === 0) {
                                    delete el.__sentry_instrumentation_handlers__;
                                }
                            }
                        }
                        catch (e) {
                            // Accessing dom properties is always fragile.
                            // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
                        }
                    }
                    return originalRemoveEventListener.call(this, type, listener, options);
                };
            });
        });
    }
    /**
     * Check whether the event is similar to the last captured one. For example, two click events on the same button.
     */
    function isSimilarToLastCapturedEvent(event) {
        // If both events have different type, then user definitely performed two separate actions. e.g. click + keypress.
        if (event.type !== lastCapturedEventType) {
            return false;
        }
        try {
            // If both events have the same type, it's still possible that actions were performed on different targets.
            // e.g. 2 clicks on different buttons.
            if (!event.target || event.target._sentryId !== lastCapturedEventTargetId) {
                return false;
            }
        }
        catch (e) {
            // just accessing `target` property can throw an exception in some rare circumstances
            // see: https://github.com/getsentry/sentry-javascript/issues/838
        }
        // If both events have the same type _and_ same `target` (an element which triggered an event, _not necessarily_
        // to which an event listener was attached), we treat them as the same action, as we want to capture
        // only one breadcrumb. e.g. multiple clicks on the same button, or typing inside a user input box.
        return true;
    }
    /**
     * Decide whether an event should be captured.
     * @param event event to be captured
     */
    function shouldSkipDOMEvent(eventType, target) {
        // We are only interested in filtering `keypress` events for now.
        if (eventType !== 'keypress') {
            return false;
        }
        if (!target || !target.tagName) {
            return true;
        }
        // Only consider keypress events on actual input elements. This will disregard keypresses targeting body
        // e.g.tabbing through elements, hotkeys, etc.
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return false;
        }
        return true;
    }
    /**
     * Wraps addEventListener to capture UI breadcrumbs
     */
    function makeDOMEventHandler(handler, globalListener) {
        if (globalListener === void 0) { globalListener = false; }
        return function (event) {
            // It's possible this handler might trigger multiple times for the same
            // event (e.g. event propagation through node ancestors).
            // Ignore if we've already captured that event.
            if (!event || event['_sentryCaptured']) {
                return;
            }
            var target = getEventTarget(event);
            // We always want to skip _some_ events.
            if (shouldSkipDOMEvent(event.type, target)) {
                return;
            }
            // Mark event as "seen"
            addNonEnumerableProperty(event, '_sentryCaptured', true);
            if (target && !target._sentryId) {
                // Add UUID to event target so we can identify if
                addNonEnumerableProperty(target, '_sentryId', uuid4());
            }
            var name = event.type === 'keypress' ? 'input' : event.type;
            // If there is no last captured event, it means that we can safely capture the new event and store it for future comparisons.
            // If there is a last captured event, see if the new event is different enough to treat it as a unique one.
            // If that's the case, emit the previous event and store locally the newly-captured DOM event.
            if (!isSimilarToLastCapturedEvent(event)) {
                var handlerData = { event: event, name: name, global: globalListener };
                handler(handlerData);
                lastCapturedEventType = event.type;
                lastCapturedEventTargetId = target ? target._sentryId : undefined;
            }
            // Start a new debounce timer that will prevent us from capturing multiple events that should be grouped together.
            clearTimeout(debounceTimerID);
            debounceTimerID = WINDOW$5.setTimeout(function () {
                lastCapturedEventTargetId = undefined;
                lastCapturedEventType = undefined;
            }, DEBOUNCE_DURATION);
        };
    }
    function getEventTarget(event) {
        try {
            return event.target;
        }
        catch (e) {
            // just accessing `target` property can throw an exception in some rare circumstances
            // see: https://github.com/getsentry/sentry-javascript/issues/838
            return null;
        }
    }

    // Based on https://github.com/angular/angular.js/pull/13945/files
    // eslint-disable-next-line deprecation/deprecation
    var WINDOW$4 = getGlobalObject();
    /**
     * Tells whether current environment supports History API
     * {@link supportsHistory}.
     *
     * @returns Answer to the given question.
     */
    function supportsHistory() {
        // NOTE: in Chrome App environment, touching history.pushState, *even inside
        //       a try/catch block*, will cause Chrome to output an error to console.error
        // borrowed from: https://github.com/angular/angular.js/pull/13945/files
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var chromeVar = WINDOW$4.chrome;
        var isChromePackagedApp = chromeVar && chromeVar.app && chromeVar.app.runtime;
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        var hasHistoryApi = 'history' in WINDOW$4 && !!WINDOW$4.history.pushState && !!WINDOW$4.history.replaceState;
        return !isChromePackagedApp && hasHistoryApi;
    }

    // eslint-disable-next-line deprecation/deprecation
    var WINDOW$3 = getGlobalObject();
    /**
     * Tells whether current environment supports Fetch API
     * {@link supportsFetch}.
     *
     * @returns Answer to the given question.
     */
    function supportsFetch() {
        if (!('fetch' in WINDOW$3)) {
            return false;
        }
        try {
            new Headers();
            new Request('http://www.example.com');
            new Response();
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * isNativeFetch checks if the given function is a native implementation of fetch()
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    function isNativeFetch(func) {
        return func && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
    }
    /**
     * Tells whether current environment supports Fetch API natively
     * {@link supportsNativeFetch}.
     *
     * @returns true if `window.fetch` is natively implemented, false otherwise
     */
    function supportsNativeFetch() {
        if (typeof EdgeRuntime === 'string') {
            return true;
        }
        if (!supportsFetch()) {
            return false;
        }
        // Fast path to avoid DOM I/O
        // eslint-disable-next-line @typescript-eslint/unbound-method
        if (isNativeFetch(WINDOW$3.fetch)) {
            return true;
        }
        // window.fetch is implemented, but is polyfilled or already wrapped (e.g: by a chrome extension)
        // so create a "pure" iframe to see if that has native fetch
        var result = false;
        var doc = WINDOW$3.document;
        // eslint-disable-next-line deprecation/deprecation
        if (doc && typeof doc.createElement === 'function') {
            try {
                var sandbox = doc.createElement('iframe');
                sandbox.hidden = true;
                doc.head.appendChild(sandbox);
                if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    result = isNativeFetch(sandbox.contentWindow.fetch);
                }
                doc.head.removeChild(sandbox);
            }
            catch (err) {
                logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', err);
            }
        }
        return result;
    }

    /**
     * Add an instrumentation handler for when a fetch request happens.
     * The handler function is called once when the request starts and once when it ends,
     * which can be identified by checking if it has an `endTimestamp`.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addFetchInstrumentationHandler(handler) {
        var type = 'fetch';
        addHandler(type, handler);
        maybeInstrument(type, instrumentFetch);
    }
    function instrumentFetch() {
        if (!supportsNativeFetch()) {
            return;
        }
        fill(GLOBAL_OBJ, 'fetch', function (originalFetch) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _a = parseFetchArgs(args), method = _a.method, url = _a.url;
                var handlerData = {
                    args: args,
                    fetchData: {
                        method: method,
                        url: url,
                    },
                    startTimestamp: Date.now(),
                };
                triggerHandlers('fetch', __assign({}, handlerData));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return originalFetch.apply(GLOBAL_OBJ, args).then(function (response) {
                    var finishedHandlerData = __assign(__assign({}, handlerData), { endTimestamp: Date.now(), response: response });
                    triggerHandlers('fetch', finishedHandlerData);
                    return response;
                }, function (error) {
                    var erroredHandlerData = __assign(__assign({}, handlerData), { endTimestamp: Date.now(), error: error });
                    triggerHandlers('fetch', erroredHandlerData);
                    // NOTE: If you are a Sentry user, and you are seeing this stack frame,
                    //       it means the sentry.javascript SDK caught an error invoking your application code.
                    //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
                    throw error;
                });
            };
        });
    }
    function hasProp(obj, prop) {
        return !!obj && typeof obj === 'object' && !!obj[prop];
    }
    function getUrlFromResource(resource) {
        if (typeof resource === 'string') {
            return resource;
        }
        if (!resource) {
            return '';
        }
        if (hasProp(resource, 'url')) {
            return resource.url;
        }
        if (resource.toString) {
            return resource.toString();
        }
        return '';
    }
    /**
     * Parses the fetch arguments to find the used Http method and the url of the request.
     * Exported for tests only.
     */
    function parseFetchArgs(fetchArgs) {
        if (fetchArgs.length === 0) {
            return { method: 'GET', url: '' };
        }
        if (fetchArgs.length === 2) {
            var _a = __read(fetchArgs, 2), url = _a[0], options = _a[1];
            return {
                url: getUrlFromResource(url),
                method: hasProp(options, 'method') ? String(options.method).toUpperCase() : 'GET',
            };
        }
        var arg = fetchArgs[0];
        return {
            url: getUrlFromResource(arg),
            method: hasProp(arg, 'method') ? String(arg.method).toUpperCase() : 'GET',
        };
    }

    var _oldOnErrorHandler = null;
    /**
     * Add an instrumentation handler for when an error is captured by the global error handler.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addGlobalErrorInstrumentationHandler(handler) {
        var type = 'error';
        addHandler(type, handler);
        maybeInstrument(type, instrumentError);
    }
    function instrumentError() {
        _oldOnErrorHandler = GLOBAL_OBJ.onerror;
        GLOBAL_OBJ.onerror = function (msg, url, line, column, error) {
            var handlerData = {
                column: column,
                error: error,
                line: line,
                msg: msg,
                url: url,
            };
            triggerHandlers('error', handlerData);
            if (_oldOnErrorHandler && !_oldOnErrorHandler.__SENTRY_LOADER__) {
                // eslint-disable-next-line prefer-rest-params
                return _oldOnErrorHandler.apply(this, arguments);
            }
            return false;
        };
        GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    var _oldOnUnhandledRejectionHandler = null;
    /**
     * Add an instrumentation handler for when an unhandled promise rejection is captured.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addGlobalUnhandledRejectionInstrumentationHandler(handler) {
        var type = 'unhandledrejection';
        addHandler(type, handler);
        maybeInstrument(type, instrumentUnhandledRejection);
    }
    function instrumentUnhandledRejection() {
        _oldOnUnhandledRejectionHandler = GLOBAL_OBJ.onunhandledrejection;
        GLOBAL_OBJ.onunhandledrejection = function (e) {
            var handlerData = e;
            triggerHandlers('unhandledrejection', handlerData);
            if (_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) {
                // eslint-disable-next-line prefer-rest-params
                return _oldOnUnhandledRejectionHandler.apply(this, arguments);
            }
            return true;
        };
        GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
    }

    // TODO(v8): Move everything in this file into the browser package. Nothing here is generic and we run risk of leaking browser types into non-browser packages.
    var WINDOW$2 = GLOBAL_OBJ;
    var lastHref;
    /**
     * Add an instrumentation handler for when a fetch request happens.
     * The handler function is called once when the request starts and once when it ends,
     * which can be identified by checking if it has an `endTimestamp`.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addHistoryInstrumentationHandler(handler) {
        var type = 'history';
        addHandler(type, handler);
        maybeInstrument(type, instrumentHistory);
    }
    function instrumentHistory() {
        if (!supportsHistory()) {
            return;
        }
        var oldOnPopState = WINDOW$2.onpopstate;
        WINDOW$2.onpopstate = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var to = WINDOW$2.location.href;
            // keep track of the current URL state, as we always receive only the updated state
            var from = lastHref;
            lastHref = to;
            var handlerData = { from: from, to: to };
            triggerHandlers('history', handlerData);
            if (oldOnPopState) {
                // Apparently this can throw in Firefox when incorrectly implemented plugin is installed.
                // https://github.com/getsentry/sentry-javascript/issues/3344
                // https://github.com/bugsnag/bugsnag-js/issues/469
                try {
                    return oldOnPopState.apply(this, args);
                }
                catch (_oO) {
                    // no-empty
                }
            }
        };
        function historyReplacementFunction(originalHistoryFunction) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var url = args.length > 2 ? args[2] : undefined;
                if (url) {
                    // coerce to string (this is what pushState does)
                    var from = lastHref;
                    var to = String(url);
                    // keep track of the current URL state, as we always receive only the updated state
                    lastHref = to;
                    var handlerData = { from: from, to: to };
                    triggerHandlers('history', handlerData);
                }
                return originalHistoryFunction.apply(this, args);
            };
        }
        fill(WINDOW$2.history, 'pushState', historyReplacementFunction);
        fill(WINDOW$2.history, 'replaceState', historyReplacementFunction);
    }

    // TODO(v8): Move everything in this file into the browser package. Nothing here is generic and we run risk of leaking browser types into non-browser packages.
    var WINDOW$1 = GLOBAL_OBJ;
    var SENTRY_XHR_DATA_KEY = '__sentry_xhr_v3__';
    /**
     * Add an instrumentation handler for when an XHR request happens.
     * The handler function is called once when the request starts and once when it ends,
     * which can be identified by checking if it has an `endTimestamp`.
     *
     * Use at your own risk, this might break without changelog notice, only used internally.
     * @hidden
     */
    function addXhrInstrumentationHandler(handler) {
        var type = 'xhr';
        addHandler(type, handler);
        maybeInstrument(type, instrumentXHR);
    }
    /** Exported only for tests. */
    function instrumentXHR() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!WINDOW$1.XMLHttpRequest) {
            return;
        }
        var xhrproto = XMLHttpRequest.prototype;
        fill(xhrproto, 'open', function (originalOpen) {
            return function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var startTimestamp = Date.now();
                // open() should always be called with two or more arguments
                // But to be on the safe side, we actually validate this and bail out if we don't have a method & url
                var method = isString(args[0]) ? args[0].toUpperCase() : undefined;
                var url = parseUrl$1(args[1]);
                if (!method || !url) {
                    return originalOpen.apply(this, args);
                }
                this[SENTRY_XHR_DATA_KEY] = {
                    method: method,
                    url: url,
                    request_headers: {},
                };
                // if Sentry key appears in URL, don't capture it as a request
                if (method === 'POST' && url.match(/sentry_key/)) {
                    this.__sentry_own_request__ = true;
                }
                var onreadystatechangeHandler = function () {
                    // For whatever reason, this is not the same instance here as from the outer method
                    var xhrInfo = _this[SENTRY_XHR_DATA_KEY];
                    if (!xhrInfo) {
                        return;
                    }
                    if (_this.readyState === 4) {
                        try {
                            // touching statusCode in some platforms throws
                            // an exception
                            xhrInfo.status_code = _this.status;
                        }
                        catch (e) {
                            /* do nothing */
                        }
                        var handlerData = {
                            args: [method, url],
                            endTimestamp: Date.now(),
                            startTimestamp: startTimestamp,
                            xhr: _this,
                        };
                        triggerHandlers('xhr', handlerData);
                    }
                };
                if ('onreadystatechange' in this && typeof this.onreadystatechange === 'function') {
                    fill(this, 'onreadystatechange', function (original) {
                        return function () {
                            var readyStateArgs = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                readyStateArgs[_i] = arguments[_i];
                            }
                            onreadystatechangeHandler();
                            return original.apply(this, readyStateArgs);
                        };
                    });
                }
                else {
                    this.addEventListener('readystatechange', onreadystatechangeHandler);
                }
                // Intercepting `setRequestHeader` to access the request headers of XHR instance.
                // This will only work for user/library defined headers, not for the default/browser-assigned headers.
                // Request cookies are also unavailable for XHR, as `Cookie` header can't be defined by `setRequestHeader`.
                fill(this, 'setRequestHeader', function (original) {
                    return function () {
                        var setRequestHeaderArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            setRequestHeaderArgs[_i] = arguments[_i];
                        }
                        var _a = __read(setRequestHeaderArgs, 2), header = _a[0], value = _a[1];
                        var xhrInfo = this[SENTRY_XHR_DATA_KEY];
                        if (xhrInfo && isString(header) && isString(value)) {
                            xhrInfo.request_headers[header.toLowerCase()] = value;
                        }
                        return original.apply(this, setRequestHeaderArgs);
                    };
                });
                return originalOpen.apply(this, args);
            };
        });
        fill(xhrproto, 'send', function (originalSend) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var sentryXhrData = this[SENTRY_XHR_DATA_KEY];
                if (!sentryXhrData) {
                    return originalSend.apply(this, args);
                }
                if (args[0] !== undefined) {
                    sentryXhrData.body = args[0];
                }
                var handlerData = {
                    args: [sentryXhrData.method, sentryXhrData.url],
                    startTimestamp: Date.now(),
                    xhr: this,
                };
                triggerHandlers('xhr', handlerData);
                return originalSend.apply(this, args);
            };
        });
    }
    function parseUrl$1(url) {
        if (isString(url)) {
            return url;
        }
        try {
            // url can be a string or URL
            // but since URL is not available in IE11, we do not check for it,
            // but simply assume it is an URL and return `toString()` from it (which returns the full URL)
            // If that fails, we just return undefined
            return url.toString();
        }
        catch (_a) { } // eslint-disable-line no-empty
        return undefined;
    }

    /*
     * This module exists for optimizations in the build process through rollup and terser.  We define some global
     * constants, which can be overridden during build. By guarding certain pieces of code with functions that return these
     * constants, we can control whether or not they appear in the final bundle. (Any code guarded by a false condition will
     * never run, and will hence be dropped during treeshaking.) The two primary uses for this are stripping out calls to
     * `logger` and preventing node-related code from appearing in browser bundles.
     *
     * Attention:
     * This file should not be used to define constants/flags that are intended to be used for tree-shaking conducted by
     * users. These flags should live in their respective packages, as we identified user tooling (specifically webpack)
     * having issues tree-shaking these constants across package boundaries.
     * An example for this is the true constant. It is declared in each package individually because we want
     * users to be able to shake away expressions that it guards.
     */
    /**
     * Get source of SDK.
     */
    function getSDKSource() {
        // @ts-expect-error "cdn" is injected by rollup during build process
        return "cdn";
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /**
     * Helper to decycle json objects
     */
    function memoBuilder() {
        var hasWeakSet = typeof WeakSet === 'function';
        var inner = hasWeakSet ? new WeakSet() : [];
        function memoize(obj) {
            if (hasWeakSet) {
                if (inner.has(obj)) {
                    return true;
                }
                inner.add(obj);
                return false;
            }
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (var i = 0; i < inner.length; i++) {
                var value = inner[i];
                if (value === obj) {
                    return true;
                }
            }
            inner.push(obj);
            return false;
        }
        function unmemoize(obj) {
            if (hasWeakSet) {
                inner.delete(obj);
            }
            else {
                for (var i = 0; i < inner.length; i++) {
                    if (inner[i] === obj) {
                        inner.splice(i, 1);
                        break;
                    }
                }
            }
        }
        return [memoize, unmemoize];
    }

    /**
     * Recursively normalizes the given object.
     *
     * - Creates a copy to prevent original input mutation
     * - Skips non-enumerable properties
     * - When stringifying, calls `toJSON` if implemented
     * - Removes circular references
     * - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
     * - Translates known global objects/classes to a string representations
     * - Takes care of `Error` object serialization
     * - Optionally limits depth of final output
     * - Optionally limits number of properties/elements included in any single object/array
     *
     * @param input The object to be normalized.
     * @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
     * @param maxProperties The max number of elements or properties to be included in any single array or
     * object in the normallized output.
     * @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function normalize(input, depth, maxProperties) {
        if (depth === void 0) { depth = 100; }
        if (maxProperties === void 0) { maxProperties = +Infinity; }
        try {
            // since we're at the outermost level, we don't provide a key
            return visit('', input, depth, maxProperties);
        }
        catch (err) {
            return { ERROR: "**non-serializable** (".concat(err, ")") };
        }
    }
    /** JSDoc */
    function normalizeToSize(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object,
    // Default Node.js REPL depth
    depth,
    // 100kB, as 200kB is max payload size, so half sounds reasonable
    maxSize) {
        if (depth === void 0) { depth = 3; }
        if (maxSize === void 0) { maxSize = 100 * 1024; }
        var normalized = normalize(object, depth);
        if (jsonSize(normalized) > maxSize) {
            return normalizeToSize(object, depth - 1, maxSize);
        }
        return normalized;
    }
    /**
     * Visits a node to perform normalization on it
     *
     * @param key The key corresponding to the given node
     * @param value The node to be visited
     * @param depth Optional number indicating the maximum recursion depth
     * @param maxProperties Optional maximum number of properties/elements included in any single object/array
     * @param memo Optional Memo class handling decycling
     */
    function visit(key, value, depth, maxProperties, memo) {
        if (depth === void 0) { depth = +Infinity; }
        if (maxProperties === void 0) { maxProperties = +Infinity; }
        if (memo === void 0) { memo = memoBuilder(); }
        var _a = __read(memo, 2), memoize = _a[0], unmemoize = _a[1];
        // Get the simple cases out of the way first
        if (value == null || // this matches null and undefined -> eqeq not eqeqeq
            (['number', 'boolean', 'string'].includes(typeof value) && !isNaN$1(value))) {
            return value;
        }
        var stringified = stringifyValue(key, value);
        // Anything we could potentially dig into more (objects or arrays) will have come back as `"[object XXXX]"`.
        // Everything else will have already been serialized, so if we don't see that pattern, we're done.
        if (!stringified.startsWith('[object ')) {
            return stringified;
        }
        // From here on, we can assert that `value` is either an object or an array.
        // Do not normalize objects that we know have already been normalized. As a general rule, the
        // "__sentry_skip_normalization__" property should only be used sparingly and only should only be set on objects that
        // have already been normalized.
        if (value['__sentry_skip_normalization__']) {
            return value;
        }
        // We can set `__sentry_override_normalization_depth__` on an object to ensure that from there
        // We keep a certain amount of depth.
        // This should be used sparingly, e.g. we use it for the redux integration to ensure we get a certain amount of state.
        var remainingDepth = typeof value['__sentry_override_normalization_depth__'] === 'number'
            ? value['__sentry_override_normalization_depth__']
            : depth;
        // We're also done if we've reached the max depth
        if (remainingDepth === 0) {
            // At this point we know `serialized` is a string of the form `"[object XXXX]"`. Clean it up so it's just `"[XXXX]"`.
            return stringified.replace('object ', '');
        }
        // If we've already visited this branch, bail out, as it's circular reference. If not, note that we're seeing it now.
        if (memoize(value)) {
            return '[Circular ~]';
        }
        // If the value has a `toJSON` method, we call it to extract more information
        var valueWithToJSON = value;
        if (valueWithToJSON && typeof valueWithToJSON.toJSON === 'function') {
            try {
                var jsonValue = valueWithToJSON.toJSON();
                // We need to normalize the return value of `.toJSON()` in case it has circular references
                return visit('', jsonValue, remainingDepth - 1, maxProperties, memo);
            }
            catch (err) {
                // pass (The built-in `toJSON` failed, but we can still try to do it ourselves)
            }
        }
        // At this point we know we either have an object or an array, we haven't seen it before, and we're going to recurse
        // because we haven't yet reached the max depth. Create an accumulator to hold the results of visiting each
        // property/entry, and keep track of the number of items we add to it.
        var normalized = (Array.isArray(value) ? [] : {});
        var numAdded = 0;
        // Before we begin, convert`Error` and`Event` instances into plain objects, since some of each of their relevant
        // properties are non-enumerable and otherwise would get missed.
        var visitable = convertToPlainObject(value);
        for (var visitKey in visitable) {
            // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
            if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
                continue;
            }
            if (numAdded >= maxProperties) {
                normalized[visitKey] = '[MaxProperties ~]';
                break;
            }
            // Recursively visit all the child nodes
            var visitValue = visitable[visitKey];
            normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
            numAdded++;
        }
        // Once we've visited all the branches, remove the parent from memo storage
        unmemoize(value);
        // Return accumulated values
        return normalized;
    }
    /* eslint-disable complexity */
    /**
     * Stringify the given value. Handles various known special values and types.
     *
     * Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
     * the number 1231 into "[Object Number]", nor on `null`, as it will throw.
     *
     * @param value The value to stringify
     * @returns A stringified representation of the given value
     */
    function stringifyValue(key,
    // this type is a tiny bit of a cheat, since this function does handle NaN (which is technically a number), but for
    // our internal use, it'll do
    value) {
        try {
            if (key === 'domain' && value && typeof value === 'object' && value._events) {
                return '[Domain]';
            }
            if (key === 'domainEmitter') {
                return '[DomainEmitter]';
            }
            // It's safe to use `global`, `window`, and `document` here in this manner, as we are asserting using `typeof` first
            // which won't throw if they are not present.
            if (typeof global !== 'undefined' && value === global) {
                return '[Global]';
            }
            // eslint-disable-next-line no-restricted-globals
            if (typeof window !== 'undefined' && value === window) {
                return '[Window]';
            }
            // eslint-disable-next-line no-restricted-globals
            if (typeof document !== 'undefined' && value === document) {
                return '[Document]';
            }
            if (isVueViewModel(value)) {
                return '[VueViewModel]';
            }
            // React's SyntheticEvent thingy
            if (isSyntheticEvent(value)) {
                return '[SyntheticEvent]';
            }
            if (typeof value === 'number' && value !== value) {
                return '[NaN]';
            }
            if (typeof value === 'function') {
                return "[Function: ".concat(getFunctionName(value), "]");
            }
            if (typeof value === 'symbol') {
                return "[".concat(String(value), "]");
            }
            // stringified BigInts are indistinguishable from regular numbers, so we need to label them to avoid confusion
            if (typeof value === 'bigint') {
                return "[BigInt: ".concat(String(value), "]");
            }
            // Now that we've knocked out all the special cases and the primitives, all we have left are objects. Simply casting
            // them to strings means that instances of classes which haven't defined their `toStringTag` will just come out as
            // `"[object Object]"`. If we instead look at the constructor's name (which is the same as the name of the class),
            // we can make sure that only plain objects come out that way.
            var objName = getConstructorName(value);
            // Handle HTML Elements
            if (/^HTML(\w*)Element$/.test(objName)) {
                return "[HTMLElement: ".concat(objName, "]");
            }
            return "[object ".concat(objName, "]");
        }
        catch (err) {
            return "**non-serializable** (".concat(err, ")");
        }
    }
    /* eslint-enable complexity */
    function getConstructorName(value) {
        var prototype = Object.getPrototypeOf(value);
        return prototype ? prototype.constructor.name : 'null prototype';
    }
    /** Calculates bytes size of input string */
    function utf8Length(value) {
        // eslint-disable-next-line no-bitwise
        return ~-encodeURI(value).split(/%..|./).length;
    }
    /** Calculates bytes size of input object */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function jsonSize(value) {
        return utf8Length(JSON.stringify(value));
    }

    /* eslint-disable @typescript-eslint/explicit-function-return-type */
    /** SyncPromise internal states */
    var States;
    (function (States) {
        /** Pending */
        States[States["PENDING"] = 0] = "PENDING";
        /** Resolved / OK */
        States[States["RESOLVED"] = 1] = "RESOLVED";
        /** Rejected / Error */
        States[States["REJECTED"] = 2] = "REJECTED";
    })(States || (States = {}));
    /**
     * Creates a resolved sync promise.
     *
     * @param value the value to resolve the promise with
     * @returns the resolved sync promise
     */
    function resolvedSyncPromise(value) {
        return new SyncPromise(function (resolve) {
            resolve(value);
        });
    }
    /**
     * Creates a rejected sync promise.
     *
     * @param value the value to reject the promise with
     * @returns the rejected sync promise
     */
    function rejectedSyncPromise(reason) {
        return new SyncPromise(function (_, reject) {
            reject(reason);
        });
    }
    /**
     * Thenable class that behaves like a Promise and follows it's interface
     * but is not async internally
     */
    var SyncPromise = /** @class */ (function () {
        function SyncPromise(executor) {
            var _this = this;
            /** JSDoc */
            this._resolve = function (value) {
                _this._setResult(States.RESOLVED, value);
            };
            /** JSDoc */
            this._reject = function (reason) {
                _this._setResult(States.REJECTED, reason);
            };
            /** JSDoc */
            this._setResult = function (state, value) {
                if (_this._state !== States.PENDING) {
                    return;
                }
                if (isThenable(value)) {
                    void value.then(_this._resolve, _this._reject);
                    return;
                }
                _this._state = state;
                _this._value = value;
                _this._executeHandlers();
            };
            /** JSDoc */
            this._executeHandlers = function () {
                if (_this._state === States.PENDING) {
                    return;
                }
                var cachedHandlers = _this._handlers.slice();
                _this._handlers = [];
                cachedHandlers.forEach(function (handler) {
                    if (handler[0]) {
                        return;
                    }
                    if (_this._state === States.RESOLVED) {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        handler[1](_this._value);
                    }
                    if (_this._state === States.REJECTED) {
                        handler[2](_this._value);
                    }
                    handler[0] = true;
                });
            };
            this._state = States.PENDING;
            this._handlers = [];
            try {
                executor(this._resolve, this._reject);
            }
            catch (e) {
                this._reject(e);
            }
        }
        /** JSDoc */
        SyncPromise.prototype.then = function (onfulfilled, onrejected) {
            var _this = this;
            return new SyncPromise(function (resolve, reject) {
                _this._handlers.push([
                    false,
                    function (result) {
                        if (!onfulfilled) {
                            // TODO: ¯\_(ツ)_/¯
                            // TODO: FIXME
                            resolve(result);
                        }
                        else {
                            try {
                                resolve(onfulfilled(result));
                            }
                            catch (e) {
                                reject(e);
                            }
                        }
                    },
                    function (reason) {
                        if (!onrejected) {
                            reject(reason);
                        }
                        else {
                            try {
                                resolve(onrejected(reason));
                            }
                            catch (e) {
                                reject(e);
                            }
                        }
                    },
                ]);
                _this._executeHandlers();
            });
        };
        /** JSDoc */
        SyncPromise.prototype.catch = function (onrejected) {
            return this.then(function (val) { return val; }, onrejected);
        };
        /** JSDoc */
        SyncPromise.prototype.finally = function (onfinally) {
            var _this = this;
            return new SyncPromise(function (resolve, reject) {
                var val;
                var isRejected;
                return _this.then(function (value) {
                    isRejected = false;
                    val = value;
                    if (onfinally) {
                        onfinally();
                    }
                }, function (reason) {
                    isRejected = true;
                    val = reason;
                    if (onfinally) {
                        onfinally();
                    }
                }).then(function () {
                    if (isRejected) {
                        reject(val);
                        return;
                    }
                    resolve(val);
                });
            });
        };
        return SyncPromise;
    }());

    /**
     * Creates an new PromiseBuffer object with the specified limit
     * @param limit max number of promises that can be stored in the buffer
     */
    function makePromiseBuffer(limit) {
        var buffer = [];
        function isReady() {
            return limit === undefined || buffer.length < limit;
        }
        /**
         * Remove a promise from the queue.
         *
         * @param task Can be any PromiseLike<T>
         * @returns Removed promise.
         */
        function remove(task) {
            return buffer.splice(buffer.indexOf(task), 1)[0];
        }
        /**
         * Add a promise (representing an in-flight action) to the queue, and set it to remove itself on fulfillment.
         *
         * @param taskProducer A function producing any PromiseLike<T>; In previous versions this used to be `task:
         *        PromiseLike<T>`, but under that model, Promises were instantly created on the call-site and their executor
         *        functions therefore ran immediately. Thus, even if the buffer was full, the action still happened. By
         *        requiring the promise to be wrapped in a function, we can defer promise creation until after the buffer
         *        limit check.
         * @returns The original promise.
         */
        function add(taskProducer) {
            if (!isReady()) {
                return rejectedSyncPromise(new SentryError('Not adding Promise because buffer limit was reached.'));
            }
            // start the task and add its promise to the queue
            var task = taskProducer();
            if (buffer.indexOf(task) === -1) {
                buffer.push(task);
            }
            void task
                .then(function () { return remove(task); })
                // Use `then(null, rejectionHandler)` rather than `catch(rejectionHandler)` so that we can use `PromiseLike`
                // rather than `Promise`. `PromiseLike` doesn't have a `.catch` method, making its polyfill smaller. (ES5 didn't
                // have promises, so TS has to polyfill when down-compiling.)
                .then(null, function () {
                return remove(task).then(null, function () {
                    // We have to add another catch here because `remove()` starts a new promise chain.
                });
            });
            return task;
        }
        /**
         * Wait for all promises in the queue to resolve or for timeout to expire, whichever comes first.
         *
         * @param timeout The time, in ms, after which to resolve to `false` if the queue is still non-empty. Passing `0` (or
         * not passing anything) will make the promise wait as long as it takes for the queue to drain before resolving to
         * `true`.
         * @returns A promise which will resolve to `true` if the queue is already empty or drains before the timeout, and
         * `false` otherwise
         */
        function drain(timeout) {
            return new SyncPromise(function (resolve, reject) {
                var counter = buffer.length;
                if (!counter) {
                    return resolve(true);
                }
                // wait for `timeout` ms and then resolve to `false` (if not cancelled first)
                var capturedSetTimeout = setTimeout(function () {
                    if (timeout && timeout > 0) {
                        resolve(false);
                    }
                }, timeout);
                // if all promises resolve in time, cancel the timer and resolve to `true`
                buffer.forEach(function (item) {
                    void resolvedSyncPromise(item).then(function () {
                        if (!--counter) {
                            clearTimeout(capturedSetTimeout);
                            resolve(true);
                        }
                    }, reject);
                });
            });
        }
        return {
            $: buffer,
            add: add,
            drain: drain,
        };
    }

    /**
     * Parses string form of URL into an object
     * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
     * // intentionally using regex and not <a/> href parsing trick because React Native and other
     * // environments where DOM might not be available
     * @returns parsed URL object
     */
    function parseUrl(url) {
        if (!url) {
            return {};
        }
        var match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
        if (!match) {
            return {};
        }
        // coerce to undefined values to empty string so we don't get 'undefined'
        var query = match[6] || '';
        var fragment = match[8] || '';
        return {
            host: match[4],
            path: match[5],
            protocol: match[2],
            search: query,
            hash: fragment,
            relative: match[5] + query + fragment, // everything minus origin
        };
    }

    // Note: Ideally the `SeverityLevel` type would be derived from `validSeverityLevels`, but that would mean either
    //
    // a) moving `validSeverityLevels` to `@sentry/types`,
    // b) moving the`SeverityLevel` type here, or
    // c) importing `validSeverityLevels` from here into `@sentry/types`.
    //
    // Option A would make `@sentry/types` a runtime dependency of `@sentry/utils` (not good), and options B and C would
    // create a circular dependency between `@sentry/types` and `@sentry/utils` (also not good). So a TODO accompanying the
    // type, reminding anyone who changes it to change this list also, will have to do.
    var validSeverityLevels = ['fatal', 'error', 'warning', 'log', 'info', 'debug'];
    /**
     * Converts a string-based level into a `SeverityLevel`, normalizing it along the way.
     *
     * @param level String representation of desired `SeverityLevel`.
     * @returns The `SeverityLevel` corresponding to the given string, or 'log' if the string isn't a valid level.
     */
    function severityLevelFromString(level) {
        return (level === 'warn' ? 'warning' : validSeverityLevels.includes(level) ? level : 'log');
    }

    var ONE_SECOND_IN_MS = 1000;
    /**
     * Returns a timestamp in seconds since the UNIX epoch using the Date API.
     *
     * TODO(v8): Return type should be rounded.
     */
    function dateTimestampInSeconds() {
        return Date.now() / ONE_SECOND_IN_MS;
    }
    /**
     * Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
     * support the API.
     *
     * Wrapping the native API works around differences in behavior from different browsers.
     */
    function createUnixTimestampInSecondsFunc() {
        var performance = GLOBAL_OBJ.performance;
        if (!performance || !performance.now) {
            return dateTimestampInSeconds;
        }
        // Some browser and environments don't have a timeOrigin, so we fallback to
        // using Date.now() to compute the starting time.
        var approxStartingTimeOrigin = Date.now() - performance.now();
        var timeOrigin = performance.timeOrigin == undefined ? approxStartingTimeOrigin : performance.timeOrigin;
        // performance.now() is a monotonic clock, which means it starts at 0 when the process begins. To get the current
        // wall clock time (actual UNIX timestamp), we need to add the starting time origin and the current time elapsed.
        //
        // TODO: This does not account for the case where the monotonic clock that powers performance.now() drifts from the
        // wall clock time, which causes the returned timestamp to be inaccurate. We should investigate how to detect and
        // correct for this.
        // See: https://github.com/getsentry/sentry-javascript/issues/2590
        // See: https://github.com/mdn/content/issues/4713
        // See: https://dev.to/noamr/when-a-millisecond-is-not-a-millisecond-3h6
        return function () {
            return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
        };
    }
    /**
     * Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
     * availability of the Performance API.
     *
     * BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
     * asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
     * skew can grow to arbitrary amounts like days, weeks or months.
     * See https://github.com/getsentry/sentry-javascript/issues/2590.
     */
    var timestampInSeconds = createUnixTimestampInSecondsFunc();
    /**
     * The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
     * performance API is available.
     */
    ((function () {
        // Unfortunately browsers may report an inaccurate time origin data, through either performance.timeOrigin or
        // performance.timing.navigationStart, which results in poor results in performance data. We only treat time origin
        // data as reliable if they are within a reasonable threshold of the current time.
        var performance = GLOBAL_OBJ.performance;
        if (!performance || !performance.now) {
            return undefined;
        }
        var threshold = 3600 * 1000;
        var performanceNow = performance.now();
        var dateNow = Date.now();
        // if timeOrigin isn't available set delta to threshold so it isn't used
        var timeOriginDelta = performance.timeOrigin
            ? Math.abs(performance.timeOrigin + performanceNow - dateNow)
            : threshold;
        var timeOriginIsReliable = timeOriginDelta < threshold;
        // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
        // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
        // Also as of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always
        // a valid fallback. In the absence of an initial time provided by the browser, fallback to the current time from the
        // Date API.
        // eslint-disable-next-line deprecation/deprecation
        var navigationStart = performance.timing && performance.timing.navigationStart;
        var hasNavigationStart = typeof navigationStart === 'number';
        // if navigationStart isn't available set delta to threshold so it isn't used
        var navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
        var navigationStartIsReliable = navigationStartDelta < threshold;
        if (timeOriginIsReliable || navigationStartIsReliable) {
            // Use the more reliable time origin
            if (timeOriginDelta <= navigationStartDelta) {
                return performance.timeOrigin;
            }
            else {
                return navigationStart;
            }
        }
        return dateNow;
    }))();

    var SENTRY_BAGGAGE_KEY_PREFIX = 'sentry-';
    var SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
    /**
     * Takes a baggage header and turns it into Dynamic Sampling Context, by extracting all the "sentry-" prefixed values
     * from it.
     *
     * @param baggageHeader A very bread definition of a baggage header as it might appear in various frameworks.
     * @returns The Dynamic Sampling Context that was found on `baggageHeader`, if there was any, `undefined` otherwise.
     */
    function baggageHeaderToDynamicSamplingContext(
    // Very liberal definition of what any incoming header might look like
    baggageHeader) {
        if (!isString(baggageHeader) && !Array.isArray(baggageHeader)) {
            return undefined;
        }
        // Intermediary object to store baggage key value pairs of incoming baggage headers on.
        // It is later used to read Sentry-DSC-values from.
        var baggageObject = {};
        if (Array.isArray(baggageHeader)) {
            // Combine all baggage headers into one object containing the baggage values so we can later read the Sentry-DSC-values from it
            baggageObject = baggageHeader.reduce(function (acc, curr) {
                var e_1, _a;
                var currBaggageObject = baggageHeaderToObject(curr);
                try {
                    for (var _b = __values(Object.keys(currBaggageObject)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var key = _c.value;
                        acc[key] = currBaggageObject[key];
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return acc;
            }, {});
        }
        else {
            // Return undefined if baggage header is an empty string (technically an empty baggage header is not spec conform but
            // this is how we choose to handle it)
            if (!baggageHeader) {
                return undefined;
            }
            baggageObject = baggageHeaderToObject(baggageHeader);
        }
        // Read all "sentry-" prefixed values out of the baggage object and put it onto a dynamic sampling context object.
        var dynamicSamplingContext = Object.entries(baggageObject).reduce(function (acc, _a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
                var nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
                acc[nonPrefixedKey] = value;
            }
            return acc;
        }, {});
        // Only return a dynamic sampling context object if there are keys in it.
        // A keyless object means there were no sentry values on the header, which means that there is no DSC.
        if (Object.keys(dynamicSamplingContext).length > 0) {
            return dynamicSamplingContext;
        }
        else {
            return undefined;
        }
    }
    /**
     * Will parse a baggage header, which is a simple key-value map, into a flat object.
     *
     * @param baggageHeader The baggage header to parse.
     * @returns a flat object containing all the key-value pairs from `baggageHeader`.
     */
    function baggageHeaderToObject(baggageHeader) {
        return baggageHeader
            .split(',')
            .map(function (baggageEntry) { return baggageEntry.split('=').map(function (keyOrValue) { return decodeURIComponent(keyOrValue.trim()); }); })
            .reduce(function (acc, _a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            acc[key] = value;
            return acc;
        }, {});
    }

    // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- RegExp is used for readability here
    var TRACEPARENT_REGEXP = new RegExp('^[ \\t]*' + // whitespace
        '([0-9a-f]{32})?' + // trace_id
        '-?([0-9a-f]{16})?' + // span_id
        '-?([01])?' + // sampled
        '[ \\t]*$');
    /**
     * Extract transaction context data from a `sentry-trace` header.
     *
     * @param traceparent Traceparent string
     *
     * @returns Object containing data from the header, or undefined if traceparent string is malformed
     */
    function extractTraceparentData(traceparent) {
        if (!traceparent) {
            return undefined;
        }
        var matches = traceparent.match(TRACEPARENT_REGEXP);
        if (!matches) {
            return undefined;
        }
        var parentSampled;
        if (matches[3] === '1') {
            parentSampled = true;
        }
        else if (matches[3] === '0') {
            parentSampled = false;
        }
        return {
            traceId: matches[1],
            parentSampled: parentSampled,
            parentSpanId: matches[2],
        };
    }
    /**
     * Create tracing context from incoming headers.
     *
     * @deprecated Use `propagationContextFromHeaders` instead.
     */
    // TODO(v8): Remove this function
    function tracingContextFromHeaders(sentryTrace, baggage) {
        var traceparentData = extractTraceparentData(sentryTrace);
        var dynamicSamplingContext = baggageHeaderToDynamicSamplingContext(baggage);
        var _a = traceparentData || {}, traceId = _a.traceId, parentSpanId = _a.parentSpanId, parentSampled = _a.parentSampled;
        if (!traceparentData) {
            return {
                traceparentData: traceparentData,
                dynamicSamplingContext: undefined,
                propagationContext: {
                    traceId: traceId || uuid4(),
                    spanId: uuid4().substring(16),
                },
            };
        }
        else {
            return {
                traceparentData: traceparentData,
                dynamicSamplingContext: dynamicSamplingContext || {},
                propagationContext: {
                    traceId: traceId || uuid4(),
                    parentSpanId: parentSpanId || uuid4().substring(16),
                    spanId: uuid4().substring(16),
                    sampled: parentSampled,
                    dsc: dynamicSamplingContext || {}, // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
                },
            };
        }
    }

    /**
     * Creates an envelope.
     * Make sure to always explicitly provide the generic to this function
     * so that the envelope types resolve correctly.
     */
    function createEnvelope(headers, items) {
        if (items === void 0) { items = []; }
        return [headers, items];
    }
    /**
     * Add an item to an envelope.
     * Make sure to always explicitly provide the generic to this function
     * so that the envelope types resolve correctly.
     */
    function addItemToEnvelope(envelope, newItem) {
        var _a = __read(envelope, 2), headers = _a[0], items = _a[1];
        return [headers, __spreadArray(__spreadArray([], __read(items), false), [newItem], false)];
    }
    /**
     * Convenience function to loop through the items and item types of an envelope.
     * (This function was mostly created because working with envelope types is painful at the moment)
     *
     * If the callback returns true, the rest of the items will be skipped.
     */
    function forEachEnvelopeItem(envelope, callback) {
        var e_1, _a;
        var envelopeItems = envelope[1];
        try {
            for (var envelopeItems_1 = __values(envelopeItems), envelopeItems_1_1 = envelopeItems_1.next(); !envelopeItems_1_1.done; envelopeItems_1_1 = envelopeItems_1.next()) {
                var envelopeItem = envelopeItems_1_1.value;
                var envelopeItemType = envelopeItem[0].type;
                var result = callback(envelopeItem, envelopeItemType);
                if (result) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (envelopeItems_1_1 && !envelopeItems_1_1.done && (_a = envelopeItems_1.return)) _a.call(envelopeItems_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    }
    /**
     * Encode a string to UTF8.
     */
    function encodeUTF8(input, textEncoder) {
        var utf8 = textEncoder || new TextEncoder();
        return utf8.encode(input);
    }
    /**
     * Serializes an envelope.
     */
    function serializeEnvelope(envelope, textEncoder) {
        var e_2, _a;
        var _b = __read(envelope, 2), envHeaders = _b[0], items = _b[1];
        // Initially we construct our envelope as a string and only convert to binary chunks if we encounter binary data
        var parts = JSON.stringify(envHeaders);
        function append(next) {
            if (typeof parts === 'string') {
                parts = typeof next === 'string' ? parts + next : [encodeUTF8(parts, textEncoder), next];
            }
            else {
                parts.push(typeof next === 'string' ? encodeUTF8(next, textEncoder) : next);
            }
        }
        try {
            for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var item = items_1_1.value;
                var _c = __read(item, 2), itemHeaders = _c[0], payload = _c[1];
                append("\n".concat(JSON.stringify(itemHeaders), "\n"));
                if (typeof payload === 'string' || payload instanceof Uint8Array) {
                    append(payload);
                }
                else {
                    var stringifiedPayload = void 0;
                    try {
                        stringifiedPayload = JSON.stringify(payload);
                    }
                    catch (e) {
                        // In case, despite all our efforts to keep `payload` circular-dependency-free, `JSON.strinify()` still
                        // fails, we try again after normalizing it again with infinite normalization depth. This of course has a
                        // performance impact but in this case a performance hit is better than throwing.
                        stringifiedPayload = JSON.stringify(normalize(payload));
                    }
                    append(stringifiedPayload);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return typeof parts === 'string' ? parts : concatBuffers(parts);
    }
    function concatBuffers(buffers) {
        var e_3, _a;
        var totalLength = buffers.reduce(function (acc, buf) { return acc + buf.length; }, 0);
        var merged = new Uint8Array(totalLength);
        var offset = 0;
        try {
            for (var buffers_1 = __values(buffers), buffers_1_1 = buffers_1.next(); !buffers_1_1.done; buffers_1_1 = buffers_1.next()) {
                var buffer = buffers_1_1.value;
                merged.set(buffer, offset);
                offset += buffer.length;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return merged;
    }
    /**
     * Creates attachment envelope items
     */
    function createAttachmentEnvelopeItem(attachment, textEncoder) {
        var buffer = typeof attachment.data === 'string' ? encodeUTF8(attachment.data, textEncoder) : attachment.data;
        return [
            dropUndefinedKeys({
                type: 'attachment',
                length: buffer.length,
                filename: attachment.filename,
                content_type: attachment.contentType,
                attachment_type: attachment.attachmentType,
            }),
            buffer,
        ];
    }
    var ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
        session: 'session',
        sessions: 'session',
        attachment: 'attachment',
        transaction: 'transaction',
        event: 'error',
        client_report: 'internal',
        user_report: 'default',
        profile: 'profile',
        replay_event: 'replay',
        replay_recording: 'replay',
        check_in: 'monitor',
        feedback: 'feedback',
        span: 'span',
        statsd: 'metric_bucket',
    };
    /**
     * Maps the type of an envelope item to a data category.
     */
    function envelopeItemTypeToDataCategory(type) {
        return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
    }
    /** Extracts the minimal SDK info from the metadata or an events */
    function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
        if (!metadataOrEvent || !metadataOrEvent.sdk) {
            return;
        }
        var _a = metadataOrEvent.sdk, name = _a.name, version = _a.version;
        return { name: name, version: version };
    }
    /**
     * Creates event envelope headers, based on event, sdk info and tunnel
     * Note: This function was extracted from the core package to make it available in Replay
     */
    function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
        var dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata.dynamicSamplingContext;
        return __assign(__assign(__assign({ event_id: event.event_id, sent_at: new Date().toISOString() }, (sdkInfo && { sdk: sdkInfo })), (!!tunnel && dsn && { dsn: dsnToString(dsn) })), (dynamicSamplingContext && {
            trace: dropUndefinedKeys(__assign({}, dynamicSamplingContext)),
        }));
    }

    /**
     * Creates client report envelope
     * @param discarded_events An array of discard events
     * @param dsn A DSN that can be set on the header. Optional.
     */
    function createClientReportEnvelope(discarded_events, dsn, timestamp) {
        var clientReportItem = [
            { type: 'client_report' },
            {
                timestamp: timestamp || dateTimestampInSeconds(),
                discarded_events: discarded_events,
            },
        ];
        return createEnvelope(dsn ? { dsn: dsn } : {}, [clientReportItem]);
    }

    var DEFAULT_RETRY_AFTER = 60 * 1000; // 60 seconds
    /**
     * Extracts Retry-After value from the request header or returns default value
     * @param header string representation of 'Retry-After' header
     * @param now current unix timestamp
     *
     */
    function parseRetryAfterHeader(header, now) {
        if (now === void 0) { now = Date.now(); }
        var headerDelay = parseInt("".concat(header), 10);
        if (!isNaN(headerDelay)) {
            return headerDelay * 1000;
        }
        var headerDate = Date.parse("".concat(header));
        if (!isNaN(headerDate)) {
            return headerDate - now;
        }
        return DEFAULT_RETRY_AFTER;
    }
    /**
     * Gets the time that the given category is disabled until for rate limiting.
     * In case no category-specific limit is set but a general rate limit across all categories is active,
     * that time is returned.
     *
     * @return the time in ms that the category is disabled until or 0 if there's no active rate limit.
     */
    function disabledUntil(limits, dataCategory) {
        return limits[dataCategory] || limits.all || 0;
    }
    /**
     * Checks if a category is rate limited
     */
    function isRateLimited(limits, dataCategory, now) {
        if (now === void 0) { now = Date.now(); }
        return disabledUntil(limits, dataCategory) > now;
    }
    /**
     * Update ratelimits from incoming headers.
     *
     * @return the updated RateLimits object.
     */
    function updateRateLimits(limits, _a, now) {
        var e_1, _b, e_2, _c;
        var statusCode = _a.statusCode, headers = _a.headers;
        if (now === void 0) { now = Date.now(); }
        var updatedRateLimits = __assign({}, limits);
        // "The name is case-insensitive."
        // https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
        var rateLimitHeader = headers && headers['x-sentry-rate-limits'];
        var retryAfterHeader = headers && headers['retry-after'];
        if (rateLimitHeader) {
            try {
                /**
                 * rate limit headers are of the form
                 *     <header>,<header>,..
                 * where each <header> is of the form
                 *     <retry_after>: <categories>: <scope>: <reason_code>: <namespaces>
                 * where
                 *     <retry_after> is a delay in seconds
                 *     <categories> is the event type(s) (error, transaction, etc) being rate limited and is of the form
                 *         <category>;<category>;...
                 *     <scope> is what's being limited (org, project, or key) - ignored by SDK
                 *     <reason_code> is an arbitrary string like "org_quota" - ignored by SDK
                 *     <namespaces> Semicolon-separated list of metric namespace identifiers. Defines which namespace(s) will be affected.
                 *         Only present if rate limit applies to the metric_bucket data category.
                 */
                for (var _d = __values(rateLimitHeader.trim().split(',')), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var limit = _e.value;
                    var _f = __read(limit.split(':', 5), 5), retryAfter = _f[0], categories = _f[1], namespaces = _f[4];
                    var headerDelay = parseInt(retryAfter, 10);
                    var delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1000; // 60sec default
                    if (!categories) {
                        updatedRateLimits.all = now + delay;
                    }
                    else {
                        try {
                            for (var _g = (e_2 = void 0, __values(categories.split(';'))), _h = _g.next(); !_h.done; _h = _g.next()) {
                                var category = _h.value;
                                if (category === 'metric_bucket') {
                                    // namespaces will be present when category === 'metric_bucket'
                                    if (!namespaces || namespaces.split(';').includes('custom')) {
                                        updatedRateLimits[category] = now + delay;
                                    }
                                }
                                else {
                                    updatedRateLimits[category] = now + delay;
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else if (retryAfterHeader) {
            updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
        }
        else if (statusCode === 429) {
            updatedRateLimits.all = now + 60 * 1000;
        }
        return updatedRateLimits;
    }

    /**
     * Extracts stack frames from the error.stack string
     */
    function parseStackFrames$1(stackParser, error) {
        return stackParser(error.stack || '', 1);
    }
    /**
     * Extracts stack frames from the error and builds a Sentry Exception
     */
    function exceptionFromError$1(stackParser, error) {
        var exception = {
            type: error.name || error.constructor.name,
            value: error.message,
        };
        var frames = parseStackFrames$1(stackParser, error);
        if (frames.length) {
            exception.stacktrace = { frames: frames };
        }
        return exception;
    }

    /**
     * This is a shim for the Feedback integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove feedback
     * from it, without changing their config. This is necessary for the loader mechanism.
     *
     * @deprecated Use `feedbackIntegration()` instead.
     */
    var FeedbackShim = /** @class */ (function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function FeedbackShim(_options) {
            // eslint-disable-next-line deprecation/deprecation
            this.name = FeedbackShim.id;
            consoleSandbox(function () {
                // eslint-disable-next-line no-console
                console.warn('You are using new Feedback() even though this bundle does not include Feedback.');
            });
        }
        /** jsdoc */
        FeedbackShim.prototype.setupOnce = function () {
            // noop
        };
        /** jsdoc */
        FeedbackShim.prototype.openDialog = function () {
            // noop
        };
        /** jsdoc */
        FeedbackShim.prototype.closeDialog = function () {
            // noop
        };
        /** jsdoc */
        FeedbackShim.prototype.attachTo = function () {
            // noop
        };
        /** jsdoc */
        FeedbackShim.prototype.createWidget = function () {
            // noop
        };
        /** jsdoc */
        FeedbackShim.prototype.removeWidget = function () {
            // noop
        };
        /** jsdoc */
        FeedbackShim.prototype.getWidget = function () {
            // noop
        };
        /** jsdoc */
        FeedbackShim.prototype.remove = function () {
            // noop
        };
        /**
         * @inheritDoc
         */
        FeedbackShim.id = 'Feedback';
        return FeedbackShim;
    }());
    /**
     * This is a shim for the Feedback integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove feedback
     * from it, without changing their config. This is necessary for the loader mechanism.
     */
    function feedbackIntegration(_options) {
        // eslint-disable-next-line deprecation/deprecation
        return new FeedbackShim({});
    }

    /**
     * This is a shim for the Replay integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove replay
     * from it, without changing their config. This is necessary for the loader mechanism.
     *
     * @deprecated Use `replayIntegration()` instead.
     */
    var ReplayShim = /** @class */ (function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function ReplayShim(_options) {
            // eslint-disable-next-line deprecation/deprecation
            this.name = ReplayShim.id;
            consoleSandbox(function () {
                // eslint-disable-next-line no-console
                console.warn('You are using new Replay() even though this bundle does not include replay.');
            });
        }
        /** jsdoc */
        ReplayShim.prototype.setupOnce = function () {
            // noop
        };
        /** jsdoc */
        ReplayShim.prototype.start = function () {
            // noop
        };
        /** jsdoc */
        ReplayShim.prototype.stop = function () {
            // noop
        };
        /** jsdoc */
        ReplayShim.prototype.flush = function () {
            // noop
        };
        /**
         * @inheritDoc
         */
        ReplayShim.id = 'Replay';
        return ReplayShim;
    }());
    /**
     * This is a shim for the Replay integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove replay
     * from it, without changing their config. This is necessary for the loader mechanism.
     */
    function replayIntegration(_options) {
        // eslint-disable-next-line deprecation/deprecation
        return new ReplayShim({});
    }

    /**
     * This is a shim for the BrowserTracing integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove tracing
     * from it, without changing their config. This is necessary for the loader mechanism.
     *
     * @deprecated Use `browserTracingIntegration()` instead.
     */
    var BrowserTracingShim = /** @class */ (function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function BrowserTracingShim(_options) {
            // eslint-disable-next-line deprecation/deprecation
            this.name = BrowserTracingShim.id;
            consoleSandbox(function () {
                // eslint-disable-next-line no-console
                console.warn('You are using new BrowserTracing() even though this bundle does not include tracing.');
            });
        }
        /** jsdoc */
        BrowserTracingShim.prototype.setupOnce = function () {
            // noop
        };
        /**
         * @inheritDoc
         */
        BrowserTracingShim.id = 'BrowserTracing';
        return BrowserTracingShim;
    }());
    /**
     * This is a shim for the BrowserTracing integration.
     * It is needed in order for the CDN bundles to continue working when users add/remove tracing
     * from it, without changing their config. This is necessary for the loader mechanism.
     */
    function browserTracingIntegrationShim(_options) {
        // eslint-disable-next-line deprecation/deprecation
        return new BrowserTracingShim({});
    }
    /** Shim function */
    function addTracingExtensions() {
        // noop
    }

    /**
     * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `true` in their generated code.
     *
     * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
     */
    var DEBUG_BUILD$1 = true;

    var DEFAULT_ENVIRONMENT = 'production';

    /**
     * Returns the global event processors.
     * @deprecated Global event processors will be removed in v8.
     */
    function getGlobalEventProcessors() {
        return getGlobalSingleton('globalEventProcessors', function () { return []; });
    }
    /**
     * Add a EventProcessor to be kept globally.
     * @deprecated Use `addEventProcessor` instead. Global event processors will be removed in v8.
     */
    function addGlobalEventProcessor(callback) {
        // eslint-disable-next-line deprecation/deprecation
        getGlobalEventProcessors().push(callback);
    }
    /**
     * Process an array of event processors, returning the processed event (or `null` if the event was dropped).
     */
    function notifyEventProcessors(processors, event, hint, index) {
        if (index === void 0) { index = 0; }
        return new SyncPromise(function (resolve, reject) {
            var processor = processors[index];
            if (event === null || typeof processor !== 'function') {
                resolve(event);
            }
            else {
                var result = processor(__assign({}, event), hint);
                processor.id && result === null && logger.log("Event processor \"".concat(processor.id, "\" dropped event"));
                if (isThenable(result)) {
                    void result
                        .then(function (final) { return notifyEventProcessors(processors, final, hint, index + 1).then(resolve); })
                        .then(null, reject);
                }
                else {
                    void notifyEventProcessors(processors, result, hint, index + 1)
                        .then(resolve)
                        .then(null, reject);
                }
            }
        });
    }

    /**
     * Creates a new `Session` object by setting certain default parameters. If optional @param context
     * is passed, the passed properties are applied to the session object.
     *
     * @param context (optional) additional properties to be applied to the returned session object
     *
     * @returns a new `Session` object
     */
    function makeSession(context) {
        // Both timestamp and started are in seconds since the UNIX epoch.
        var startingTime = timestampInSeconds();
        var session = {
            sid: uuid4(),
            init: true,
            timestamp: startingTime,
            started: startingTime,
            duration: 0,
            status: 'ok',
            errors: 0,
            ignoreDuration: false,
            toJSON: function () { return sessionToJSON(session); },
        };
        if (context) {
            updateSession(session, context);
        }
        return session;
    }
    /**
     * Updates a session object with the properties passed in the context.
     *
     * Note that this function mutates the passed object and returns void.
     * (Had to do this instead of returning a new and updated session because closing and sending a session
     * makes an update to the session after it was passed to the sending logic.
     * @see BaseClient.captureSession )
     *
     * @param session the `Session` to update
     * @param context the `SessionContext` holding the properties that should be updated in @param session
     */
    // eslint-disable-next-line complexity
    function updateSession(session, context) {
        if (context === void 0) { context = {}; }
        if (context.user) {
            if (!session.ipAddress && context.user.ip_address) {
                session.ipAddress = context.user.ip_address;
            }
            if (!session.did && !context.did) {
                session.did = context.user.id || context.user.email || context.user.username;
            }
        }
        session.timestamp = context.timestamp || timestampInSeconds();
        if (context.abnormal_mechanism) {
            session.abnormal_mechanism = context.abnormal_mechanism;
        }
        if (context.ignoreDuration) {
            session.ignoreDuration = context.ignoreDuration;
        }
        if (context.sid) {
            // Good enough uuid validation. — Kamil
            session.sid = context.sid.length === 32 ? context.sid : uuid4();
        }
        if (context.init !== undefined) {
            session.init = context.init;
        }
        if (!session.did && context.did) {
            session.did = "".concat(context.did);
        }
        if (typeof context.started === 'number') {
            session.started = context.started;
        }
        if (session.ignoreDuration) {
            session.duration = undefined;
        }
        else if (typeof context.duration === 'number') {
            session.duration = context.duration;
        }
        else {
            var duration = session.timestamp - session.started;
            session.duration = duration >= 0 ? duration : 0;
        }
        if (context.release) {
            session.release = context.release;
        }
        if (context.environment) {
            session.environment = context.environment;
        }
        if (!session.ipAddress && context.ipAddress) {
            session.ipAddress = context.ipAddress;
        }
        if (!session.userAgent && context.userAgent) {
            session.userAgent = context.userAgent;
        }
        if (typeof context.errors === 'number') {
            session.errors = context.errors;
        }
        if (context.status) {
            session.status = context.status;
        }
    }
    /**
     * Closes a session by setting its status and updating the session object with it.
     * Internally calls `updateSession` to update the passed session object.
     *
     * Note that this function mutates the passed session (@see updateSession for explanation).
     *
     * @param session the `Session` object to be closed
     * @param status the `SessionStatus` with which the session was closed. If you don't pass a status,
     *               this function will keep the previously set status, unless it was `'ok'` in which case
     *               it is changed to `'exited'`.
     */
    function closeSession(session, status) {
        var context = {};
        if (status) {
            context = { status: status };
        }
        else if (session.status === 'ok') {
            context = { status: 'exited' };
        }
        updateSession(session, context);
    }
    /**
     * Serializes a passed session object to a JSON object with a slightly different structure.
     * This is necessary because the Sentry backend requires a slightly different schema of a session
     * than the one the JS SDKs use internally.
     *
     * @param session the session to be converted
     *
     * @returns a JSON object of the passed session
     */
    function sessionToJSON(session) {
        return dropUndefinedKeys({
            sid: "".concat(session.sid),
            init: session.init,
            // Make sure that sec is converted to ms for date constructor
            started: new Date(session.started * 1000).toISOString(),
            timestamp: new Date(session.timestamp * 1000).toISOString(),
            status: session.status,
            errors: session.errors,
            did: typeof session.did === 'number' || typeof session.did === 'string' ? "".concat(session.did) : undefined,
            duration: session.duration,
            abnormal_mechanism: session.abnormal_mechanism,
            attrs: {
                release: session.release,
                environment: session.environment,
                ip_address: session.ipAddress,
                user_agent: session.userAgent,
            },
        });
    }

    var TRACE_FLAG_SAMPLED = 0x1;
    /**
     * Convert a span to a trace context, which can be sent as the `trace` context in an event.
     */
    function spanToTraceContext(span) {
        var _a = span.spanContext(), span_id = _a.spanId, trace_id = _a.traceId;
        var _b = spanToJSON(span), data = _b.data, op = _b.op, parent_span_id = _b.parent_span_id, status = _b.status, tags = _b.tags, origin = _b.origin;
        return dropUndefinedKeys({
            data: data,
            op: op,
            parent_span_id: parent_span_id,
            span_id: span_id,
            status: status,
            tags: tags,
            trace_id: trace_id,
            origin: origin,
        });
    }
    /**
     * Convert a span time input intp a timestamp in seconds.
     */
    function spanTimeInputToSeconds(input) {
        if (typeof input === 'number') {
            return ensureTimestampInSeconds(input);
        }
        if (Array.isArray(input)) {
            // See {@link HrTime} for the array-based time format
            return input[0] + input[1] / 1e9;
        }
        if (input instanceof Date) {
            return ensureTimestampInSeconds(input.getTime());
        }
        return timestampInSeconds();
    }
    /**
     * Converts a timestamp to second, if it was in milliseconds, or keeps it as second.
     */
    function ensureTimestampInSeconds(timestamp) {
        var isMs = timestamp > 9999999999;
        return isMs ? timestamp / 1000 : timestamp;
    }
    /**
     * Convert a span to a JSON representation.
     * Note that all fields returned here are optional and need to be guarded against.
     *
     * Note: Because of this, we currently have a circular type dependency (which we opted out of in package.json).
     * This is not avoidable as we need `spanToJSON` in `spanUtils.ts`, which in turn is needed by `span.ts` for backwards compatibility.
     * And `spanToJSON` needs the Span class from `span.ts` to check here.
     * TODO v8: When we remove the deprecated stuff from `span.ts`, we can remove the circular dependency again.
     */
    function spanToJSON(span) {
        if (spanIsSpanClass(span)) {
            return span.getSpanJSON();
        }
        // Fallback: We also check for `.toJSON()` here...
        // eslint-disable-next-line deprecation/deprecation
        if (typeof span.toJSON === 'function') {
            // eslint-disable-next-line deprecation/deprecation
            return span.toJSON();
        }
        return {};
    }
    /**
     * Sadly, due to circular dependency checks we cannot actually import the Span class here and check for instanceof.
     * :( So instead we approximate this by checking if it has the `getSpanJSON` method.
     */
    function spanIsSpanClass(span) {
        return typeof span.getSpanJSON === 'function';
    }
    /**
     * Returns true if a span is sampled.
     * In most cases, you should just use `span.isRecording()` instead.
     * However, this has a slightly different semantic, as it also returns false if the span is finished.
     * So in the case where this distinction is important, use this method.
     */
    function spanIsSampled(span) {
        // We align our trace flags with the ones OpenTelemetry use
        // So we also check for sampled the same way they do.
        var traceFlags = span.spanContext().traceFlags;
        // eslint-disable-next-line no-bitwise
        return Boolean(traceFlags & TRACE_FLAG_SAMPLED);
    }

    /**
     * Adds common information to events.
     *
     * The information includes release and environment from `options`,
     * breadcrumbs and context (extra, tags and user) from the scope.
     *
     * Information that is already present in the event is never overwritten. For
     * nested objects, such as the context, keys are merged.
     *
     * Note: This also triggers callbacks for `addGlobalEventProcessor`, but not `beforeSend`.
     *
     * @param event The original event.
     * @param hint May contain additional information about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A new event with more information.
     * @hidden
     */
    function prepareEvent(options, event, hint, scope, client, isolationScope) {
        var _a = options.normalizeDepth, normalizeDepth = _a === void 0 ? 3 : _a, _b = options.normalizeMaxBreadth, normalizeMaxBreadth = _b === void 0 ? 1000 : _b;
        var prepared = __assign(__assign({}, event), { event_id: event.event_id || hint.event_id || uuid4(), timestamp: event.timestamp || dateTimestampInSeconds() });
        var integrations = hint.integrations || options.integrations.map(function (i) { return i.name; });
        applyClientOptions(prepared, options);
        applyIntegrationsMetadata(prepared, integrations);
        // Only put debug IDs onto frames for error events.
        if (event.type === undefined) {
            applyDebugIds(prepared, options.stackParser);
        }
        // If we have scope given to us, use it as the base for further modifications.
        // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
        var finalScope = getFinalScope(scope, hint.captureContext);
        if (hint.mechanism) {
            addExceptionMechanism(prepared, hint.mechanism);
        }
        var clientEventProcessors = client && client.getEventProcessors ? client.getEventProcessors() : [];
        // This should be the last thing called, since we want that
        // {@link Hub.addEventProcessor} gets the finished prepared event.
        // Merge scope data together
        var data = getGlobalScope().getScopeData();
        if (isolationScope) {
            var isolationData = isolationScope.getScopeData();
            mergeScopeData(data, isolationData);
        }
        if (finalScope) {
            var finalScopeData = finalScope.getScopeData();
            mergeScopeData(data, finalScopeData);
        }
        var attachments = __spreadArray(__spreadArray([], __read((hint.attachments || [])), false), __read(data.attachments), false);
        if (attachments.length) {
            hint.attachments = attachments;
        }
        applyScopeDataToEvent(prepared, data);
        // TODO (v8): Update this order to be: Global > Client > Scope
        var eventProcessors = __spreadArray(__spreadArray(__spreadArray([], __read(clientEventProcessors), false), __read(getGlobalEventProcessors()), false), __read(data.eventProcessors), false);
        var result = notifyEventProcessors(eventProcessors, prepared, hint);
        return result.then(function (evt) {
            if (evt) {
                // We apply the debug_meta field only after all event processors have ran, so that if any event processors modified
                // file names (e.g.the RewriteFrames integration) the filename -> debug ID relationship isn't destroyed.
                // This should not cause any PII issues, since we're only moving data that is already on the event and not adding
                // any new data
                applyDebugMeta(evt);
            }
            if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
                return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
            }
            return evt;
        });
    }
    /**
     *  Enhances event using the client configuration.
     *  It takes care of all "static" values like environment, release and `dist`,
     *  as well as truncating overly long values.
     * @param event event instance to be enhanced
     */
    function applyClientOptions(event, options) {
        var environment = options.environment, release = options.release, dist = options.dist, _a = options.maxValueLength, maxValueLength = _a === void 0 ? 250 : _a;
        if (!('environment' in event)) {
            event.environment = 'environment' in options ? environment : DEFAULT_ENVIRONMENT;
        }
        if (event.release === undefined && release !== undefined) {
            event.release = release;
        }
        if (event.dist === undefined && dist !== undefined) {
            event.dist = dist;
        }
        if (event.message) {
            event.message = truncate(event.message, maxValueLength);
        }
        var exception = event.exception && event.exception.values && event.exception.values[0];
        if (exception && exception.value) {
            exception.value = truncate(exception.value, maxValueLength);
        }
        var request = event.request;
        if (request && request.url) {
            request.url = truncate(request.url, maxValueLength);
        }
    }
    var debugIdStackParserCache = new WeakMap();
    /**
     * Puts debug IDs into the stack frames of an error event.
     */
    function applyDebugIds(event, stackParser) {
        var debugIdMap = GLOBAL_OBJ._sentryDebugIds;
        if (!debugIdMap) {
            return;
        }
        var debugIdStackFramesCache;
        var cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
        if (cachedDebugIdStackFrameCache) {
            debugIdStackFramesCache = cachedDebugIdStackFrameCache;
        }
        else {
            debugIdStackFramesCache = new Map();
            debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
        }
        // Build a map of filename -> debug_id
        var filenameDebugIdMap = Object.keys(debugIdMap).reduce(function (acc, debugIdStackTrace) {
            var parsedStack;
            var cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
            if (cachedParsedStack) {
                parsedStack = cachedParsedStack;
            }
            else {
                parsedStack = stackParser(debugIdStackTrace);
                debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
            }
            for (var i = parsedStack.length - 1; i >= 0; i--) {
                var stackFrame = parsedStack[i];
                if (stackFrame.filename) {
                    acc[stackFrame.filename] = debugIdMap[debugIdStackTrace];
                    break;
                }
            }
            return acc;
        }, {});
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            event.exception.values.forEach(function (exception) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                exception.stacktrace.frames.forEach(function (frame) {
                    if (frame.filename) {
                        frame.debug_id = filenameDebugIdMap[frame.filename];
                    }
                });
            });
        }
        catch (e) {
            // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
        }
    }
    /**
     * Moves debug IDs from the stack frames of an error event into the debug_meta field.
     */
    function applyDebugMeta(event) {
        // Extract debug IDs and filenames from the stack frames on the event.
        var filenameDebugIdMap = {};
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            event.exception.values.forEach(function (exception) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                exception.stacktrace.frames.forEach(function (frame) {
                    if (frame.debug_id) {
                        if (frame.abs_path) {
                            filenameDebugIdMap[frame.abs_path] = frame.debug_id;
                        }
                        else if (frame.filename) {
                            filenameDebugIdMap[frame.filename] = frame.debug_id;
                        }
                        delete frame.debug_id;
                    }
                });
            });
        }
        catch (e) {
            // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
        }
        if (Object.keys(filenameDebugIdMap).length === 0) {
            return;
        }
        // Fill debug_meta information
        event.debug_meta = event.debug_meta || {};
        event.debug_meta.images = event.debug_meta.images || [];
        var images = event.debug_meta.images;
        Object.keys(filenameDebugIdMap).forEach(function (filename) {
            images.push({
                type: 'sourcemap',
                code_file: filename,
                debug_id: filenameDebugIdMap[filename],
            });
        });
    }
    /**
     * This function adds all used integrations to the SDK info in the event.
     * @param event The event that will be filled with all integrations.
     */
    function applyIntegrationsMetadata(event, integrationNames) {
        if (integrationNames.length > 0) {
            event.sdk = event.sdk || {};
            event.sdk.integrations = __spreadArray(__spreadArray([], __read((event.sdk.integrations || [])), false), __read(integrationNames), false);
        }
    }
    /**
     * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
     * Normalized keys:
     * - `breadcrumbs.data`
     * - `user`
     * - `contexts`
     * - `extra`
     * @param event Event
     * @returns Normalized event
     */
    function normalizeEvent(event, depth, maxBreadth) {
        if (!event) {
            return null;
        }
        var normalized = __assign(__assign(__assign(__assign(__assign({}, event), (event.breadcrumbs && {
            breadcrumbs: event.breadcrumbs.map(function (b) { return (__assign(__assign({}, b), (b.data && {
                data: normalize(b.data, depth, maxBreadth),
            }))); }),
        })), (event.user && {
            user: normalize(event.user, depth, maxBreadth),
        })), (event.contexts && {
            contexts: normalize(event.contexts, depth, maxBreadth),
        })), (event.extra && {
            extra: normalize(event.extra, depth, maxBreadth),
        }));
        // event.contexts.trace stores information about a Transaction. Similarly,
        // event.spans[] stores information about child Spans. Given that a
        // Transaction is conceptually a Span, normalization should apply to both
        // Transactions and Spans consistently.
        // For now the decision is to skip normalization of Transactions and Spans,
        // so this block overwrites the normalized event to add back the original
        // Transaction information prior to normalization.
        if (event.contexts && event.contexts.trace && normalized.contexts) {
            normalized.contexts.trace = event.contexts.trace;
            // event.contexts.trace.data may contain circular/dangerous data so we need to normalize it
            if (event.contexts.trace.data) {
                normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
            }
        }
        // event.spans[].data may contain circular/dangerous data so we need to normalize it
        if (event.spans) {
            normalized.spans = event.spans.map(function (span) {
                var data = spanToJSON(span).data;
                if (data) {
                    // This is a bit weird, as we generally have `Span` instances here, but to be safe we do not assume so
                    // eslint-disable-next-line deprecation/deprecation
                    span.data = normalize(data, depth, maxBreadth);
                }
                return span;
            });
        }
        return normalized;
    }
    function getFinalScope(scope, captureContext) {
        if (!captureContext) {
            return scope;
        }
        var finalScope = scope ? scope.clone() : new Scope();
        finalScope.update(captureContext);
        return finalScope;
    }
    /**
     * Parse either an `EventHint` directly, or convert a `CaptureContext` to an `EventHint`.
     * This is used to allow to update method signatures that used to accept a `CaptureContext` but should now accept an `EventHint`.
     */
    function parseEventHintOrCaptureContext(hint) {
        if (!hint) {
            return undefined;
        }
        // If you pass a Scope or `() => Scope` as CaptureContext, we just return this as captureContext
        if (hintIsScopeOrFunction(hint)) {
            return { captureContext: hint };
        }
        if (hintIsScopeContext(hint)) {
            return {
                captureContext: hint,
            };
        }
        return hint;
    }
    function hintIsScopeOrFunction(hint) {
        return hint instanceof Scope || typeof hint === 'function';
    }
    var captureContextKeys = [
        'user',
        'level',
        'extra',
        'contexts',
        'tags',
        'fingerprint',
        'requestSession',
        'propagationContext',
    ];
    function hintIsScopeContext(hint) {
        return Object.keys(hint).some(function (key) { return captureContextKeys.includes(key); });
    }

    /**
     * Captures an exception event and sends it to Sentry.
     *
     * @param exception The exception to capture.
     * @param hint Optional additional data to attach to the Sentry event.
     * @returns the id of the captured Sentry event.
     */
    function captureException(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exception, hint) {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().captureException(exception, parseEventHintOrCaptureContext(hint));
    }
    /**
     * Captures a message event and sends it to Sentry.
     *
     * @param exception The exception to capture.
     * @param captureContext Define the level of the message or pass in additional data to attach to the message.
     * @returns the id of the captured message.
     */
    function captureMessage(message,
    // eslint-disable-next-line deprecation/deprecation
    captureContext) {
        // This is necessary to provide explicit scopes upgrade, without changing the original
        // arity of the `captureMessage(message, level)` method.
        var level = typeof captureContext === 'string' ? captureContext : undefined;
        var context = typeof captureContext !== 'string' ? { captureContext: captureContext } : undefined;
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().captureMessage(message, level, context);
    }
    /**
     * Captures a manually created event and sends it to Sentry.
     *
     * @param exception The event to send to Sentry.
     * @param hint Optional additional data to attach to the Sentry event.
     * @returns the id of the captured event.
     */
    function captureEvent(event, hint) {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().captureEvent(event, hint);
    }
    /**
     * Callback to set context information onto the scope.
     * @param callback Callback function that receives Scope.
     *
     * @deprecated Use getCurrentScope() directly.
     */
    // eslint-disable-next-line deprecation/deprecation
    function configureScope(callback) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().configureScope(callback);
    }
    /**
     * Records a new breadcrumb which will be attached to future events.
     *
     * Breadcrumbs will be added to subsequent events to provide more context on
     * user's actions prior to an error or crash.
     *
     * @param breadcrumb The breadcrumb to record.
     */
    // eslint-disable-next-line deprecation/deprecation
    function addBreadcrumb(breadcrumb, hint) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().addBreadcrumb(breadcrumb, hint);
    }
    /**
     * Sets context data with the given name.
     * @param name of the context
     * @param context Any kind of data. This data will be normalized.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, deprecation/deprecation
    function setContext(name, context) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().setContext(name, context);
    }
    /**
     * Set an object that will be merged sent as extra data with the event.
     * @param extras Extras object to merge into current context.
     */
    // eslint-disable-next-line deprecation/deprecation
    function setExtras(extras) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().setExtras(extras);
    }
    /**
     * Set key:value that will be sent as extra data with the event.
     * @param key String of extra
     * @param extra Any kind of data. This data will be normalized.
     */
    // eslint-disable-next-line deprecation/deprecation
    function setExtra(key, extra) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().setExtra(key, extra);
    }
    /**
     * Set an object that will be merged sent as tags data with the event.
     * @param tags Tags context object to merge into current context.
     */
    // eslint-disable-next-line deprecation/deprecation
    function setTags(tags) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().setTags(tags);
    }
    /**
     * Set key:value that will be sent as tags data with the event.
     *
     * Can also be used to unset a tag, by passing `undefined`.
     *
     * @param key String key of tag
     * @param value Value of tag
     */
    // eslint-disable-next-line deprecation/deprecation
    function setTag(key, value) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().setTag(key, value);
    }
    /**
     * Updates user context information for future events.
     *
     * @param user User context object to be set in the current context. Pass `null` to unset the user.
     */
    // eslint-disable-next-line deprecation/deprecation
    function setUser(user) {
        // eslint-disable-next-line deprecation/deprecation
        getCurrentHub().setUser(user);
    }
    /**
     * Either creates a new active scope, or sets the given scope as active scope in the given callback.
     */
    function withScope() {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        // eslint-disable-next-line deprecation/deprecation
        var hub = getCurrentHub();
        // If a scope is defined, we want to make this the active scope instead of the default one
        if (rest.length === 2) {
            var _a = __read(rest, 2), scope_1 = _a[0], callback_1 = _a[1];
            if (!scope_1) {
                // eslint-disable-next-line deprecation/deprecation
                return hub.withScope(callback_1);
            }
            // eslint-disable-next-line deprecation/deprecation
            return hub.withScope(function () {
                // eslint-disable-next-line deprecation/deprecation
                hub.getStackTop().scope = scope_1;
                return callback_1(scope_1);
            });
        }
        // eslint-disable-next-line deprecation/deprecation
        return hub.withScope(rest[0]);
    }
    /**
     * Attempts to fork the current isolation scope and the current scope based on the current async context strategy. If no
     * async context strategy is set, the isolation scope and the current scope will not be forked (this is currently the
     * case, for example, in the browser).
     *
     * Usage of this function in environments without async context strategy is discouraged and may lead to unexpected behaviour.
     *
     * This function is intended for Sentry SDK and SDK integration development. It is not recommended to be used in "normal"
     * applications directly because it comes with pitfalls. Use at your own risk!
     *
     * @param callback The callback in which the passed isolation scope is active. (Note: In environments without async
     * context strategy, the currently active isolation scope may change within execution of the callback.)
     * @returns The same value that `callback` returns.
     */
    function withIsolationScope(callback) {
        return runWithAsyncContext(function () {
            return callback(getIsolationScope());
        });
    }
    /**
     * Forks the current scope and sets the provided span as active span in the context of the provided callback.
     *
     * @param span Spans started in the context of the provided callback will be children of this span.
     * @param callback Execution context in which the provided span will be active. Is passed the newly forked scope.
     * @returns the value returned from the provided callback function.
     */
    function withActiveSpan(span, callback) {
        return withScope(function (scope) {
            // eslint-disable-next-line deprecation/deprecation
            scope.setSpan(span);
            return callback(scope);
        });
    }
    /**
     * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
     *
     * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
     * new child span within the transaction or any span, call the respective `.startChild()` method.
     *
     * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
     *
     * The transaction must be finished with a call to its `.end()` method, at which point the transaction with all its
     * finished child spans will be sent to Sentry.
     *
     * NOTE: This function should only be used for *manual* instrumentation. Auto-instrumentation should call
     * `startTransaction` directly on the hub.
     *
     * @param context Properties of the new `Transaction`.
     * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
     * default values). See {@link Options.tracesSampler}.
     *
     * @returns The transaction which was just started
     *
     * @deprecated Use `startSpan()`, `startSpanManual()` or `startInactiveSpan()` instead.
     */
    function startTransaction(context, customSamplingContext) {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().startTransaction(__assign({}, context), customSamplingContext);
    }
    /**
     * Call `flush()` on the current client, if there is one. See {@link Client.flush}.
     *
     * @param timeout Maximum time in ms the client should wait to flush its event queue. Omitting this parameter will cause
     * the client to wait until all events are sent before resolving the promise.
     * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
     * doesn't (or if there's no client defined).
     */
    function flush(timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                client = getClient();
                if (client) {
                    return [2 /*return*/, client.flush(timeout)];
                }
                logger.warn('Cannot flush events. No client defined.');
                return [2 /*return*/, Promise.resolve(false)];
            });
        });
    }
    /**
     * Call `close()` on the current client, if there is one. See {@link Client.close}.
     *
     * @param timeout Maximum time in ms the client should wait to flush its event queue before shutting down. Omitting this
     * parameter will cause the client to wait until all events are sent before disabling itself.
     * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
     * doesn't (or if there's no client defined).
     */
    function close(timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                client = getClient();
                if (client) {
                    return [2 /*return*/, client.close(timeout)];
                }
                logger.warn('Cannot flush events and disable SDK. No client defined.');
                return [2 /*return*/, Promise.resolve(false)];
            });
        });
    }
    /**
     * This is the getter for lastEventId.
     *
     * @returns The last event id of a captured event.
     */
    function lastEventId() {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().lastEventId();
    }
    /**
     * Get the currently active client.
     */
    function getClient() {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().getClient();
    }
    /**
     * Returns true if Sentry has been properly initialized.
     */
    function isInitialized() {
        return !!getClient();
    }
    /**
     * Get the currently active scope.
     */
    function getCurrentScope() {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().getScope();
    }
    /**
     * Start a session on the current isolation scope.
     *
     * @param context (optional) additional properties to be applied to the returned session object
     *
     * @returns the new active session
     */
    function startSession(context) {
        var client = getClient();
        var isolationScope = getIsolationScope();
        var currentScope = getCurrentScope();
        var _a = (client && client.getOptions()) || {}, release = _a.release, _b = _a.environment, environment = _b === void 0 ? DEFAULT_ENVIRONMENT : _b;
        // Will fetch userAgent if called from browser sdk
        var userAgent = (GLOBAL_OBJ.navigator || {}).userAgent;
        var session = makeSession(__assign(__assign({ release: release, environment: environment, user: currentScope.getUser() || isolationScope.getUser() }, (userAgent && { userAgent: userAgent })), context));
        // End existing session if there's one
        var currentSession = isolationScope.getSession();
        if (currentSession && currentSession.status === 'ok') {
            updateSession(currentSession, { status: 'exited' });
        }
        endSession();
        // Afterwards we set the new session on the scope
        isolationScope.setSession(session);
        // TODO (v8): Remove this and only use the isolation scope(?).
        // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
        currentScope.setSession(session);
        return session;
    }
    /**
     * End the session on the current isolation scope.
     */
    function endSession() {
        var isolationScope = getIsolationScope();
        var currentScope = getCurrentScope();
        var session = currentScope.getSession() || isolationScope.getSession();
        if (session) {
            closeSession(session);
        }
        _sendSessionUpdate();
        // the session is over; take it off of the scope
        isolationScope.setSession();
        // TODO (v8): Remove this and only use the isolation scope(?).
        // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
        currentScope.setSession();
    }
    /**
     * Sends the current Session on the scope
     */
    function _sendSessionUpdate() {
        var isolationScope = getIsolationScope();
        var currentScope = getCurrentScope();
        var client = getClient();
        // TODO (v8): Remove currentScope and only use the isolation scope(?).
        // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
        var session = currentScope.getSession() || isolationScope.getSession();
        if (session && client && client.captureSession) {
            client.captureSession(session);
        }
    }
    /**
     * Sends the current session on the scope to Sentry
     *
     * @param end If set the session will be marked as exited and removed from the scope.
     *            Defaults to `false`.
     */
    function captureSession(end) {
        if (end === void 0) { end = false; }
        // both send the update and pull the session from the scope
        if (end) {
            endSession();
            return;
        }
        // only send the update
        _sendSessionUpdate();
    }

    /**
     * Returns the root span of a given span.
     *
     * As long as we use `Transaction`s internally, the returned root span
     * will be a `Transaction` but be aware that this might change in the future.
     *
     * If the given span has no root span or transaction, `undefined` is returned.
     */
    function getRootSpan(span) {
        // TODO (v8): Remove this check and just return span
        // eslint-disable-next-line deprecation/deprecation
        return span.transaction;
    }

    /**
     * Creates a dynamic sampling context from a client.
     *
     * Dispatches the `createDsc` lifecycle hook as a side effect.
     */
    function getDynamicSamplingContextFromClient(trace_id, client, scope) {
        var options = client.getOptions();
        var public_key = (client.getDsn() || {}).publicKey;
        // TODO(v8): Remove segment from User
        // eslint-disable-next-line deprecation/deprecation
        var user_segment = ((scope && scope.getUser()) || {}).segment;
        var dsc = dropUndefinedKeys({
            environment: options.environment || DEFAULT_ENVIRONMENT,
            release: options.release,
            user_segment: user_segment,
            public_key: public_key,
            trace_id: trace_id,
        });
        client.emit && client.emit('createDsc', dsc);
        return dsc;
    }
    /**
     * Creates a dynamic sampling context from a span (and client and scope)
     *
     * @param span the span from which a few values like the root span name and sample rate are extracted.
     *
     * @returns a dynamic sampling context
     */
    function getDynamicSamplingContextFromSpan(span) {
        var client = getClient();
        if (!client) {
            return {};
        }
        // passing emit=false here to only emit later once the DSC is actually populated
        var dsc = getDynamicSamplingContextFromClient(spanToJSON(span).trace_id || '', client, getCurrentScope());
        // TODO (v8): Remove v7FrozenDsc as a Transaction will no longer have _frozenDynamicSamplingContext
        var txn = getRootSpan(span);
        if (!txn) {
            return dsc;
        }
        // TODO (v8): Remove v7FrozenDsc as a Transaction will no longer have _frozenDynamicSamplingContext
        // For now we need to avoid breaking users who directly created a txn with a DSC, where this field is still set.
        // @see Transaction class constructor
        var v7FrozenDsc = txn && txn._frozenDynamicSamplingContext;
        if (v7FrozenDsc) {
            return v7FrozenDsc;
        }
        // TODO (v8): Replace txn.metadata with txn.attributes[]
        // We can't do this yet because attributes aren't always set yet.
        // eslint-disable-next-line deprecation/deprecation
        var _a = txn.metadata, maybeSampleRate = _a.sampleRate, source = _a.source;
        if (maybeSampleRate != null) {
            dsc.sample_rate = "".concat(maybeSampleRate);
        }
        // We don't want to have a transaction name in the DSC if the source is "url" because URLs might contain PII
        var jsonSpan = spanToJSON(txn);
        // after JSON conversion, txn.name becomes jsonSpan.description
        if (source && source !== 'url') {
            dsc.transaction = jsonSpan.description;
        }
        dsc.sampled = String(spanIsSampled(txn));
        client.emit && client.emit('createDsc', dsc);
        return dsc;
    }

    /**
     * Applies data from the scope to the event and runs all event processors on it.
     */
    function applyScopeDataToEvent(event, data) {
        var fingerprint = data.fingerprint, span = data.span, breadcrumbs = data.breadcrumbs, sdkProcessingMetadata = data.sdkProcessingMetadata;
        // Apply general data
        applyDataToEvent(event, data);
        // We want to set the trace context for normal events only if there isn't already
        // a trace context on the event. There is a product feature in place where we link
        // errors with transaction and it relies on that.
        if (span) {
            applySpanToEvent(event, span);
        }
        applyFingerprintToEvent(event, fingerprint);
        applyBreadcrumbsToEvent(event, breadcrumbs);
        applySdkMetadataToEvent(event, sdkProcessingMetadata);
    }
    /** Merge data of two scopes together. */
    function mergeScopeData(data, mergeData) {
        var extra = mergeData.extra, tags = mergeData.tags, user = mergeData.user, contexts = mergeData.contexts, level = mergeData.level, sdkProcessingMetadata = mergeData.sdkProcessingMetadata, breadcrumbs = mergeData.breadcrumbs, fingerprint = mergeData.fingerprint, eventProcessors = mergeData.eventProcessors, attachments = mergeData.attachments, propagationContext = mergeData.propagationContext,
        // eslint-disable-next-line deprecation/deprecation
        transactionName = mergeData.transactionName, span = mergeData.span;
        mergeAndOverwriteScopeData(data, 'extra', extra);
        mergeAndOverwriteScopeData(data, 'tags', tags);
        mergeAndOverwriteScopeData(data, 'user', user);
        mergeAndOverwriteScopeData(data, 'contexts', contexts);
        mergeAndOverwriteScopeData(data, 'sdkProcessingMetadata', sdkProcessingMetadata);
        if (level) {
            data.level = level;
        }
        if (transactionName) {
            // eslint-disable-next-line deprecation/deprecation
            data.transactionName = transactionName;
        }
        if (span) {
            data.span = span;
        }
        if (breadcrumbs.length) {
            data.breadcrumbs = __spreadArray(__spreadArray([], __read(data.breadcrumbs), false), __read(breadcrumbs), false);
        }
        if (fingerprint.length) {
            data.fingerprint = __spreadArray(__spreadArray([], __read(data.fingerprint), false), __read(fingerprint), false);
        }
        if (eventProcessors.length) {
            data.eventProcessors = __spreadArray(__spreadArray([], __read(data.eventProcessors), false), __read(eventProcessors), false);
        }
        if (attachments.length) {
            data.attachments = __spreadArray(__spreadArray([], __read(data.attachments), false), __read(attachments), false);
        }
        data.propagationContext = __assign(__assign({}, data.propagationContext), propagationContext);
    }
    /**
     * Merges certain scope data. Undefined values will overwrite any existing values.
     * Exported only for tests.
     */
    function mergeAndOverwriteScopeData(data, prop, mergeVal) {
        if (mergeVal && Object.keys(mergeVal).length) {
            // Clone object
            data[prop] = __assign({}, data[prop]);
            for (var key in mergeVal) {
                if (Object.prototype.hasOwnProperty.call(mergeVal, key)) {
                    data[prop][key] = mergeVal[key];
                }
            }
        }
    }
    function applyDataToEvent(event, data) {
        var extra = data.extra, tags = data.tags, user = data.user, contexts = data.contexts, level = data.level,
        // eslint-disable-next-line deprecation/deprecation
        transactionName = data.transactionName;
        var cleanedExtra = dropUndefinedKeys(extra);
        if (cleanedExtra && Object.keys(cleanedExtra).length) {
            event.extra = __assign(__assign({}, cleanedExtra), event.extra);
        }
        var cleanedTags = dropUndefinedKeys(tags);
        if (cleanedTags && Object.keys(cleanedTags).length) {
            event.tags = __assign(__assign({}, cleanedTags), event.tags);
        }
        var cleanedUser = dropUndefinedKeys(user);
        if (cleanedUser && Object.keys(cleanedUser).length) {
            event.user = __assign(__assign({}, cleanedUser), event.user);
        }
        var cleanedContexts = dropUndefinedKeys(contexts);
        if (cleanedContexts && Object.keys(cleanedContexts).length) {
            event.contexts = __assign(__assign({}, cleanedContexts), event.contexts);
        }
        if (level) {
            event.level = level;
        }
        if (transactionName) {
            event.transaction = transactionName;
        }
    }
    function applyBreadcrumbsToEvent(event, breadcrumbs) {
        var mergedBreadcrumbs = __spreadArray(__spreadArray([], __read((event.breadcrumbs || [])), false), __read(breadcrumbs), false);
        event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : undefined;
    }
    function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
        event.sdkProcessingMetadata = __assign(__assign({}, event.sdkProcessingMetadata), sdkProcessingMetadata);
    }
    function applySpanToEvent(event, span) {
        event.contexts = __assign({ trace: spanToTraceContext(span) }, event.contexts);
        var rootSpan = getRootSpan(span);
        if (rootSpan) {
            event.sdkProcessingMetadata = __assign({ dynamicSamplingContext: getDynamicSamplingContextFromSpan(span) }, event.sdkProcessingMetadata);
            var transactionName = spanToJSON(rootSpan).description;
            if (transactionName) {
                event.tags = __assign({ transaction: transactionName }, event.tags);
            }
        }
    }
    /**
     * Applies fingerprint from the scope to the event if there's one,
     * uses message if there's one instead or get rid of empty fingerprint
     */
    function applyFingerprintToEvent(event, fingerprint) {
        // Make sure it's an array first and we actually have something in place
        event.fingerprint = event.fingerprint ? arrayify(event.fingerprint) : [];
        // If we have something on the scope, then merge it with event
        if (fingerprint) {
            event.fingerprint = event.fingerprint.concat(fingerprint);
        }
        // If we have no data at all, remove empty array default
        if (event.fingerprint && !event.fingerprint.length) {
            delete event.fingerprint;
        }
    }

    /**
     * Default value for maximum number of breadcrumbs added to an event.
     */
    var DEFAULT_MAX_BREADCRUMBS = 100;
    /**
     * The global scope is kept in this module.
     * When accessing this via `getGlobalScope()` we'll make sure to set one if none is currently present.
     */
    var globalScope;
    /**
     * Holds additional event information. {@link Scope.applyToEvent} will be
     * called by the client before an event will be sent.
     */
    var Scope = /** @class */ (function () {
        // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.
        function Scope() {
            this._notifyingListeners = false;
            this._scopeListeners = [];
            this._eventProcessors = [];
            this._breadcrumbs = [];
            this._attachments = [];
            this._user = {};
            this._tags = {};
            this._extra = {};
            this._contexts = {};
            this._sdkProcessingMetadata = {};
            this._propagationContext = generatePropagationContext();
        }
        /**
         * Inherit values from the parent scope.
         * @deprecated Use `scope.clone()` and `new Scope()` instead.
         */
        Scope.clone = function (scope) {
            return scope ? scope.clone() : new Scope();
        };
        /**
         * Clone this scope instance.
         */
        Scope.prototype.clone = function () {
            var newScope = new Scope();
            newScope._breadcrumbs = __spreadArray([], __read(this._breadcrumbs), false);
            newScope._tags = __assign({}, this._tags);
            newScope._extra = __assign({}, this._extra);
            newScope._contexts = __assign({}, this._contexts);
            newScope._user = this._user;
            newScope._level = this._level;
            newScope._span = this._span;
            newScope._session = this._session;
            newScope._transactionName = this._transactionName;
            newScope._fingerprint = this._fingerprint;
            newScope._eventProcessors = __spreadArray([], __read(this._eventProcessors), false);
            newScope._requestSession = this._requestSession;
            newScope._attachments = __spreadArray([], __read(this._attachments), false);
            newScope._sdkProcessingMetadata = __assign({}, this._sdkProcessingMetadata);
            newScope._propagationContext = __assign({}, this._propagationContext);
            newScope._client = this._client;
            return newScope;
        };
        /** Update the client on the scope. */
        Scope.prototype.setClient = function (client) {
            this._client = client;
        };
        /**
         * Get the client assigned to this scope.
         *
         * It is generally recommended to use the global function `Sentry.getClient()` instead, unless you know what you are doing.
         */
        Scope.prototype.getClient = function () {
            return this._client;
        };
        /**
         * Add internal on change listener. Used for sub SDKs that need to store the scope.
         * @hidden
         */
        Scope.prototype.addScopeListener = function (callback) {
            this._scopeListeners.push(callback);
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.addEventProcessor = function (callback) {
            this._eventProcessors.push(callback);
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setUser = function (user) {
            // If null is passed we want to unset everything, but still define keys,
            // so that later down in the pipeline any existing values are cleared.
            this._user = user || {
                email: undefined,
                id: undefined,
                ip_address: undefined,
                segment: undefined,
                username: undefined,
            };
            if (this._session) {
                updateSession(this._session, { user: user });
            }
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.getUser = function () {
            return this._user;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.getRequestSession = function () {
            return this._requestSession;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setRequestSession = function (requestSession) {
            this._requestSession = requestSession;
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setTags = function (tags) {
            this._tags = __assign(__assign({}, this._tags), tags);
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setTag = function (key, value) {
            var _a;
            this._tags = __assign(__assign({}, this._tags), (_a = {}, _a[key] = value, _a));
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setExtras = function (extras) {
            this._extra = __assign(__assign({}, this._extra), extras);
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setExtra = function (key, extra) {
            var _a;
            this._extra = __assign(__assign({}, this._extra), (_a = {}, _a[key] = extra, _a));
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setFingerprint = function (fingerprint) {
            this._fingerprint = fingerprint;
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setLevel = function (
        // eslint-disable-next-line deprecation/deprecation
        level) {
            this._level = level;
            this._notifyScopeListeners();
            return this;
        };
        /**
         * Sets the transaction name on the scope for future events.
         */
        Scope.prototype.setTransactionName = function (name) {
            this._transactionName = name;
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setContext = function (key, context) {
            if (context === null) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this._contexts[key];
            }
            else {
                this._contexts[key] = context;
            }
            this._notifyScopeListeners();
            return this;
        };
        /**
         * Sets the Span on the scope.
         * @param span Span
         * @deprecated Instead of setting a span on a scope, use `startSpan()`/`startSpanManual()` instead.
         */
        Scope.prototype.setSpan = function (span) {
            this._span = span;
            this._notifyScopeListeners();
            return this;
        };
        /**
         * Returns the `Span` if there is one.
         * @deprecated Use `getActiveSpan()` instead.
         */
        Scope.prototype.getSpan = function () {
            return this._span;
        };
        /**
         * Returns the `Transaction` attached to the scope (if there is one).
         * @deprecated You should not rely on the transaction, but just use `startSpan()` APIs instead.
         */
        Scope.prototype.getTransaction = function () {
            // Often, this span (if it exists at all) will be a transaction, but it's not guaranteed to be. Regardless, it will
            // have a pointer to the currently-active transaction.
            var span = this._span;
            // Cannot replace with getRootSpan because getRootSpan returns a span, not a transaction
            // Also, this method will be removed anyway.
            // eslint-disable-next-line deprecation/deprecation
            return span && span.transaction;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setSession = function (session) {
            if (!session) {
                delete this._session;
            }
            else {
                this._session = session;
            }
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.getSession = function () {
            return this._session;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.update = function (captureContext) {
            if (!captureContext) {
                return this;
            }
            var scopeToMerge = typeof captureContext === 'function' ? captureContext(this) : captureContext;
            if (scopeToMerge instanceof Scope) {
                var scopeData = scopeToMerge.getScopeData();
                this._tags = __assign(__assign({}, this._tags), scopeData.tags);
                this._extra = __assign(__assign({}, this._extra), scopeData.extra);
                this._contexts = __assign(__assign({}, this._contexts), scopeData.contexts);
                if (scopeData.user && Object.keys(scopeData.user).length) {
                    this._user = scopeData.user;
                }
                if (scopeData.level) {
                    this._level = scopeData.level;
                }
                if (scopeData.fingerprint.length) {
                    this._fingerprint = scopeData.fingerprint;
                }
                if (scopeToMerge.getRequestSession()) {
                    this._requestSession = scopeToMerge.getRequestSession();
                }
                if (scopeData.propagationContext) {
                    this._propagationContext = scopeData.propagationContext;
                }
            }
            else if (isPlainObject(scopeToMerge)) {
                var scopeContext = captureContext;
                this._tags = __assign(__assign({}, this._tags), scopeContext.tags);
                this._extra = __assign(__assign({}, this._extra), scopeContext.extra);
                this._contexts = __assign(__assign({}, this._contexts), scopeContext.contexts);
                if (scopeContext.user) {
                    this._user = scopeContext.user;
                }
                if (scopeContext.level) {
                    this._level = scopeContext.level;
                }
                if (scopeContext.fingerprint) {
                    this._fingerprint = scopeContext.fingerprint;
                }
                if (scopeContext.requestSession) {
                    this._requestSession = scopeContext.requestSession;
                }
                if (scopeContext.propagationContext) {
                    this._propagationContext = scopeContext.propagationContext;
                }
            }
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.clear = function () {
            this._breadcrumbs = [];
            this._tags = {};
            this._extra = {};
            this._user = {};
            this._contexts = {};
            this._level = undefined;
            this._transactionName = undefined;
            this._fingerprint = undefined;
            this._requestSession = undefined;
            this._span = undefined;
            this._session = undefined;
            this._notifyScopeListeners();
            this._attachments = [];
            this._propagationContext = generatePropagationContext();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.addBreadcrumb = function (breadcrumb, maxBreadcrumbs) {
            var maxCrumbs = typeof maxBreadcrumbs === 'number' ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
            // No data has been changed, so don't notify scope listeners
            if (maxCrumbs <= 0) {
                return this;
            }
            var mergedBreadcrumb = __assign({ timestamp: dateTimestampInSeconds() }, breadcrumb);
            var breadcrumbs = this._breadcrumbs;
            breadcrumbs.push(mergedBreadcrumb);
            this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs;
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.getLastBreadcrumb = function () {
            return this._breadcrumbs[this._breadcrumbs.length - 1];
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.clearBreadcrumbs = function () {
            this._breadcrumbs = [];
            this._notifyScopeListeners();
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.addAttachment = function (attachment) {
            this._attachments.push(attachment);
            return this;
        };
        /**
         * @inheritDoc
         * @deprecated Use `getScopeData()` instead.
         */
        Scope.prototype.getAttachments = function () {
            var data = this.getScopeData();
            return data.attachments;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.clearAttachments = function () {
            this._attachments = [];
            return this;
        };
        /** @inheritDoc */
        Scope.prototype.getScopeData = function () {
            var _a = this, _breadcrumbs = _a._breadcrumbs, _attachments = _a._attachments, _contexts = _a._contexts, _tags = _a._tags, _extra = _a._extra, _user = _a._user, _level = _a._level, _fingerprint = _a._fingerprint, _eventProcessors = _a._eventProcessors, _propagationContext = _a._propagationContext, _sdkProcessingMetadata = _a._sdkProcessingMetadata, _transactionName = _a._transactionName, _span = _a._span;
            return {
                breadcrumbs: _breadcrumbs,
                attachments: _attachments,
                contexts: _contexts,
                tags: _tags,
                extra: _extra,
                user: _user,
                level: _level,
                fingerprint: _fingerprint || [],
                eventProcessors: _eventProcessors,
                propagationContext: _propagationContext,
                sdkProcessingMetadata: _sdkProcessingMetadata,
                transactionName: _transactionName,
                span: _span,
            };
        };
        /**
         * Applies data from the scope to the event and runs all event processors on it.
         *
         * @param event Event
         * @param hint Object containing additional information about the original exception, for use by the event processors.
         * @hidden
         * @deprecated Use `applyScopeDataToEvent()` directly
         */
        Scope.prototype.applyToEvent = function (event, hint, additionalEventProcessors) {
            if (hint === void 0) { hint = {}; }
            if (additionalEventProcessors === void 0) { additionalEventProcessors = []; }
            applyScopeDataToEvent(event, this.getScopeData());
            // TODO (v8): Update this order to be: Global > Client > Scope
            var eventProcessors = __spreadArray(__spreadArray(__spreadArray([], __read(additionalEventProcessors), false), __read(getGlobalEventProcessors()), false), __read(this._eventProcessors), false);
            return notifyEventProcessors(eventProcessors, event, hint);
        };
        /**
         * Add data which will be accessible during event processing but won't get sent to Sentry
         */
        Scope.prototype.setSDKProcessingMetadata = function (newData) {
            this._sdkProcessingMetadata = __assign(__assign({}, this._sdkProcessingMetadata), newData);
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.setPropagationContext = function (context) {
            this._propagationContext = context;
            return this;
        };
        /**
         * @inheritDoc
         */
        Scope.prototype.getPropagationContext = function () {
            return this._propagationContext;
        };
        /**
         * Capture an exception for this scope.
         *
         * @param exception The exception to capture.
         * @param hint Optinal additional data to attach to the Sentry event.
         * @returns the id of the captured Sentry event.
         */
        Scope.prototype.captureException = function (exception, hint) {
            var eventId = hint && hint.event_id ? hint.event_id : uuid4();
            if (!this._client) {
                logger.warn('No client configured on scope - will not capture exception!');
                return eventId;
            }
            var syntheticException = new Error('Sentry syntheticException');
            this._client.captureException(exception, __assign(__assign({ originalException: exception, syntheticException: syntheticException }, hint), { event_id: eventId }), this);
            return eventId;
        };
        /**
         * Capture a message for this scope.
         *
         * @param message The message to capture.
         * @param level An optional severity level to report the message with.
         * @param hint Optional additional data to attach to the Sentry event.
         * @returns the id of the captured message.
         */
        Scope.prototype.captureMessage = function (message, level, hint) {
            var eventId = hint && hint.event_id ? hint.event_id : uuid4();
            if (!this._client) {
                logger.warn('No client configured on scope - will not capture message!');
                return eventId;
            }
            var syntheticException = new Error(message);
            this._client.captureMessage(message, level, __assign(__assign({ originalException: message, syntheticException: syntheticException }, hint), { event_id: eventId }), this);
            return eventId;
        };
        /**
         * Captures a manually created event for this scope and sends it to Sentry.
         *
         * @param exception The event to capture.
         * @param hint Optional additional data to attach to the Sentry event.
         * @returns the id of the captured event.
         */
        Scope.prototype.captureEvent = function (event, hint) {
            var eventId = hint && hint.event_id ? hint.event_id : uuid4();
            if (!this._client) {
                logger.warn('No client configured on scope - will not capture event!');
                return eventId;
            }
            this._client.captureEvent(event, __assign(__assign({}, hint), { event_id: eventId }), this);
            return eventId;
        };
        /**
         * This will be called on every set call.
         */
        Scope.prototype._notifyScopeListeners = function () {
            var _this = this;
            // We need this check for this._notifyingListeners to be able to work on scope during updates
            // If this check is not here we'll produce endless recursion when something is done with the scope
            // during the callback.
            if (!this._notifyingListeners) {
                this._notifyingListeners = true;
                this._scopeListeners.forEach(function (callback) {
                    callback(_this);
                });
                this._notifyingListeners = false;
            }
        };
        return Scope;
    }());
    /**
     * Get the global scope.
     * This scope is applied to _all_ events.
     */
    function getGlobalScope() {
        if (!globalScope) {
            globalScope = new Scope();
        }
        return globalScope;
    }
    function generatePropagationContext() {
        return {
            traceId: uuid4(),
            spanId: uuid4().substring(16),
        };
    }

    var SDK_VERSION = '7.119.0';

    /**
     * API compatibility version of this hub.
     *
     * WARNING: This number should only be increased when the global interface
     * changes and new methods are introduced.
     *
     * @hidden
     */
    var API_VERSION = parseFloat(SDK_VERSION);
    /**
     * Default maximum number of breadcrumbs added to an event. Can be overwritten
     * with {@link Options.maxBreadcrumbs}.
     */
    var DEFAULT_BREADCRUMBS = 100;
    /**
     * @deprecated The `Hub` class will be removed in version 8 of the SDK in favour of `Scope` and `Client` objects.
     *
     * If you previously used the `Hub` class directly, replace it with `Scope` and `Client` objects. More information:
     * - [Multiple Sentry Instances](https://docs.sentry.io/platforms/javascript/best-practices/multiple-sentry-instances/)
     * - [Browser Extensions](https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/)
     *
     * Some of our APIs are typed with the Hub class instead of the interface (e.g. `getCurrentHub`). Most of them are deprecated
     * themselves and will also be removed in version 8. More information:
     * - [Migration Guide](https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md#deprecate-hub)
     */
    // eslint-disable-next-line deprecation/deprecation
    var Hub = /** @class */ (function () {
        /**
         * Creates a new instance of the hub, will push one {@link Layer} into the
         * internal stack on creation.
         *
         * @param client bound to the hub.
         * @param scope bound to the hub.
         * @param version number, higher number means higher priority.
         *
         * @deprecated Instantiation of Hub objects is deprecated and the constructor will be removed in version 8 of the SDK.
         *
         * If you are currently using the Hub for multi-client use like so:
         *
         * ```
         * // OLD
         * const hub = new Hub();
         * hub.bindClient(client);
         * makeMain(hub)
         * ```
         *
         * instead initialize the client as follows:
         *
         * ```
         * // NEW
         * Sentry.withIsolationScope(() => {
         *    Sentry.setCurrentClient(client);
         *    client.init();
         * });
         * ```
         *
         * If you are using the Hub to capture events like so:
         *
         * ```
         * // OLD
         * const client = new Client();
         * const hub = new Hub(client);
         * hub.captureException()
         * ```
         *
         * instead capture isolated events as follows:
         *
         * ```
         * // NEW
         * const client = new Client();
         * const scope = new Scope();
         * scope.setClient(client);
         * scope.captureException();
         * ```
         */
        function Hub(client, scope, isolationScope, _version) {
            if (_version === void 0) { _version = API_VERSION; }
            this._version = _version;
            var assignedScope;
            if (!scope) {
                assignedScope = new Scope();
                assignedScope.setClient(client);
            }
            else {
                assignedScope = scope;
            }
            var assignedIsolationScope;
            if (!isolationScope) {
                assignedIsolationScope = new Scope();
                assignedIsolationScope.setClient(client);
            }
            else {
                assignedIsolationScope = isolationScope;
            }
            this._stack = [{ scope: assignedScope }];
            if (client) {
                // eslint-disable-next-line deprecation/deprecation
                this.bindClient(client);
            }
            this._isolationScope = assignedIsolationScope;
        }
        /**
         * Checks if this hub's version is older than the given version.
         *
         * @param version A version number to compare to.
         * @return True if the given version is newer; otherwise false.
         *
         * @deprecated This will be removed in v8.
         */
        Hub.prototype.isOlderThan = function (version) {
            return this._version < version;
        };
        /**
         * This binds the given client to the current scope.
         * @param client An SDK client (client) instance.
         *
         * @deprecated Use `initAndBind()` directly, or `setCurrentClient()` and/or `client.init()` instead.
         */
        Hub.prototype.bindClient = function (client) {
            // eslint-disable-next-line deprecation/deprecation
            var top = this.getStackTop();
            top.client = client;
            top.scope.setClient(client);
            // eslint-disable-next-line deprecation/deprecation
            if (client && client.setupIntegrations) {
                // eslint-disable-next-line deprecation/deprecation
                client.setupIntegrations();
            }
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `withScope` instead.
         */
        Hub.prototype.pushScope = function () {
            // We want to clone the content of prev scope
            // eslint-disable-next-line deprecation/deprecation
            var scope = this.getScope().clone();
            // eslint-disable-next-line deprecation/deprecation
            this.getStack().push({
                // eslint-disable-next-line deprecation/deprecation
                client: this.getClient(),
                scope: scope,
            });
            return scope;
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `withScope` instead.
         */
        Hub.prototype.popScope = function () {
            // eslint-disable-next-line deprecation/deprecation
            if (this.getStack().length <= 1)
                return false;
            // eslint-disable-next-line deprecation/deprecation
            return !!this.getStack().pop();
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `Sentry.withScope()` instead.
         */
        Hub.prototype.withScope = function (callback) {
            var _this = this;
            // eslint-disable-next-line deprecation/deprecation
            var scope = this.pushScope();
            var maybePromiseResult;
            try {
                maybePromiseResult = callback(scope);
            }
            catch (e) {
                // eslint-disable-next-line deprecation/deprecation
                this.popScope();
                throw e;
            }
            if (isThenable(maybePromiseResult)) {
                // @ts-expect-error - isThenable returns the wrong type
                return maybePromiseResult.then(function (res) {
                    // eslint-disable-next-line deprecation/deprecation
                    _this.popScope();
                    return res;
                }, function (e) {
                    // eslint-disable-next-line deprecation/deprecation
                    _this.popScope();
                    throw e;
                });
            }
            // eslint-disable-next-line deprecation/deprecation
            this.popScope();
            return maybePromiseResult;
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `Sentry.getClient()` instead.
         */
        Hub.prototype.getClient = function () {
            // eslint-disable-next-line deprecation/deprecation
            return this.getStackTop().client;
        };
        /**
         * Returns the scope of the top stack.
         *
         * @deprecated Use `Sentry.getCurrentScope()` instead.
         */
        Hub.prototype.getScope = function () {
            // eslint-disable-next-line deprecation/deprecation
            return this.getStackTop().scope;
        };
        /**
         * @deprecated Use `Sentry.getIsolationScope()` instead.
         */
        Hub.prototype.getIsolationScope = function () {
            return this._isolationScope;
        };
        /**
         * Returns the scope stack for domains or the process.
         * @deprecated This will be removed in v8.
         */
        Hub.prototype.getStack = function () {
            return this._stack;
        };
        /**
         * Returns the topmost scope layer in the order domain > local > process.
         * @deprecated This will be removed in v8.
         */
        Hub.prototype.getStackTop = function () {
            return this._stack[this._stack.length - 1];
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `Sentry.captureException()` instead.
         */
        Hub.prototype.captureException = function (exception, hint) {
            var eventId = (this._lastEventId = hint && hint.event_id ? hint.event_id : uuid4());
            var syntheticException = new Error('Sentry syntheticException');
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().captureException(exception, __assign(__assign({ originalException: exception, syntheticException: syntheticException }, hint), { event_id: eventId }));
            return eventId;
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use  `Sentry.captureMessage()` instead.
         */
        Hub.prototype.captureMessage = function (message,
        // eslint-disable-next-line deprecation/deprecation
        level, hint) {
            var eventId = (this._lastEventId = hint && hint.event_id ? hint.event_id : uuid4());
            var syntheticException = new Error(message);
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().captureMessage(message, level, __assign(__assign({ originalException: message, syntheticException: syntheticException }, hint), { event_id: eventId }));
            return eventId;
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `Sentry.captureEvent()` instead.
         */
        Hub.prototype.captureEvent = function (event, hint) {
            var eventId = hint && hint.event_id ? hint.event_id : uuid4();
            if (!event.type) {
                this._lastEventId = eventId;
            }
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().captureEvent(event, __assign(__assign({}, hint), { event_id: eventId }));
            return eventId;
        };
        /**
         * @inheritDoc
         *
         * @deprecated This will be removed in v8.
         */
        Hub.prototype.lastEventId = function () {
            return this._lastEventId;
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `Sentry.addBreadcrumb()` instead.
         */
        Hub.prototype.addBreadcrumb = function (breadcrumb, hint) {
            // eslint-disable-next-line deprecation/deprecation
            var _a = this.getStackTop(), scope = _a.scope, client = _a.client;
            if (!client)
                return;
            var _b = (client.getOptions && client.getOptions()) || {}, _c = _b.beforeBreadcrumb, beforeBreadcrumb = _c === void 0 ? null : _c, _d = _b.maxBreadcrumbs, maxBreadcrumbs = _d === void 0 ? DEFAULT_BREADCRUMBS : _d;
            if (maxBreadcrumbs <= 0)
                return;
            var timestamp = dateTimestampInSeconds();
            var mergedBreadcrumb = __assign({ timestamp: timestamp }, breadcrumb);
            var finalBreadcrumb = beforeBreadcrumb
                ? consoleSandbox(function () { return beforeBreadcrumb(mergedBreadcrumb, hint); })
                : mergedBreadcrumb;
            if (finalBreadcrumb === null)
                return;
            if (client.emit) {
                client.emit('beforeAddBreadcrumb', finalBreadcrumb, hint);
            }
            // TODO(v8): I know this comment doesn't make much sense because the hub will be deprecated but I still wanted to
            // write it down. In theory, we would have to add the breadcrumbs to the isolation scope here, however, that would
            // duplicate all of the breadcrumbs. There was the possibility of adding breadcrumbs to both, the isolation scope
            // and the normal scope, and deduplicating it down the line in the event processing pipeline. However, that would
            // have been very fragile, because the breadcrumb objects would have needed to keep their identity all throughout
            // the event processing pipeline.
            // In the new implementation, the top level `Sentry.addBreadcrumb()` should ONLY write to the isolation scope.
            scope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
        };
        /**
         * @inheritDoc
         * @deprecated Use `Sentry.setUser()` instead.
         */
        Hub.prototype.setUser = function (user) {
            // TODO(v8): The top level `Sentry.setUser()` function should write ONLY to the isolation scope.
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().setUser(user);
            // eslint-disable-next-line deprecation/deprecation
            this.getIsolationScope().setUser(user);
        };
        /**
         * @inheritDoc
         * @deprecated Use `Sentry.setTags()` instead.
         */
        Hub.prototype.setTags = function (tags) {
            // TODO(v8): The top level `Sentry.setTags()` function should write ONLY to the isolation scope.
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().setTags(tags);
            // eslint-disable-next-line deprecation/deprecation
            this.getIsolationScope().setTags(tags);
        };
        /**
         * @inheritDoc
         * @deprecated Use `Sentry.setExtras()` instead.
         */
        Hub.prototype.setExtras = function (extras) {
            // TODO(v8): The top level `Sentry.setExtras()` function should write ONLY to the isolation scope.
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().setExtras(extras);
            // eslint-disable-next-line deprecation/deprecation
            this.getIsolationScope().setExtras(extras);
        };
        /**
         * @inheritDoc
         * @deprecated Use `Sentry.setTag()` instead.
         */
        Hub.prototype.setTag = function (key, value) {
            // TODO(v8): The top level `Sentry.setTag()` function should write ONLY to the isolation scope.
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().setTag(key, value);
            // eslint-disable-next-line deprecation/deprecation
            this.getIsolationScope().setTag(key, value);
        };
        /**
         * @inheritDoc
         * @deprecated Use `Sentry.setExtra()` instead.
         */
        Hub.prototype.setExtra = function (key, extra) {
            // TODO(v8): The top level `Sentry.setExtra()` function should write ONLY to the isolation scope.
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().setExtra(key, extra);
            // eslint-disable-next-line deprecation/deprecation
            this.getIsolationScope().setExtra(key, extra);
        };
        /**
         * @inheritDoc
         * @deprecated Use `Sentry.setContext()` instead.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Hub.prototype.setContext = function (name, context) {
            // TODO(v8): The top level `Sentry.setContext()` function should write ONLY to the isolation scope.
            // eslint-disable-next-line deprecation/deprecation
            this.getScope().setContext(name, context);
            // eslint-disable-next-line deprecation/deprecation
            this.getIsolationScope().setContext(name, context);
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use `getScope()` directly.
         */
        Hub.prototype.configureScope = function (callback) {
            // eslint-disable-next-line deprecation/deprecation
            var _a = this.getStackTop(), scope = _a.scope, client = _a.client;
            if (client) {
                callback(scope);
            }
        };
        /**
         * @inheritDoc
         */
        // eslint-disable-next-line deprecation/deprecation
        Hub.prototype.run = function (callback) {
            // eslint-disable-next-line deprecation/deprecation
            var oldHub = makeMain(this);
            try {
                callback(this);
            }
            finally {
                // eslint-disable-next-line deprecation/deprecation
                makeMain(oldHub);
            }
        };
        /**
         * @inheritDoc
         * @deprecated Use `Sentry.getClient().getIntegrationByName()` instead.
         */
        Hub.prototype.getIntegration = function (integration) {
            // eslint-disable-next-line deprecation/deprecation
            var client = this.getClient();
            if (!client)
                return null;
            try {
                // eslint-disable-next-line deprecation/deprecation
                return client.getIntegration(integration);
            }
            catch (_oO) {
                DEBUG_BUILD$1 && logger.warn("Cannot retrieve integration ".concat(integration.id, " from the current Hub"));
                return null;
            }
        };
        /**
         * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
         *
         * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
         * new child span within the transaction or any span, call the respective `.startChild()` method.
         *
         * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
         *
         * The transaction must be finished with a call to its `.end()` method, at which point the transaction with all its
         * finished child spans will be sent to Sentry.
         *
         * @param context Properties of the new `Transaction`.
         * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
         * default values). See {@link Options.tracesSampler}.
         *
         * @returns The transaction which was just started
         *
         * @deprecated Use `startSpan()`, `startSpanManual()` or `startInactiveSpan()` instead.
         */
        Hub.prototype.startTransaction = function (context, customSamplingContext) {
            var result = this._callExtensionMethod('startTransaction', context, customSamplingContext);
            if (DEBUG_BUILD$1 && !result) {
                // eslint-disable-next-line deprecation/deprecation
                var client = this.getClient();
                if (!client) {
                    logger.warn("Tracing extension 'startTransaction' is missing. You should 'init' the SDK before calling 'startTransaction'");
                }
                else {
                    logger.warn("Tracing extension 'startTransaction' has not been added. Call 'addTracingExtensions' before calling 'init':\nSentry.addTracingExtensions();\nSentry.init({...});\n");
                }
            }
            return result;
        };
        /**
         * @inheritDoc
         * @deprecated Use `spanToTraceHeader()` instead.
         */
        Hub.prototype.traceHeaders = function () {
            return this._callExtensionMethod('traceHeaders');
        };
        /**
         * @inheritDoc
         *
         * @deprecated Use top level `captureSession` instead.
         */
        Hub.prototype.captureSession = function (endSession) {
            if (endSession === void 0) { endSession = false; }
            // both send the update and pull the session from the scope
            if (endSession) {
                // eslint-disable-next-line deprecation/deprecation
                return this.endSession();
            }
            // only send the update
            this._sendSessionUpdate();
        };
        /**
         * @inheritDoc
         * @deprecated Use top level `endSession` instead.
         */
        Hub.prototype.endSession = function () {
            // eslint-disable-next-line deprecation/deprecation
            var layer = this.getStackTop();
            var scope = layer.scope;
            var session = scope.getSession();
            if (session) {
                closeSession(session);
            }
            this._sendSessionUpdate();
            // the session is over; take it off of the scope
            scope.setSession();
        };
        /**
         * @inheritDoc
         * @deprecated Use top level `startSession` instead.
         */
        Hub.prototype.startSession = function (context) {
            // eslint-disable-next-line deprecation/deprecation
            var _a = this.getStackTop(), scope = _a.scope, client = _a.client;
            var _b = (client && client.getOptions()) || {}, release = _b.release, _c = _b.environment, environment = _c === void 0 ? DEFAULT_ENVIRONMENT : _c;
            // Will fetch userAgent if called from browser sdk
            var userAgent = (GLOBAL_OBJ.navigator || {}).userAgent;
            var session = makeSession(__assign(__assign({ release: release, environment: environment, user: scope.getUser() }, (userAgent && { userAgent: userAgent })), context));
            // End existing session if there's one
            var currentSession = scope.getSession && scope.getSession();
            if (currentSession && currentSession.status === 'ok') {
                updateSession(currentSession, { status: 'exited' });
            }
            // eslint-disable-next-line deprecation/deprecation
            this.endSession();
            // Afterwards we set the new session on the scope
            scope.setSession(session);
            return session;
        };
        /**
         * Returns if default PII should be sent to Sentry and propagated in ourgoing requests
         * when Tracing is used.
         *
         * @deprecated Use top-level `getClient().getOptions().sendDefaultPii` instead. This function
         * only unnecessarily increased API surface but only wrapped accessing the option.
         */
        Hub.prototype.shouldSendDefaultPii = function () {
            // eslint-disable-next-line deprecation/deprecation
            var client = this.getClient();
            var options = client && client.getOptions();
            return Boolean(options && options.sendDefaultPii);
        };
        /**
         * Sends the current Session on the scope
         */
        Hub.prototype._sendSessionUpdate = function () {
            // eslint-disable-next-line deprecation/deprecation
            var _a = this.getStackTop(), scope = _a.scope, client = _a.client;
            var session = scope.getSession();
            if (session && client && client.captureSession) {
                client.captureSession(session);
            }
        };
        /**
         * Calls global extension method and binding current instance to the function call
         */
        // @ts-expect-error Function lacks ending return statement and return type does not include 'undefined'. ts(2366)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Hub.prototype._callExtensionMethod = function (method) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var carrier = getMainCarrier();
            var sentry = carrier.__SENTRY__;
            if (sentry && sentry.extensions && typeof sentry.extensions[method] === 'function') {
                return sentry.extensions[method].apply(this, args);
            }
            DEBUG_BUILD$1 && logger.warn("Extension method ".concat(method, " couldn't be found, doing nothing."));
        };
        return Hub;
    }());
    /**
     * Returns the global shim registry.
     *
     * FIXME: This function is problematic, because despite always returning a valid Carrier,
     * it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
     * at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
     **/
    function getMainCarrier() {
        GLOBAL_OBJ.__SENTRY__ = GLOBAL_OBJ.__SENTRY__ || {
            extensions: {},
            hub: undefined,
        };
        return GLOBAL_OBJ;
    }
    /**
     * Replaces the current main hub with the passed one on the global object
     *
     * @returns The old replaced hub
     *
     * @deprecated Use `setCurrentClient()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    function makeMain(hub) {
        var registry = getMainCarrier();
        var oldHub = getHubFromCarrier(registry);
        setHubOnCarrier(registry, hub);
        return oldHub;
    }
    /**
     * Returns the default hub instance.
     *
     * If a hub is already registered in the global carrier but this module
     * contains a more recent version, it replaces the registered version.
     * Otherwise, the currently registered hub will be returned.
     *
     * @deprecated Use the respective replacement method directly instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    function getCurrentHub() {
        // Get main carrier (global for every environment)
        var registry = getMainCarrier();
        if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
            var hub = registry.__SENTRY__.acs.getCurrentHub();
            if (hub) {
                return hub;
            }
        }
        // Return hub that lives on a global object
        return getGlobalHub(registry);
    }
    /**
     * Get the currently active isolation scope.
     * The isolation scope is active for the current exection context,
     * meaning that it will remain stable for the same Hub.
     */
    function getIsolationScope() {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentHub().getIsolationScope();
    }
    // eslint-disable-next-line deprecation/deprecation
    function getGlobalHub(registry) {
        // If there's no hub, or its an old API, assign a new one
        if (registry === void 0) { registry = getMainCarrier(); }
        if (!hasHubOnCarrier(registry) ||
            // eslint-disable-next-line deprecation/deprecation
            getHubFromCarrier(registry).isOlderThan(API_VERSION)) {
            // eslint-disable-next-line deprecation/deprecation
            setHubOnCarrier(registry, new Hub());
        }
        // Return hub that lives on a global object
        return getHubFromCarrier(registry);
    }
    /**
     * Runs the supplied callback in its own async context. Async Context strategies are defined per SDK.
     *
     * @param callback The callback to run in its own async context
     * @param options Options to pass to the async context strategy
     * @returns The result of the callback
     */
    function runWithAsyncContext(callback, options) {
        if (options === void 0) { options = {}; }
        var registry = getMainCarrier();
        if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
            return registry.__SENTRY__.acs.runWithAsyncContext(callback, options);
        }
        // if there was no strategy, fallback to just calling the callback
        return callback();
    }
    /**
     * This will tell whether a carrier has a hub on it or not
     * @param carrier object
     */
    function hasHubOnCarrier(carrier) {
        return !!(carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub);
    }
    /**
     * This will create a new {@link Hub} and add to the passed object on
     * __SENTRY__.hub.
     * @param carrier object
     * @hidden
     */
    // eslint-disable-next-line deprecation/deprecation
    function getHubFromCarrier(carrier) {
        // eslint-disable-next-line deprecation/deprecation
        return getGlobalSingleton('hub', function () { return new Hub(); }, carrier);
    }
    /**
     * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
     * @param carrier object
     * @param hub Hub
     * @returns A boolean indicating success or failure
     */
    // eslint-disable-next-line deprecation/deprecation
    function setHubOnCarrier(carrier, hub) {
        if (!carrier)
            return false;
        var __SENTRY__ = (carrier.__SENTRY__ = carrier.__SENTRY__ || {});
        __SENTRY__.hub = hub;
        return true;
    }

    var SPAN_METRIC_SUMMARY;
    function getMetricStorageForSpan(span) {
        return SPAN_METRIC_SUMMARY ? SPAN_METRIC_SUMMARY.get(span) : undefined;
    }
    /**
     * Updates the metric summary on the currently active span
     */
    function updateMetricSummaryOnActiveSpan(metricType, sanitizedName, value, unit, tags, bucketKey) {
        var span = getActiveSpan();
        if (span) {
            var storage = getMetricStorageForSpan(span) || new Map();
            var exportKey = "".concat(metricType, ":").concat(sanitizedName, "@").concat(unit);
            var bucketItem = storage.get(bucketKey);
            if (bucketItem) {
                var _a = __read(bucketItem, 2), summary = _a[1];
                storage.set(bucketKey, [
                    exportKey,
                    {
                        min: Math.min(summary.min, value),
                        max: Math.max(summary.max, value),
                        count: (summary.count += 1),
                        sum: (summary.sum += value),
                        tags: summary.tags,
                    },
                ]);
            }
            else {
                storage.set(bucketKey, [
                    exportKey,
                    {
                        min: value,
                        max: value,
                        count: 1,
                        sum: value,
                        tags: tags,
                    },
                ]);
            }
            if (!SPAN_METRIC_SUMMARY) {
                SPAN_METRIC_SUMMARY = new WeakMap();
            }
            SPAN_METRIC_SUMMARY.set(span, storage);
        }
    }

    /**
     * Use this attribute to represent the source of a span.
     * Should be one of: custom, url, route, view, component, task, unknown
     *
     */
    var SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = 'sentry.source';
    /**
     * Use this attribute to represent the sample rate used for a span.
     */
    var SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = 'sentry.sample_rate';
    /**
     * Use this attribute to represent the operation of a span.
     */
    var SEMANTIC_ATTRIBUTE_SENTRY_OP = 'sentry.op';
    /**
     * Use this attribute to represent the origin of a span.
     */
    var SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = 'sentry.origin';

    /**
     * Wrap a callback function with error handling.
     * If an error is thrown, it will be passed to the `onError` callback and re-thrown.
     *
     * If the return value of the function is a promise, it will be handled with `maybeHandlePromiseRejection`.
     *
     * If an `onFinally` callback is provided, this will be called when the callback has finished
     * - so if it returns a promise, once the promise resolved/rejected,
     * else once the callback has finished executing.
     * The `onFinally` callback will _always_ be called, no matter if an error was thrown or not.
     */
    function handleCallbackErrors(fn, onError,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onFinally) {
        if (onFinally === void 0) { onFinally = function () { }; }
        var maybePromiseResult;
        try {
            maybePromiseResult = fn();
        }
        catch (e) {
            onError(e);
            onFinally();
            throw e;
        }
        return maybeHandlePromiseRejection(maybePromiseResult, onError, onFinally);
    }
    /**
     * Maybe handle a promise rejection.
     * This expects to be given a value that _may_ be a promise, or any other value.
     * If it is a promise, and it rejects, it will call the `onError` callback.
     * Other than this, it will generally return the given value as-is.
     */
    function maybeHandlePromiseRejection(value, onError, onFinally) {
        if (isThenable(value)) {
            // @ts-expect-error - the isThenable check returns the "wrong" type here
            return value.then(function (res) {
                onFinally();
                return res;
            }, function (e) {
                onError(e);
                onFinally();
                throw e;
            });
        }
        onFinally();
        return value;
    }

    /**
     * Determines if tracing is currently enabled.
     *
     * Tracing is enabled when at least one of `tracesSampleRate` and `tracesSampler` is defined in the SDK config.
     */
    function hasTracingEnabled(maybeOptions) {
        if (typeof __SENTRY_TRACING__ === 'boolean' && !__SENTRY_TRACING__) {
            return false;
        }
        var client = getClient();
        var options = maybeOptions || (client && client.getOptions());
        return !!options && (options.enableTracing || 'tracesSampleRate' in options || 'tracesSampler' in options);
    }

    /**
     * Wraps a function with a transaction/span and finishes the span after the function is done.
     * The created span is the active span and will be used as parent by other spans created inside the function
     * and can be accessed via `Sentry.getSpan()`, as long as the function is executed while the scope is active.
     *
     * If you want to create a span that is not set as active, use {@link startInactiveSpan}.
     *
     * Note that if you have not enabled tracing extensions via `addTracingExtensions`
     * or you didn't set `tracesSampleRate`, this function will not generate spans
     * and the `span` returned from the callback will be undefined.
     */
    function startSpan(context, callback) {
        var spanContext = normalizeContext(context);
        return runWithAsyncContext(function () {
            return withScope(context.scope, function (scope) {
                // eslint-disable-next-line deprecation/deprecation
                var hub = getCurrentHub();
                // eslint-disable-next-line deprecation/deprecation
                var parentSpan = scope.getSpan();
                var shouldSkipSpan = context.onlyIfParent && !parentSpan;
                var activeSpan = shouldSkipSpan
                    ? undefined
                    : createChildSpanOrTransaction(hub, {
                        parentSpan: parentSpan,
                        spanContext: spanContext,
                        forceTransaction: context.forceTransaction,
                        scope: scope,
                    });
                return handleCallbackErrors(function () { return callback(activeSpan); }, function () {
                    // Only update the span status if it hasn't been changed yet
                    if (activeSpan) {
                        var status_1 = spanToJSON(activeSpan).status;
                        if (!status_1 || status_1 === 'ok') {
                            activeSpan.setStatus('internal_error');
                        }
                    }
                }, function () { return activeSpan && activeSpan.end(); });
            });
        });
    }
    /**
     * Similar to `Sentry.startSpan`. Wraps a function with a transaction/span, but does not finish the span
     * after the function is done automatically. You'll have to call `span.end()` manually.
     *
     * The created span is the active span and will be used as parent by other spans created inside the function
     * and can be accessed via `Sentry.getActiveSpan()`, as long as the function is executed while the scope is active.
     *
     * Note that if you have not enabled tracing extensions via `addTracingExtensions`
     * or you didn't set `tracesSampleRate`, this function will not generate spans
     * and the `span` returned from the callback will be undefined.
     */
    function startSpanManual(context, callback) {
        var spanContext = normalizeContext(context);
        return runWithAsyncContext(function () {
            return withScope(context.scope, function (scope) {
                // eslint-disable-next-line deprecation/deprecation
                var hub = getCurrentHub();
                // eslint-disable-next-line deprecation/deprecation
                var parentSpan = scope.getSpan();
                var shouldSkipSpan = context.onlyIfParent && !parentSpan;
                var activeSpan = shouldSkipSpan
                    ? undefined
                    : createChildSpanOrTransaction(hub, {
                        parentSpan: parentSpan,
                        spanContext: spanContext,
                        forceTransaction: context.forceTransaction,
                        scope: scope,
                    });
                function finishAndSetSpan() {
                    activeSpan && activeSpan.end();
                }
                return handleCallbackErrors(function () { return callback(activeSpan, finishAndSetSpan); }, function () {
                    // Only update the span status if it hasn't been changed yet, and the span is not yet finished
                    if (activeSpan && activeSpan.isRecording()) {
                        var status_2 = spanToJSON(activeSpan).status;
                        if (!status_2 || status_2 === 'ok') {
                            activeSpan.setStatus('internal_error');
                        }
                    }
                });
            });
        });
    }
    /**
     * Creates a span. This span is not set as active, so will not get automatic instrumentation spans
     * as children or be able to be accessed via `Sentry.getSpan()`.
     *
     * If you want to create a span that is set as active, use {@link startSpan}.
     *
     * Note that if you have not enabled tracing extensions via `addTracingExtensions`
     * or you didn't set `tracesSampleRate` or `tracesSampler`, this function will not generate spans
     * and the `span` returned from the callback will be undefined.
     */
    function startInactiveSpan(context) {
        if (!hasTracingEnabled()) {
            return undefined;
        }
        var spanContext = normalizeContext(context);
        // eslint-disable-next-line deprecation/deprecation
        var hub = getCurrentHub();
        var parentSpan = context.scope
            ? // eslint-disable-next-line deprecation/deprecation
                context.scope.getSpan()
            : getActiveSpan();
        var shouldSkipSpan = context.onlyIfParent && !parentSpan;
        if (shouldSkipSpan) {
            return undefined;
        }
        var scope = context.scope || getCurrentScope();
        // Even though we don't actually want to make this span active on the current scope,
        // we need to make it active on a temporary scope that we use for event processing
        // as otherwise, it won't pick the correct span for the event when processing it
        var temporaryScope = scope.clone();
        return createChildSpanOrTransaction(hub, {
            parentSpan: parentSpan,
            spanContext: spanContext,
            forceTransaction: context.forceTransaction,
            scope: temporaryScope,
        });
    }
    /**
     * Returns the currently active span.
     */
    function getActiveSpan() {
        // eslint-disable-next-line deprecation/deprecation
        return getCurrentScope().getSpan();
    }
    var continueTrace = function (_a, callback) {
        // TODO(v8): Change this function so it doesn't do anything besides setting the propagation context on the current scope:
        /*
          return withScope((scope) => {
            const propagationContext = propagationContextFromHeaders(sentryTrace, baggage);
            scope.setPropagationContext(propagationContext);
            return callback();
          })
        */
        var sentryTrace = _a.sentryTrace, baggage = _a.baggage;
        var currentScope = getCurrentScope();
        // eslint-disable-next-line deprecation/deprecation
        var _b = tracingContextFromHeaders(sentryTrace, baggage), traceparentData = _b.traceparentData, dynamicSamplingContext = _b.dynamicSamplingContext, propagationContext = _b.propagationContext;
        currentScope.setPropagationContext(propagationContext);
        if (DEBUG_BUILD$1 && traceparentData) {
            logger.log("[Tracing] Continuing trace ".concat(traceparentData.traceId, "."));
        }
        var transactionContext = __assign(__assign({}, traceparentData), { metadata: dropUndefinedKeys({
                dynamicSamplingContext: dynamicSamplingContext,
            }) });
        if (!callback) {
            return transactionContext;
        }
        return runWithAsyncContext(function () {
            return callback(transactionContext);
        });
    };
    function createChildSpanOrTransaction(
    // eslint-disable-next-line deprecation/deprecation
    hub, _a) {
        var parentSpan = _a.parentSpan, spanContext = _a.spanContext, forceTransaction = _a.forceTransaction, scope = _a.scope;
        if (!hasTracingEnabled()) {
            return undefined;
        }
        var isolationScope = getIsolationScope();
        var span;
        if (parentSpan && !forceTransaction) {
            // eslint-disable-next-line deprecation/deprecation
            span = parentSpan.startChild(spanContext);
        }
        else if (parentSpan) {
            // If we forced a transaction but have a parent span, make sure to continue from the parent span, not the scope
            var dsc = getDynamicSamplingContextFromSpan(parentSpan);
            var _b = parentSpan.spanContext(), traceId = _b.traceId, parentSpanId = _b.spanId;
            var sampled = spanIsSampled(parentSpan);
            // eslint-disable-next-line deprecation/deprecation
            span = hub.startTransaction(__assign(__assign({ traceId: traceId, parentSpanId: parentSpanId, parentSampled: sampled }, spanContext), { metadata: __assign({ dynamicSamplingContext: dsc }, spanContext.metadata) }));
        }
        else {
            var _c = __assign(__assign({}, isolationScope.getPropagationContext()), scope.getPropagationContext()), traceId = _c.traceId, dsc = _c.dsc, parentSpanId = _c.parentSpanId, sampled = _c.sampled;
            // eslint-disable-next-line deprecation/deprecation
            span = hub.startTransaction(__assign(__assign({ traceId: traceId, parentSpanId: parentSpanId, parentSampled: sampled }, spanContext), { metadata: __assign({ dynamicSamplingContext: dsc }, spanContext.metadata) }));
        }
        // We always set this as active span on the scope
        // In the case of this being an inactive span, we ensure to pass a detached scope in here in the first place
        // But by having this here, we can ensure that the lookup through `getCapturedScopesOnSpan` results in the correct scope & span combo
        // eslint-disable-next-line deprecation/deprecation
        scope.setSpan(span);
        setCapturedScopesOnSpan(span, scope, isolationScope);
        return span;
    }
    /**
     * This converts StartSpanOptions to TransactionContext.
     * For the most part (for now) we accept the same options,
     * but some of them need to be transformed.
     *
     * Eventually the StartSpanOptions will be more aligned with OpenTelemetry.
     */
    function normalizeContext(context) {
        if (context.startTime) {
            var ctx = __assign({}, context);
            ctx.startTimestamp = spanTimeInputToSeconds(context.startTime);
            delete ctx.startTime;
            return ctx;
        }
        return context;
    }
    var SCOPE_ON_START_SPAN_FIELD = '_sentryScope';
    var ISOLATION_SCOPE_ON_START_SPAN_FIELD = '_sentryIsolationScope';
    function setCapturedScopesOnSpan(span, scope, isolationScope) {
        if (span) {
            addNonEnumerableProperty(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, isolationScope);
            addNonEnumerableProperty(span, SCOPE_ON_START_SPAN_FIELD, scope);
        }
    }

    /**
     * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
     * Merge with existing data if any.
     **/
    function enhanceEventWithSdkInfo(event, sdkInfo) {
        if (!sdkInfo) {
            return event;
        }
        event.sdk = event.sdk || {};
        event.sdk.name = event.sdk.name || sdkInfo.name;
        event.sdk.version = event.sdk.version || sdkInfo.version;
        event.sdk.integrations = __spreadArray(__spreadArray([], __read((event.sdk.integrations || [])), false), __read((sdkInfo.integrations || [])), false);
        event.sdk.packages = __spreadArray(__spreadArray([], __read((event.sdk.packages || [])), false), __read((sdkInfo.packages || [])), false);
        return event;
    }
    /** Creates an envelope from a Session */
    function createSessionEnvelope(session, dsn, metadata, tunnel) {
        var sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
        var envelopeHeaders = __assign(__assign({ sent_at: new Date().toISOString() }, (sdkInfo && { sdk: sdkInfo })), (!!tunnel && dsn && { dsn: dsnToString(dsn) }));
        var envelopeItem = 'aggregates' in session ? [{ type: 'sessions' }, session] : [{ type: 'session' }, session.toJSON()];
        return createEnvelope(envelopeHeaders, [envelopeItem]);
    }
    /**
     * Create an Envelope from an event.
     */
    function createEventEnvelope(event, dsn, metadata, tunnel) {
        var sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
        /*
          Note: Due to TS, event.type may be `replay_event`, theoretically.
          In practice, we never call `createEventEnvelope` with `replay_event` type,
          and we'd have to adjut a looot of types to make this work properly.
          We want to avoid casting this around, as that could lead to bugs (e.g. when we add another type)
          So the safe choice is to really guard against the replay_event type here.
        */
        var eventType = event.type && event.type !== 'replay_event' ? event.type : 'event';
        enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
        var envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
        // Prevent this data (which, if it exists, was used in earlier steps in the processing pipeline) from being sent to
        // sentry. (Note: Our use of this property comes and goes with whatever we might be debugging, whatever hacks we may
        // have temporarily added, etc. Even if we don't happen to be using it at some point in the future, let's not get rid
        // of this `delete`, lest we miss putting it back in the next time the property is in use.)
        delete event.sdkProcessingMetadata;
        var eventItem = [{ type: eventType }, event];
        return createEnvelope(envelopeHeaders, [eventItem]);
    }

    var SENTRY_API_VERSION = '7';
    /** Returns the prefix to construct Sentry ingestion API endpoints. */
    function getBaseApiEndpoint(dsn) {
        var protocol = dsn.protocol ? "".concat(dsn.protocol, ":") : '';
        var port = dsn.port ? ":".concat(dsn.port) : '';
        return "".concat(protocol, "//").concat(dsn.host).concat(port).concat(dsn.path ? "/".concat(dsn.path) : '', "/api/");
    }
    /** Returns the ingest API endpoint for target. */
    function _getIngestEndpoint(dsn) {
        return "".concat(getBaseApiEndpoint(dsn)).concat(dsn.projectId, "/envelope/");
    }
    /** Returns a URL-encoded string with auth config suitable for a query string. */
    function _encodedAuth(dsn, sdkInfo) {
        return urlEncode(__assign({
            // We send only the minimum set of required information. See
            // https://github.com/getsentry/sentry-javascript/issues/2572.
            sentry_key: dsn.publicKey, sentry_version: SENTRY_API_VERSION }, (sdkInfo && { sentry_client: "".concat(sdkInfo.name, "/").concat(sdkInfo.version) })));
    }
    /**
     * Returns the envelope endpoint URL with auth in the query string.
     *
     * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
     */
    function getEnvelopeEndpointWithUrlEncodedAuth(dsn,
    // TODO (v8): Remove `tunnelOrOptions` in favor of `options`, and use the substitute code below
    // options: ClientOptions = {} as ClientOptions,
    tunnelOrOptions) {
        // TODO (v8): Use this code instead
        // const { tunnel, _metadata = {} } = options;
        // return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, _metadata.sdk)}`;
        if (tunnelOrOptions === void 0) { tunnelOrOptions = {}; }
        var tunnel = typeof tunnelOrOptions === 'string' ? tunnelOrOptions : tunnelOrOptions.tunnel;
        var sdkInfo = typeof tunnelOrOptions === 'string' || !tunnelOrOptions._metadata ? undefined : tunnelOrOptions._metadata.sdk;
        return tunnel ? tunnel : "".concat(_getIngestEndpoint(dsn), "?").concat(_encodedAuth(dsn, sdkInfo));
    }
    /** Returns the url to the report dialog endpoint. */
    function getReportDialogEndpoint(dsnLike, dialogOptions) {
        var dsn = makeDsn(dsnLike);
        if (!dsn) {
            return '';
        }
        var endpoint = "".concat(getBaseApiEndpoint(dsn), "embed/error-page/");
        var encodedOptions = "dsn=".concat(dsnToString(dsn));
        for (var key in dialogOptions) {
            if (key === 'dsn') {
                continue;
            }
            if (key === 'onClose') {
                continue;
            }
            if (key === 'user') {
                var user = dialogOptions.user;
                if (!user) {
                    continue;
                }
                if (user.name) {
                    encodedOptions += "&name=".concat(encodeURIComponent(user.name));
                }
                if (user.email) {
                    encodedOptions += "&email=".concat(encodeURIComponent(user.email));
                }
            }
            else {
                encodedOptions += "&".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(dialogOptions[key]));
            }
        }
        return "".concat(endpoint, "?").concat(encodedOptions);
    }

    var installedIntegrations = [];
    /**
     * Remove duplicates from the given array, preferring the last instance of any duplicate. Not guaranteed to
     * preseve the order of integrations in the array.
     *
     * @private
     */
    function filterDuplicates(integrations) {
        var integrationsByName = {};
        integrations.forEach(function (currentInstance) {
            var name = currentInstance.name;
            var existingInstance = integrationsByName[name];
            // We want integrations later in the array to overwrite earlier ones of the same type, except that we never want a
            // default instance to overwrite an existing user instance
            if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
                return;
            }
            integrationsByName[name] = currentInstance;
        });
        return Object.keys(integrationsByName).map(function (k) { return integrationsByName[k]; });
    }
    /** Gets integrations to install */
    function getIntegrationsToSetup(options) {
        var defaultIntegrations = options.defaultIntegrations || [];
        var userIntegrations = options.integrations;
        // We flag default instances, so that later we can tell them apart from any user-created instances of the same class
        defaultIntegrations.forEach(function (integration) {
            integration.isDefaultInstance = true;
        });
        var integrations;
        if (Array.isArray(userIntegrations)) {
            integrations = __spreadArray(__spreadArray([], __read(defaultIntegrations), false), __read(userIntegrations), false);
        }
        else if (typeof userIntegrations === 'function') {
            integrations = arrayify(userIntegrations(defaultIntegrations));
        }
        else {
            integrations = defaultIntegrations;
        }
        var finalIntegrations = filterDuplicates(integrations);
        // The `Debug` integration prints copies of the `event` and `hint` which will be passed to `beforeSend` or
        // `beforeSendTransaction`. It therefore has to run after all other integrations, so that the changes of all event
        // processors will be reflected in the printed values. For lack of a more elegant way to guarantee that, we therefore
        // locate it and, assuming it exists, pop it out of its current spot and shove it onto the end of the array.
        var debugIndex = findIndex(finalIntegrations, function (integration) { return integration.name === 'Debug'; });
        if (debugIndex !== -1) {
            var _a = __read(finalIntegrations.splice(debugIndex, 1), 1), debugInstance = _a[0];
            finalIntegrations.push(debugInstance);
        }
        return finalIntegrations;
    }
    /**
     * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
     * integrations are added unless they were already provided before.
     * @param integrations array of integration instances
     * @param withDefault should enable default integrations
     */
    function setupIntegrations(client, integrations) {
        var integrationIndex = {};
        integrations.forEach(function (integration) {
            // guard against empty provided integrations
            if (integration) {
                setupIntegration(client, integration, integrationIndex);
            }
        });
        return integrationIndex;
    }
    /**
     * Execute the `afterAllSetup` hooks of the given integrations.
     */
    function afterSetupIntegrations(client, integrations) {
        var e_1, _a;
        try {
            for (var integrations_1 = __values(integrations), integrations_1_1 = integrations_1.next(); !integrations_1_1.done; integrations_1_1 = integrations_1.next()) {
                var integration = integrations_1_1.value;
                // guard against empty provided integrations
                if (integration && integration.afterAllSetup) {
                    integration.afterAllSetup(client);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (integrations_1_1 && !integrations_1_1.done && (_a = integrations_1.return)) _a.call(integrations_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    /** Setup a single integration.  */
    function setupIntegration(client, integration, integrationIndex) {
        if (integrationIndex[integration.name]) {
            logger.log("Integration skipped because it was already installed: ".concat(integration.name));
            return;
        }
        integrationIndex[integration.name] = integration;
        // `setupOnce` is only called the first time
        if (installedIntegrations.indexOf(integration.name) === -1) {
            // eslint-disable-next-line deprecation/deprecation
            integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
            installedIntegrations.push(integration.name);
        }
        // `setup` is run for each client
        if (integration.setup && typeof integration.setup === 'function') {
            integration.setup(client);
        }
        if (client.on && typeof integration.preprocessEvent === 'function') {
            var callback_1 = integration.preprocessEvent.bind(integration);
            client.on('preprocessEvent', function (event, hint) { return callback_1(event, hint, client); });
        }
        if (client.addEventProcessor && typeof integration.processEvent === 'function') {
            var callback_2 = integration.processEvent.bind(integration);
            var processor = Object.assign(function (event, hint) { return callback_2(event, hint, client); }, {
                id: integration.name,
            });
            client.addEventProcessor(processor);
        }
        logger.log("Integration installed: ".concat(integration.name));
    }
    /** Add an integration to the current hub's client. */
    function addIntegration(integration) {
        var client = getClient();
        if (!client || !client.addIntegration) {
            DEBUG_BUILD$1 && logger.warn("Cannot add integration \"".concat(integration.name, "\" because no SDK Client is available."));
            return;
        }
        client.addIntegration(integration);
    }
    // Polyfill for Array.findIndex(), which is not supported in ES5
    function findIndex(arr, callback) {
        for (var i = 0; i < arr.length; i++) {
            if (callback(arr[i]) === true) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Convert a new integration function to the legacy class syntax.
     * In v8, we can remove this and instead export the integration functions directly.
     *
     * @deprecated This will be removed in v8!
     */
    function convertIntegrationFnToClass(name, fn) {
        return Object.assign(function ConvertedIntegration() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return fn.apply(void 0, __spreadArray([], __read(args), false));
        }, { id: name });
    }
    /**
     * Define an integration function that can be used to create an integration instance.
     * Note that this by design hides the implementation details of the integration, as they are considered internal.
     */
    function defineIntegration(fn) {
        return fn;
    }

    /**
     * Generate bucket key from metric properties.
     */
    function getBucketKey(metricType, name, unit, tags) {
        var stringifiedTags = Object.entries(dropUndefinedKeys(tags)).sort(function (a, b) { return a[0].localeCompare(b[0]); });
        return "".concat(metricType).concat(name).concat(unit).concat(stringifiedTags);
    }
    /* eslint-disable no-bitwise */
    /**
     * Simple hash function for strings.
     */
    function simpleHash(s) {
        var rv = 0;
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            rv = (rv << 5) - rv + c;
            rv &= rv;
        }
        return rv >>> 0;
    }
    /* eslint-enable no-bitwise */
    /**
     * Serialize metrics buckets into a string based on statsd format.
     *
     * Example of format:
     * metric.name@second:1:1.2|d|#a:value,b:anothervalue|T12345677
     * Segments:
     * name: metric.name
     * unit: second
     * value: [1, 1.2]
     * type of metric: d (distribution)
     * tags: { a: value, b: anothervalue }
     * timestamp: 12345677
     */
    function serializeMetricBuckets(metricBucketItems) {
        var e_1, _a;
        var out = '';
        try {
            for (var metricBucketItems_1 = __values(metricBucketItems), metricBucketItems_1_1 = metricBucketItems_1.next(); !metricBucketItems_1_1.done; metricBucketItems_1_1 = metricBucketItems_1.next()) {
                var item = metricBucketItems_1_1.value;
                var tagEntries = Object.entries(item.tags);
                var maybeTags = tagEntries.length > 0 ? "|#".concat(tagEntries.map(function (_a) {
                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
                    return "".concat(key, ":").concat(value);
                }).join(',')) : '';
                out += "".concat(item.name, "@").concat(item.unit, ":").concat(item.metric, "|").concat(item.metricType).concat(maybeTags, "|T").concat(item.timestamp, "\n");
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (metricBucketItems_1_1 && !metricBucketItems_1_1.done && (_a = metricBucketItems_1.return)) _a.call(metricBucketItems_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return out;
    }
    /** Sanitizes units */
    function sanitizeUnit(unit) {
        return unit.replace(/[^\w]+/gi, '_');
    }
    /** Sanitizes metric keys */
    function sanitizeMetricKey(key) {
        return key.replace(/[^\w\-.]+/gi, '_');
    }
    function sanitizeTagKey(key) {
        return key.replace(/[^\w\-./]+/gi, '');
    }
    var tagValueReplacements = [
        ['\n', '\\n'],
        ['\r', '\\r'],
        ['\t', '\\t'],
        ['\\', '\\\\'],
        ['|', '\\u{7c}'],
        [',', '\\u{2c}'],
    ];
    function getCharOrReplacement(input) {
        var e_2, _a;
        try {
            for (var tagValueReplacements_1 = __values(tagValueReplacements), tagValueReplacements_1_1 = tagValueReplacements_1.next(); !tagValueReplacements_1_1.done; tagValueReplacements_1_1 = tagValueReplacements_1.next()) {
                var _b = __read(tagValueReplacements_1_1.value, 2), search = _b[0], replacement = _b[1];
                if (input === search) {
                    return replacement;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tagValueReplacements_1_1 && !tagValueReplacements_1_1.done && (_a = tagValueReplacements_1.return)) _a.call(tagValueReplacements_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return input;
    }
    function sanitizeTagValue(value) {
        return __spreadArray([], __read(value), false).reduce(function (acc, char) { return acc + getCharOrReplacement(char); }, '');
    }
    /**
     * Sanitizes tags.
     */
    function sanitizeTags(unsanitizedTags) {
        var tags = {};
        for (var key in unsanitizedTags) {
            if (Object.prototype.hasOwnProperty.call(unsanitizedTags, key)) {
                var sanitizedKey = sanitizeTagKey(key);
                tags[sanitizedKey] = sanitizeTagValue(String(unsanitizedTags[key]));
            }
        }
        return tags;
    }

    /**
     * Create envelope from a metric aggregate.
     */
    function createMetricEnvelope(metricBucketItems, dsn, metadata, tunnel) {
        var headers = {
            sent_at: new Date().toISOString(),
        };
        if (metadata && metadata.sdk) {
            headers.sdk = {
                name: metadata.sdk.name,
                version: metadata.sdk.version,
            };
        }
        if (!!tunnel && dsn) {
            headers.dsn = dsnToString(dsn);
        }
        var item = createMetricEnvelopeItem(metricBucketItems);
        return createEnvelope(headers, [item]);
    }
    function createMetricEnvelopeItem(metricBucketItems) {
        var payload = serializeMetricBuckets(metricBucketItems);
        var metricHeaders = {
            type: 'statsd',
            length: payload.length,
        };
        return [metricHeaders, payload];
    }

    var ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
    /**
     * Base implementation for all JavaScript SDK clients.
     *
     * Call the constructor with the corresponding options
     * specific to the client subclass. To access these options later, use
     * {@link Client.getOptions}.
     *
     * If a Dsn is specified in the options, it will be parsed and stored. Use
     * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
     * invalid, the constructor will throw a {@link SentryException}. Note that
     * without a valid Dsn, the SDK will not send any events to Sentry.
     *
     * Before sending an event, it is passed through
     * {@link BaseClient._prepareEvent} to add SDK information and scope data
     * (breadcrumbs and context). To add more custom information, override this
     * method and extend the resulting prepared event.
     *
     * To issue automatically created events (e.g. via instrumentation), use
     * {@link Client.captureEvent}. It will prepare the event and pass it through
     * the callback lifecycle. To issue auto-breadcrumbs, use
     * {@link Client.addBreadcrumb}.
     *
     * @example
     * class NodeClient extends BaseClient<NodeOptions> {
     *   public constructor(options: NodeOptions) {
     *     super(options);
     *   }
     *
     *   // ...
     * }
     */
    var BaseClient = /** @class */ (function () {
        /**
         * Initializes this client instance.
         *
         * @param options Options for the client.
         */
        function BaseClient(options) {
            this._options = options;
            this._integrations = {};
            this._integrationsInitialized = false;
            this._numProcessing = 0;
            this._outcomes = {};
            this._hooks = {};
            this._eventProcessors = [];
            if (options.dsn) {
                this._dsn = makeDsn(options.dsn);
            }
            else {
                logger.warn('No DSN provided, client will not send events.');
            }
            if (this._dsn) {
                var url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options);
                this._transport = options.transport(__assign(__assign({ tunnel: this._options.tunnel, recordDroppedEvent: this.recordDroppedEvent.bind(this) }, options.transportOptions), { url: url }));
            }
        }
        /**
         * @inheritDoc
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        BaseClient.prototype.captureException = function (exception, hint, scope) {
            var _this = this;
            // ensure we haven't captured this very object before
            if (checkOrSetAlreadyCaught(exception)) {
                logger.log(ALREADY_SEEN_ERROR);
                return;
            }
            var eventId = hint && hint.event_id;
            this._process(this.eventFromException(exception, hint)
                .then(function (event) { return _this._captureEvent(event, hint, scope); })
                .then(function (result) {
                eventId = result;
            }));
            return eventId;
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.captureMessage = function (message,
        // eslint-disable-next-line deprecation/deprecation
        level, hint, scope) {
            var _this = this;
            var eventId = hint && hint.event_id;
            var eventMessage = isParameterizedString(message) ? message : String(message);
            var promisedEvent = isPrimitive(message)
                ? this.eventFromMessage(eventMessage, level, hint)
                : this.eventFromException(message, hint);
            this._process(promisedEvent
                .then(function (event) { return _this._captureEvent(event, hint, scope); })
                .then(function (result) {
                eventId = result;
            }));
            return eventId;
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.captureEvent = function (event, hint, scope) {
            // ensure we haven't captured this very object before
            if (hint && hint.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
                logger.log(ALREADY_SEEN_ERROR);
                return;
            }
            var eventId = hint && hint.event_id;
            var sdkProcessingMetadata = event.sdkProcessingMetadata || {};
            var capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
            this._process(this._captureEvent(event, hint, capturedSpanScope || scope).then(function (result) {
                eventId = result;
            }));
            return eventId;
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.captureSession = function (session) {
            if (!(typeof session.release === 'string')) {
                logger.warn('Discarded session because of missing or non-string release');
            }
            else {
                this.sendSession(session);
                // After sending, we set init false to indicate it's not the first occurrence
                updateSession(session, { init: false });
            }
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.getDsn = function () {
            return this._dsn;
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.getOptions = function () {
            return this._options;
        };
        /**
         * @see SdkMetadata in @sentry/types
         *
         * @return The metadata of the SDK
         */
        BaseClient.prototype.getSdkMetadata = function () {
            return this._options._metadata;
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.getTransport = function () {
            return this._transport;
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.flush = function (timeout) {
            var transport = this._transport;
            if (transport) {
                if (this.metricsAggregator) {
                    this.metricsAggregator.flush();
                }
                return this._isClientDoneProcessing(timeout).then(function (clientFinished) {
                    return transport.flush(timeout).then(function (transportFlushed) { return clientFinished && transportFlushed; });
                });
            }
            else {
                return resolvedSyncPromise(true);
            }
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.close = function (timeout) {
            var _this = this;
            return this.flush(timeout).then(function (result) {
                _this.getOptions().enabled = false;
                if (_this.metricsAggregator) {
                    _this.metricsAggregator.close();
                }
                return result;
            });
        };
        /** Get all installed event processors. */
        BaseClient.prototype.getEventProcessors = function () {
            return this._eventProcessors;
        };
        /** @inheritDoc */
        BaseClient.prototype.addEventProcessor = function (eventProcessor) {
            this._eventProcessors.push(eventProcessor);
        };
        /**
         * This is an internal function to setup all integrations that should run on the client.
         * @deprecated Use `client.init()` instead.
         */
        BaseClient.prototype.setupIntegrations = function (forceInitialize) {
            if ((forceInitialize && !this._integrationsInitialized) || (this._isEnabled() && !this._integrationsInitialized)) {
                this._setupIntegrations();
            }
        };
        /** @inheritdoc */
        BaseClient.prototype.init = function () {
            if (this._isEnabled()) {
                this._setupIntegrations();
            }
        };
        /**
         * Gets an installed integration by its `id`.
         *
         * @returns The installed integration or `undefined` if no integration with that `id` was installed.
         * @deprecated Use `getIntegrationByName()` instead.
         */
        BaseClient.prototype.getIntegrationById = function (integrationId) {
            return this.getIntegrationByName(integrationId);
        };
        /**
         * Gets an installed integration by its name.
         *
         * @returns The installed integration or `undefined` if no integration with that `name` was installed.
         */
        BaseClient.prototype.getIntegrationByName = function (integrationName) {
            return this._integrations[integrationName];
        };
        /**
         * Returns the client's instance of the given integration class, it any.
         * @deprecated Use `getIntegrationByName()` instead.
         */
        BaseClient.prototype.getIntegration = function (integration) {
            try {
                return this._integrations[integration.id] || null;
            }
            catch (_oO) {
                logger.warn("Cannot retrieve integration ".concat(integration.id, " from the current Client"));
                return null;
            }
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.addIntegration = function (integration) {
            var isAlreadyInstalled = this._integrations[integration.name];
            // This hook takes care of only installing if not already installed
            setupIntegration(this, integration, this._integrations);
            // Here we need to check manually to make sure to not run this multiple times
            if (!isAlreadyInstalled) {
                afterSetupIntegrations(this, [integration]);
            }
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.sendEvent = function (event, hint) {
            var e_1, _a;
            var _this = this;
            if (hint === void 0) { hint = {}; }
            this.emit('beforeSendEvent', event, hint);
            var env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
            try {
                for (var _b = __values(hint.attachments || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var attachment = _c.value;
                    env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment, this._options.transportOptions && this._options.transportOptions.textEncoder));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var promise = this._sendEnvelope(env);
            if (promise) {
                promise.then(function (sendResponse) { return _this.emit('afterSendEvent', event, sendResponse); }, null);
            }
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.sendSession = function (session) {
            var env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
            // _sendEnvelope should not throw
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._sendEnvelope(env);
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.recordDroppedEvent = function (reason, category, eventOrCount) {
            if (this._options.sendClientReports) {
                // TODO v9: We do not need the `event` passed as third argument anymore, and can possibly remove this overload
                // If event is passed as third argument, we assume this is a count of 1
                var count = typeof eventOrCount === 'number' ? eventOrCount : 1;
                // We want to track each category (error, transaction, session, replay_event) separately
                // but still keep the distinction between different type of outcomes.
                // We could use nested maps, but it's much easier to read and type this way.
                // A correct type for map-based implementation if we want to go that route
                // would be `Partial<Record<SentryRequestType, Partial<Record<Outcome, number>>>>`
                // With typescript 4.1 we could even use template literal types
                var key = "".concat(reason, ":").concat(category);
                logger.log("Recording outcome: \"".concat(key, "\"").concat(count > 1 ? " (".concat(count, " times)") : ''));
                this._outcomes[key] = (this._outcomes[key] || 0) + count;
            }
        };
        /**
         * @inheritDoc
         */
        BaseClient.prototype.captureAggregateMetrics = function (metricBucketItems) {
            logger.log("Flushing aggregated metrics, number of metrics: ".concat(metricBucketItems.length));
            var metricsEnvelope = createMetricEnvelope(metricBucketItems, this._dsn, this._options._metadata, this._options.tunnel);
            // _sendEnvelope should not throw
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._sendEnvelope(metricsEnvelope);
        };
        /** @inheritdoc */
        BaseClient.prototype.on = function (hook, callback) {
            if (!this._hooks[hook]) {
                this._hooks[hook] = [];
            }
            // @ts-expect-error We assue the types are correct
            this._hooks[hook].push(callback);
        };
        /** @inheritdoc */
        BaseClient.prototype.emit = function (hook) {
            var rest = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                rest[_i - 1] = arguments[_i];
            }
            if (this._hooks[hook]) {
                this._hooks[hook].forEach(function (callback) { return callback.apply(void 0, __spreadArray([], __read(rest), false)); });
            }
        };
        /* eslint-enable @typescript-eslint/unified-signatures */
        /** Setup integrations for this client. */
        BaseClient.prototype._setupIntegrations = function () {
            var integrations = this._options.integrations;
            this._integrations = setupIntegrations(this, integrations);
            afterSetupIntegrations(this, integrations);
            // TODO v8: We don't need this flag anymore
            this._integrationsInitialized = true;
        };
        /** Updates existing session based on the provided event */
        BaseClient.prototype._updateSessionFromEvent = function (session, event) {
            var e_2, _a;
            var crashed = false;
            var errored = false;
            var exceptions = event.exception && event.exception.values;
            if (exceptions) {
                errored = true;
                try {
                    for (var exceptions_1 = __values(exceptions), exceptions_1_1 = exceptions_1.next(); !exceptions_1_1.done; exceptions_1_1 = exceptions_1.next()) {
                        var ex = exceptions_1_1.value;
                        var mechanism = ex.mechanism;
                        if (mechanism && mechanism.handled === false) {
                            crashed = true;
                            break;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (exceptions_1_1 && !exceptions_1_1.done && (_a = exceptions_1.return)) _a.call(exceptions_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            // A session is updated and that session update is sent in only one of the two following scenarios:
            // 1. Session with non terminal status and 0 errors + an error occurred -> Will set error count to 1 and send update
            // 2. Session with non terminal status and 1 error + a crash occurred -> Will set status crashed and send update
            var sessionNonTerminal = session.status === 'ok';
            var shouldUpdateAndSend = (sessionNonTerminal && session.errors === 0) || (sessionNonTerminal && crashed);
            if (shouldUpdateAndSend) {
                updateSession(session, __assign(__assign({}, (crashed && { status: 'crashed' })), { errors: session.errors || Number(errored || crashed) }));
                this.captureSession(session);
            }
        };
        /**
         * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
         * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
         *
         * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
         * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
         * `true`.
         * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
         * `false` otherwise
         */
        BaseClient.prototype._isClientDoneProcessing = function (timeout) {
            var _this = this;
            return new SyncPromise(function (resolve) {
                var ticked = 0;
                var tick = 1;
                var interval = setInterval(function () {
                    if (_this._numProcessing == 0) {
                        clearInterval(interval);
                        resolve(true);
                    }
                    else {
                        ticked += tick;
                        if (timeout && ticked >= timeout) {
                            clearInterval(interval);
                            resolve(false);
                        }
                    }
                }, tick);
            });
        };
        /** Determines whether this SDK is enabled and a transport is present. */
        BaseClient.prototype._isEnabled = function () {
            return this.getOptions().enabled !== false && this._transport !== undefined;
        };
        /**
         * Adds common information to events.
         *
         * The information includes release and environment from `options`,
         * breadcrumbs and context (extra, tags and user) from the scope.
         *
         * Information that is already present in the event is never overwritten. For
         * nested objects, such as the context, keys are merged.
         *
         * @param event The original event.
         * @param hint May contain additional information about the original exception.
         * @param scope A scope containing event metadata.
         * @returns A new event with more information.
         */
        BaseClient.prototype._prepareEvent = function (event, hint, scope, isolationScope) {
            var _this = this;
            if (isolationScope === void 0) { isolationScope = getIsolationScope(); }
            var options = this.getOptions();
            var integrations = Object.keys(this._integrations);
            if (!hint.integrations && integrations.length > 0) {
                hint.integrations = integrations;
            }
            this.emit('preprocessEvent', event, hint);
            return prepareEvent(options, event, hint, scope, this, isolationScope).then(function (evt) {
                if (evt === null) {
                    return evt;
                }
                var propagationContext = __assign(__assign({}, isolationScope.getPropagationContext()), (scope ? scope.getPropagationContext() : undefined));
                var trace = evt.contexts && evt.contexts.trace;
                if (!trace && propagationContext) {
                    var trace_id = propagationContext.traceId, spanId = propagationContext.spanId, parentSpanId = propagationContext.parentSpanId, dsc = propagationContext.dsc;
                    evt.contexts = __assign({ trace: {
                            trace_id: trace_id,
                            span_id: spanId,
                            parent_span_id: parentSpanId,
                        } }, evt.contexts);
                    var dynamicSamplingContext = dsc ? dsc : getDynamicSamplingContextFromClient(trace_id, _this, scope);
                    evt.sdkProcessingMetadata = __assign({ dynamicSamplingContext: dynamicSamplingContext }, evt.sdkProcessingMetadata);
                }
                return evt;
            });
        };
        /**
         * Processes the event and logs an error in case of rejection
         * @param event
         * @param hint
         * @param scope
         */
        BaseClient.prototype._captureEvent = function (event, hint, scope) {
            if (hint === void 0) { hint = {}; }
            return this._processEvent(event, hint, scope).then(function (finalEvent) {
                return finalEvent.event_id;
            }, function (reason) {
                {
                    // If something's gone wrong, log the error as a warning. If it's just us having used a `SentryError` for
                    // control flow, log just the message (no stack) as a log-level log.
                    var sentryError = reason;
                    if (sentryError.logLevel === 'log') {
                        logger.log(sentryError.message);
                    }
                    else {
                        logger.warn(sentryError);
                    }
                }
                return undefined;
            });
        };
        /**
         * Processes an event (either error or message) and sends it to Sentry.
         *
         * This also adds breadcrumbs and context information to the event. However,
         * platform specific meta data (such as the User's IP address) must be added
         * by the SDK implementor.
         *
         *
         * @param event The event to send to Sentry.
         * @param hint May contain additional information about the original exception.
         * @param scope A scope containing event metadata.
         * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
         */
        BaseClient.prototype._processEvent = function (event, hint, scope) {
            var _this = this;
            var options = this.getOptions();
            var sampleRate = options.sampleRate;
            var isTransaction = isTransactionEvent(event);
            var isError = isErrorEvent(event);
            var eventType = event.type || 'error';
            var beforeSendLabel = "before send for type `".concat(eventType, "`");
            // 1.0 === 100% events are sent
            // 0.0 === 0% events are sent
            // Sampling for transaction happens somewhere else
            if (isError && typeof sampleRate === 'number' && Math.random() > sampleRate) {
                this.recordDroppedEvent('sample_rate', 'error', event);
                return rejectedSyncPromise(new SentryError("Discarding event because it's not included in the random sample (sampling rate = ".concat(sampleRate, ")"), 'log'));
            }
            var dataCategory = eventType === 'replay_event' ? 'replay' : eventType;
            var sdkProcessingMetadata = event.sdkProcessingMetadata || {};
            var capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
            return this._prepareEvent(event, hint, scope, capturedSpanIsolationScope)
                .then(function (prepared) {
                if (prepared === null) {
                    _this.recordDroppedEvent('event_processor', dataCategory, event);
                    throw new SentryError('An event processor returned `null`, will not send event.', 'log');
                }
                var isInternalException = hint.data && hint.data.__sentry__ === true;
                if (isInternalException) {
                    return prepared;
                }
                var result = processBeforeSend(options, prepared, hint);
                return _validateBeforeSendResult(result, beforeSendLabel);
            })
                .then(function (processedEvent) {
                if (processedEvent === null) {
                    _this.recordDroppedEvent('before_send', dataCategory, event);
                    if (isTransaction) {
                        var spans = event.spans || [];
                        // the transaction itself counts as one span, plus all the child spans that are added
                        var spanCount = 1 + spans.length;
                        _this.recordDroppedEvent('before_send', 'span', spanCount);
                    }
                    throw new SentryError("".concat(beforeSendLabel, " returned `null`, will not send event."), 'log');
                }
                var session = scope && scope.getSession();
                if (!isTransaction && session) {
                    _this._updateSessionFromEvent(session, processedEvent);
                }
                if (isTransaction) {
                    var spanCountBefore = (processedEvent.sdkProcessingMetadata && processedEvent.sdkProcessingMetadata.spanCountBeforeProcessing) ||
                        0;
                    var spanCountAfter = processedEvent.spans ? processedEvent.spans.length : 0;
                    var droppedSpanCount = spanCountBefore - spanCountAfter;
                    if (droppedSpanCount > 0) {
                        _this.recordDroppedEvent('before_send', 'span', droppedSpanCount);
                    }
                }
                // None of the Sentry built event processor will update transaction name,
                // so if the transaction name has been changed by an event processor, we know
                // it has to come from custom event processor added by a user
                var transactionInfo = processedEvent.transaction_info;
                if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
                    var source = 'custom';
                    processedEvent.transaction_info = __assign(__assign({}, transactionInfo), { source: source });
                }
                _this.sendEvent(processedEvent, hint);
                return processedEvent;
            })
                .then(null, function (reason) {
                if (reason instanceof SentryError) {
                    throw reason;
                }
                _this.captureException(reason, {
                    data: {
                        __sentry__: true,
                    },
                    originalException: reason,
                });
                throw new SentryError("Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ".concat(reason));
            });
        };
        /**
         * Occupies the client with processing and event
         */
        BaseClient.prototype._process = function (promise) {
            var _this = this;
            this._numProcessing++;
            void promise.then(function (value) {
                _this._numProcessing--;
                return value;
            }, function (reason) {
                _this._numProcessing--;
                return reason;
            });
        };
        /**
         * @inheritdoc
         */
        BaseClient.prototype._sendEnvelope = function (envelope) {
            this.emit('beforeEnvelope', envelope);
            if (this._isEnabled() && this._transport) {
                return this._transport.send(envelope).then(null, function (reason) {
                    logger.error('Error while sending event:', reason);
                });
            }
            else {
                logger.error('Transport disabled');
            }
        };
        /**
         * Clears outcomes on this client and returns them.
         */
        BaseClient.prototype._clearOutcomes = function () {
            var outcomes = this._outcomes;
            this._outcomes = {};
            return Object.keys(outcomes).map(function (key) {
                var _a = __read(key.split(':'), 2), reason = _a[0], category = _a[1];
                return {
                    reason: reason,
                    category: category,
                    quantity: outcomes[key],
                };
            });
        };
        return BaseClient;
    }());
    /**
     * Verifies that return value of configured `beforeSend` or `beforeSendTransaction` is of expected type, and returns the value if so.
     */
    function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
        var invalidValueError = "".concat(beforeSendLabel, " must return `null` or a valid event.");
        if (isThenable(beforeSendResult)) {
            return beforeSendResult.then(function (event) {
                if (!isPlainObject(event) && event !== null) {
                    throw new SentryError(invalidValueError);
                }
                return event;
            }, function (e) {
                throw new SentryError("".concat(beforeSendLabel, " rejected with ").concat(e));
            });
        }
        else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) {
            throw new SentryError(invalidValueError);
        }
        return beforeSendResult;
    }
    /**
     * Process the matching `beforeSendXXX` callback.
     */
    function processBeforeSend(options, event, hint) {
        var beforeSend = options.beforeSend, beforeSendTransaction = options.beforeSendTransaction;
        if (isErrorEvent(event) && beforeSend) {
            return beforeSend(event, hint);
        }
        if (isTransactionEvent(event) && beforeSendTransaction) {
            if (event.spans) {
                // We store the # of spans before processing in SDK metadata,
                // so we can compare it afterwards to determine how many spans were dropped
                var spanCountBefore = event.spans.length;
                event.sdkProcessingMetadata = __assign(__assign({}, event.sdkProcessingMetadata), { spanCountBeforeProcessing: spanCountBefore });
            }
            return beforeSendTransaction(event, hint);
        }
        return event;
    }
    function isErrorEvent(event) {
        return event.type === undefined;
    }
    function isTransactionEvent(event) {
        return event.type === 'transaction';
    }
    /**
     * Add an event processor to the current client.
     * This event processor will run for all events processed by this client.
     */
    function addEventProcessor(callback) {
        var client = getClient();
        if (!client || !client.addEventProcessor) {
            return;
        }
        client.addEventProcessor(callback);
    }

    var COUNTER_METRIC_TYPE = 'c';
    var GAUGE_METRIC_TYPE = 'g';
    var SET_METRIC_TYPE = 's';
    var DISTRIBUTION_METRIC_TYPE = 'd';
    /**
     * This does not match spec in https://develop.sentry.dev/sdk/metrics
     * but was chosen to optimize for the most common case in browser environments.
     */
    var DEFAULT_BROWSER_FLUSH_INTERVAL = 5000;

    var _a;
    /**
     * A metric instance representing a counter.
     */
    var CounterMetric = /** @class */ (function () {
        function CounterMetric(_value) {
            this._value = _value;
        }
        Object.defineProperty(CounterMetric.prototype, "weight", {
            /** @inheritDoc */
            get: function () {
                return 1;
            },
            enumerable: false,
            configurable: true
        });
        /** @inheritdoc */
        CounterMetric.prototype.add = function (value) {
            this._value += value;
        };
        /** @inheritdoc */
        CounterMetric.prototype.toString = function () {
            return "".concat(this._value);
        };
        return CounterMetric;
    }());
    /**
     * A metric instance representing a gauge.
     */
    var GaugeMetric = /** @class */ (function () {
        function GaugeMetric(value) {
            this._last = value;
            this._min = value;
            this._max = value;
            this._sum = value;
            this._count = 1;
        }
        Object.defineProperty(GaugeMetric.prototype, "weight", {
            /** @inheritDoc */
            get: function () {
                return 5;
            },
            enumerable: false,
            configurable: true
        });
        /** @inheritdoc */
        GaugeMetric.prototype.add = function (value) {
            this._last = value;
            if (value < this._min) {
                this._min = value;
            }
            if (value > this._max) {
                this._max = value;
            }
            this._sum += value;
            this._count++;
        };
        /** @inheritdoc */
        GaugeMetric.prototype.toString = function () {
            return "".concat(this._last, ":").concat(this._min, ":").concat(this._max, ":").concat(this._sum, ":").concat(this._count);
        };
        return GaugeMetric;
    }());
    /**
     * A metric instance representing a distribution.
     */
    var DistributionMetric = /** @class */ (function () {
        function DistributionMetric(first) {
            this._value = [first];
        }
        Object.defineProperty(DistributionMetric.prototype, "weight", {
            /** @inheritDoc */
            get: function () {
                return this._value.length;
            },
            enumerable: false,
            configurable: true
        });
        /** @inheritdoc */
        DistributionMetric.prototype.add = function (value) {
            this._value.push(value);
        };
        /** @inheritdoc */
        DistributionMetric.prototype.toString = function () {
            return this._value.join(':');
        };
        return DistributionMetric;
    }());
    /**
     * A metric instance representing a set.
     */
    var SetMetric = /** @class */ (function () {
        function SetMetric(first) {
            this.first = first;
            this._value = new Set([first]);
        }
        Object.defineProperty(SetMetric.prototype, "weight", {
            /** @inheritDoc */
            get: function () {
                return this._value.size;
            },
            enumerable: false,
            configurable: true
        });
        /** @inheritdoc */
        SetMetric.prototype.add = function (value) {
            this._value.add(value);
        };
        /** @inheritdoc */
        SetMetric.prototype.toString = function () {
            return Array.from(this._value)
                .map(function (val) { return (typeof val === 'string' ? simpleHash(val) : val); })
                .join(':');
        };
        return SetMetric;
    }());
    var METRIC_MAP = (_a = {},
        _a[COUNTER_METRIC_TYPE] = CounterMetric,
        _a[GAUGE_METRIC_TYPE] = GaugeMetric,
        _a[DISTRIBUTION_METRIC_TYPE] = DistributionMetric,
        _a[SET_METRIC_TYPE] = SetMetric,
        _a);

    /**
     * Internal function to create a new SDK client instance. The client is
     * installed and then bound to the current scope.
     *
     * @param clientClass The client class to instantiate.
     * @param options Options to pass to the client.
     */
    function initAndBind(clientClass, options) {
        if (options.debug === true) {
            if (DEBUG_BUILD$1) {
                logger.enable();
            }
            else {
                // use `console.warn` rather than `logger.warn` since by non-debug bundles have all `logger.x` statements stripped
                consoleSandbox(function () {
                    // eslint-disable-next-line no-console
                    console.warn('[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.');
                });
            }
        }
        var scope = getCurrentScope();
        scope.update(options.initialScope);
        var client = new clientClass(options);
        setCurrentClient(client);
        initializeClient(client);
    }
    /**
     * Make the given client the current client.
     */
    function setCurrentClient(client) {
        // eslint-disable-next-line deprecation/deprecation
        var hub = getCurrentHub();
        // eslint-disable-next-line deprecation/deprecation
        var top = hub.getStackTop();
        top.client = client;
        top.scope.setClient(client);
    }
    /**
     * Initialize the client for the current scope.
     * Make sure to call this after `setCurrentClient()`.
     */
    function initializeClient(client) {
        if (client.init) {
            client.init();
            // TODO v8: Remove this fallback
            // eslint-disable-next-line deprecation/deprecation
        }
        else if (client.setupIntegrations) {
            // eslint-disable-next-line deprecation/deprecation
            client.setupIntegrations();
        }
    }

    var DEFAULT_TRANSPORT_BUFFER_SIZE = 30;
    /**
     * Creates an instance of a Sentry `Transport`
     *
     * @param options
     * @param makeRequest
     */
    function createTransport(options, makeRequest, buffer) {
        if (buffer === void 0) { buffer = makePromiseBuffer(options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE); }
        var rateLimits = {};
        var flush = function (timeout) { return buffer.drain(timeout); };
        function send(envelope) {
            var filteredEnvelopeItems = [];
            // Drop rate limited items from envelope
            forEachEnvelopeItem(envelope, function (item, type) {
                var dataCategory = envelopeItemTypeToDataCategory(type);
                if (isRateLimited(rateLimits, dataCategory)) {
                    var event_1 = getEventForEnvelopeItem(item, type);
                    options.recordDroppedEvent('ratelimit_backoff', dataCategory, event_1);
                }
                else {
                    filteredEnvelopeItems.push(item);
                }
            });
            // Skip sending if envelope is empty after filtering out rate limited events
            if (filteredEnvelopeItems.length === 0) {
                return resolvedSyncPromise();
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems);
            // Creates client report for each item in an envelope
            var recordEnvelopeLoss = function (reason) {
                forEachEnvelopeItem(filteredEnvelope, function (item, type) {
                    var event = getEventForEnvelopeItem(item, type);
                    options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type), event);
                });
            };
            var requestTask = function () {
                return makeRequest({ body: serializeEnvelope(filteredEnvelope, options.textEncoder) }).then(function (response) {
                    // We don't want to throw on NOK responses, but we want to at least log them
                    if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode >= 300)) {
                        logger.warn("Sentry responded with status code ".concat(response.statusCode, " to sent event."));
                    }
                    rateLimits = updateRateLimits(rateLimits, response);
                    return response;
                }, function (error) {
                    recordEnvelopeLoss('network_error');
                    throw error;
                });
            };
            return buffer.add(requestTask).then(function (result) { return result; }, function (error) {
                if (error instanceof SentryError) {
                    logger.error('Skipped sending event because buffer is full.');
                    recordEnvelopeLoss('queue_overflow');
                    return resolvedSyncPromise();
                }
                else {
                    throw error;
                }
            });
        }
        // We use this to identifify if the transport is the base transport
        // TODO (v8): Remove this again as we'll no longer need it
        send.__sentry__baseTransport__ = true;
        return {
            send: send,
            flush: flush,
        };
    }
    function getEventForEnvelopeItem(item, type) {
        if (type !== 'event' && type !== 'transaction') {
            return undefined;
        }
        return Array.isArray(item) ? item[1] : undefined;
    }

    /**
     * Tagged template function which returns paramaterized representation of the message
     * For example: parameterize`This is a log statement with ${x} and ${y} params`, would return:
     * "__sentry_template_string__": 'This is a log statement with %s and %s params',
     * "__sentry_template_values__": ['first', 'second']
     * @param strings An array of string values splitted between expressions
     * @param values Expressions extracted from template string
     * @returns String with template information in __sentry_template_string__ and __sentry_template_values__ properties
     */
    function parameterize(strings) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        var formatted = new String(String.raw.apply(String, __spreadArray([strings], __read(values), false)));
        formatted.__sentry_template_string__ = strings.join('\x00').replace(/%/g, '%%').replace(/\0/g, '%s');
        formatted.__sentry_template_values__ = values;
        return formatted;
    }

    /**
     * A builder for the SDK metadata in the options for the SDK initialization.
     *
     * Note: This function is identical to `buildMetadata` in Remix and NextJS and SvelteKit.
     * We don't extract it for bundle size reasons.
     * @see https://github.com/getsentry/sentry-javascript/pull/7404
     * @see https://github.com/getsentry/sentry-javascript/pull/4196
     *
     * If you make changes to this function consider updating the others as well.
     *
     * @param options SDK options object that gets mutated
     * @param names list of package names
     */
    function applySdkMetadata(options, name, names, source) {
        if (names === void 0) { names = [name]; }
        if (source === void 0) { source = 'npm'; }
        var metadata = options._metadata || {};
        if (!metadata.sdk) {
            metadata.sdk = {
                name: "sentry.javascript.".concat(name),
                packages: names.map(function (name) { return ({
                    name: "".concat(source, ":@sentry/").concat(name),
                    version: SDK_VERSION,
                }); }),
                version: SDK_VERSION,
            };
        }
        options._metadata = metadata;
    }

    // "Script error." is hard coded into browsers for errors that it can't read.
    // this is the result of a script being pulled in from an external domain and CORS.
    var DEFAULT_IGNORE_ERRORS = [
        /^Script error\.?$/,
        /^Javascript error: Script error\.? on line 0$/,
        /^ResizeObserver loop completed with undelivered notifications.$/,
        /^Cannot redefine property: googletag$/,
    ];
    var DEFAULT_IGNORE_TRANSACTIONS = [
        /^.*\/healthcheck$/,
        /^.*\/healthy$/,
        /^.*\/live$/,
        /^.*\/ready$/,
        /^.*\/heartbeat$/,
        /^.*\/health$/,
        /^.*\/healthz$/,
    ];
    var INTEGRATION_NAME$9 = 'InboundFilters';
    var _inboundFiltersIntegration = (function (options) {
        if (options === void 0) { options = {}; }
        return {
            name: INTEGRATION_NAME$9,
            // TODO v8: Remove this
            setupOnce: function () { },
            processEvent: function (event, _hint, client) {
                var clientOptions = client.getOptions();
                var mergedOptions = _mergeOptions(options, clientOptions);
                return _shouldDropEvent$1(event, mergedOptions) ? null : event;
            },
        };
    });
    var inboundFiltersIntegration = defineIntegration(_inboundFiltersIntegration);
    /**
     * Inbound filters configurable by the user.
     * @deprecated Use `inboundFiltersIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var InboundFilters = convertIntegrationFnToClass(INTEGRATION_NAME$9, inboundFiltersIntegration);
    function _mergeOptions(internalOptions, clientOptions) {
        if (internalOptions === void 0) { internalOptions = {}; }
        if (clientOptions === void 0) { clientOptions = {}; }
        return {
            allowUrls: __spreadArray(__spreadArray([], __read((internalOptions.allowUrls || [])), false), __read((clientOptions.allowUrls || [])), false),
            denyUrls: __spreadArray(__spreadArray([], __read((internalOptions.denyUrls || [])), false), __read((clientOptions.denyUrls || [])), false),
            ignoreErrors: __spreadArray(__spreadArray(__spreadArray([], __read((internalOptions.ignoreErrors || [])), false), __read((clientOptions.ignoreErrors || [])), false), __read((internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS)), false),
            ignoreTransactions: __spreadArray(__spreadArray(__spreadArray([], __read((internalOptions.ignoreTransactions || [])), false), __read((clientOptions.ignoreTransactions || [])), false), __read((internalOptions.disableTransactionDefaults ? [] : DEFAULT_IGNORE_TRANSACTIONS)), false),
            ignoreInternal: internalOptions.ignoreInternal !== undefined ? internalOptions.ignoreInternal : true,
        };
    }
    function _shouldDropEvent$1(event, options) {
        if (options.ignoreInternal && _isSentryError(event)) {
            logger.warn("Event dropped due to being internal Sentry Error.\nEvent: ".concat(getEventDescription(event)));
            return true;
        }
        if (_isIgnoredError(event, options.ignoreErrors)) {
            logger.warn("Event dropped due to being matched by `ignoreErrors` option.\nEvent: ".concat(getEventDescription(event)));
            return true;
        }
        if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
            logger.warn("Event dropped due to being matched by `ignoreTransactions` option.\nEvent: ".concat(getEventDescription(event)));
            return true;
        }
        if (_isDeniedUrl(event, options.denyUrls)) {
            logger.warn("Event dropped due to being matched by `denyUrls` option.\nEvent: ".concat(getEventDescription(event), ".\nUrl: ").concat(_getEventFilterUrl(event)));
            return true;
        }
        if (!_isAllowedUrl(event, options.allowUrls)) {
            logger.warn("Event dropped due to not being matched by `allowUrls` option.\nEvent: ".concat(getEventDescription(event), ".\nUrl: ").concat(_getEventFilterUrl(event)));
            return true;
        }
        return false;
    }
    function _isIgnoredError(event, ignoreErrors) {
        // If event.type, this is not an error
        if (event.type || !ignoreErrors || !ignoreErrors.length) {
            return false;
        }
        return _getPossibleEventMessages(event).some(function (message) { return stringMatchesSomePattern(message, ignoreErrors); });
    }
    function _isIgnoredTransaction(event, ignoreTransactions) {
        if (event.type !== 'transaction' || !ignoreTransactions || !ignoreTransactions.length) {
            return false;
        }
        var name = event.transaction;
        return name ? stringMatchesSomePattern(name, ignoreTransactions) : false;
    }
    function _isDeniedUrl(event, denyUrls) {
        // TODO: Use Glob instead?
        if (!denyUrls || !denyUrls.length) {
            return false;
        }
        var url = _getEventFilterUrl(event);
        return !url ? false : stringMatchesSomePattern(url, denyUrls);
    }
    function _isAllowedUrl(event, allowUrls) {
        // TODO: Use Glob instead?
        if (!allowUrls || !allowUrls.length) {
            return true;
        }
        var url = _getEventFilterUrl(event);
        return !url ? true : stringMatchesSomePattern(url, allowUrls);
    }
    function _getPossibleEventMessages(event) {
        var possibleMessages = [];
        if (event.message) {
            possibleMessages.push(event.message);
        }
        var lastException;
        try {
            // @ts-expect-error Try catching to save bundle size
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            lastException = event.exception.values[event.exception.values.length - 1];
        }
        catch (e) {
            // try catching to save bundle size checking existence of variables
        }
        if (lastException) {
            if (lastException.value) {
                possibleMessages.push(lastException.value);
                if (lastException.type) {
                    possibleMessages.push("".concat(lastException.type, ": ").concat(lastException.value));
                }
            }
        }
        if (possibleMessages.length === 0) {
            logger.error("Could not extract message for event ".concat(getEventDescription(event)));
        }
        return possibleMessages;
    }
    function _isSentryError(event) {
        try {
            // @ts-expect-error can't be a sentry error if undefined
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return event.exception.values[0].type === 'SentryError';
        }
        catch (e) {
            // ignore
        }
        return false;
    }
    function _getLastValidUrl(frames) {
        if (frames === void 0) { frames = []; }
        for (var i = frames.length - 1; i >= 0; i--) {
            var frame = frames[i];
            if (frame && frame.filename !== '<anonymous>' && frame.filename !== '[native code]') {
                return frame.filename || null;
            }
        }
        return null;
    }
    function _getEventFilterUrl(event) {
        try {
            var frames_1;
            try {
                // @ts-expect-error we only care about frames if the whole thing here is defined
                frames_1 = event.exception.values[0].stacktrace.frames;
            }
            catch (e) {
                // ignore
            }
            return frames_1 ? _getLastValidUrl(frames_1) : null;
        }
        catch (oO) {
            logger.error("Cannot extract url for event ".concat(getEventDescription(event)));
            return null;
        }
    }

    var originalFunctionToString;
    var INTEGRATION_NAME$8 = 'FunctionToString';
    var SETUP_CLIENTS = new WeakMap();
    var _functionToStringIntegration = (function () {
        return {
            name: INTEGRATION_NAME$8,
            setupOnce: function () {
                // eslint-disable-next-line @typescript-eslint/unbound-method
                originalFunctionToString = Function.prototype.toString;
                // intrinsics (like Function.prototype) might be immutable in some environments
                // e.g. Node with --frozen-intrinsics, XS (an embedded JavaScript engine) or SES (a JavaScript proposal)
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    Function.prototype.toString = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var originalFunction = getOriginalFunction(this);
                        var context = SETUP_CLIENTS.has(getClient()) && originalFunction !== undefined ? originalFunction : this;
                        return originalFunctionToString.apply(context, args);
                    };
                }
                catch (_a) {
                    // ignore errors here, just don't patch this
                }
            },
            setup: function (client) {
                SETUP_CLIENTS.set(client, true);
            },
        };
    });
    /**
     * Patch toString calls to return proper name for wrapped functions.
     *
     * ```js
     * Sentry.init({
     *   integrations: [
     *     functionToStringIntegration(),
     *   ],
     * });
     * ```
     */
    var functionToStringIntegration = defineIntegration(_functionToStringIntegration);
    /**
     * Patch toString calls to return proper name for wrapped functions.
     *
     * @deprecated Use `functionToStringIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var FunctionToString = convertIntegrationFnToClass(INTEGRATION_NAME$8, functionToStringIntegration);

    var DEFAULT_KEY$1 = 'cause';
    var DEFAULT_LIMIT$1 = 5;
    var INTEGRATION_NAME$7 = 'LinkedErrors';
    var _linkedErrorsIntegration$1 = (function (options) {
        if (options === void 0) { options = {}; }
        var limit = options.limit || DEFAULT_LIMIT$1;
        var key = options.key || DEFAULT_KEY$1;
        return {
            name: INTEGRATION_NAME$7,
            // TODO v8: Remove this
            setupOnce: function () { },
            preprocessEvent: function (event, hint, client) {
                var options = client.getOptions();
                applyAggregateErrorsToEvent(exceptionFromError$1, options.stackParser, options.maxValueLength, key, limit, event, hint);
            },
        };
    });
    var linkedErrorsIntegration$1 = defineIntegration(_linkedErrorsIntegration$1);
    /**
     * Adds SDK info to an event.
     * @deprecated Use `linkedErrorsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var LinkedErrors$1 = convertIntegrationFnToClass(INTEGRATION_NAME$7, linkedErrorsIntegration$1);

    /* eslint-disable deprecation/deprecation */

    var INTEGRATIONS$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        FunctionToString: FunctionToString,
        InboundFilters: InboundFilters,
        LinkedErrors: LinkedErrors$1
    });

    /**
     * A simple metrics aggregator that aggregates metrics in memory and flushes them periodically.
     * Default flush interval is 5 seconds.
     *
     * @experimental This API is experimental and might change in the future.
     */
    var BrowserMetricsAggregator = /** @class */ (function () {
        function BrowserMetricsAggregator(_client) {
            var _this = this;
            this._client = _client;
            this._buckets = new Map();
            this._interval = setInterval(function () { return _this.flush(); }, DEFAULT_BROWSER_FLUSH_INTERVAL);
        }
        /**
         * @inheritDoc
         */
        BrowserMetricsAggregator.prototype.add = function (metricType, unsanitizedName, value, unsanitizedUnit, unsanitizedTags, maybeFloatTimestamp) {
            if (unsanitizedUnit === void 0) { unsanitizedUnit = 'none'; }
            if (unsanitizedTags === void 0) { unsanitizedTags = {}; }
            if (maybeFloatTimestamp === void 0) { maybeFloatTimestamp = timestampInSeconds(); }
            var timestamp = Math.floor(maybeFloatTimestamp);
            var name = sanitizeMetricKey(unsanitizedName);
            var tags = sanitizeTags(unsanitizedTags);
            var unit = sanitizeUnit(unsanitizedUnit);
            var bucketKey = getBucketKey(metricType, name, unit, tags);
            var bucketItem = this._buckets.get(bucketKey);
            // If this is a set metric, we need to calculate the delta from the previous weight.
            var previousWeight = bucketItem && metricType === SET_METRIC_TYPE ? bucketItem.metric.weight : 0;
            if (bucketItem) {
                bucketItem.metric.add(value);
                // TODO(abhi): Do we need this check?
                if (bucketItem.timestamp < timestamp) {
                    bucketItem.timestamp = timestamp;
                }
            }
            else {
                bucketItem = {
                    // @ts-expect-error we don't need to narrow down the type of value here, saves bundle size.
                    metric: new METRIC_MAP[metricType](value),
                    timestamp: timestamp,
                    metricType: metricType,
                    name: name,
                    unit: unit,
                    tags: tags,
                };
                this._buckets.set(bucketKey, bucketItem);
            }
            // If value is a string, it's a set metric so calculate the delta from the previous weight.
            var val = typeof value === 'string' ? bucketItem.metric.weight - previousWeight : value;
            updateMetricSummaryOnActiveSpan(metricType, name, val, unit, unsanitizedTags, bucketKey);
        };
        /**
         * @inheritDoc
         */
        BrowserMetricsAggregator.prototype.flush = function () {
            // short circuit if buckets are empty.
            if (this._buckets.size === 0) {
                return;
            }
            if (this._client.captureAggregateMetrics) {
                // TODO(@anonrig): Use Object.values() when we support ES6+
                var metricBuckets = Array.from(this._buckets).map(function (_a) {
                    var _b = __read(_a, 2), bucketItem = _b[1];
                    return bucketItem;
                });
                this._client.captureAggregateMetrics(metricBuckets);
            }
            this._buckets.clear();
        };
        /**
         * @inheritDoc
         */
        BrowserMetricsAggregator.prototype.close = function () {
            clearInterval(this._interval);
            this.flush();
        };
        return BrowserMetricsAggregator;
    }());

    var INTEGRATION_NAME$6 = 'MetricsAggregator';
    var _metricsAggregatorIntegration = (function () {
        return {
            name: INTEGRATION_NAME$6,
            // TODO v8: Remove this
            setupOnce: function () { },
            setup: function (client) {
                client.metricsAggregator = new BrowserMetricsAggregator(client);
            },
        };
    });
    var metricsAggregatorIntegration = defineIntegration(_metricsAggregatorIntegration);
    /**
     * Enables Sentry metrics monitoring.
     *
     * @experimental This API is experimental and might having breaking changes in the future.
     * @deprecated Use `metricsAggegratorIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var MetricsAggregator = convertIntegrationFnToClass(INTEGRATION_NAME$6, metricsAggregatorIntegration);

    function addToMetricsAggregator(metricType, name, value, data) {
        if (data === void 0) { data = {}; }
        var client = getClient();
        var scope = getCurrentScope();
        if (client) {
            if (!client.metricsAggregator) {
                logger.warn('No metrics aggregator enabled. Please add the MetricsAggregator integration to use metrics APIs');
                return;
            }
            var unit = data.unit, tags = data.tags, timestamp = data.timestamp;
            var _a = client.getOptions(), release = _a.release, environment = _a.environment;
            // eslint-disable-next-line deprecation/deprecation
            var transaction = scope.getTransaction();
            var metricTags = {};
            if (release) {
                metricTags.release = release;
            }
            if (environment) {
                metricTags.environment = environment;
            }
            if (transaction) {
                metricTags.transaction = spanToJSON(transaction).description || '';
            }
            logger.log("Adding value of ".concat(value, " to ").concat(metricType, " metric ").concat(name));
            client.metricsAggregator.add(metricType, name, value, unit, __assign(__assign({}, metricTags), tags), timestamp);
        }
    }
    /**
     * Adds a value to a counter metric
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function increment(name, value, data) {
        if (value === void 0) { value = 1; }
        addToMetricsAggregator(COUNTER_METRIC_TYPE, name, value, data);
    }
    /**
     * Adds a value to a distribution metric
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function distribution(name, value, data) {
        addToMetricsAggregator(DISTRIBUTION_METRIC_TYPE, name, value, data);
    }
    /**
     * Adds a value to a set metric. Value must be a string or integer.
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function set(name, value, data) {
        addToMetricsAggregator(SET_METRIC_TYPE, name, value, data);
    }
    /**
     * Adds a value to a gauge metric
     *
     * @experimental This API is experimental and might have breaking changes in the future.
     */
    function gauge(name, value, data) {
        addToMetricsAggregator(GAUGE_METRIC_TYPE, name, value, data);
    }
    var metrics = {
        increment: increment,
        distribution: distribution,
        set: set,
        gauge: gauge,
        /** @deprecated Use `metrics.metricsAggregratorIntegration()` instead. */
        // eslint-disable-next-line deprecation/deprecation
        MetricsAggregator: MetricsAggregator,
        metricsAggregatorIntegration: metricsAggregatorIntegration,
    };

    /** @deprecated Import the integration function directly, e.g. `inboundFiltersIntegration()` instead of `new Integrations.InboundFilter(). */
    var Integrations = INTEGRATIONS$1;

    var WINDOW = GLOBAL_OBJ;
    var ignoreOnError = 0;
    /**
     * @hidden
     */
    function shouldIgnoreOnError() {
        return ignoreOnError > 0;
    }
    /**
     * @hidden
     */
    function ignoreNextOnError() {
        // onerror should trigger before setTimeout
        ignoreOnError++;
        setTimeout(function () {
            ignoreOnError--;
        });
    }
    /**
     * Instruments the given function and sends an event to Sentry every time the
     * function throws an exception.
     *
     * @param fn A function to wrap. It is generally safe to pass an unbound function, because the returned wrapper always
     * has a correct `this` context.
     * @returns The wrapped function.
     * @hidden
     */
    function wrap$1(fn, options, before) {
        // for future readers what this does is wrap a function and then create
        // a bi-directional wrapping between them.
        //
        // example: wrapped = wrap(original);
        //  original.__sentry_wrapped__ -> wrapped
        //  wrapped.__sentry_original__ -> original
        if (options === void 0) { options = {}; }
        if (typeof fn !== 'function') {
            return fn;
        }
        try {
            // if we're dealing with a function that was previously wrapped, return
            // the original wrapper.
            var wrapper = fn.__sentry_wrapped__;
            if (wrapper) {
                return wrapper;
            }
            // We don't wanna wrap it twice
            if (getOriginalFunction(fn)) {
                return fn;
            }
        }
        catch (e) {
            // Just accessing custom props in some Selenium environments
            // can cause a "Permission denied" exception (see raven-js#495).
            // Bail on wrapping and return the function as-is (defers to window.onerror).
            return fn;
        }
        /* eslint-disable prefer-rest-params */
        // It is important that `sentryWrapped` is not an arrow function to preserve the context of `this`
        var sentryWrapped = function () {
            var args = Array.prototype.slice.call(arguments);
            try {
                if (before && typeof before === 'function') {
                    before.apply(this, arguments);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                var wrappedArguments = args.map(function (arg) { return wrap$1(arg, options); });
                // Attempt to invoke user-land function
                // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
                //       means the sentry.javascript SDK caught an error invoking your application code. This
                //       is expected behavior and NOT indicative of a bug with sentry.javascript.
                return fn.apply(this, wrappedArguments);
            }
            catch (ex) {
                ignoreNextOnError();
                withScope(function (scope) {
                    scope.addEventProcessor(function (event) {
                        if (options.mechanism) {
                            addExceptionTypeValue(event, undefined, undefined);
                            addExceptionMechanism(event, options.mechanism);
                        }
                        event.extra = __assign(__assign({}, event.extra), { arguments: args });
                        return event;
                    });
                    captureException(ex);
                });
                throw ex;
            }
        };
        /* eslint-enable prefer-rest-params */
        // Accessing some objects may throw
        // ref: https://github.com/getsentry/sentry-javascript/issues/1168
        try {
            for (var property in fn) {
                if (Object.prototype.hasOwnProperty.call(fn, property)) {
                    sentryWrapped[property] = fn[property];
                }
            }
        }
        catch (_oO) { } // eslint-disable-line no-empty
        // Signal that this function has been wrapped/filled already
        // for both debugging and to prevent it to being wrapped/filled twice
        markFunctionWrapped(sentryWrapped, fn);
        addNonEnumerableProperty(fn, '__sentry_wrapped__', sentryWrapped);
        // Restore original function name (not all browsers allow that)
        try {
            var descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name');
            if (descriptor.configurable) {
                Object.defineProperty(sentryWrapped, 'name', {
                    get: function () {
                        return fn.name;
                    },
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (_oO) { }
        return sentryWrapped;
    }

    /**
     * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `true` in their generated code.
     *
     * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
     */
    var DEBUG_BUILD = true;

    /**
     * This function creates an exception from a JavaScript Error
     */
    function exceptionFromError(stackParser, ex) {
        // Get the frames first since Opera can lose the stack if we touch anything else first
        var frames = parseStackFrames(stackParser, ex);
        var exception = {
            type: ex && ex.name,
            value: extractMessage(ex),
        };
        if (frames.length) {
            exception.stacktrace = { frames: frames };
        }
        if (exception.type === undefined && exception.value === '') {
            exception.value = 'Unrecoverable error caught';
        }
        return exception;
    }
    /**
     * @hidden
     */
    function eventFromPlainObject(stackParser, exception, syntheticException, isUnhandledRejection) {
        var client = getClient();
        var normalizeDepth = client && client.getOptions().normalizeDepth;
        var event = {
            exception: {
                values: [
                    {
                        type: isEvent(exception) ? exception.constructor.name : isUnhandledRejection ? 'UnhandledRejection' : 'Error',
                        value: getNonErrorObjectExceptionValue(exception, { isUnhandledRejection: isUnhandledRejection }),
                    },
                ],
            },
            extra: {
                __serialized__: normalizeToSize(exception, normalizeDepth),
            },
        };
        if (syntheticException) {
            var frames_1 = parseStackFrames(stackParser, syntheticException);
            if (frames_1.length) {
                // event.exception.values[0] has been set above
                event.exception.values[0].stacktrace = { frames: frames_1 };
            }
        }
        return event;
    }
    /**
     * @hidden
     */
    function eventFromError(stackParser, ex) {
        return {
            exception: {
                values: [exceptionFromError(stackParser, ex)],
            },
        };
    }
    /** Parses stack frames from an error */
    function parseStackFrames(stackParser, ex) {
        // Access and store the stacktrace property before doing ANYTHING
        // else to it because Opera is not very good at providing it
        // reliably in other circumstances.
        var stacktrace = ex.stacktrace || ex.stack || '';
        var popSize = getPopSize(ex);
        try {
            return stackParser(stacktrace, popSize);
        }
        catch (e) {
            // no-empty
        }
        return [];
    }
    // Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
    var reactMinifiedRegexp = /Minified React error #\d+;/i;
    function getPopSize(ex) {
        if (ex) {
            if (typeof ex.framesToPop === 'number') {
                return ex.framesToPop;
            }
            if (reactMinifiedRegexp.test(ex.message)) {
                return 1;
            }
        }
        return 0;
    }
    /**
     * There are cases where stacktrace.message is an Event object
     * https://github.com/getsentry/sentry-javascript/issues/1949
     * In this specific case we try to extract stacktrace.message.error.message
     */
    function extractMessage(ex) {
        var message = ex && ex.message;
        if (!message) {
            return 'No error message';
        }
        if (message.error && typeof message.error.message === 'string') {
            return message.error.message;
        }
        return message;
    }
    /**
     * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
     * @hidden
     */
    function eventFromException(stackParser, exception, hint, attachStacktrace) {
        var syntheticException = (hint && hint.syntheticException) || undefined;
        var event = eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace);
        addExceptionMechanism(event); // defaults to { type: 'generic', handled: true }
        event.level = 'error';
        if (hint && hint.event_id) {
            event.event_id = hint.event_id;
        }
        return resolvedSyncPromise(event);
    }
    /**
     * Builds and Event from a Message
     * @hidden
     */
    function eventFromMessage(stackParser, message,
    // eslint-disable-next-line deprecation/deprecation
    level, hint, attachStacktrace) {
        if (level === void 0) { level = 'info'; }
        var syntheticException = (hint && hint.syntheticException) || undefined;
        var event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
        event.level = level;
        if (hint && hint.event_id) {
            event.event_id = hint.event_id;
        }
        return resolvedSyncPromise(event);
    }
    /**
     * @hidden
     */
    function eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace, isUnhandledRejection) {
        var event;
        if (isErrorEvent$1(exception) && exception.error) {
            // If it is an ErrorEvent with `error` property, extract it to get actual Error
            var errorEvent = exception;
            return eventFromError(stackParser, errorEvent.error);
        }
        // If it is a `DOMError` (which is a legacy API, but still supported in some browsers) then we just extract the name
        // and message, as it doesn't provide anything else. According to the spec, all `DOMExceptions` should also be
        // `Error`s, but that's not the case in IE11, so in that case we treat it the same as we do a `DOMError`.
        //
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
        // https://webidl.spec.whatwg.org/#es-DOMException-specialness
        if (isDOMError(exception) || isDOMException(exception)) {
            var domException = exception;
            if ('stack' in exception) {
                event = eventFromError(stackParser, exception);
            }
            else {
                var name_1 = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
                var message = domException.message ? "".concat(name_1, ": ").concat(domException.message) : name_1;
                event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
                addExceptionTypeValue(event, message);
            }
            if ('code' in domException) {
                // eslint-disable-next-line deprecation/deprecation
                event.tags = __assign(__assign({}, event.tags), { 'DOMException.code': "".concat(domException.code) });
            }
            return event;
        }
        if (isError(exception)) {
            // we have a real Error object, do nothing
            return eventFromError(stackParser, exception);
        }
        if (isPlainObject(exception) || isEvent(exception)) {
            // If it's a plain object or an instance of `Event` (the built-in JS kind, not this SDK's `Event` type), serialize
            // it manually. This will allow us to group events based on top-level keys which is much better than creating a new
            // group on any key/value change.
            var objectException = exception;
            event = eventFromPlainObject(stackParser, objectException, syntheticException, isUnhandledRejection);
            addExceptionMechanism(event, {
                synthetic: true,
            });
            return event;
        }
        // If none of previous checks were valid, then it means that it's not:
        // - an instance of DOMError
        // - an instance of DOMException
        // - an instance of Event
        // - an instance of Error
        // - a valid ErrorEvent (one with an error property)
        // - a plain Object
        //
        // So bail out and capture it as a simple message:
        event = eventFromString(stackParser, exception, syntheticException, attachStacktrace);
        addExceptionTypeValue(event, "".concat(exception), undefined);
        addExceptionMechanism(event, {
            synthetic: true,
        });
        return event;
    }
    /**
     * @hidden
     */
    function eventFromString(stackParser, message, syntheticException, attachStacktrace) {
        var event = {};
        if (attachStacktrace && syntheticException) {
            var frames_2 = parseStackFrames(stackParser, syntheticException);
            if (frames_2.length) {
                event.exception = {
                    values: [{ value: message, stacktrace: { frames: frames_2 } }],
                };
            }
        }
        if (isParameterizedString(message)) {
            var __sentry_template_string__ = message.__sentry_template_string__, __sentry_template_values__ = message.__sentry_template_values__;
            event.logentry = {
                message: __sentry_template_string__,
                params: __sentry_template_values__,
            };
            return event;
        }
        event.message = message;
        return event;
    }
    function getNonErrorObjectExceptionValue(exception, _a) {
        var isUnhandledRejection = _a.isUnhandledRejection;
        var keys = extractExceptionKeysForMessage(exception);
        var captureType = isUnhandledRejection ? 'promise rejection' : 'exception';
        // Some ErrorEvent instances do not have an `error` property, which is why they are not handled before
        // We still want to try to get a decent message for these cases
        if (isErrorEvent$1(exception)) {
            return "Event `ErrorEvent` captured as ".concat(captureType, " with message `").concat(exception.message, "`");
        }
        if (isEvent(exception)) {
            var className = getObjectClassName(exception);
            return "Event `".concat(className, "` (type=").concat(exception.type, ") captured as ").concat(captureType);
        }
        return "Object captured as ".concat(captureType, " with keys: ").concat(keys);
    }
    function getObjectClassName(obj) {
        try {
            var prototype = Object.getPrototypeOf(obj);
            return prototype ? prototype.constructor.name : undefined;
        }
        catch (e) {
            // ignore errors here
        }
    }

    /**
     * Creates an envelope from a user feedback.
     */
    function createUserFeedbackEnvelope(feedback, _a) {
        var metadata = _a.metadata, tunnel = _a.tunnel, dsn = _a.dsn;
        var headers = __assign(__assign({ event_id: feedback.event_id, sent_at: new Date().toISOString() }, (metadata &&
            metadata.sdk && {
            sdk: {
                name: metadata.sdk.name,
                version: metadata.sdk.version,
            },
        })), (!!tunnel && !!dsn && { dsn: dsnToString(dsn) }));
        var item = createUserFeedbackEnvelopeItem(feedback);
        return createEnvelope(headers, [item]);
    }
    function createUserFeedbackEnvelopeItem(feedback) {
        var feedbackHeaders = {
            type: 'user_report',
        };
        return [feedbackHeaders, feedback];
    }

    /**
     * The Sentry Browser SDK Client.
     *
     * @see BrowserOptions for documentation on configuration options.
     * @see SentryClient for usage documentation.
     */
    var BrowserClient = /** @class */ (function (_super) {
        __extends(BrowserClient, _super);
        /**
         * Creates a new Browser SDK instance.
         *
         * @param options Configuration options for this SDK.
         */
        function BrowserClient(options) {
            var _this = this;
            var sdkSource = WINDOW.SENTRY_SDK_SOURCE || getSDKSource();
            applySdkMetadata(options, 'browser', ['browser'], sdkSource);
            _this = _super.call(this, options) || this;
            if (options.sendClientReports && WINDOW.document) {
                WINDOW.document.addEventListener('visibilitychange', function () {
                    if (WINDOW.document.visibilityState === 'hidden') {
                        _this._flushOutcomes();
                    }
                });
            }
            return _this;
        }
        /**
         * @inheritDoc
         */
        BrowserClient.prototype.eventFromException = function (exception, hint) {
            return eventFromException(this._options.stackParser, exception, hint, this._options.attachStacktrace);
        };
        /**
         * @inheritDoc
         */
        BrowserClient.prototype.eventFromMessage = function (message,
        // eslint-disable-next-line deprecation/deprecation
        level, hint) {
            if (level === void 0) { level = 'info'; }
            return eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
        };
        /**
         * Sends user feedback to Sentry.
         */
        BrowserClient.prototype.captureUserFeedback = function (feedback) {
            if (!this._isEnabled()) {
                DEBUG_BUILD && logger.warn('SDK not enabled, will not capture user feedback.');
                return;
            }
            var envelope = createUserFeedbackEnvelope(feedback, {
                metadata: this.getSdkMetadata(),
                dsn: this.getDsn(),
                tunnel: this.getOptions().tunnel,
            });
            // _sendEnvelope should not throw
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._sendEnvelope(envelope);
        };
        /**
         * @inheritDoc
         */
        BrowserClient.prototype._prepareEvent = function (event, hint, scope) {
            event.platform = event.platform || 'javascript';
            return _super.prototype._prepareEvent.call(this, event, hint, scope);
        };
        /**
         * Sends client reports as an envelope.
         */
        BrowserClient.prototype._flushOutcomes = function () {
            var outcomes = this._clearOutcomes();
            if (outcomes.length === 0) {
                DEBUG_BUILD && logger.log('No outcomes to send');
                return;
            }
            // This is really the only place where we want to check for a DSN and only send outcomes then
            if (!this._dsn) {
                DEBUG_BUILD && logger.log('No dsn provided, will not send outcomes');
                return;
            }
            DEBUG_BUILD && logger.log('Sending outcomes:', outcomes);
            var envelope = createClientReportEnvelope(outcomes, this._options.tunnel && dsnToString(this._dsn));
            // _sendEnvelope should not throw
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._sendEnvelope(envelope);
        };
        return BrowserClient;
    }(BaseClient));

    var cachedFetchImpl = undefined;
    /**
     * A special usecase for incorrectly wrapped Fetch APIs in conjunction with ad-blockers.
     * Whenever someone wraps the Fetch API and returns the wrong promise chain,
     * this chain becomes orphaned and there is no possible way to capture it's rejections
     * other than allowing it bubble up to this very handler. eg.
     *
     * const f = window.fetch;
     * window.fetch = function () {
     *   const p = f.apply(this, arguments);
     *
     *   p.then(function() {
     *     console.log('hi.');
     *   });
     *
     *   return p;
     * }
     *
     * `p.then(function () { ... })` is producing a completely separate promise chain,
     * however, what's returned is `p` - the result of original `fetch` call.
     *
     * This mean, that whenever we use the Fetch API to send our own requests, _and_
     * some ad-blocker blocks it, this orphaned chain will _always_ reject,
     * effectively causing another event to be captured.
     * This makes a whole process become an infinite loop, which we need to somehow
     * deal with, and break it in one way or another.
     *
     * To deal with this issue, we are making sure that we _always_ use the real
     * browser Fetch API, instead of relying on what `window.fetch` exposes.
     * The only downside to this would be missing our own requests as breadcrumbs,
     * but because we are already not doing this, it should be just fine.
     *
     * Possible failed fetch error messages per-browser:
     *
     * Chrome:  Failed to fetch
     * Edge:    Failed to Fetch
     * Firefox: NetworkError when attempting to fetch resource
     * Safari:  resource blocked by content blocker
     */
    function getNativeFetchImplementation() {
        if (cachedFetchImpl) {
            return cachedFetchImpl;
        }
        /* eslint-disable @typescript-eslint/unbound-method */
        // Fast path to avoid DOM I/O
        if (isNativeFetch(WINDOW.fetch)) {
            return (cachedFetchImpl = WINDOW.fetch.bind(WINDOW));
        }
        var document = WINDOW.document;
        var fetchImpl = WINDOW.fetch;
        // eslint-disable-next-line deprecation/deprecation
        if (document && typeof document.createElement === 'function') {
            try {
                var sandbox = document.createElement('iframe');
                sandbox.hidden = true;
                document.head.appendChild(sandbox);
                var contentWindow = sandbox.contentWindow;
                if (contentWindow && contentWindow.fetch) {
                    fetchImpl = contentWindow.fetch;
                }
                document.head.removeChild(sandbox);
            }
            catch (e) {
                logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', e);
            }
        }
        return (cachedFetchImpl = fetchImpl.bind(WINDOW));
        /* eslint-enable @typescript-eslint/unbound-method */
    }
    /** Clears cached fetch impl */
    function clearCachedFetchImplementation() {
        cachedFetchImpl = undefined;
    }

    /**
     * Creates a Transport that uses the Fetch API to send events to Sentry.
     */
    function makeFetchTransport(options, nativeFetch) {
        if (nativeFetch === void 0) { nativeFetch = getNativeFetchImplementation(); }
        var pendingBodySize = 0;
        var pendingCount = 0;
        function makeRequest(request) {
            var requestSize = request.body.length;
            pendingBodySize += requestSize;
            pendingCount++;
            var requestOptions = __assign({ body: request.body, method: 'POST', referrerPolicy: 'origin', headers: options.headers,
                // Outgoing requests are usually cancelled when navigating to a different page, causing a "TypeError: Failed to
                // fetch" error and sending a "network_error" client-outcome - in Chrome, the request status shows "(cancelled)".
                // The `keepalive` flag keeps outgoing requests alive, even when switching pages. We want this since we're
                // frequently sending events right before the user is switching pages (eg. whenfinishing navigation transactions).
                // Gotchas:
                // - `keepalive` isn't supported by Firefox
                // - As per spec (https://fetch.spec.whatwg.org/#http-network-or-cache-fetch):
                //   If the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes, then return a network error.
                //   We will therefore only activate the flag when we're below that limit.
                // There is also a limit of requests that can be open at the same time, so we also limit this to 15
                // See https://github.com/getsentry/sentry-javascript/pull/7553 for details
                keepalive: pendingBodySize <= 60000 && pendingCount < 15 }, options.fetchOptions);
            try {
                return nativeFetch(options.url, requestOptions).then(function (response) {
                    pendingBodySize -= requestSize;
                    pendingCount--;
                    return {
                        statusCode: response.status,
                        headers: {
                            'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
                            'retry-after': response.headers.get('Retry-After'),
                        },
                    };
                });
            }
            catch (e) {
                clearCachedFetchImplementation();
                pendingBodySize -= requestSize;
                pendingCount--;
                return rejectedSyncPromise(e);
            }
        }
        return createTransport(options, makeRequest);
    }

    /**
     * The DONE ready state for XmlHttpRequest
     *
     * Defining it here as a constant b/c XMLHttpRequest.DONE is not always defined
     * (e.g. during testing, it is `undefined`)
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState}
     */
    var XHR_READYSTATE_DONE = 4;
    /**
     * Creates a Transport that uses the XMLHttpRequest API to send events to Sentry.
     */
    function makeXHRTransport(options) {
        function makeRequest(request) {
            return new SyncPromise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onerror = reject;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XHR_READYSTATE_DONE) {
                        resolve({
                            statusCode: xhr.status,
                            headers: {
                                'x-sentry-rate-limits': xhr.getResponseHeader('X-Sentry-Rate-Limits'),
                                'retry-after': xhr.getResponseHeader('Retry-After'),
                            },
                        });
                    }
                };
                xhr.open('POST', options.url);
                for (var header in options.headers) {
                    if (Object.prototype.hasOwnProperty.call(options.headers, header)) {
                        xhr.setRequestHeader(header, options.headers[header]);
                    }
                }
                xhr.send(request.body);
            });
        }
        return createTransport(options, makeRequest);
    }

    // This was originally forked from https://github.com/csnover/TraceKit, and was largely
    // global reference to slice
    var UNKNOWN_FUNCTION = '?';
    var OPERA10_PRIORITY = 10;
    var OPERA11_PRIORITY = 20;
    var CHROME_PRIORITY = 30;
    var WINJS_PRIORITY = 40;
    var GECKO_PRIORITY = 50;
    function createFrame(filename, func, lineno, colno) {
        var frame = {
            filename: filename,
            function: func,
            in_app: true, // All browser frames are considered in_app
        };
        if (lineno !== undefined) {
            frame.lineno = lineno;
        }
        if (colno !== undefined) {
            frame.colno = colno;
        }
        return frame;
    }
    // Chromium based browsers: Chrome, Brave, new Opera, new Edge
    var chromeRegex = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    var chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    // We cannot call this variable `chrome` because it can conflict with global `chrome` variable in certain environments
    // See: https://github.com/getsentry/sentry-javascript/issues/6880
    var chromeStackParserFn = function (line) {
        var parts = chromeRegex.exec(line);
        if (parts) {
            var isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
            if (isEval) {
                var subMatch = chromeEvalRegex.exec(parts[2]);
                if (subMatch) {
                    // throw out eval line/column and use top-most line/column number
                    parts[2] = subMatch[1]; // url
                    parts[3] = subMatch[2]; // line
                    parts[4] = subMatch[3]; // column
                }
            }
            // Kamil: One more hack won't hurt us right? Understanding and adding more rules on top of these regexps right now
            // would be way too time consuming. (TODO: Rewrite whole RegExp to be more readable)
            var _a = __read(extractSafariExtensionDetails(parts[1] || UNKNOWN_FUNCTION, parts[2]), 2), func = _a[0], filename = _a[1];
            return createFrame(filename, func, parts[3] ? +parts[3] : undefined, parts[4] ? +parts[4] : undefined);
        }
        return;
    };
    var chromeStackLineParser = [CHROME_PRIORITY, chromeStackParserFn];
    // gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
    // generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
    // We need this specific case for now because we want no other regex to match.
    var geckoREgex = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
    var geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    var gecko = function (line) {
        var _a;
        var parts = geckoREgex.exec(line);
        if (parts) {
            var isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
            if (isEval) {
                var subMatch = geckoEvalRegex.exec(parts[3]);
                if (subMatch) {
                    // throw out eval line/column and use top-most line number
                    parts[1] = parts[1] || 'eval';
                    parts[3] = subMatch[1];
                    parts[4] = subMatch[2];
                    parts[5] = ''; // no column when eval
                }
            }
            var filename = parts[3];
            var func = parts[1] || UNKNOWN_FUNCTION;
            _a = __read(extractSafariExtensionDetails(func, filename), 2), func = _a[0], filename = _a[1];
            return createFrame(filename, func, parts[4] ? +parts[4] : undefined, parts[5] ? +parts[5] : undefined);
        }
        return;
    };
    var geckoStackLineParser = [GECKO_PRIORITY, gecko];
    var winjsRegex = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    var winjs = function (line) {
        var parts = winjsRegex.exec(line);
        return parts
            ? createFrame(parts[2], parts[1] || UNKNOWN_FUNCTION, +parts[3], parts[4] ? +parts[4] : undefined)
            : undefined;
    };
    var winjsStackLineParser = [WINJS_PRIORITY, winjs];
    var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
    var opera10 = function (line) {
        var parts = opera10Regex.exec(line);
        return parts ? createFrame(parts[2], parts[3] || UNKNOWN_FUNCTION, +parts[1]) : undefined;
    };
    var opera10StackLineParser = [OPERA10_PRIORITY, opera10];
    var opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i;
    var opera11 = function (line) {
        var parts = opera11Regex.exec(line);
        return parts ? createFrame(parts[5], parts[3] || parts[4] || UNKNOWN_FUNCTION, +parts[1], +parts[2]) : undefined;
    };
    var opera11StackLineParser = [OPERA11_PRIORITY, opera11];
    var defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser, winjsStackLineParser];
    var defaultStackParser = createStackParser.apply(void 0, __spreadArray([], __read(defaultStackLineParsers), false));
    /**
     * Safari web extensions, starting version unknown, can produce "frames-only" stacktraces.
     * What it means, is that instead of format like:
     *
     * Error: wat
     *   at function@url:row:col
     *   at function@url:row:col
     *   at function@url:row:col
     *
     * it produces something like:
     *
     *   function@url:row:col
     *   function@url:row:col
     *   function@url:row:col
     *
     * Because of that, it won't be captured by `chrome` RegExp and will fall into `Gecko` branch.
     * This function is extracted so that we can use it in both places without duplicating the logic.
     * Unfortunately "just" changing RegExp is too complicated now and making it pass all tests
     * and fix this case seems like an impossible, or at least way too time-consuming task.
     */
    var extractSafariExtensionDetails = function (func, filename) {
        var isSafariExtension = func.indexOf('safari-extension') !== -1;
        var isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;
        return isSafariExtension || isSafariWebExtension
            ? [
                func.indexOf('@') !== -1 ? func.split('@')[0] : UNKNOWN_FUNCTION,
                isSafariExtension ? "safari-extension:".concat(filename) : "safari-web-extension:".concat(filename),
            ]
            : [func, filename];
    };

    /** maxStringLength gets capped to prevent 100 breadcrumbs exceeding 1MB event payload size */
    var MAX_ALLOWED_STRING_LENGTH = 1024;
    var INTEGRATION_NAME$5 = 'Breadcrumbs';
    var _breadcrumbsIntegration = (function (options) {
        if (options === void 0) { options = {}; }
        var _options = __assign({ console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true }, options);
        return {
            name: INTEGRATION_NAME$5,
            // TODO v8: Remove this
            setupOnce: function () { },
            setup: function (client) {
                if (_options.console) {
                    addConsoleInstrumentationHandler(_getConsoleBreadcrumbHandler(client));
                }
                if (_options.dom) {
                    addClickKeypressInstrumentationHandler(_getDomBreadcrumbHandler(client, _options.dom));
                }
                if (_options.xhr) {
                    addXhrInstrumentationHandler(_getXhrBreadcrumbHandler(client));
                }
                if (_options.fetch) {
                    addFetchInstrumentationHandler(_getFetchBreadcrumbHandler(client));
                }
                if (_options.history) {
                    addHistoryInstrumentationHandler(_getHistoryBreadcrumbHandler(client));
                }
                if (_options.sentry && client.on) {
                    client.on('beforeSendEvent', _getSentryBreadcrumbHandler(client));
                }
            },
        };
    });
    var breadcrumbsIntegration = defineIntegration(_breadcrumbsIntegration);
    /**
     * Default Breadcrumbs instrumentations
     *
     * @deprecated Use `breadcrumbsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var Breadcrumbs = convertIntegrationFnToClass(INTEGRATION_NAME$5, breadcrumbsIntegration);
    /**
     * Adds a breadcrumb for Sentry events or transactions if this option is enabled.
     */
    function _getSentryBreadcrumbHandler(client) {
        return function addSentryBreadcrumb(event) {
            if (getClient() !== client) {
                return;
            }
            addBreadcrumb({
                category: "sentry.".concat(event.type === 'transaction' ? 'transaction' : 'event'),
                event_id: event.event_id,
                level: event.level,
                message: getEventDescription(event),
            }, {
                event: event,
            });
        };
    }
    /**
     * A HOC that creaes a function that creates breadcrumbs from DOM API calls.
     * This is a HOC so that we get access to dom options in the closure.
     */
    function _getDomBreadcrumbHandler(client, dom) {
        return function _innerDomBreadcrumb(handlerData) {
            if (getClient() !== client) {
                return;
            }
            var target;
            var componentName;
            var keyAttrs = typeof dom === 'object' ? dom.serializeAttribute : undefined;
            var maxStringLength = typeof dom === 'object' && typeof dom.maxStringLength === 'number' ? dom.maxStringLength : undefined;
            if (maxStringLength && maxStringLength > MAX_ALLOWED_STRING_LENGTH) {
                logger.warn("`dom.maxStringLength` cannot exceed ".concat(MAX_ALLOWED_STRING_LENGTH, ", but a value of ").concat(maxStringLength, " was configured. Sentry will use ").concat(MAX_ALLOWED_STRING_LENGTH, " instead."));
                maxStringLength = MAX_ALLOWED_STRING_LENGTH;
            }
            if (typeof keyAttrs === 'string') {
                keyAttrs = [keyAttrs];
            }
            // Accessing event.target can throw (see getsentry/raven-js#838, #768)
            try {
                var event_1 = handlerData.event;
                var element = _isEvent(event_1) ? event_1.target : event_1;
                target = htmlTreeAsString(element, { keyAttrs: keyAttrs, maxStringLength: maxStringLength });
                componentName = getComponentName(element);
            }
            catch (e) {
                target = '<unknown>';
            }
            if (target.length === 0) {
                return;
            }
            var breadcrumb = {
                category: "ui.".concat(handlerData.name),
                message: target,
            };
            if (componentName) {
                breadcrumb.data = { 'ui.component_name': componentName };
            }
            addBreadcrumb(breadcrumb, {
                event: handlerData.event,
                name: handlerData.name,
                global: handlerData.global,
            });
        };
    }
    /**
     * Creates breadcrumbs from console API calls
     */
    function _getConsoleBreadcrumbHandler(client) {
        return function _consoleBreadcrumb(handlerData) {
            if (getClient() !== client) {
                return;
            }
            var breadcrumb = {
                category: 'console',
                data: {
                    arguments: handlerData.args,
                    logger: 'console',
                },
                level: severityLevelFromString(handlerData.level),
                message: safeJoin(handlerData.args, ' '),
            };
            if (handlerData.level === 'assert') {
                if (handlerData.args[0] === false) {
                    breadcrumb.message = "Assertion failed: ".concat(safeJoin(handlerData.args.slice(1), ' ') || 'console.assert');
                    breadcrumb.data.arguments = handlerData.args.slice(1);
                }
                else {
                    // Don't capture a breadcrumb for passed assertions
                    return;
                }
            }
            addBreadcrumb(breadcrumb, {
                input: handlerData.args,
                level: handlerData.level,
            });
        };
    }
    /**
     * Creates breadcrumbs from XHR API calls
     */
    function _getXhrBreadcrumbHandler(client) {
        return function _xhrBreadcrumb(handlerData) {
            if (getClient() !== client) {
                return;
            }
            var startTimestamp = handlerData.startTimestamp, endTimestamp = handlerData.endTimestamp;
            var sentryXhrData = handlerData.xhr[SENTRY_XHR_DATA_KEY];
            // We only capture complete, non-sentry requests
            if (!startTimestamp || !endTimestamp || !sentryXhrData) {
                return;
            }
            var method = sentryXhrData.method, url = sentryXhrData.url, status_code = sentryXhrData.status_code, body = sentryXhrData.body;
            var data = {
                method: method,
                url: url,
                status_code: status_code,
            };
            var hint = {
                xhr: handlerData.xhr,
                input: body,
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp,
            };
            addBreadcrumb({
                category: 'xhr',
                data: data,
                type: 'http',
            }, hint);
        };
    }
    /**
     * Creates breadcrumbs from fetch API calls
     */
    function _getFetchBreadcrumbHandler(client) {
        return function _fetchBreadcrumb(handlerData) {
            if (getClient() !== client) {
                return;
            }
            var startTimestamp = handlerData.startTimestamp, endTimestamp = handlerData.endTimestamp;
            // We only capture complete fetch requests
            if (!endTimestamp) {
                return;
            }
            if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === 'POST') {
                // We will not create breadcrumbs for fetch requests that contain `sentry_key` (internal sentry requests)
                return;
            }
            if (handlerData.error) {
                var data = handlerData.fetchData;
                var hint = {
                    data: handlerData.error,
                    input: handlerData.args,
                    startTimestamp: startTimestamp,
                    endTimestamp: endTimestamp,
                };
                addBreadcrumb({
                    category: 'fetch',
                    data: data,
                    level: 'error',
                    type: 'http',
                }, hint);
            }
            else {
                var response = handlerData.response;
                var data = __assign(__assign({}, handlerData.fetchData), { status_code: response && response.status });
                var hint = {
                    input: handlerData.args,
                    response: response,
                    startTimestamp: startTimestamp,
                    endTimestamp: endTimestamp,
                };
                addBreadcrumb({
                    category: 'fetch',
                    data: data,
                    type: 'http',
                }, hint);
            }
        };
    }
    /**
     * Creates breadcrumbs from history API calls
     */
    function _getHistoryBreadcrumbHandler(client) {
        return function _historyBreadcrumb(handlerData) {
            if (getClient() !== client) {
                return;
            }
            var from = handlerData.from;
            var to = handlerData.to;
            var parsedLoc = parseUrl(WINDOW.location.href);
            var parsedFrom = from ? parseUrl(from) : undefined;
            var parsedTo = parseUrl(to);
            // Initial pushState doesn't provide `from` information
            if (!parsedFrom || !parsedFrom.path) {
                parsedFrom = parsedLoc;
            }
            // Use only the path component of the URL if the URL matches the current
            // document (almost all the time when using pushState)
            if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
                to = parsedTo.relative;
            }
            if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
                from = parsedFrom.relative;
            }
            addBreadcrumb({
                category: 'navigation',
                data: {
                    from: from,
                    to: to,
                },
            });
        };
    }
    function _isEvent(event) {
        return !!event && !!event.target;
    }

    var INTEGRATION_NAME$4 = 'Dedupe';
    var _dedupeIntegration = (function () {
        var previousEvent;
        return {
            name: INTEGRATION_NAME$4,
            // TODO v8: Remove this
            setupOnce: function () { },
            processEvent: function (currentEvent) {
                // We want to ignore any non-error type events, e.g. transactions or replays
                // These should never be deduped, and also not be compared against as _previousEvent.
                if (currentEvent.type) {
                    return currentEvent;
                }
                // Juuust in case something goes wrong
                try {
                    if (_shouldDropEvent(currentEvent, previousEvent)) {
                        logger.warn('Event dropped due to being a duplicate of previously captured event.');
                        return null;
                    }
                }
                catch (_oO) { } // eslint-disable-line no-empty
                return (previousEvent = currentEvent);
            },
        };
    });
    var dedupeIntegration = defineIntegration(_dedupeIntegration);
    /**
     * Deduplication filter.
     * @deprecated Use `dedupeIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var Dedupe = convertIntegrationFnToClass(INTEGRATION_NAME$4, dedupeIntegration);
    function _shouldDropEvent(currentEvent, previousEvent) {
        if (!previousEvent) {
            return false;
        }
        if (_isSameMessageEvent(currentEvent, previousEvent)) {
            return true;
        }
        if (_isSameExceptionEvent(currentEvent, previousEvent)) {
            return true;
        }
        return false;
    }
    function _isSameMessageEvent(currentEvent, previousEvent) {
        var currentMessage = currentEvent.message;
        var previousMessage = previousEvent.message;
        // If neither event has a message property, they were both exceptions, so bail out
        if (!currentMessage && !previousMessage) {
            return false;
        }
        // If only one event has a stacktrace, but not the other one, they are not the same
        if ((currentMessage && !previousMessage) || (!currentMessage && previousMessage)) {
            return false;
        }
        if (currentMessage !== previousMessage) {
            return false;
        }
        if (!_isSameFingerprint(currentEvent, previousEvent)) {
            return false;
        }
        if (!_isSameStacktrace(currentEvent, previousEvent)) {
            return false;
        }
        return true;
    }
    function _isSameExceptionEvent(currentEvent, previousEvent) {
        var previousException = _getExceptionFromEvent(previousEvent);
        var currentException = _getExceptionFromEvent(currentEvent);
        if (!previousException || !currentException) {
            return false;
        }
        if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
            return false;
        }
        if (!_isSameFingerprint(currentEvent, previousEvent)) {
            return false;
        }
        if (!_isSameStacktrace(currentEvent, previousEvent)) {
            return false;
        }
        return true;
    }
    function _isSameStacktrace(currentEvent, previousEvent) {
        var currentFrames = _getFramesFromEvent(currentEvent);
        var previousFrames = _getFramesFromEvent(previousEvent);
        // If neither event has a stacktrace, they are assumed to be the same
        if (!currentFrames && !previousFrames) {
            return true;
        }
        // If only one event has a stacktrace, but not the other one, they are not the same
        if ((currentFrames && !previousFrames) || (!currentFrames && previousFrames)) {
            return false;
        }
        currentFrames = currentFrames;
        previousFrames = previousFrames;
        // If number of frames differ, they are not the same
        if (previousFrames.length !== currentFrames.length) {
            return false;
        }
        // Otherwise, compare the two
        for (var i = 0; i < previousFrames.length; i++) {
            var frameA = previousFrames[i];
            var frameB = currentFrames[i];
            if (frameA.filename !== frameB.filename ||
                frameA.lineno !== frameB.lineno ||
                frameA.colno !== frameB.colno ||
                frameA.function !== frameB.function) {
                return false;
            }
        }
        return true;
    }
    function _isSameFingerprint(currentEvent, previousEvent) {
        var currentFingerprint = currentEvent.fingerprint;
        var previousFingerprint = previousEvent.fingerprint;
        // If neither event has a fingerprint, they are assumed to be the same
        if (!currentFingerprint && !previousFingerprint) {
            return true;
        }
        // If only one event has a fingerprint, but not the other one, they are not the same
        if ((currentFingerprint && !previousFingerprint) || (!currentFingerprint && previousFingerprint)) {
            return false;
        }
        currentFingerprint = currentFingerprint;
        previousFingerprint = previousFingerprint;
        // Otherwise, compare the two
        try {
            return !!(currentFingerprint.join('') === previousFingerprint.join(''));
        }
        catch (_oO) {
            return false;
        }
    }
    function _getExceptionFromEvent(event) {
        return event.exception && event.exception.values && event.exception.values[0];
    }
    function _getFramesFromEvent(event) {
        var exception = event.exception;
        if (exception) {
            try {
                // @ts-expect-error Object could be undefined
                return exception.values[0].stacktrace.frames;
            }
            catch (_oO) {
                return undefined;
            }
        }
        return undefined;
    }

    var INTEGRATION_NAME$3 = 'GlobalHandlers';
    var _globalHandlersIntegration = (function (options) {
        if (options === void 0) { options = {}; }
        var _options = __assign({ onerror: true, onunhandledrejection: true }, options);
        return {
            name: INTEGRATION_NAME$3,
            setupOnce: function () {
                Error.stackTraceLimit = 50;
            },
            setup: function (client) {
                if (_options.onerror) {
                    _installGlobalOnErrorHandler(client);
                    globalHandlerLog('onerror');
                }
                if (_options.onunhandledrejection) {
                    _installGlobalOnUnhandledRejectionHandler(client);
                    globalHandlerLog('onunhandledrejection');
                }
            },
        };
    });
    var globalHandlersIntegration = defineIntegration(_globalHandlersIntegration);
    /**
     * Global handlers.
     * @deprecated Use `globalHandlersIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var GlobalHandlers = convertIntegrationFnToClass(INTEGRATION_NAME$3, globalHandlersIntegration);
    function _installGlobalOnErrorHandler(client) {
        addGlobalErrorInstrumentationHandler(function (data) {
            var _a = getOptions(), stackParser = _a.stackParser, attachStacktrace = _a.attachStacktrace;
            if (getClient() !== client || shouldIgnoreOnError()) {
                return;
            }
            var msg = data.msg, url = data.url, line = data.line, column = data.column, error = data.error;
            var event = error === undefined && isString(msg)
                ? _eventFromIncompleteOnError(msg, url, line, column)
                : _enhanceEventWithInitialFrame(eventFromUnknownInput(stackParser, error || msg, undefined, attachStacktrace, false), url, line, column);
            event.level = 'error';
            captureEvent(event, {
                originalException: error,
                mechanism: {
                    handled: false,
                    type: 'onerror',
                },
            });
        });
    }
    function _installGlobalOnUnhandledRejectionHandler(client) {
        addGlobalUnhandledRejectionInstrumentationHandler(function (e) {
            var _a = getOptions(), stackParser = _a.stackParser, attachStacktrace = _a.attachStacktrace;
            if (getClient() !== client || shouldIgnoreOnError()) {
                return;
            }
            var error = _getUnhandledRejectionError(e);
            var event = isPrimitive(error)
                ? _eventFromRejectionWithPrimitive(error)
                : eventFromUnknownInput(stackParser, error, undefined, attachStacktrace, true);
            event.level = 'error';
            captureEvent(event, {
                originalException: error,
                mechanism: {
                    handled: false,
                    type: 'onunhandledrejection',
                },
            });
        });
    }
    function _getUnhandledRejectionError(error) {
        if (isPrimitive(error)) {
            return error;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var e = error;
        // dig the object of the rejection out of known event types
        try {
            // PromiseRejectionEvents store the object of the rejection under 'reason'
            // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
            if ('reason' in e) {
                return e.reason;
            }
            // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
            // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
            // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
            // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
            // https://github.com/getsentry/sentry-javascript/issues/2380
            else if ('detail' in e && 'reason' in e.detail) {
                return e.detail.reason;
            }
        }
        catch (_a) { } // eslint-disable-line no-empty
        return error;
    }
    /**
     * Create an event from a promise rejection where the `reason` is a primitive.
     *
     * @param reason: The `reason` property of the promise rejection
     * @returns An Event object with an appropriate `exception` value
     */
    function _eventFromRejectionWithPrimitive(reason) {
        return {
            exception: {
                values: [
                    {
                        type: 'UnhandledRejection',
                        // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
                        value: "Non-Error promise rejection captured with value: ".concat(String(reason)),
                    },
                ],
            },
        };
    }
    /**
     * This function creates a stack from an old, error-less onerror handler.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _eventFromIncompleteOnError(msg, url, line, column) {
        var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
        // If 'message' is ErrorEvent, get real message from inside
        var message = isErrorEvent$1(msg) ? msg.message : msg;
        var name = 'Error';
        var groups = message.match(ERROR_TYPES_RE);
        if (groups) {
            name = groups[1];
            message = groups[2];
        }
        var event = {
            exception: {
                values: [
                    {
                        type: name,
                        value: message,
                    },
                ],
            },
        };
        return _enhanceEventWithInitialFrame(event, url, line, column);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _enhanceEventWithInitialFrame(event, url, line, column) {
        // event.exception
        var e = (event.exception = event.exception || {});
        // event.exception.values
        var ev = (e.values = e.values || []);
        // event.exception.values[0]
        var ev0 = (ev[0] = ev[0] || {});
        // event.exception.values[0].stacktrace
        var ev0s = (ev0.stacktrace = ev0.stacktrace || {});
        // event.exception.values[0].stacktrace.frames
        var ev0sf = (ev0s.frames = ev0s.frames || []);
        var colno = isNaN(parseInt(column, 10)) ? undefined : column;
        var lineno = isNaN(parseInt(line, 10)) ? undefined : line;
        var filename = isString(url) && url.length > 0 ? url : getLocationHref();
        // event.exception.values[0].stacktrace.frames
        if (ev0sf.length === 0) {
            ev0sf.push({
                colno: colno,
                filename: filename,
                function: '?',
                in_app: true,
                lineno: lineno,
            });
        }
        return event;
    }
    function globalHandlerLog(type) {
        logger.log("Global Handler attached: ".concat(type));
    }
    function getOptions() {
        var client = getClient();
        var options = (client && client.getOptions()) || {
            stackParser: function () { return []; },
            attachStacktrace: false,
        };
        return options;
    }

    var INTEGRATION_NAME$2 = 'HttpContext';
    var _httpContextIntegration = (function () {
        return {
            name: INTEGRATION_NAME$2,
            // TODO v8: Remove this
            setupOnce: function () { },
            preprocessEvent: function (event) {
                // if none of the information we want exists, don't bother
                if (!WINDOW.navigator && !WINDOW.location && !WINDOW.document) {
                    return;
                }
                // grab as much info as exists and add it to the event
                var url = (event.request && event.request.url) || (WINDOW.location && WINDOW.location.href);
                var referrer = (WINDOW.document || {}).referrer;
                var userAgent = (WINDOW.navigator || {}).userAgent;
                var headers = __assign(__assign(__assign({}, (event.request && event.request.headers)), (referrer && { Referer: referrer })), (userAgent && { 'User-Agent': userAgent }));
                var request = __assign(__assign(__assign({}, event.request), (url && { url: url })), { headers: headers });
                event.request = request;
            },
        };
    });
    var httpContextIntegration = defineIntegration(_httpContextIntegration);
    /**
     * HttpContext integration collects information about HTTP request headers.
     * @deprecated Use `httpContextIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var HttpContext = convertIntegrationFnToClass(INTEGRATION_NAME$2, httpContextIntegration);

    var DEFAULT_KEY = 'cause';
    var DEFAULT_LIMIT = 5;
    var INTEGRATION_NAME$1 = 'LinkedErrors';
    var _linkedErrorsIntegration = (function (options) {
        if (options === void 0) { options = {}; }
        var limit = options.limit || DEFAULT_LIMIT;
        var key = options.key || DEFAULT_KEY;
        return {
            name: INTEGRATION_NAME$1,
            // TODO v8: Remove this
            setupOnce: function () { },
            preprocessEvent: function (event, hint, client) {
                var options = client.getOptions();
                applyAggregateErrorsToEvent(
                // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
                exceptionFromError, options.stackParser, options.maxValueLength, key, limit, event, hint);
            },
        };
    });
    var linkedErrorsIntegration = defineIntegration(_linkedErrorsIntegration);
    /**
     * Aggregrate linked errors in an event.
     * @deprecated Use `linkedErrorsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var LinkedErrors = convertIntegrationFnToClass(INTEGRATION_NAME$1, linkedErrorsIntegration);

    var DEFAULT_EVENT_TARGET = [
        'EventTarget',
        'Window',
        'Node',
        'ApplicationCache',
        'AudioTrackList',
        'BroadcastChannel',
        'ChannelMergerNode',
        'CryptoOperation',
        'EventSource',
        'FileReader',
        'HTMLUnknownElement',
        'IDBDatabase',
        'IDBRequest',
        'IDBTransaction',
        'KeyOperation',
        'MediaController',
        'MessagePort',
        'ModalWindow',
        'Notification',
        'SVGElementInstance',
        'Screen',
        'SharedWorker',
        'TextTrack',
        'TextTrackCue',
        'TextTrackList',
        'WebSocket',
        'WebSocketWorker',
        'Worker',
        'XMLHttpRequest',
        'XMLHttpRequestEventTarget',
        'XMLHttpRequestUpload',
    ];
    var INTEGRATION_NAME = 'TryCatch';
    var _browserApiErrorsIntegration = (function (options) {
        if (options === void 0) { options = {}; }
        var _options = __assign({ XMLHttpRequest: true, eventTarget: true, requestAnimationFrame: true, setInterval: true, setTimeout: true }, options);
        return {
            name: INTEGRATION_NAME,
            // TODO: This currently only works for the first client this is setup
            // We may want to adjust this to check for client etc.
            setupOnce: function () {
                if (_options.setTimeout) {
                    fill(WINDOW, 'setTimeout', _wrapTimeFunction);
                }
                if (_options.setInterval) {
                    fill(WINDOW, 'setInterval', _wrapTimeFunction);
                }
                if (_options.requestAnimationFrame) {
                    fill(WINDOW, 'requestAnimationFrame', _wrapRAF);
                }
                if (_options.XMLHttpRequest && 'XMLHttpRequest' in WINDOW) {
                    fill(XMLHttpRequest.prototype, 'send', _wrapXHR);
                }
                var eventTargetOption = _options.eventTarget;
                if (eventTargetOption) {
                    var eventTarget = Array.isArray(eventTargetOption) ? eventTargetOption : DEFAULT_EVENT_TARGET;
                    eventTarget.forEach(_wrapEventTarget);
                }
            },
        };
    });
    var browserApiErrorsIntegration = defineIntegration(_browserApiErrorsIntegration);
    /**
     * Wrap timer functions and event targets to catch errors and provide better meta data.
     * @deprecated Use `browserApiErrorsIntegration()` instead.
     */
    // eslint-disable-next-line deprecation/deprecation
    var TryCatch = convertIntegrationFnToClass(INTEGRATION_NAME, browserApiErrorsIntegration);
    function _wrapTimeFunction(original) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var originalCallback = args[0];
            args[0] = wrap$1(originalCallback, {
                mechanism: {
                    data: { function: getFunctionName(original) },
                    handled: false,
                    type: 'instrument',
                },
            });
            return original.apply(this, args);
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function _wrapRAF(original) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function (callback) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return original.apply(this, [
                wrap$1(callback, {
                    mechanism: {
                        data: {
                            function: 'requestAnimationFrame',
                            handler: getFunctionName(original),
                        },
                        handled: false,
                        type: 'instrument',
                    },
                }),
            ]);
        };
    }
    function _wrapXHR(originalSend) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            var xhr = this;
            var xmlHttpRequestProps = ['onload', 'onerror', 'onprogress', 'onreadystatechange'];
            xmlHttpRequestProps.forEach(function (prop) {
                if (prop in xhr && typeof xhr[prop] === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    fill(xhr, prop, function (original) {
                        var wrapOptions = {
                            mechanism: {
                                data: {
                                    function: prop,
                                    handler: getFunctionName(original),
                                },
                                handled: false,
                                type: 'instrument',
                            },
                        };
                        // If Instrument integration has been called before TryCatch, get the name of original function
                        var originalFunction = getOriginalFunction(original);
                        if (originalFunction) {
                            wrapOptions.mechanism.data.handler = getFunctionName(originalFunction);
                        }
                        // Otherwise wrap directly
                        return wrap$1(original, wrapOptions);
                    });
                }
            });
            return originalSend.apply(this, args);
        };
    }
    function _wrapEventTarget(target) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var globalObject = WINDOW;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        var proto = globalObject[target] && globalObject[target].prototype;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return;
        }
        fill(proto, 'addEventListener', function (original) {
            return function (eventName, fn, options) {
                try {
                    if (typeof fn.handleEvent === 'function') {
                        // ESlint disable explanation:
                        //  First, it is generally safe to call `wrap` with an unbound function. Furthermore, using `.bind()` would
                        //  introduce a bug here, because bind returns a new function that doesn't have our
                        //  flags(like __sentry_original__) attached. `wrap` checks for those flags to avoid unnecessary wrapping.
                        //  Without those flags, every call to addEventListener wraps the function again, causing a memory leak.
                        // eslint-disable-next-line @typescript-eslint/unbound-method
                        fn.handleEvent = wrap$1(fn.handleEvent, {
                            mechanism: {
                                data: {
                                    function: 'handleEvent',
                                    handler: getFunctionName(fn),
                                    target: target,
                                },
                                handled: false,
                                type: 'instrument',
                            },
                        });
                    }
                }
                catch (err) {
                    // can sometimes get 'Permission denied to access property "handle Event'
                }
                return original.apply(this, [
                    eventName,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrap$1(fn, {
                        mechanism: {
                            data: {
                                function: 'addEventListener',
                                handler: getFunctionName(fn),
                                target: target,
                            },
                            handled: false,
                            type: 'instrument',
                        },
                    }),
                    options,
                ]);
            };
        });
        fill(proto, 'removeEventListener', function (originalRemoveEventListener) {
            return function (eventName, fn, options) {
                /**
                 * There are 2 possible scenarios here:
                 *
                 * 1. Someone passes a callback, which was attached prior to Sentry initialization, or by using unmodified
                 * method, eg. `document.addEventListener.call(el, name, handler). In this case, we treat this function
                 * as a pass-through, and call original `removeEventListener` with it.
                 *
                 * 2. Someone passes a callback, which was attached after Sentry was initialized, which means that it was using
                 * our wrapped version of `addEventListener`, which internally calls `wrap` helper.
                 * This helper "wraps" whole callback inside a try/catch statement, and attached appropriate metadata to it,
                 * in order for us to make a distinction between wrapped/non-wrapped functions possible.
                 * If a function was wrapped, it has additional property of `__sentry_wrapped__`, holding the handler.
                 *
                 * When someone adds a handler prior to initialization, and then do it again, but after,
                 * then we have to detach both of them. Otherwise, if we'd detach only wrapped one, it'd be impossible
                 * to get rid of the initial handler and it'd stick there forever.
                 */
                var wrappedEventHandler = fn;
                try {
                    var originalEventHandler = wrappedEventHandler && wrappedEventHandler.__sentry_wrapped__;
                    if (originalEventHandler) {
                        originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
                    }
                }
                catch (e) {
                    // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
                }
                return originalRemoveEventListener.call(this, eventName, wrappedEventHandler, options);
            };
        });
    }

    /** @deprecated Use `getDefaultIntegrations(options)` instead. */
    var defaultIntegrations = [
        inboundFiltersIntegration(),
        functionToStringIntegration(),
        browserApiErrorsIntegration(),
        breadcrumbsIntegration(),
        globalHandlersIntegration(),
        linkedErrorsIntegration(),
        dedupeIntegration(),
        httpContextIntegration(),
    ];
    /** Get the default integrations for the browser SDK. */
    function getDefaultIntegrations(_options) {
        // We return a copy of the defaultIntegrations here to avoid mutating this
        return __spreadArray([], __read(defaultIntegrations), false);
    }
    /**
     * The Sentry Browser SDK Client.
     *
     * To use this SDK, call the {@link init} function as early as possible when
     * loading the web page. To set context information or send manual events, use
     * the provided methods.
     *
     * @example
     *
     * ```
     *
     * import { init } from '@sentry/browser';
     *
     * init({
     *   dsn: '__DSN__',
     *   // ...
     * });
     * ```
     *
     * @example
     * ```
     *
     * import { configureScope } from '@sentry/browser';
     * configureScope((scope: Scope) => {
     *   scope.setExtra({ battery: 0.7 });
     *   scope.setTag({ user_mode: 'admin' });
     *   scope.setUser({ id: '4711' });
     * });
     * ```
     *
     * @example
     * ```
     *
     * import { addBreadcrumb } from '@sentry/browser';
     * addBreadcrumb({
     *   message: 'My Breadcrumb',
     *   // ...
     * });
     * ```
     *
     * @example
     *
     * ```
     *
     * import * as Sentry from '@sentry/browser';
     * Sentry.captureMessage('Hello, world!');
     * Sentry.captureException(new Error('Good bye'));
     * Sentry.captureEvent({
     *   message: 'Manual',
     *   stacktrace: [
     *     // ...
     *   ],
     * });
     * ```
     *
     * @see {@link BrowserOptions} for documentation on configuration options.
     */
    function init(options) {
        if (options === void 0) { options = {}; }
        if (options.defaultIntegrations === undefined) {
            options.defaultIntegrations = getDefaultIntegrations();
        }
        if (options.release === undefined) {
            // This allows build tooling to find-and-replace __SENTRY_RELEASE__ to inject a release value
            if (typeof __SENTRY_RELEASE__ === 'string') {
                options.release = __SENTRY_RELEASE__;
            }
            // This supports the variable that sentry-webpack-plugin injects
            if (WINDOW.SENTRY_RELEASE && WINDOW.SENTRY_RELEASE.id) {
                options.release = WINDOW.SENTRY_RELEASE.id;
            }
        }
        if (options.autoSessionTracking === undefined) {
            options.autoSessionTracking = true;
        }
        if (options.sendClientReports === undefined) {
            options.sendClientReports = true;
        }
        var clientOptions = __assign(__assign({}, options), { stackParser: stackParserFromStackParserOptions(options.stackParser || defaultStackParser), integrations: getIntegrationsToSetup(options), transport: options.transport || (supportsFetch() ? makeFetchTransport : makeXHRTransport) });
        initAndBind(BrowserClient, clientOptions);
        if (options.autoSessionTracking) {
            startSessionTracking();
        }
    }
    var showReportDialog = function (
    // eslint-disable-next-line deprecation/deprecation
    options,
    // eslint-disable-next-line deprecation/deprecation
    hub) {
        if (options === void 0) { options = {}; }
        if (hub === void 0) { hub = getCurrentHub(); }
        // doesn't work without a document (React Native)
        if (!WINDOW.document) {
            DEBUG_BUILD && logger.error('Global document not defined in showReportDialog call');
            return;
        }
        // eslint-disable-next-line deprecation/deprecation
        var _a = hub.getStackTop(), client = _a.client, scope = _a.scope;
        var dsn = options.dsn || (client && client.getDsn());
        if (!dsn) {
            DEBUG_BUILD && logger.error('DSN not configured for showReportDialog call');
            return;
        }
        if (scope) {
            options.user = __assign(__assign({}, scope.getUser()), options.user);
        }
        if (!options.eventId) {
            // eslint-disable-next-line deprecation/deprecation
            options.eventId = hub.lastEventId();
        }
        var script = WINDOW.document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = getReportDialogEndpoint(dsn, options);
        if (options.onLoad) {
            script.onload = options.onLoad;
        }
        var onClose = options.onClose;
        if (onClose) {
            var reportDialogClosedMessageHandler_1 = function (event) {
                if (event.data === '__sentry_reportdialog_closed__') {
                    try {
                        onClose();
                    }
                    finally {
                        WINDOW.removeEventListener('message', reportDialogClosedMessageHandler_1);
                    }
                }
            };
            WINDOW.addEventListener('message', reportDialogClosedMessageHandler_1);
        }
        var injectionPoint = WINDOW.document.head || WINDOW.document.body;
        if (injectionPoint) {
            injectionPoint.appendChild(script);
        }
        else {
            DEBUG_BUILD && logger.error('Not injecting report dialog. No injection point found in HTML');
        }
    };
    /**
     * This function is here to be API compatible with the loader.
     * @hidden
     */
    function forceLoad() {
        // Noop
    }
    /**
     * This function is here to be API compatible with the loader.
     * @hidden
     */
    function onLoad(callback) {
        callback();
    }
    /**
     * Wrap code within a try/catch block so the SDK is able to capture errors.
     *
     * @deprecated This function will be removed in v8.
     * It is not part of Sentry's official API and it's easily replaceable by using a try/catch block
     * and calling Sentry.captureException.
     *
     * @param fn A function to wrap.
     *
     * @returns The result of wrapped function call.
     */
    // TODO(v8): Remove this function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function wrap(fn) {
        return wrap$1(fn)();
    }
    /**
     * Enable automatic Session Tracking for the initial page load.
     */
    function startSessionTracking() {
        if (typeof WINDOW.document === 'undefined') {
            DEBUG_BUILD && logger.warn('Session tracking in non-browser environment with @sentry/browser is not supported.');
            return;
        }
        // The session duration for browser sessions does not track a meaningful
        // concept that can be used as a metric.
        // Automatically captured sessions are akin to page views, and thus we
        // discard their duration.
        startSession({ ignoreDuration: true });
        captureSession();
        // We want to create a session for every navigation as well
        addHistoryInstrumentationHandler(function (_a) {
            var from = _a.from, to = _a.to;
            // Don't create an additional session for the initial route or if the location did not change
            if (from !== undefined && from !== to) {
                startSession({ ignoreDuration: true });
                captureSession();
            }
        });
    }
    /**
     * Captures user feedback and sends it to Sentry.
     */
    function captureUserFeedback(feedback) {
        var client = getClient();
        if (client) {
            client.captureUserFeedback(feedback);
        }
    }

    /* eslint-disable deprecation/deprecation */

    var BrowserIntegrations = /*#__PURE__*/Object.freeze({
        __proto__: null,
        GlobalHandlers: GlobalHandlers,
        TryCatch: TryCatch,
        Breadcrumbs: Breadcrumbs,
        LinkedErrors: LinkedErrors,
        HttpContext: HttpContext,
        Dedupe: Dedupe
    });

    var windowIntegrations = {};
    // This block is needed to add compatibility with the integrations packages when used with a CDN
    if (WINDOW.Sentry && WINDOW.Sentry.Integrations) {
        windowIntegrations = WINDOW.Sentry.Integrations;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var INTEGRATIONS = __assign(__assign(__assign({}, windowIntegrations), Integrations), BrowserIntegrations);

    // This is exported so the loader does not fail when switching off Replay/Tracing
    // TODO (v8): Remove this as it was only needed for backwards compatibility
    // eslint-disable-next-line deprecation/deprecation
    INTEGRATIONS.Replay = ReplayShim;
    // eslint-disable-next-line deprecation/deprecation
    INTEGRATIONS.BrowserTracing = BrowserTracingShim;
    // Note: We do not export a shim for `Span` here, as that is quite complex and would blow up the bundle

    exports.Breadcrumbs = Breadcrumbs;
    exports.BrowserClient = BrowserClient;
    exports.BrowserTracing = BrowserTracingShim;
    exports.Dedupe = Dedupe;
    exports.Feedback = FeedbackShim;
    exports.FunctionToString = FunctionToString;
    exports.GlobalHandlers = GlobalHandlers;
    exports.HttpContext = HttpContext;
    exports.Hub = Hub;
    exports.InboundFilters = InboundFilters;
    exports.Integrations = INTEGRATIONS;
    exports.LinkedErrors = LinkedErrors;
    exports.Replay = ReplayShim;
    exports.SDK_VERSION = SDK_VERSION;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_OP = SEMANTIC_ATTRIBUTE_SENTRY_OP;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE;
    exports.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
    exports.Scope = Scope;
    exports.TryCatch = TryCatch;
    exports.WINDOW = WINDOW;
    exports.addBreadcrumb = addBreadcrumb;
    exports.addEventProcessor = addEventProcessor;
    exports.addGlobalEventProcessor = addGlobalEventProcessor;
    exports.addIntegration = addIntegration;
    exports.addTracingExtensions = addTracingExtensions;
    exports.breadcrumbsIntegration = breadcrumbsIntegration;
    exports.browserApiErrorsIntegration = browserApiErrorsIntegration;
    exports.browserTracingIntegration = browserTracingIntegrationShim;
    exports.captureEvent = captureEvent;
    exports.captureException = captureException;
    exports.captureMessage = captureMessage;
    exports.captureSession = captureSession;
    exports.captureUserFeedback = captureUserFeedback;
    exports.chromeStackLineParser = chromeStackLineParser;
    exports.close = close;
    exports.configureScope = configureScope;
    exports.continueTrace = continueTrace;
    exports.createTransport = createTransport;
    exports.createUserFeedbackEnvelope = createUserFeedbackEnvelope;
    exports.dedupeIntegration = dedupeIntegration;
    exports.defaultIntegrations = defaultIntegrations;
    exports.defaultStackLineParsers = defaultStackLineParsers;
    exports.defaultStackParser = defaultStackParser;
    exports.endSession = endSession;
    exports.eventFromException = eventFromException;
    exports.eventFromMessage = eventFromMessage;
    exports.exceptionFromError = exceptionFromError;
    exports.feedbackIntegration = feedbackIntegration;
    exports.flush = flush;
    exports.forceLoad = forceLoad;
    exports.functionToStringIntegration = functionToStringIntegration;
    exports.geckoStackLineParser = geckoStackLineParser;
    exports.getActiveSpan = getActiveSpan;
    exports.getClient = getClient;
    exports.getCurrentHub = getCurrentHub;
    exports.getCurrentScope = getCurrentScope;
    exports.getDefaultIntegrations = getDefaultIntegrations;
    exports.getHubFromCarrier = getHubFromCarrier;
    exports.globalHandlersIntegration = globalHandlersIntegration;
    exports.httpContextIntegration = httpContextIntegration;
    exports.inboundFiltersIntegration = inboundFiltersIntegration;
    exports.init = init;
    exports.isInitialized = isInitialized;
    exports.lastEventId = lastEventId;
    exports.linkedErrorsIntegration = linkedErrorsIntegration;
    exports.makeFetchTransport = makeFetchTransport;
    exports.makeMain = makeMain;
    exports.makeXHRTransport = makeXHRTransport;
    exports.metrics = metrics;
    exports.onLoad = onLoad;
    exports.opera10StackLineParser = opera10StackLineParser;
    exports.opera11StackLineParser = opera11StackLineParser;
    exports.parameterize = parameterize;
    exports.replayIntegration = replayIntegration;
    exports.setContext = setContext;
    exports.setCurrentClient = setCurrentClient;
    exports.setExtra = setExtra;
    exports.setExtras = setExtras;
    exports.setTag = setTag;
    exports.setTags = setTags;
    exports.setUser = setUser;
    exports.showReportDialog = showReportDialog;
    exports.startInactiveSpan = startInactiveSpan;
    exports.startSession = startSession;
    exports.startSpan = startSpan;
    exports.startSpanManual = startSpanManual;
    exports.startTransaction = startTransaction;
    exports.winjsStackLineParser = winjsStackLineParser;
    exports.withActiveSpan = withActiveSpan;
    exports.withIsolationScope = withIsolationScope;
    exports.withScope = withScope;
    exports.wrap = wrap;

    // Sentry ES5 polyfills
    if (!('includes' in Array.prototype)) {
      Array.prototype.includes = function (searchElement) {
        return this.indexOf(searchElement) > -1;
      };
    }
    if (!('find' in Array.prototype)) {
      Array.prototype.find = function (callback) {
        for (var i = 0; i < this.length; i++) {
          if (callback(this[i])) {
            return this[i];
          }
        }
      };
    }
    if (!('findIndex' in Array.prototype)) {
      Array.prototype.findIndex = function (callback) {
        for (var i = 0; i < this.length; i++) {
          if (callback(this[i])) {
            return i;
          }
        }
        return -1;
      };
    }
    if (!('includes' in String.prototype)) {
      String.prototype.includes = function (searchElement) {
        return this.indexOf(searchElement) > -1;
      };
    }
    if (!('startsWith' in String.prototype)) {
      String.prototype.startsWith = function (searchElement) {
        return this.indexOf(searchElement) === 0;
      };
    }
    if (!('endsWith' in String.prototype)) {
      String.prototype.endsWith = function (searchElement) {
        var i = this.indexOf(searchElement);
        return i > -1 && i === this.length - searchElement.length;
      };
    }


    return exports;

})({});
//# sourceMappingURL=bundle.es5.js.map
