export type UserRole = "OWNER" | "ADMIN" | "USER";

/** ADMIN или OWNER имеют доступ к панели администратора */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "OWNER";
}

/** Только OWNER */
export function isOwner(role: string | null | undefined): boolean {
  return role === "OWNER";
}
