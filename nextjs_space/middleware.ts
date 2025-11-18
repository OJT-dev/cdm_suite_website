
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/builder/:path*",
    "/analytics/:path*",
    "/billing/:path*",
  ],
};
