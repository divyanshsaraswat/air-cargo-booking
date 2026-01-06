'use client'

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect } from "react"

function SessionSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Generate or use a session ID. For simulation we can use the user's email or a random string if needed, 
            // but usually a session ID implies a token. 
            // Since we don't have a real backend session ID exposed here (NextAuth token is HttpOnly cookie usually), 
            // we will simulate it using a hash of the email or just a flag.
            // User asked: "let there be a session id in session storage"

            // We'll use a simple placeholder for now or the user's email/sub if available in session object, 
            // but standard session id is opaque. NextAuth session doesn't expose the sensitive token by default.
            // We will simulate one.
            const simulatedSessionId = `sess_${btoa(session.user.email || 'user')}_${Date.now()}`;

            // Only set if not already set to avoid constant overwites if that matters, but safe to overwrite here.
            if (!sessionStorage.getItem('sessionId')) {
                sessionStorage.setItem('sessionId', simulatedSessionId);
            }
        } else if (status === "unauthenticated") {
            sessionStorage.removeItem('sessionId');
        }
    }, [session, status]);

    return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionSync>
                {children}
            </SessionSync>
        </SessionProvider>
    )
}
