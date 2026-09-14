export type UserRole = "user" | "admin";

export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export interface InsertUser {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  lastSignedIn?: Date;
}

export interface Project {
  id: number;
  slug: string;
  number: string;
  label: string;
  title: string;
  description: string;
  imageUrl: string | null;
  accent: "yellow" | "dark";
  challenge: string | null;
  solution: string | null;
  result: string | null;
  benefits: string;
  sortOrder: number;
  published: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertProject {
  slug: string;
  number: string;
  label: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  accent?: "yellow" | "dark";
  challenge?: string | null;
  solution?: string | null;
  result?: string | null;
  benefits?: string | string[];
  sortOrder?: number;
  published?: number | boolean;
}

export type UpdateProject = Partial<InsertProject>;
export type ProjectInput = InsertProject;
export type UserInput = InsertUser;
export type AuthUser = User;
export type Role = UserRole;
export type Accent = Project["accent"];
export type CreateProjectInput = InsertProject;
export type CreateUserInput = InsertUser;
export type EditProjectInput = UpdateProject;
export type PortfolioProject = Project;
export type ProjectRow = Project;
export type UserRow = User;
export type CurrentUser = User;
export type PublicProject = Project;
export type PublicUser = User;
export type ProjectRecord = Project;
export type UserRecord = User;
