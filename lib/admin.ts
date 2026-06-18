export function isAdmin(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? "";
  if (!raw) return false;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}
