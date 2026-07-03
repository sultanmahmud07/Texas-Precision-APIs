"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("../user/user.interface");
const availability_validation_1 = require("./availability.validation");
const availability_controller_1 = require("./availability.controller");
const router = (0, express_1.Router)();
// ADMIN: Set availability for a date
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(availability_validation_1.createAvailabilitySchema), availability_controller_1.AvailabilityController.createAvailability);
// PUBLIC: Get all available dates
router.get("/", availability_controller_1.AvailabilityController.getAllAvailable);
// PUBLIC: Get active dates for the calendar month view
router.get("/dates", availability_controller_1.AvailabilityController.getAvailableDates);
// PUBLIC: Get exact slots for a clicked date
router.get("/:date", availability_controller_1.AvailabilityController.getSingleDateAvailability);
exports.AvailabilityRoutes = router;
