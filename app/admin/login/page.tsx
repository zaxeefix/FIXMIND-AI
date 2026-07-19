import { ShieldCheck } from "lucide-react";
import { RoleLogin } from "@/components/role-login";

export default function AdminLogin() {
  return <RoleLogin role="admin" eyebrow="Administrator portal" title="AI Operations Console" copy="Authorized platform administrators only. Manage AI usage, repair operations, technicians, and system health." icon={<ShieldCheck size={22} />} />;
}
