import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "./middleware";

describe("middleware", () => {
  it("serves the public landing page at the application root", () => {
    const response = middleware(new NextRequest("http://localhost:3000/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["mcp.kan.bn", "mcp-staging.kan.bn"])(
    "rewrites requests with Host: %s to /api/mcp",
    (host) => {
      const response = middleware(
        new NextRequest("http://localhost:3000/", { headers: { host } }),
      );

      const rewriteTarget = response.headers.get("x-middleware-rewrite");
      expect(rewriteTarget).not.toBeNull();
      expect(new URL(rewriteTarget!).pathname).toBe("/api/mcp");
    },
  );

  it("does not rewrite the main app domain", () => {
    const response = middleware(
      new NextRequest("http://localhost:3000/", {
        headers: { host: "kan.bn" },
      }),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-authorization-server",
  ])(
    "returns 404 for %s on the MCP hostname instead of the app shell",
    (pathname) => {
      const response = middleware(
        new NextRequest(`http://localhost:3000${pathname}`, {
          headers: { host: "mcp.kan.bn" },
        }),
      );

      expect(response.status).toBe(404);
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    },
  );

  it("does not 404 OAuth discovery paths on the main app domain", () => {
    const response = middleware(
      new NextRequest(
        "http://localhost:3000/.well-known/oauth-protected-resource",
        { headers: { host: "kan.bn" } },
      ),
    );

    expect(response.status).not.toBe(404);
  });
});
