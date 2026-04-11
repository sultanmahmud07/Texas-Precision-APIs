import { Response } from "express";

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
    }
    // const isProduction = false;

    // if (tokenInfo.accessToken) {
    //     res.cookie("accessToken", tokenInfo.accessToken, {
    //         httpOnly: true,
    //         secure: isProduction, // true in prod (requires HTTPS), false in dev
    //         sameSite: isProduction ? "none" : "lax", // 'none' requires 'secure: true'
    //         maxAge: 15 * 60 * 1000 // Example: 15 minutes
    //     });
    // }
    
    // if (tokenInfo.refreshToken) {
    //     res.cookie("refreshToken", tokenInfo.refreshToken, {
    //         httpOnly: true,
    //         secure: isProduction,
    //         sameSite: isProduction ? "none" : "lax",
    //         maxAge: 7 * 24 * 60 * 60 * 1000 // Example: 7 days
    //     });
    // }

}

