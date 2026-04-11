import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { MessageRequestController } from "./messageRequest.controller";


const router = express.Router();


router.post("/create", checkAuth(...Object.values(Role)), MessageRequestController.createMessageRequest);
router.get("/", checkAuth(...Object.values(Role)), MessageRequestController.getGuideMessageRequests);
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

export const MessageRoutes = router;