"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const availability_service_1 = require("./availability.service");
const createAvailability = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract the array from the 'schedules' key
    const payloadArray = req.body.schedules;
    const result = yield availability_service_1.AvailabilityService.createOrUpdateAvailability(payloadArray);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Availability created successfully",
        data: result,
    });
}));
const getAllAvailable = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield availability_service_1.AvailabilityService.getAllAvailability(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Available dates retrieved",
        data: result.data,
        meta: result.meta
    });
}));
const getAvailableDates = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Expecting query params like ?startDate=2026-04-01&endDate=2026-04-30
    const { startDate, endDate } = req.query;
    const result = yield availability_service_1.AvailabilityService.getAvailableDates(startDate, endDate);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Available dates retrieved",
        data: result, // Returns: ["2026-04-24", "2026-04-25"]
    });
}));
const getSingleDateAvailability = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.params; // e.g., 2026-04-24
    const result = yield availability_service_1.AvailabilityService.getAvailabilityByDate(date);
    // This matches your exact required JSON output!
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Slots retrieved successfully",
        data: result,
    });
}));
exports.AvailabilityController = {
    createAvailability,
    getAvailableDates,
    getAllAvailable,
    getSingleDateAvailability
};
