import { Router } from "express"
import { AuthRoutes } from "../modules/auth/auth.route"
import { UserRoutes } from "../modules/user/user.route"
import { StatsRoutes } from "../modules/stats/stats.route"
import { ContactRoutes } from "../modules/contact/contact.route"
import { OtpRoutes } from "../modules/otp/otp.route"
import { ReviewRoutes } from "../modules/review/review.route"
import { AvailabilityRoutes } from "../modules/availability/availability.route"
import { AddressRoutes } from "../modules/address/address.route"

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
        path: "/availability",
        route: AvailabilityRoutes
    },
    {
        path: "/review",
        route: ReviewRoutes
    },
    {
        path: "/address",
        route: AddressRoutes
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
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})
