import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch(`${BACKEND_URL}/users/login`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const data = await res.json();

                    if (res.ok && data.user) {
                        return {
                            id: data.user.id,
                            name: data.user.name,
                            email: data.user.email,
                            accessToken: data.access_token // Capture token
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Login failed", e);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (account) {
                if (account.provider === 'google') {
                    const googleId = account.providerAccountId;
                    const email = user.email;
                    const name = user.name;

                    try {
                        // 1. Try Login
                        let backendResponse = null;
                        const loginRes = await fetch(`${BACKEND_URL}/users/login`, {
                            method: 'POST',
                            body: JSON.stringify({
                                email: email,
                                password: googleId
                            }),
                            headers: { "Content-Type": "application/json" }
                        });

                        if (loginRes.ok) {
                            backendResponse = await loginRes.json();
                        } else {
                            // 2. If Login fails, try Signup
                            const signupRes = await fetch(`${BACKEND_URL}/users/signup`, {
                                method: 'POST',
                                body: JSON.stringify({
                                    email: email,
                                    password: googleId,
                                    name: name,
                                    dob: null
                                }),
                                headers: { "Content-Type": "application/json" }
                            });

                            if (signupRes.ok) {
                                backendResponse = await signupRes.json();
                            } else {
                                console.error("Failed to auto-signup google user");
                            }
                        }

                        if (backendResponse) {
                            token.id = backendResponse.user.id;
                            token.accessToken = backendResponse.access_token;
                        }
                    } catch (e) {
                        console.error("Error syncing google user with backend", e);
                    }
                } else {

                    if (user) {
                        token.id = user.id;
                        // @ts-ignore
                        token.accessToken = user.accessToken;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                if (token.id) {
                    
                    session.user.id = token.id as string;
                }
                if (token.accessToken) {
                    session.accessToken = token.accessToken as string;
                }
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
