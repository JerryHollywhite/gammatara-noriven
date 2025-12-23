import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
    pages: {
        signIn: '/login', // Redirect to custom login page
    }
});

export const config = {
    // Protect /modules and /admin routes via middleware
    matcher: [
        "/modules/:path*",
        "/admin/:path*"
    ]
};
