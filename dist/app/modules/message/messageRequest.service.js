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
exports.MessageRequestService = void 0;
const MessageRequest_model_1 = require("./MessageRequest.model");
const createMessageRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const request = yield MessageRequest_model_1.MessageRequest.create({
        payload
    });
    return { data: request };
});
const getGuideRequests = (guideId) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield MessageRequest_model_1.MessageRequest.find({ guide: guideId })
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    return { data: requests };
});
exports.MessageRequestService = {
    createMessageRequest,
    getGuideRequests,
};
