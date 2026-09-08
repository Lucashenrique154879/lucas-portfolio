import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProject, InsertUser, Project, projects, users } from "../drizzle/schema";
import { ADMIN_EMAIL } from "@shared/const";
import { ENV } from "./_core/env";

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
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.email?.trim().toLowerCase() === ADMIN_EMAIL || user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  else if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
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

export async function getPublishedProjects(): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.published, 1)).orderBy(asc(projects.sortOrder), asc(projects.id));
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id));
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function createProject(input: InsertProject): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(projects).values(input);
  return getProjectBySlug(input.slug);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return result[0];
}

export async function updateProject(id: number, input: Partial<InsertProject>): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(projects).set(input).where(eq(projects.id, id));
  return getProjectById(id);
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(projects).where(eq(projects.id, id));
}

export async function countProjects(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.published, 1)));
  return rows.length;
}
