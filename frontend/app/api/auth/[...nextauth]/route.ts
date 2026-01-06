import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("Google Sign-In Response (SignIn Callback):");
            console.log("User:", user);
            console.log("Account:", account);
            console.log("Profile:", profile);
            return true;
        },
        async jwt({ token, account, profile }) {
            if (account) {
                console.log("Google Sign-In Response (JWT Callback - Initial Sign In):");
                console.log("Token:", token);
                console.log("Account:", account);
                console.log("Profile:", profile);
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Session Callback:", session);
            return session;
        },
    },
})

export { handler as GET, handler as POST }
