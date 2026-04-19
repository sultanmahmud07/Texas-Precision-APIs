import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { AddressController } from "./address.controller";
import { createAddressSchema, updateAddressSchema } from "./address.validation";

const router = Router();

// PUBLIC: Users submitting their address on the landing page
router.post(
    "/create",
    validateRequest(createAddressSchema),
    AddressController.createAddress
);

// ADMIN ONLY: Managing the addresses
router.get("/", AddressController.getAllAddresses);
router.get("/:id", AddressController.getSingleAddress);

router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateAddressSchema),
    AddressController.updateAddress
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AddressController.deleteAddress);

export const AddressRoutes = router;