"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("../user/user.interface");
const inspection_controller_1 = require("./inspection.controller");
const inspection_validation_1 = require("./inspection.validation");
const router = (0, express_1.Router)();
// PUBLIC: Customer submitting the booking form
router.post("/create", (0, validateRequest_1.validateRequest)(inspection_validation_1.createInspectionSchema), inspection_controller_1.InspectionController.createInspection);
// ADMIN ONLY: Managing the booked inspections
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), inspection_controller_1.InspectionController.getAllInspections);
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), inspection_controller_1.InspectionController.getSingleInspection);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(inspection_validation_1.updateInspectionSchema), inspection_controller_1.InspectionController.updateInspection);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), inspection_controller_1.InspectionController.deleteInspection);
exports.InspectionRoutes = router;
