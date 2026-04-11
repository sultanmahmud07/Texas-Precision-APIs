import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = express.Router();
 // GET /stats/tourist - Get stats for tourists
 // GET /stats/guide - Get stats for guides
 // GET /stats/analytics - Get overall analytics (admin only)
router.get(
    "/tourist",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.TOURIST),
    StatsController.getTouristStats
);
router.get(
    "/guide",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.GUIDE),
    StatsController.getGuideStats
);
router.get(
    "/analytics",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getAdminStats
);

export const StatsRoutes = router;
