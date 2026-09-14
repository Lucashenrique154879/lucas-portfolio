import type { InsertProject, InsertUser, Project, User } from "../shared/models";
import { supabaseAdmin } from "./supabase";

type SupabaseProject = {
  id: number; slug: string; number: string; label: string; title: string;
  description: string; image_url: string | null; accent: "yellow" | "dark";
  challenge: string | null; solution: string | null; result: string | null;
  benefits: string[] | string | null; sort_order: number; published: boolean;
  created_at: string; updated_at: string;
};

// Supabase Auth is the source of truth for users. No MySQL/Drizzle mirror is used.
export async function upsertUser(_user: InsertUser): Promise<void> {}
export async function getUserByOpenId(_openId: string): Promise<User | undefined> { return undefined; }

function toProject(row: SupabaseProject): Project {
  return {
    id: row.id, slug: row.slug, number: row.number, label: row.label,
    title: row.title, description: row.description, imageUrl: row.image_url,
    accent: row.accent, challenge: row.challenge, solution: row.solution,
    result: row.result,
    benefits: typeof row.benefits === "string" ? row.benefits : JSON.stringify(row.benefits ?? []),
    sortOrder: row.sort_order, published: row.published ? 1 : 0,
    createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at),
  };
}

function toSupabaseProject(input: Partial<InsertProject>) {
  const output: Record<string, unknown> = {};
  const map: Record<string, string> = {
    imageUrl: "image_url", sortOrder: "sort_order", published: "published",
  };
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const column = map[key] ?? key;
    if (key === "benefits" && typeof value === "string") {
      try { output[column] = JSON.parse(value); } catch { output[column] = [value]; }
    } else output[column] = value;
  }
  return output;
}

function storagePathFromPublicUrl(imageUrl: string | null | undefined) {
  const marker = "/storage/v1/object/public/portfolio-images/";
  return imageUrl?.includes(marker) ? decodeURIComponent(imageUrl.split(marker)[1]) : null;
}

async function removeStoredProjectImage(imageUrl: string | null | undefined) {
  const path = storagePathFromPublicUrl(imageUrl);
  if (path) await supabaseAdmin.storage.from("portfolio-images").remove([path]);
}

async function fetchProjects(query: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error) throw new Error(`Supabase projects error: ${error.message}`);
  return (data as SupabaseProject[]).map(toProject);
}

export function getPublishedProjects() {
  return fetchProjects(supabaseAdmin.from("projects").select("*").eq("published", true).order("sort_order").order("id"));
}

export function getAllProjects() {
  return fetchProjects(supabaseAdmin.from("projects").select("*").order("sort_order").order("id"));
}

export async function createProject(input: InsertProject) {
  const { data, error } = await supabaseAdmin.from("projects").insert(toSupabaseProject(input)).select("*").single();
  if (error) throw new Error(`Supabase project create error: ${error.message}`);
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function updateProject(id: number, input: Partial<InsertProject>) {
  const { data: previous } = await supabaseAdmin.from("projects").select("image_url").eq("id", id).maybeSingle();
  const { data, error } = await supabaseAdmin.from("projects").update(toSupabaseProject(input)).eq("id", id).select("*").single();
  if (error) throw new Error(`Supabase project update error: ${error.message}`);
  if (previous?.image_url && input.imageUrl !== undefined && input.imageUrl !== previous.image_url) await removeStoredProjectImage(previous.image_url);
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function deleteProject(id: number) {
  const { data: previous } = await supabaseAdmin.from("projects").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
  if (error) throw new Error(`Supabase project delete error: ${error.message}`);
  await removeStoredProjectImage(previous?.image_url);
}

export async function getProjectById(id: number) {
  const { data, error } = await supabaseAdmin.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase project error: ${error.message}`);
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function getProjectBySlug(slug: string) {
  const { data, error } = await supabaseAdmin.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Supabase project lookup error: ${error.message}`);
  return data ? toProject(data as SupabaseProject) : undefined;
}

export async function countProjects() {
  const { count, error } = await supabaseAdmin.from("projects").select("id", { count: "exact", head: true }).eq("published", true);
  if (error) throw new Error(`Supabase projects count error: ${error.message}`);
  return count ?? 0;
}

export type { InsertProject, InsertUser, Project, User };
export const persistenceBackend = "supabase" as const;
export const usesSupabaseOnly = true;

// Deliberately retained as a compatibility shim for old callers; it never opens a legacy database.
export async function getDb(): Promise<null> { return null; }
void getDb;
void persistenceBackend;
void usesSupabaseOnly;
void getProjectById;
void getProjectBySlug;
void countProjects;
void upsertUser;
void getUserByOpenId;
void removeStoredProjectImage;
void storagePathFromPublicUrl;
void fetchProjects;
void toProject;
void toSupabaseProject;
void supabaseAdmin;
void getPublishedProjects;
void getAllProjects;
void createProject;
void updateProject;
void deleteProject;
