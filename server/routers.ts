import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createProject, deleteProject, getAllProjects, getPublishedProjects, updateProject } from "./db";
import { systemRouter } from "./_core/systemRouter";

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
    create: adminProcedure.input(projectInput).mutation(async ({ input }) => {
      const project = await createProject({ ...input, benefits: JSON.stringify(input.benefits), published: input.published ? 1 : 0 });
      if (!project) throw new Error("Project could not be created");
      return serializeProject(project);
    }),
    update: adminProcedure.input(projectUpdate).mutation(async ({ input }) => {
      const { id, benefits, published, ...rest } = input;
      const project = await updateProject(id, { ...rest, ...(benefits ? { benefits: JSON.stringify(benefits) } : {}), ...(published === undefined ? {} : { published: published ? 1 : 0 }) });
      if (!project) throw new Error("Project not found");
      return serializeProject(project);
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await deleteProject(input.id); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
