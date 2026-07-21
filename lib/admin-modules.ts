export const adminModules = ["overview", "ai", "bookings", "customers", "technicians", "reports", "inventory", "prompt", "logs", "notifications", "settings", "profile"] as const;
export type AdminModule = typeof adminModules[number];

export function parseAdminModule(value: string | undefined): AdminModule {
  return adminModules.includes(value as AdminModule) ? value as AdminModule : "overview";
}
