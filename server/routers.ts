import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createProject, deleteProject, getAllProjects, getPublishedProjects, getProjectBySlug, updateProject } from "./db";
import { supabaseAdmin } from "./supabase";
import { systemRouter } from "./_core/systemRouter";

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function imageExtension(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  return contentType.split("/")[1] ?? "png";
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return normalized.replace(/\.(png|jpe?g|webp|gif)$/i, "") || "projeto";
}

const projectInput = z.object({
  slug: z.string().min(1).max(120),
  number: z.string().min(1).max(8),
  label: z.string().min(1).max(120),
  title: z.string().min(1).max(220),
  description: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  accent: z.enum(["yellow", "dark"]).default("yellow"),
  challenge: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  benefits: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(true),
});

const projectUpdate = projectInput.partial().extend({ id: z.number().int().positive() });

function serializeProject(project: Awaited<ReturnType<typeof getPublishedProjects>>[number]) {
  let benefits: string[] = [];
  try { benefits = project.benefits ? JSON.parse(project.benefits) : []; } catch { benefits = project.benefits ? [project.benefits] : []; }
  return { ...project, benefits, published: Boolean(project.published) };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  projects: router({
    list: publicProcedure.query(async () => (await getPublishedProjects()).map(serializeProject)),
    adminList: adminProcedure.query(async () => (await getAllProjects()).map(serializeProject)),
    checkSlug: adminProcedure.input(z.object({ slug: z.string().min(1).max(120), excludeId: z.number().int().positive().optional() })).query(async ({ input }) => {
      const existing = await getProjectBySlug(input.slug);
      if (!existing) return { available: true } as const;
      if (input.excludeId !== undefined && existing.id === input.excludeId) return { available: true } as const;
      return { available: false, conflictId: existing.id } as const;
    }),
    create: adminProcedure.input(projectInput).mutation(async ({ input }) => {
      const existing = await getProjectBySlug(input.slug);
      if (existing) throw new Error("Já existe um projeto com este slug. Escolha outro nome interno.");
      const project = await createProject({ ...input, benefits: JSON.stringify(input.benefits), published: input.published ? 1 : 0 });
      if (!project) throw new Error("Project could not be created");
      return serializeProject(project);
    }),
    update: adminProcedure.input(projectUpdate).mutation(async ({ input }) => {
      const { id, benefits, published, slug, ...rest } = input;
      if (slug !== undefined) {
        const existing = await getProjectBySlug(slug);
        if (existing && existing.id !== id) throw new Error("Já existe outro projeto com este slug. Escolha outro nome interno.");
      }
      const project = await updateProject(id, { ...rest, ...(slug !== undefined ? { slug } : {}), ...(benefits ? { benefits: JSON.stringify(benefits) } : {}), ...(published === undefined ? {} : { published: published ? 1 : 0 }) });
      if (!project) throw new Error("Project not found");
      return serializeProject(project);
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await deleteProject(input.id); return { success: true }; }),
    uploadImage: adminProcedure
      .input(
        z.object({
          base64: z.string().min(1),
          contentType: z.string(),
          fileName: z.string().min(1).max(200),
          size: z.number().int().min(1).max(MAX_IMAGE_BYTES),
        })
      )
      .mutation(async ({ input }) => {
        if (!ALLOWED_IMAGE_TYPES.has(input.contentType)) {
          throw new Error("Formato não suportado. Use PNG, JPG, WEBP ou GIF.");
        }
        const prefix = input.base64.match(/^data:[^;]+;base64,/)?.[0] ?? "";
        const rawBase64 = prefix ? input.base64.slice(prefix.length) : input.base64;
        const buffer = Buffer.from(rawBase64, "base64");
        if (buffer.length > MAX_IMAGE_BYTES) {
          throw new Error("A imagem excede o limite de 15 MB.");
        }
        const name = sanitizeFileName(input.fileName);
        const ext = imageExtension(input.contentType);
        const filePath = `portfolio/projects/${Date.now()}-${name}.${ext}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from("portfolio-images")
          .upload(filePath, buffer, { cacheControl: "3600", contentType: input.contentType, upsert: false });

        if (uploadError) {
          throw new Error(`Falha ao enviar imagem: ${uploadError.message}`);
        }

        const { data: urlData } = supabaseAdmin.storage
          .from("portfolio-images")
          .getPublicUrl(filePath);

        return { publicUrl: urlData.publicUrl };
      }),
  }),
});

export type AppRouter = typeof appRouter;
