import { Router } from "express"
import { AuthRoutes } from "../modules/auth/auth.route"
import { UserRoutes } from "../modules/user/user.route"
import { StatsRoutes } from "../modules/stats/stats.route"
import { ContactRoutes } from "../modules/contact/contact.route"
import { BookingRoutes } from "../modules/booking/booking.route"
import { PaymentRoutes } from "../modules/payment/payment.route"
import { OtpRoutes } from "../modules/otp/otp.route"
import { ReviewRoutes } from "../modules/review/review.route"
import { MessageRoutes } from "../modules/message/message.route"
import { BlogRoutes } from "../modules/blog/blog.route"
import { ProductRoutes } from "../modules/product/product.route"
import { CategoryRoutes } from "../modules/category/category.route"

export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
     {
        path: "/category",
        route: CategoryRoutes
    },  
    {
        path: "/product",
        route: ProductRoutes
    },
    {
        path: "/booking",
        route: BookingRoutes
    },
    {
        path: "/review",
        route: ReviewRoutes
    },
    {
        path: "/payment",
        route: PaymentRoutes
    },
    {
        path: "/otp",
        route: OtpRoutes
    },
    {
        path: "/stats",
        route: StatsRoutes
    },
    {
        path: "/contact",
        route: ContactRoutes
    },
    {
        path: "/blog",
        route: BlogRoutes
    },
    {
        path: "/message",
        route: MessageRoutes
    },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})
