import { env } from "next-runtime-env";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAvatarUrl, isPlaceholderPublicId } from "./helpers";

vi.mock("next-runtime-env", () => ({
  env: vi.fn(),
}));

const mockEnv = env as ReturnType<typeof vi.fn>;

describe("isPlaceholderPublicId", () => {
  it("identifies optimistic entity IDs", () => {
    expect(isPlaceholderPublicId("PLACEHOLDER_abc123")).toBe(true);
    expect(isPlaceholderPublicId("abc123")).toBe(false);
  });
});

describe("getAvatarUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty string for null input", () => {
    expect(getAvatarUrl(null)).toBe("");
  });

  it("returns empty string for empty string input", () => {
    expect(getAvatarUrl("")).toBe("");
  });

  it("returns URL unchanged if already absolute http", () => {
    expect(getAvatarUrl("http://example.com/avatar.jpg")).toBe(
      "http://example.com/avatar.jpg",
    );
  });

  it("returns URL unchanged if already absolute https", () => {
    expect(getAvatarUrl("https://example.com/avatar.jpg")).toBe(
      "https://example.com/avatar.jpg",
    );
  });

  it("routes stored avatar keys through the authenticated application", () => {
    mockEnv.mockImplementation((key: string) =>
      key === "NEXT_PUBLIC_BASE_URL" ? "https://tasks.holedo.com" : undefined,
    );

    expect(getAvatarUrl("user123/avatar.jpg")).toBe(
      "https://tasks.holedo.com/api/avatar?key=user123%2Favatar.jpg",
    );
  });
});
