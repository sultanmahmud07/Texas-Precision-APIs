"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const user_route_1 = require("../modules/user/user.route");
const stats_route_1 = require("../modules/stats/stats.route");
const contact_route_1 = require("../modules/contact/contact.route");
const otp_route_1 = require("../modules/otp/otp.route");
const review_route_1 = require("../modules/review/review.route");
const availability_route_1 = require("../modules/availability/availability.route");
const address_route_1 = require("../modules/address/address.route");
const inspection_route_1 = require("../modules/inspection/inspection.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/availability",
        route: availability_route_1.AvailabilityRoutes
    },
    {
        path: "/review",
        route: review_route_1.ReviewRoutes
    },
    {
        path: "/address",
        route: address_route_1.AddressRoutes
    },
    {
        path: "/inspection",
        route: inspection_route_1.InspectionRoutes
    },
    {
        path: "/otp",
        route: otp_route_1.OtpRoutes
    },
    {
        path: "/stats",
        route: stats_route_1.StatsRoutes
    },
    {
        path: "/contact",
        route: contact_route_1.ContactRoutes
    }
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
