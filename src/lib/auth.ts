import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(1, "Enter your password.").max(128, "Keep your password under 129 characters."),
  name: z.string().trim().max(100, "Keep your name under 101 characters."),
});

export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/home";
  if (value.split(/[?#]/)[0] === "/login") return "/home";
  return value;
}

export function userDisplayName(user: Pick<User, "email" | "user_metadata"> | null): string {
  const name: unknown = user?.user_metadata['full_name'];
  return (typeof name === "string" ? name.trim() : "") || user?.email?.split("@")[0] || "friend";
}

export async function authenticatedUser() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
  } catch {
    return null;
  }
}