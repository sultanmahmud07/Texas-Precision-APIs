"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("../user/user.interface");
const tour_validation_1 = require("./tour.validation");
const tour_controller_1 = require("./tour.controller");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
// Public
router.get("/", tour_controller_1.TourController.getAllTours);
router.get("/search", tour_controller_1.TourController.getSearchTours);
router.get("/:slug", tour_controller_1.TourController.getTourBySlug);
// Authenticated routes
router.get("/guide/all", (0, checkAuth_1.checkAuth)(user_interface_1.Role.GUIDE), tour_controller_1.TourController.getToursByGuide);
// router.patch("/:id", checkAuth(Role.GUIDE, Role.ADMIN, Role.SUPER_ADMIN), TourController.updateTour);
// Create Tour (GUIDE, ADMIN)
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.GUIDE, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.array("files"), (0, validateRequest_1.validateRequest)(tour_validation_1.createTourZodSchema), tour_controller_1.TourController.createTour);
router.patch("/update/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.GUIDE, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.array("files"), (0, validateRequest_1.validateRequest)(tour_validation_1.updateTourZodSchema), tour_controller_1.TourController.updateTour);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.GUIDE, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), tour_controller_1.TourController.deleteTour);
exports.TourRoutes = router;
