import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProject, InsertUser, Project, projects, users } from "../drizzle/schema";
import { ADMIN_EMAIL } from "@shared/const";
import { ENV } from "./_core/env";
import { supabaseAdmin } from "./supabase";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.email?.trim().toLowerCase() === ADMIN_EMAIL || user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  } else if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

type SupabaseProject = {
  id: number;
  slug: string;
  number: string;
  label: string;
  title: string;
  description: string;
  image_url: string | null;
  accent: "yellow" | "dark";
  challenge: string | null;
  solution: string | null;
  result: string | null;
  benefits: string[] | string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function toProject(row: SupabaseProject): Project {
  return {
    id: row.id,
    slug: row.slug,
    number: row.number,
    label: row.label,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    accent: row.accent,
    challenge: row.challenge,
    solution: row.solution,
    result: row.result,
    benefits: typeof row.benefits === "string" ? row.benefits : JSON.stringify(row.benefits ?? []),
    sortOrder: row.sort_order,
    published: row.published ? 1 : 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toSupabaseProject(input: Partial<InsertProject>) {
  const output: Record<string, unknown> = {};
  if (input.slug !== undefined) output.slug = input.slug;
  if (input.number !== undefined) output.number = input.number;
  if (input.label !== undefined) output.label = input.label;
  if (input.title !== undefined) output.title = input.title;
  if (input.description !== undefined) output.description = input.description;
  if (input.imageUrl !== undefined) output.image_url = input.imageUrl;
  if (input.accent !== undefined) output.accent = input.accent;
  if (input.challenge !== undefined) output.challenge = input.challenge;
  if (input.solution !== undefined) output.solution = input.solution;
  if (input.result !== undefined) output.result = input.result;
  if (input.benefits !== undefined) {
    try {
      output.benefits = typeof input.benefits === "string" ? JSON.parse(input.benefits) : input.benefits;
    } catch {
      output.benefits = [input.benefits];
    }
  }
  if (input.sortOrder !== undefined) output.sort_order = input.sortOrder;
  if (input.published !== undefined) output.published = Boolean(input.published);
  return output;
}

function storagePathFromPublicUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return null;
  const marker = "/storage/v1/object/public/portfolio-images/";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex < 0) return null;
  return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
}

async function removeStoredProjectImage(imageUrl: string | null | undefined) {
  const path = storagePathFromPublicUrl(imageUrl);
  if (!path) return;
  const { error } = await supabaseAdmin.storage.from("portfolio-images").remove([path]);
  if (error) console.warn(`[Supabase Storage] Could not remove ${path}:`, error.message);
}

async function fetchProjects(query: any) {
  const { data, error } = await query;
  if (error) throw new Error(`Supabase projects error: ${error.message}`);
  return (data as SupabaseProject[]).map(toProject);
}

export async function getPublishedProjects(): Promise<Project[]> {
  return fetchProjects(supabaseAdmin.from("projects").select("*").eq("published", true).order("sort_order", { ascending: true }).order("id", { ascending: true }));
}

export async function getAllProjects(): Promise<Project[]> {
  return fetchProjects(supabaseAdmin.from("projects").select("*").order("sort_order", { ascending: true }).order("id", { ascending: true }));
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const { data, error } = await supabaseAdmin.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase project error: ${error.message}`);
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function createProject(input: InsertProject): Promise<Project | undefined> {
  const { data, error } = await supabaseAdmin.from("projects").insert(toSupabaseProject(input)).select("*").single();
  if (error) throw new Error(`Supabase project create error: ${error.message}`);
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data, error } = await supabaseAdmin.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Supabase project lookup error: ${error.message}`);
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function updateProject(id: number, input: Partial<InsertProject>): Promise<Project | undefined> {
  const { data: previous } = await supabaseAdmin.from("projects").select("image_url").eq("id", id).maybeSingle();
  const { data, error } = await supabaseAdmin.from("projects").update(toSupabaseProject(input)).eq("id", id).select("*").single();
  if (error) throw new Error(`Supabase project update error: ${error.message}`);
  if (previous?.image_url && input.imageUrl !== undefined && input.imageUrl !== previous.image_url) {
    await removeStoredProjectImage(previous.image_url);
  }
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function deleteProject(id: number): Promise<void> {
  const { data: previous } = await supabaseAdmin.from("projects").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
  if (error) throw new Error(`Supabase project delete error: ${error.message}`);
  await removeStoredProjectImage(previous?.image_url);
}

export async function countProjects(): Promise<number> {
  const { count, error } = await supabaseAdmin.from("projects").select("id", { count: "exact", head: true }).eq("published", true);
  if (error) throw new Error(`Supabase projects count error: ${error.message}`);
  return count ?? 0;
}
