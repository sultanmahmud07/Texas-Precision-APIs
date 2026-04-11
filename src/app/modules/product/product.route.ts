import express from "express";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ProductController } from "./product.controller";
import {
    createProductZodSchema,
    updateProductZodSchema
} from "./product.validation";

const router = express.Router();
router.get("/", ProductController.getAllProducts);
router.get("/short-info", ProductController.getProductShortInfo);

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "images", maxCount: 10 },
        { name: "featureImages", maxCount: 10 }
    ]),
    validateRequest(createProductZodSchema),
    ProductController.createProduct
);

router.get(
    "/:slug",
    ProductController.getSingleProduct
);
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.array("files"),
    validateRequest(updateProductZodSchema),
    ProductController.updateProduct
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ProductController.deleteProduct);




export const ProductRoutes = router