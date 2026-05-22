export const adminRoles = ["user", "admin", "manager", "supervisor"] as const;

export type AdminRole = (typeof adminRoles)[number];

export const adminModules = [
  "dashboard",
  "users",
  "hero",
  "collections",
  "orders",
  "products",
  "addons",
  "locations",
  "occasions",
  "customers",
  "segments",
  "campaigns",
] as const;

export type AdminModule = (typeof adminModules)[number];

export const adminModuleLabels: Record<AdminModule, string> = {
  dashboard: "Dashboard",
  users: "Users",
  hero: "Hero",
  collections: "Collections",
  orders: "Orders",
  products: "Products",
  addons: "Add-ons",
  locations: "Locations",
  occasions: "Occasions",
  customers: "Customers",
  segments: "Segments",
  campaigns: "Campaigns",
};

export function normalizePermissions(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function canAccessModule(
  role: string | null | undefined,
  rawPermissions: unknown,
  module: AdminModule,
) {
  if (role === "admin") return true;
  if (role !== "manager" && role !== "supervisor") return false;
  const permissions = normalizePermissions(rawPermissions);
  return permissions.includes("*") || permissions.includes(module);
}
