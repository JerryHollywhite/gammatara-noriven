
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Ensure protocol is correct if missing
if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('http')) {
    process.env.NEXTAUTH_URL = `https://${process.env.NEXTAUTH_URL}`;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;

                if (!email || !password) return null;

                // Case-insensitive email match
                const user = await prisma.user.findUnique({
                    where: { email: email.toLowerCase().trim() }
                });

                if (!user || user.password === null) return null;

                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) return null;

                // TODO: Add status check if we add a status field to User model later
                // if (user.status !== "Approved") ...

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            }
        }),
    ],
    // Remove manual cookie config - let NextAuth handle it based on NEXTAUTH_URL
    // Remove hardcoded secret - let NextAuth use process.env.NEXTAUTH_SECRET
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: "jwt",
    },
    // Explicitly use the env var to be safe, though NextAuth does this by default checking
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
};
