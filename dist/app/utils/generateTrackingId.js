"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrackingId = void 0;
const generateTrackingId = () => {
    const timestamp = Date.now().toString(36); // convert timestamp to base36
    const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // random string
    return `TRK-${timestamp}-${random}`;
};
exports.generateTrackingId = generateTrackingId;
