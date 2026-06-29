import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export function middleware(request: NextRequest) {
  const isMobileApi = request.nextUrl.pathname.startsWith("/api/mobile/");

  if (isMobileApi && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const response = NextResponse.next();
  if (isMobileApi) {
    Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
  } else {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }
  return response;
}

export const config = {
  matcher: [
    "/api/mobile/:path*",
    "/dashboard",
    "/log-drink",
    "/activity",
    "/friends",
    "/stats",
    "/profile",
    "/onboarding",
    "/login",
    "/signup",
  ],
};
