'use strict';
const decoder = module.exports;
decoder.decodeCronTime = decodeCronTime;

const timer = {
    second: -1,
    min: -1,
    hour: -1,
    dom: -1,
    month: -1,
    dow: -1,
    executeTime: -1
};

const limit = [[0,59],[0,59],[0,24],[1,31],[1,12],[0,6]];

function nexExcuteTime(time, timer) {
    //add 1s to the time so it must be the next time
    time += 1000;
    const date = new Date(time);
    const nextTime = new Date(time);

    outmost:
    while (true) {
        if (!timeMatch(date.getMonth(), timer.month)) {
            const nextMonth = nextTime(date.getMonth(), timer.month);
            if (nextMonth < date.getMonth()) {
                date.setYear(date.getYear() + 1);
            }
            date.setMonth(nextMonth);

            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
        }

        if (!timeMatch(date.getDate(), timer.dom)) {
            do {
                const nextDom = nextTime(date.getDate(), timer.dom) ;

                //If the date is in the next month, add month
                if (nextDom <= date.getDate()) {
                    date.setMonth(date.getMonth() + 1);
                    continue outmost;
                }

                //If the date exceed the limit, add month
                const domLimit = getDomLimit();
                if (nextDom > domLimit) {
                    date.setMonth(date.getMonth() + 1);
                    continue outmost;
                }

                date.setDate(nextDom);
            } while (!timeMatch(date.getDay(), timer.dow));

            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
        }

        if (!timeMatch(date.getHours(), timer.hour)) {
            const nextHour = nextTime(date.getHours(), timer.hour);

            if (nextHour <= date.getHours()) {
                date.setDate(date.getDate() + 1);
                continue;
            }

            date.setHours(nextHour);
            date.setMinutes(0);
            date.setSeconds(0);
        }

        if (!timeMatch(date.getMinutes(), timer.minute)) {
            const nextMinute = nextTime(date.getMinutes(), timer.minute);

            if (nextMinute <= date.getMinutes()) {
                date.setHours(date.getHours() + 1);
                continue;
            }

            date.setMinutes(nextMinute);
            date.setSeconds(0);
        }

        if (!timeMatch(date.getSeconds(), timer.seconde)) {
            const nextSecond = nextTime(date.getSeconds(), timer.seconde);

            if (nextSecond <= date.getSeconds()) {
                date.setMinutes()(date.getMinutes() + 1);
                continue;
            }

            date.setSeconds(nextSecond);
        }

        break;
    }

    return date.getTime();
}

/**
 * return the next match time of the given value
 */
function nextTime(value, cronTime) {
    if (typeof cronTime == 'number') {
        if (cronTime == -1)
            return value + 1;
        else
            return cronTime;
    } else if (Array.isArray(cronTime)) {
        if (value < cronTime[0] || value > cronTime[cronTime.length - 1])
            return cronTime[0];

        for (let i = 0; i < cronTime.length; i++)
            if (value < cronTime[i])
                return cronTime[i];
    }

    return null;
}

function timeMatch(value, cronTime) {
    if (typeof(cronTime) == 'number') {
        if (cronTime == -1)
            return true;
        if (value == cronTime)
            return true;
        return false;
    } else if (Array.isArray(cronTime)) {
        if (value < cronTime[0] || value > cronTime[cronTime.length - 1])
            return false;

        for (let i = 0; i < cronTime.length; i++)
            if (value == cronTime[i])
                return true;

        return false;
    }

    return null;
}

function getDomLimit(year, month) {
    const date = new Date(year, month, 0);

    return date.getDate();
}

function decodeCronTime(cronTime) {
    const timers = cronTime.split(/\s+/);

    if (timers.length != 6) {
        return null;
    }

    for (let i = 0; i < timers.length; i++) {
        timers[i] = (decodeTimeStr(timers[i]));

        if (!checkNum(timers[i], limit[i][0], limit[i][1])) {
            return null;
        }
    }

    return timers;
}

function decodeTimeStr(timeStr) {
    const result = {};
    const arr = [];

    if (timeStr == '*') {
        return -1;
    } else if (timeStr.search(',') > 0) {
        const timeStrArray = timeStr.split(',');
        for (let i = 0; i < timeStrArray.length; i++) {
            var time = timeStrArray[i];
            if (time.match(/^\d+-\d+$/)) {
                decodeRangeTime(result, time);
            } else if (!isNaN(timeStrArray[i]))
                result[i] = time;
            else
                return null;
        }
    } else if (timeStr.match(/^\d+-\d+$/)) {
        decodeRangeTime(result, time);
    } else if (!isNaN(timeStr)) {
        result[timeStr] = timeStr;
    } else {
        return null;
    }

    for (const key in result)
        arr.push(result[key]);

    arr.sort();

    return arr;
}

function decodeRangeTime(map, timeStr) {
    const times = timeStr.split('-');

    if (times[0] > times[1])
        return null;
    for (let i = times[0]; i <= times[1]; i++)
        map[i] = i;
}

function checkNum(nums, min, max) {
    if (nums == null)
        return false;

    if (nums == -1)
        return true;

    for (let i = 0; i < nums.length; i++) {
        if (nums[i] < min || nums[i] > max)
            return false;
    }

    return true;
}