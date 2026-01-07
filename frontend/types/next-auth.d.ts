import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {

    interface Session {
        accessToken?: string
        user: {
            id?: string
        } & DefaultSession["user"]
    }

    interface User {
        id?: string
        access_token?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        id?: string
    }
}
