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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const review_service_1 = require("./review.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
exports.ReviewController = {
    createReview: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.user;
        const result = yield review_service_1.ReviewService.createReview(req.body, user.userId);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.CREATED,
            message: "Review created successfully",
            data: result.data,
        });
    })),
    getReviewsByTour: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.query;
        const result = yield review_service_1.ReviewService.getReviewsByTour(req.params.tourId, query);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "Reviews retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    })),
    getAllReviews: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.query;
        const result = yield review_service_1.ReviewService.getAllReviews(query);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "Reviews all retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    })),
    getReviewsByGuide: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.query;
        const result = yield review_service_1.ReviewService.getReviewsByGuide(req.params.guideId, query);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "Guide reviews retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    })),
    getReviewsByTourist: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.query;
        const result = yield review_service_1.ReviewService.getReviewsByTourist(req.params.touristId, query);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "Tourist reviews retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    })),
    getMyReviews: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.query;
        const decodeToken = req.user;
        const result = yield review_service_1.ReviewService.getMyReviews(decodeToken._id, query);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "My reviews retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    })),
    updateReview: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const decodeToken = req.user;
        const result = yield review_service_1.ReviewService.updateReview(req.params.id, decodeToken._id, req.body);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "Review updated successfully",
            data: result.data,
        });
    })),
    deleteReview: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const decodeToken = req.user;
        yield review_service_1.ReviewService.deleteReview(req.params.id, decodeToken._id);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "Review deleted successfully",
            data: null,
        });
    })),
};
