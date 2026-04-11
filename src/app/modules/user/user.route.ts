import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router()

router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)// Admin delete any user, user can delete own profile
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.deleteUser
)
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)
router.get("/all-admin", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllAdmin)
router.get("/deleted-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllDeletedUsers)
router.get("/unauthorized-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUnauthorizedUsers)
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.get("/:id", UserControllers.getSingleUser)
router.get("/guide/featured", UserControllers.getFeaturedGuide)
router.get("/tourist/featured", UserControllers.getFeaturedTourist)
router.get("/guide/search", UserControllers.getSearchGuide)
router.get("/guide/:id", UserControllers.getGuideDetails)
router.patch("/profile",
  checkAuth(...Object.values(Role)),
  multerUpload.single("file"),
  validateRequest(updateUserZodSchema),
  UserControllers.updateUser)
router.patch("/:id",
   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateUserZodSchema),
  UserControllers.updateUserByAdmin)

export const UserRoutes = router