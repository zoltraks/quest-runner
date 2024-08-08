class Utils {

    getTimeString = date => {
        let μ = '';
        if (!date) {
            const { hrtime } = require('node:process');
            μ = '.' + ((hrtime.bigint() % 1000000000n / 1000n) + '').padStart(6, '0');
            date = new Date();
        } else {
            μ = '.' + String(date.getMilliseconds()).padStart(3, '0');
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        const text = `${year}-${month}-${day} ${hour}:${minute}:${second}${μ}`;
        return text;
    };

    parseTime = time => {
        if (!time) return null;
        const pattern = /(?:(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2}))?(?:\s+(?<hour>[0-9]{2}):(?<minute>[0-9]{2}):(?<second>[0-9]{2})(?:\.(?<milli>[0-9]{3}))?)?/;
        const match = pattern.exec(time);
        const now = new Date();
        const year = match.groups.year || now.getFullYear();
        const month = typeof match.groups.month !== 'undefined' ? match.groups.month - 1 : now.getMonth();
        const day = match.groups.day || now.getDate();
        const hour = match.groups.hour || 0;
        const minute = match.groups.minute || 0;
        const second = match.groups.second || 0;
        const milli = match.groups.milli || 0;
        const result = new Date(year, month, day, hour, minute, second, milli);
        return result;
    }

    getTimeDifference = (one, two) => {
        if (!two) two = new Date();
        if (typeof one === 'string') one = this.parseTime(one);
        if (typeof two === 'string') two = this.parseTime(two);
        let past = one > two;
        if (past) [one, two] = [two, one];
        let difference = two.getTime() - one.getTime();
        const total = { difference };
        let days = Math.floor(difference / (1000 * 60 * 60 * 24));
        total.days = Math.floor(total.difference / (1000 * 60 * 60 * 24));
        difference -= days * (1000 * 60 * 60 * 24);
        let hours = Math.floor(difference / (1000 * 60 * 60));
        total.hours = Math.floor(total.difference / (1000 * 60 * 60));
        difference -= hours * (1000 * 60 * 60);
        let minutes = Math.floor(difference / (1000 * 60));
        total.minutes = Math.floor(total.difference / (1000 * 60));
        difference -= minutes * (1000 * 60);
        let seconds = Math.floor(difference / 1000);
        total.seconds = Math.floor(total.difference / 1000);
        difference -= seconds * 1000;
        let milliseconds = difference;
        total.milliseconds = total.difference;
        delete total.difference;
        let result = {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds,
            past,
            total,
        };
        return result;
    }

    findIndexCaseInsensitive = (array, field, value) => array.findIndex(object => object[field]?.toLowerCase() === value.toLowerCase());

    findIndexDeepCaseInsensitive = (array, field, value) => array.findIndex(object => {
        if (value == undefined && object[field] == undefined) return true;
        if (object[field] == undefined || value == undefined) return false;
        if (Array.isArray(object[field])) {
            for (const element of object[field]) {
                if (element == undefined) continue;
                if (element.toLowerCase() === value.toLowerCase()) return true;
            }
        }
        if (('' + object[field]).toLowerCase() === value.toLowerCase()) return true;
        return false;
    });

    getRandomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    getProtocol = url => {
        if (url == undefined) return url;
        const regex = /^([^:]+):\//;
        const match = url.match(regex);
        if (!match) return '';
        return match[1];
    }

    stringToBoolean = value => {
        if (value == undefined) return false;
        if (value === false || value === 0 || value === '' || value === '0') return false;
        if (typeof value === 'string' && 0 <= ['FALSE', 'NULL', ''].indexOf(value.trim().toUpperCase())) return false;
        return true;
    }

    stringLimit = (text, length = 100, suffix = '...') => {
        if (text == undefined) return text;
        if (length <= 0) return '';
        if (typeof (text) === 'object') return text;
        if (typeof text === 'number' || typeof text === 'boolean') text = '' + text;
        if (text.length > length) {
            if (typeof (suffix) !== 'string') suffix = '';
            if (suffix.length > length) suffix = suffix.slice(-length);
            text = text.substring(0, length - suffix.length) + suffix;
        }
        return text;
    }

    squeeze = (array, limit = 10, separator = '...') => {
        if (array == undefined) return array;
        if (typeof array !== 'object' || !Array.isArray(array)) return array;
        if (array.length <= limit) return array;
        if (separator == undefined) {
            const half = Math.floor(limit / 2);
            const result = [ ...array.slice(0, half), ...array.slice(half - limit) ];
            return result;
        } else {
            const half = Math.floor((limit - 1) / 2);
            const result = [ ...array.slice(0, half), separator, ...array.slice(1 + half - limit) ];
            return result;
        }
    };

}

module.exports = new Utils;
