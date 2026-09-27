import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MCP_HOSTNAMES = new Set(["mcp.kan.bn", "mcp-staging.kan.bn"]);

const OAUTH_DISCOVERY_PATHS = new Set([
  "/.well-known/oauth-protected-resource",
  "/.well-known/oauth-authorization-server",
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];

  if (
    host &&
    MCP_HOSTNAMES.has(host) &&
    OAUTH_DISCOVERY_PATHS.has(request.nextUrl.pathname)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  if (request.nextUrl.pathname === "/" && host && MCP_HOSTNAMES.has(host)) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/mcp";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-authorization-server",
  ],
};
