import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getPublishedProjects: vi.fn(),
  getAllProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

function createContext(role: "admin" | "user" = "admin"): TrpcContext {
  return {
    user: { id: 1, openId: "owner", name: "Lucas", email: "lucas@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const row = { id: 7, slug: "site-demo", number: "01", label: "Site profissional", title: "Projeto demonstrativo", description: "Descrição", imageUrl: null, accent: "yellow" as const, challenge: "Desafio", solution: "Solução", result: "Resultado", benefits: JSON.stringify(["Benefício 1"]), sortOrder: 0, published: 1, createdAt: new Date(), updatedAt: new Date() };

describe("projects router", () => {
  it("lists published projects and decodes benefits", async () => {
    dbMocks.getPublishedProjects.mockResolvedValue([row]);
    const result = await appRouter.createCaller(createContext("user")).projects.list();
    expect(result[0]).toMatchObject({ id: 7, benefits: ["Benefício 1"], published: true });
  });

  it("allows admins to create a project", async () => {
    dbMocks.createProject.mockResolvedValue(row);
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.projects.create({ slug: "site-demo", number: "01", label: "Site profissional", title: "Projeto demonstrativo", description: "Descrição", benefits: ["Benefício 1"] });
    expect(dbMocks.createProject).toHaveBeenCalledWith(expect.objectContaining({ benefits: JSON.stringify(["Benefício 1"]), published: 1 }));
    expect(result.benefits).toEqual(["Benefício 1"]);
  });

  it("rejects project deletion for non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.projects.remove({ id: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.deleteProject).not.toHaveBeenCalled();
  });
});
