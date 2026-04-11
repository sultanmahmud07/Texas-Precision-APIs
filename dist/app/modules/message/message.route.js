"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const messageRequest_controller_1 = require("./messageRequest.controller");
const router = express_1.default.Router();
router.post("/create", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), messageRequest_controller_1.MessageRequestController.createMessageRequest);
router.get("/", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), messageRequest_controller_1.MessageRequestController.getGuideMessageRequests);
// router.get(
//     "/:id",
//     MessageRequestController.getSingleMessageRequest
// );
// router.patch(
//     "/:id",
//     checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
//     PaymentController.updatePayment
// );
// router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PaymentController.deletePayment);
exports.MessageRoutes = router;
