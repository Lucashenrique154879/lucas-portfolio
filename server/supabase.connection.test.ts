import { describe, expect, it } from "vitest";

describe("Supabase connection", () => {
  it("accepts the configured public key on the auth settings endpoint", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    expect(url).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(key).toMatch(/^eyJ/);
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key as string } });
    expect(response.ok).toBe(true);
  }, 15000);

  it("accepts the configured private key on an admin-only endpoint", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(key).toMatch(/^eyJ/);
    const response = await fetch(`${url}/auth/v1/admin/users?limit=1`, { headers: { apikey: key as string, Authorization: `Bearer ${key}` } });
    expect(response.ok).toBe(true);
  }, 15000);
});
