import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { auth: { getUser } } }));
import { authenticatedUser, authSchema, safeReturnPath, userDisplayName } from "./auth";
import { Route } from "@/routes/_main";

describe("Account rules", () => {
  beforeEach(() => getUser.mockReset());
  it("prefers full_name, then email name, then friend", () => {
    expect(userDisplayName({ email: "river@example.com", user_metadata: { full_name: "  Rakshitha  " } })).toBe("Rakshitha");
    expect(userDisplayName({ email: "river@example.com", user_metadata: {} })).toBe("river");
    expect(userDisplayName(null)).toBe("friend");
  });
  it("returns to the original internal page but rejects external redirects", () => {
    expect(safeReturnPath("/journal?new=true")).toBe("/journal?new=true");
    for (const unsafe of ["https://example.com", "//example.com", "/\\example.com", "/login", "/\n/example.com"]) expect(safeReturnPath(unsafe)).toBe("/home");
  });
  it("validates email and optional metadata name", () => {
    expect(authSchema.safeParse({ email: "invalid", password: "password", name: "" }).success).toBe(false);
    expect(authSchema.safeParse({ email: "river@example.com", password: "", name: "" }).success).toBe(false);
    expect(authSchema.safeParse({ email: "river@example.com", password: "password", name: "" }).success).toBe(true);
  });
  it("requires a server-validated user rather than trusting a cached session", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error("Expired") });
    expect(await authenticatedUser()).toBeNull();
    getUser.mockResolvedValue({ data: { user: { id: "verified-user" } }, error: null });
    expect(await authenticatedUser()).toEqual({ id: "verified-user" });
  });
  it("guards app pages and remembers the requested path", async () => {
    const guard = Route.options.beforeLoad as unknown as (args: { location: { href: string } }) => Promise<void>;
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    for (const path of ["/home", "/explore", "/meditation", "/journal", "/profile", "/chanting", "/wisdom", "/recommendations", "/settings"]) {
      await expect(guard({ location: { href: path } })).rejects.toMatchObject({ options: { to: "/login", search: { redirect: path } } });
    }
    getUser.mockResolvedValue({ data: { user: { id: "verified-user" } }, error: null });
    await expect(guard({ location: { href: "/home" } })).resolves.toBeUndefined();
  });
});