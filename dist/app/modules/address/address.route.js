"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("../user/user.interface");
const address_controller_1 = require("./address.controller");
const address_validation_1 = require("./address.validation");
const router = (0, express_1.Router)();
// PUBLIC: Users submitting their address on the landing page
router.post("/create", (0, validateRequest_1.validateRequest)(address_validation_1.createAddressSchema), address_controller_1.AddressController.createAddress);
// ADMIN ONLY: Managing the addresses
router.get("/", address_controller_1.AddressController.getAllAddresses);
router.get("/:id", address_controller_1.AddressController.getSingleAddress);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(address_validation_1.updateAddressSchema), address_controller_1.AddressController.updateAddress);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), address_controller_1.AddressController.deleteAddress);
exports.AddressRoutes = router;
