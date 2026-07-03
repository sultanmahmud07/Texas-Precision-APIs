"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTo24Hour = void 0;
/* eslint-disable prefer-const */
const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12')
        hours = '00';
    if (modifier === 'PM' || modifier === 'CDT' || modifier === 'EDT') {
        hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
};
exports.convertTo24Hour = convertTo24Hour;
