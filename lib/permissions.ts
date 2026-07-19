export const roles = ["guest", "customer", "technician", "admin"] as const;
export type Role = typeof roles[number];
export type AuthenticatedRole = Exclude<Role, "guest">;

export const permissions = {
  browsePublicContent: ["guest", "customer", "technician", "admin"],
  bookRepair: ["customer"],
  runAiDiagnosis: ["customer"],
  uploadDiagnosticImages: ["customer"],
  downloadDiagnosisReport: ["customer"],
  viewDiagnosisHistory: ["customer"],
  trackOwnRepairs: ["customer"],
  manageProfile: ["customer", "technician", "admin"],
  viewAssignedRepairs: ["technician"],
  updateRepairProgress: ["technician"],
  addTechnicianNotes: ["technician"],
  uploadRepairPhotos: ["technician"],
  manageUsers: ["admin"],
  manageTechnicians: ["admin"],
  viewAiUsage: ["admin"],
  viewAnalytics: ["admin"],
  managePricing: ["admin"],
  manageRepairGuides: ["admin"],
  manageBookings: ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof permissions;
export function can(role: Role, permission: Permission) { return (permissions[permission] as readonly Role[]).includes(role); }
export function roleHome(role: AuthenticatedRole) { return role === "admin" ? "/admin" : role === "technician" ? "/technician" : "/dashboard"; }
