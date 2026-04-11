"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const user_route_1 = require("../modules/user/user.route");
const stats_route_1 = require("../modules/stats/stats.route");
const contact_route_1 = require("../modules/contact/contact.route");
const booking_route_1 = require("../modules/booking/booking.route");
const payment_route_1 = require("../modules/payment/payment.route");
const otp_route_1 = require("../modules/otp/otp.route");
const review_route_1 = require("../modules/review/review.route");
const message_route_1 = require("../modules/message/message.route");
const blog_route_1 = require("../modules/blog/blog.route");
const product_route_1 = require("../modules/product/product.route");
const category_route_1 = require("../modules/category/category.route");
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
        path: "/category",
        route: category_route_1.CategoryRoutes
    },
    {
        path: "/product",
        route: product_route_1.ProductRoutes
    },
    {
        path: "/booking",
        route: booking_route_1.BookingRoutes
    },
    {
        path: "/review",
        route: review_route_1.ReviewRoutes
    },
    {
        path: "/payment",
        route: payment_route_1.PaymentRoutes
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
    },
    {
        path: "/blog",
        route: blog_route_1.BlogRoutes
    },
    {
        path: "/message",
        route: message_route_1.MessageRoutes
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
