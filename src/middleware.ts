import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const role = req.auth?.user?.role;
  if (role === "ADMIN") {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/dang-nhap";
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/admin/:path*"],
};
