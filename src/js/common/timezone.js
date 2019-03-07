/**
 * @fileoverview timezone
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var MIN_TO_MS = 60 * 1000;
var SYSTEM_OFFSET_MS = getTimezoneOffset();
var customOffsetMs = SYSTEM_OFFSET_MS;
var timezoneOffsetCallback = null;
var setByTimezoneOption = false;

var getterMethods = [
    'getDate',
    'getDay',
    'getFullYear',
    'getHours',
    'getMilliseconds',
    'getMinutes',
    'getMonth',
    'getSeconds',
    'getTime'
];

var setterMethods = [
    'setDate',
    'setFullYear',
    'setHours',
    'setMilliseconds',
    'setMinutes',
    'setMonth',
    'setSeconds'
];

/**
 * Calculate diff milliseconds for DST. Subtract the firstly loaded timezoneOffset and specific date timezoneOffset.
 * @param {number} time milliseconds
 * @returns {number} dst diff 
 */
function getDSTDiff(time) {
    return getTimezoneOffset(time) - SYSTEM_OFFSET_MS;
}

/**
 * Get the timezone offset by timestampe
 * @param {number} timestamp - timestamp
 * @returns {number} timezone offset
 * @private
 */
function getTimezoneOffset(timestamp) {
    timestamp = timestamp || Date.now();

    return new Date(timestamp).getTimezoneOffset() * MIN_TO_MS;
}

/**
 * Get the custome timezone offset by timestampe
 * @param {number} timestamp - timestamp
 * @returns {number} timezone offset
 * @private
 */
function getCustomTimezoneOffset(timestamp) {
    if (!setByTimezoneOption && timezoneOffsetCallback) {
        return timezoneOffsetCallback(timestamp) * MIN_TO_MS;
    }

    return customOffsetMs;
}

/**
 * Create a Date instance with multiple arguments
 * @param {Array} args - arguments ['2019', '2', '1']
 * @returns {Date}
 * @private
 */
function createDateWithMultipleArgs(args) {
    var time = Date.UTC.apply(null, args);
    var timezoneOffset = getTimezoneOffset(time);
    var diffDST = getDSTDiff(time);
    var localizedTime = time + timezoneOffset - diffDST;
    var localizedDate = new Date(localizedTime);

    return localizedDate;
}

/**
 * Create a Date instance with argument
 * @param {Date|TZDate|string|number} arg - arguments
 * @returns {Date}
 * @private
 */
function createDateWithSingleArg(arg) {
    var time;

    if (arg instanceof Date || arg instanceof TZDate) {
        time = arg.getTime();
    } else if ((typeof arg) === 'string') {
        time = Date.parse(arg);
    } else if ((typeof arg) === 'number') {
        time = arg;
    } else if (arg === null) {
        time = 0;
    } else {
        throw new Error('Invalid Type');
    }

    return new Date(time);
}

/**
 * Timezone Date Class
 * @constructor
 */
function TZDate() {
    var date;

    switch (arguments.length) {
        case 0:
            date = createDateWithSingleArg(Date.now());
            break;
        case 1:
            date = createDateWithSingleArg(arguments[0]);
            break;
        default:
            date = createDateWithMultipleArgs(arguments);
    }

    this._date = date;
}

/**
 * toUTCString
 * @returns {Date}
 */
TZDate.prototype.toUTCString = function() {
    return this._date.toUTCString();
};

/**
 * to Date
 * @returns {Date}
 */
TZDate.prototype.toDate = function() {
    return this._date;
};

TZDate.prototype.valueOf = function() {
    return this.getTime();
};

getterMethods.forEach(function(methodName) {
    TZDate.prototype[methodName] = function() {
        return this._date[methodName].apply(this._date, arguments);
    };
});

setterMethods.forEach(function(methodName) {
    TZDate.prototype[methodName] = function() {
        this._date[methodName].apply(this._date, arguments);

        return this.getTime();
    };
});

module.exports = {
    Date: TZDate,

    /**
     * Set offset
     * @param {number} offset - timezone offset based on minutes
     */
    setOffset: function(offset) {
        customOffsetMs = offset * MIN_TO_MS;
    },

    /**
     * Set offset
     * @param {number} offset - timezone offset based on minutes
     */
    setOffsetByTimezoneOption: function(offset) {
        this.setOffset(-offset);
        setByTimezoneOption = true;
    },

    /**
     * Get offset in case of `setByTimezoneOption`. Or return 0.
     * @returns {number} timezone offset offset minutes
     */
    getOffset: function() {
        if (setByTimezoneOption) {
            return customOffsetMs / MIN_TO_MS;
        }

        return 0;
    },

    getTimezoneOffset: getTimezoneOffset,
    getCustomTimezoneOffset: getCustomTimezoneOffset,

    /**
     * Set a callback function to get timezone offset by timestamp
     * @param {function} callback - callback function
     */
    setOffsetCallback: function(callback) {
        timezoneOffsetCallback = callback;
    },

    /**
     * (Use this method only for testing)
     * Reset system timezone and custom timezone
     */
    restoreOffset: function() {
        customOffsetMs = getTimezoneOffset();
    }
};
