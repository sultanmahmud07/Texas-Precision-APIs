import { Router } from "express";
import { ContactController } from "./contact.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createContactZodSchema } from "./contact.validation";

const router = Router();

router.post("/create", 
      validateRequest(createContactZodSchema), 
      ContactController.createContact);

router.get("/all-contact",checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ContactController.getContactByAdmin);
router.get("/:id", ContactController.getSingleContact);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ContactController.deleteContact);

export const ContactRoutes = router;
