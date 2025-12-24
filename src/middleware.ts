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
    // Protect all dashboard and admin routes
    matcher: [
        "/modules/:path*",
        "/admin/:path*",
        "/student/:path*",
        "/teacher/:path*",
        "/parent/:path*"
    ]
};
